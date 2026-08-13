import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Faq, Message, Phrase, Ticket } from '../entities';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(Faq) private readonly faqRepo: Repository<Faq>,
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,
    @InjectRepository(Phrase) private readonly phraseRepo: Repository<Phrase>,
    private readonly settings: SettingsService,
  ) {}

  // ---------- 配置 ----------
  async getConfig() {
    return {
      enabled: (await this.settings.get('ai_enabled', '0')) === '1',
      provider: await this.settings.get('ai_provider', 'openai'),
      apiUrl: await this.settings.get('ai_api_url', 'https://api.openai.com/v1'),
      apiKey: await this.settings.get('ai_api_key', ''),
      model: await this.settings.get('ai_model', 'gpt-4o-mini'),
      autoAssign: (await this.settings.get('auto_assign_enabled', '0')) === '1',
    };
  }

  async saveConfig(body: any) {
    await this.settings.set('ai_enabled', body.enabled ? '1' : '0');
    await this.settings.set('ai_provider', body.provider || 'openai');
    await this.settings.set('ai_api_url', body.apiUrl || 'https://api.openai.com/v1');
    await this.settings.set('ai_api_key', body.apiKey || '');
    await this.settings.set('ai_model', body.model || 'gpt-4o-mini');
    await this.settings.set('auto_assign_enabled', body.autoAssign ? '1' : '0');
    return this.getConfig();
  }

  // ---------- LLM ----------
  private async callLLM(system: string, user: string): Promise<string | null> {
    const cfg = await this.getConfig();
    if (!cfg.enabled || !cfg.apiKey) return null;
    const url = cfg.apiUrl.replace(/\/$/, '') + '/chat/completions';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.3,
        }),
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const data: any = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  private async ticketContext(ticketId: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('工单不存在');
    const messages = await this.msgRepo.find({ where: { ticketId }, order: { id: 'ASC' } });
    const chat = messages
      .map((m) => `${m.senderType === 'customer' ? '客户' : '客服'}: ${m.content}`)
      .join('\n');
    return { ticket, chat };
  }

  // ---------- 回复建议 ----------
  async suggestReply(ticketId: number, draft?: string) {
    const { ticket, chat } = await this.ticketContext(ticketId);
    const llm = await this.callLLM(
      '你是一名专业的企业客服，请根据工单内容用中文给出礼貌、简洁、可操作的回信草稿。只输出回复正文。',
      `工单标题：${ticket.title}\n工单内容：${ticket.content}\n沟通记录：\n${chat}\n${draft ? `客服已写草稿：${draft}\n请优化并补充。` : '请生成回复。'}`,
    );
    if (llm) return { source: 'llm', content: llm };
    return this.fallbackReply(ticket, chat);
  }

  private async fallbackReply(ticket: Ticket, chat: string) {
    const phrases = await this.phraseRepo.find({ where: { status: 1 }, order: { sort: 'ASC' } });
    const text = ticket.content + chat;
    let pick = phrases.find((p) => text.includes(p.content.slice(0, 6)));
    if (!pick && /密码|登录|账号/.test(text)) {
      pick = phrases.find((p) => p.content.includes('账号')) || null;
    }
    if (!pick && /打印|乱码|软件|系统/.test(text)) {
      pick = phrases.find((p) => p.content.includes('定位')) || null;
    }
    return {
      source: 'rule',
      content:
        pick?.content ||
        '您好，已收到您的工单，我们正在为您处理，请耐心等待。如需补充信息，请直接留言。',
    };
  }

  // ---------- 工单摘要 ----------
  async summarize(ticketId: number) {
    const { ticket, chat } = await this.ticketContext(ticketId);
    const llm = await this.callLLM(
      '请用 3-5 句中文概括工单的来龙去脉、当前进展与待办事项。',
      `标题：${ticket.title}\n内容：${ticket.content}\n状态：${ticket.status}\n沟通记录：\n${chat}`,
    );
    if (llm) return { source: 'llm', summary: llm };
    const lastMsg = chat.split('\n').filter(Boolean).pop() || '';
    return {
      source: 'rule',
      summary: `工单「${ticket.title}」：客户反馈问题后已有 ${chat.split('\n').filter(Boolean).length} 条沟通记录，当前状态为处理中，最新进展：${lastMsg}`,
    };
  }

  // ---------- 自动分类 ----------
  async classify(ticketId: number) {
    const { ticket } = await this.ticketContext(ticketId);
    const categories = await this.catRepo.find({ where: { status: 1 } });
    const llm = await this.callLLM(
      `从以下分类中选择最合适的一个，只输出分类名称：${categories.map((c) => c.name).join('、')}`,
      `工单标题：${ticket.title}\n工单内容：${ticket.content}`,
    );
    if (llm) {
      const hit = categories.find((c) => llm.includes(c.name));
      if (hit) return { source: 'llm', categoryId: hit.id, categoryName: hit.name };
    }
    const text = `${ticket.title} ${ticket.content}`;
    const rules: Array<[RegExp, string]> = [
      [/密码|登录|账号|权限/, '账号与权限'],
      [/打印|乱码|软件|系统|安装|升级/, '软件故障'],
      [/硬件|扫码|设备|鼠标|键盘|显示器/, '硬件故障'],
    ];
    for (const [re, name] of rules) {
      if (re.test(text)) {
        const hit = categories.find((c) => c.name === name);
        if (hit) return { source: 'rule', categoryId: hit.id, categoryName: hit.name };
      }
    }
    const fallback = categories[0];
    return { source: 'rule', categoryId: fallback?.id ?? null, categoryName: fallback?.name ?? null };
  }

  // ---------- 知识库问答（RAG） ----------
  async ask(question: string) {
    const q = (question || '').trim();
    if (!q) throw new BadRequestException('请输入您的问题');
    const faqs = await this.faqRepo.find({ where: { status: 1 } });

    const charGrams = (s: string, n = 2): Set<string> => {
      const set = new Set<string>();
      const clean = s.toLowerCase().replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
      for (let i = 0; i + n <= clean.length; i++) set.add(clean.slice(i, i + n));
      return set;
    };
    const qGrams = charGrams(q);
    const scored = faqs
      .map((f) => {
        const qSimilarity = qGrams.size
          ? (() => {
              const fg = charGrams(f.question);
              let hit = 0;
              qGrams.forEach((g) => {
                if (fg.has(g)) hit += 1;
              });
              return hit / qGrams.size;
            })()
          : 0;
        const aGrams = charGrams(`${f.question} ${f.answer}`);
        let answerHits = 0;
        qGrams.forEach((g) => {
          if (aGrams.has(g)) answerHits += 1;
        });
        const aScore = qGrams.size ? answerHits / qGrams.size : 0;
        // 问题相似度权重更高，答案命中作为补充
        const score = qSimilarity * 0.8 + aScore * 0.2;
        return { faq: f, score: Math.round(score * 100) / 100 };
      })
      .filter((x) => x.score >= 0.35)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const matches = scored.map((x) => ({ id: x.faq.id, question: x.faq.question, answer: x.faq.answer, score: x.score }));
    let answer = matches.length ? matches[0].answer : null;
    let source = 'kb';
    if (matches.length) {
      const llm = await this.callLLM(
        '你是客服知识库助手，请基于给定的资料用中文简洁回答用户问题；若资料不足以回答，请说明并建议提交工单。',
        `用户问题：${q}\n参考资料：${matches.map((m) => `Q:${m.question}\nA:${m.answer}`).join('\n---\n')}`,
      );
      if (llm) {
        answer = llm;
        source = 'llm';
      }
    }
    return { question: q, answer, source, matches, suggestTicket: matches.length === 0 };
  }
}
