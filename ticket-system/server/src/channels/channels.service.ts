import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, Ticket } from '../entities';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel) private readonly chanRepo: Repository<Channel>,
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
  ) {}

  list() {
    return this.chanRepo.find({ order: { id: 'ASC' } });
  }

  async update(type: string, body: any) {
    let ch = await this.chanRepo.findOne({ where: { type } });
    if (!ch) ch = this.chanRepo.create({ type, name: body.name || type });
    if (body.name !== undefined) ch.name = body.name;
    if (body.enabled !== undefined) ch.enabled = body.enabled;
    if (body.config !== undefined) ch.config = body.config ? JSON.stringify(body.config) : null;
    return this.chanRepo.save(ch);
  }

  /** 渠道入站 webhook（微信/企业微信/邮件），真实接入时在此扩展签名校验与解析 */
  async inbound(type: string, body: any) {
    const ch = await this.chanRepo.findOne({ where: { type } });
    if (!ch || ch.enabled !== 1) throw new BadRequestException(`渠道 ${type} 未启用`);
    const text = String(body?.content || body?.text || body?.Content || '').trim();
    const from = String(body?.from || body?.FromUserName || body?.sender || '外部用户');
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const no = `TS${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${Math.floor(Math.random() * 900 + 100)}`;
    const title = `[${ch.name}] ${from} 的来信`;
    const ticket = this.ticketRepo.create({
      no,
      title,
      content: text || '（空消息）',
      categoryId: null,
      customerId: null,
      staffId: null,
      status: 'pending',
      priority: 'normal',
      channel: type,
    });
    await this.ticketRepo.save(ticket);
    return { success: true, ticketId: ticket.id, no: ticket.no };
  }
}
