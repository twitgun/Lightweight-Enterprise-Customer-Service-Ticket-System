import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeService } from '../realtime/realtime.service';
import { SettingsService } from '../settings/settings.service';
import { Category, Message, SlaPolicy, Ticket, TicketLog, User } from '../entities';

export const STATUS_LABEL: Record<string, string> = {
  pending: '待分配',
  processing: '处理中',
  waiting: '待客户确认',
  closed: '已完结',
};

const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(TicketLog) private readonly logRepo: Repository<TicketLog>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,
    @InjectRepository(SlaPolicy) private readonly slaRepo: Repository<SlaPolicy>,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
    private readonly settings: SettingsService,
  ) {}

  private genNo() {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `TS${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${Math.floor(Math.random() * 900 + 100)}`;
  }

  private hoursLater(hours: number) {
    return new Date(Date.now() + hours * 3600 * 1000);
  }

  private async managers() {
    return this.userRepo.find({ where: { role: 'manager', status: 1 } });
  }

  private async applySla(ticket: Ticket) {
    const policy = await this.slaRepo.findOne({ where: { priority: ticket.priority } });
    if (!policy) return;
    ticket.slaResponseAt = this.hoursLater(policy.responseHours);
    ticket.slaResolveAt = this.hoursLater(policy.resolveHours);
  }

  private async autoAssign(ticket: Ticket) {
    const enabled = (await this.settings.get('auto_assign_enabled', '0')) === '1';
    if (!enabled) return;
    const staffList = await this.userRepo.find({ where: { role: 'staff', status: 1 } });
    if (!staffList.length) return;
    const loads = await this.ticketRepo
      .createQueryBuilder('t')
      .select('t.staff_id', 'staffId')
      .addSelect('COUNT(t.id)', 'count')
      .where('t.status != :closed', { closed: 'closed' })
      .andWhere('t.staff_id IS NOT NULL')
      .groupBy('t.staff_id')
      .getRawMany();
    const loadMap = new Map(loads.map((r) => [Number(r.staffId), Number(r.count)]));
    const picked = [...staffList].sort((a, b) => (loadMap.get(a.id) || 0) - (loadMap.get(b.id) || 0))[0];
    ticket.staffId = picked.id;
    if (ticket.status === 'pending') ticket.status = 'processing';
    await this.logRepo.save({
      ticketId: ticket.id,
      operatorId: null,
      action: 'assign',
      detail: `系统自动分配给 ${picked.name}（${picked.account}）`,
    });
    await this.notifications.create(picked.id, 'assign', '新工单已自动分配给您', `工单 ${ticket.no}：${ticket.title}`, 'inapp', `/tickets/${ticket.id}`);
  }

  private async notifyNewTicket(ticket: Ticket) {
    for (const m of await this.managers()) {
      await this.notifications.create(m.id, 'new_ticket', '收到新工单', `工单 ${ticket.no}：${ticket.title}，请及时分配处理`, 'inapp', `/tickets/${ticket.id}`);
    }
    this.realtime.emitAll('ticket:new', { ticketId: ticket.id, no: ticket.no, title: ticket.title });
  }

  async create(user: any, body: any) {
    const title = (body.title || '').trim();
    const content = (body.content || '').trim();
    if (!title) throw new BadRequestException('工单标题不能为空');
    if (title.length > 128) throw new BadRequestException('标题不能超过 128 字');
    if (!content) throw new BadRequestException('问题描述不能为空');
    if (content.length > 2000) throw new BadRequestException('问题描述不能超过 2000 字');

    const ticket = this.ticketRepo.create({
      no: this.genNo(),
      title,
      content,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      customerId: user.sub,
      staffId: null,
      status: 'pending',
      priority: PRIORITIES.includes(body.priority) ? body.priority : 'normal',
      fieldValues: body.fieldValues ? JSON.stringify(body.fieldValues) : null,
      channel: body.channel || 'web',
    });
    await this.applySla(ticket);
    await this.ticketRepo.save(ticket);
    await this.msgRepo.save({ ticketId: ticket.id, senderId: user.sub, senderType: 'customer', content });
    await this.logRepo.save({ ticketId: ticket.id, operatorId: user.sub, action: 'create', detail: '客户提交工单' });
    await this.autoAssign(ticket);
    await this.ticketRepo.save(ticket);
    await this.notifyNewTicket(ticket);
    return this.detail(user, ticket.id);
  }

  async list(user: any, query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const size = Math.min(50, Math.max(1, Number(query.size) || 10));
    const qb = this.ticketRepo
      .createQueryBuilder('t')
      .select('t.id', 'id')
      .addSelect('t.no', 'no')
      .addSelect('t.title', 'title')
      .addSelect('t.priority', 'priority')
      .addSelect('t.channel', 'channel')
      .addSelect('t.categoryId', 'categoryId')
      .addSelect('t.customerId', 'customerId')
      .addSelect('t.staffId', 'staffId')
      .addSelect('t.status', 'status')
      .addSelect('t.slaResponseAt', 'slaResponseAt')
      .addSelect('t.slaResolveAt', 'slaResolveAt')
      .addSelect('t.createdAt', 'createdAt')
      .addSelect('t.updatedAt', 'updatedAt')
      .addSelect('customer.name', 'customerName')
      .addSelect('staff.name', 'staffName')
      .addSelect('category.name', 'categoryName')
      .leftJoin(User, 'customer', 'customer.id = t.customer_id')
      .leftJoin(User, 'staff', 'staff.id = t.staff_id')
      .leftJoin(Category, 'category', 'category.id = t.category_id');

    if (user.role === 'customer') qb.where('t.customer_id = :uid', { uid: user.sub });
    else if (user.role === 'staff') qb.where('t.staff_id = :uid', { uid: user.sub });

    if (query.status) qb.andWhere('t.status = :status', { status: query.status });
    if (query.priority) qb.andWhere('t.priority = :priority', { priority: query.priority });
    if (query.channel) qb.andWhere('t.channel = :channel', { channel: query.channel });
    if (query.overdue === '1') {
      qb.andWhere('t.status != :closed', { closed: 'closed' }).andWhere('t.sla_resolve_at IS NOT NULL').andWhere('t.sla_resolve_at < NOW()');
    }
    if (query.keyword) {
      qb.andWhere('(t.title LIKE :kw OR t.no LIKE :kw OR t.content LIKE :kw)', { kw: `%${query.keyword}%` });
    }
    if (query.staffId) qb.andWhere('t.staff_id = :staffId', { staffId: Number(query.staffId) });
    if (query.categoryId) qb.andWhere('t.category_id = :categoryId', { categoryId: Number(query.categoryId) });

    const total = await qb.getCount();
    const rows = await qb.orderBy('t.id', 'DESC').skip((page - 1) * size).take(size).getRawMany();
    const now = new Date();
    const list = rows.map((r) => ({
      ...r,
      overdue: r.status !== 'closed' && r.slaResolveAt && new Date(r.slaResolveAt) < now ? 1 : 0,
    }));
    return { list, total, page, size };
  }

  /** 客服工作台：我的待处理工单 + 最近留言 */
  async staffFeed(user: any) {
    const open = await this.ticketRepo
      .createQueryBuilder('t')
      .select('t.id', 'id')
      .addSelect('t.no', 'no')
      .addSelect('t.title', 'title')
      .addSelect('t.status', 'status')
      .addSelect('t.priority', 'priority')
      .addSelect('t.slaResolveAt', 'slaResolveAt')
      .addSelect('t.updatedAt', 'updatedAt')
      .addSelect('customer.name', 'customerName')
      .leftJoin(User, 'customer', 'customer.id = t.customer_id')
      .where('t.staff_id = :uid', { uid: user.sub })
      .andWhere('t.status != :closed', { closed: 'closed' })
      .orderBy('t.updated_at', 'DESC')
      .take(8)
      .getRawMany();

    const now = new Date();
    const openTickets = open.map((r) => ({
      ...r,
      overdue: r.slaResolveAt && new Date(r.slaResolveAt) < now ? 1 : 0,
    }));

    const recent = await this.msgRepo
      .createQueryBuilder('m')
      .select('m.id', 'id')
      .addSelect('m.content', 'content')
      .addSelect('m.senderType', 'senderType')
      .addSelect('m.createdAt', 'createdAt')
      .addSelect('t.id', 'ticketId')
      .addSelect('t.no', 'ticketNo')
      .addSelect('t.title', 'ticketTitle')
      .addSelect('sender.name', 'senderName')
      .innerJoin(Ticket, 't', 't.id = m.ticket_id')
      .leftJoin(User, 'sender', 'sender.id = m.sender_id')
      .where('t.staff_id = :uid', { uid: user.sub })
      .orderBy('m.id', 'DESC')
      .take(8)
      .getRawMany();

    return { openTickets, recentMessages: recent };
  }

  async detail(user: any, id: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    await this.assertAccess(user, ticket);

    const customer = ticket.customerId ? await this.userRepo.findOne({ where: { id: ticket.customerId } }) : null;
    const staff = ticket.staffId ? await this.userRepo.findOne({ where: { id: ticket.staffId } }) : null;
    const category = ticket.categoryId ? await this.catRepo.findOne({ where: { id: ticket.categoryId } }) : null;

    const messages = await this.msgRepo.find({ where: { ticketId: id }, order: { id: 'ASC' } });
    const logs = await this.logRepo.find({ where: { ticketId: id }, order: { id: 'ASC' } });
    const senderIds = Array.from(new Set([...messages.map((m) => m.senderId), ...logs.map((l) => l.operatorId)].filter((v): v is number => v != null)));
    const users = senderIds.length ? await this.userRepo.find({ where: { id: In(senderIds) } }) : [];
    const userMap = new Map(users.map((u) => [u.id, u.name]));
    let fieldValues = {};
    if (ticket.fieldValues) {
      try {
        fieldValues = JSON.parse(ticket.fieldValues);
      } catch {
        fieldValues = {};
      }
    }

    return {
      ticket: {
        ...ticket,
        customerName: customer?.name || (ticket.customerId ? '未知客户' : '外部客户'),
        staffName: staff?.name || null,
        categoryName: category?.name || null,
        overdue: ticket.status !== 'closed' && ticket.slaResolveAt && new Date(ticket.slaResolveAt) < new Date() ? 1 : 0,
        fieldValues,
      },
      messages: messages.map((m) => ({ ...m, senderName: m.senderId ? userMap.get(m.senderId) || null : '系统' })),
      logs: logs.map((l) => ({ ...l, operatorName: l.operatorId ? userMap.get(l.operatorId) || null : '系统' })),
    };
  }

  async reply(user: any, id: number, content: string) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    await this.assertAccess(user, ticket);
    if (ticket.status === 'closed') throw new BadRequestException('工单已完结，不能继续回复');
    const text = (content || '').trim();
    if (!text) throw new BadRequestException('回复内容不能为空');
    if (text.length > 2000) throw new BadRequestException('回复内容不能超过 2000 字');

    const senderType = user.role === 'customer' ? 'customer' : 'staff';
    await this.msgRepo.save({ ticketId: id, senderId: user.sub, senderType, content: text });
    await this.logRepo.save({
      ticketId: id,
      operatorId: user.sub,
      action: 'reply',
      detail: senderType === 'customer' ? '客户追加留言' : '客服回复留言',
    });

    if (senderType === 'customer' && ticket.status === 'waiting') {
      ticket.status = 'processing';
      await this.ticketRepo.save(ticket);
      await this.logRepo.save({
        ticketId: id,
        operatorId: user.sub,
        action: 'status',
        detail: '客户不认可方案并追加留言，工单回到处理中',
      });
    }

    // 通知对方
    if (senderType === 'staff' && ticket.customerId) {
      await this.notifications.create(ticket.customerId, 'reply', '客服回复了您的工单', `工单 ${ticket.no}：${ticket.title}`, 'inapp', `/tickets/${ticket.id}`);
    } else if (senderType === 'customer') {
      if (ticket.staffId) {
        await this.notifications.create(ticket.staffId, 'reply', '客户回复了工单', `工单 ${ticket.no}：${ticket.title}`, 'inapp', `/tickets/${ticket.id}`);
      } else {
        for (const m of await this.managers()) {
          await this.notifications.create(m.id, 'reply', '未分配工单有新留言', `工单 ${ticket.no}：${ticket.title}`, 'inapp', `/tickets/${ticket.id}`);
        }
      }
    }

    this.realtime.emitTo(`ticket:${id}`, 'ticket:message', { ticketId: id, senderType });
    return this.detail(user, id);
  }

  async updateStatus(user: any, id: number, status: string, note?: string) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    await this.assertAccess(user, ticket);
    if (!['processing', 'waiting', 'closed'].includes(status)) throw new BadRequestException('无效的状态变更');
    if (ticket.status === 'closed') throw new BadRequestException('工单已完结，状态不可再变更');
    if (!ticket.staffId && user.role === 'staff') throw new BadRequestException('工单尚未分配，无法处理');

    ticket.status = status as Ticket['status'];
    if (status === 'closed') ticket.closedAt = new Date();
    await this.ticketRepo.save(ticket);
    await this.logRepo.save({
      ticketId: id,
      operatorId: user.sub,
      action: 'status',
      detail: `${note ? note + ' | ' : ''}状态变更为 ${STATUS_LABEL[status]}`,
    });

    if (ticket.customerId) {
      if (status === 'waiting') {
        await this.notifications.create(ticket.customerId, 'status', '工单待您确认', `工单 ${ticket.no} 处理完成，请确认结果`, 'inapp', `/tickets/${ticket.id}`);
      } else if (status === 'closed') {
        await this.notifications.create(ticket.customerId, 'status', '工单已完结，欢迎评价', `工单 ${ticket.no} 已完结，感谢您的反馈`, 'inapp', `/tickets/${ticket.id}`);
      }
    }
    this.realtime.emitTo(`ticket:${id}`, 'ticket:updated', { ticketId: id, status });
    return this.detail(user, id);
  }

  async assign(user: any, id: number, staffId: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    if (ticket.status === 'closed') throw new BadRequestException('工单已完结，不能分配');
    const staff = await this.userRepo.findOne({ where: { id: staffId, role: 'staff', status: 1 } });
    if (!staff) throw new BadRequestException('目标客服不存在或不在岗');

    const action = ticket.staffId && ticket.staffId !== staffId ? 'transfer' : 'assign';
    ticket.staffId = staffId;
    if (ticket.status === 'pending') ticket.status = 'processing';
    await this.ticketRepo.save(ticket);
    await this.logRepo.save({
      ticketId: id,
      operatorId: user.sub,
      action,
      detail: `${action === 'transfer' ? '转派' : '分配'}给 ${staff.name}（${staff.account}）`,
    });
    await this.notifications.create(staffId, 'assign', '新工单已分配给您', `工单 ${ticket.no}：${ticket.title}`, 'inapp', `/tickets/${ticket.id}`);
    this.realtime.emitTo(`ticket:${id}`, 'ticket:updated', { ticketId: id });
    return this.detail(user, id);
  }

  async confirm(user: any, id: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('工单不存在');
    if (ticket.customerId !== user.sub) throw new ForbiddenException('只能确认自己的工单');
    if (ticket.status !== 'waiting') throw new BadRequestException('仅待客户确认的工单可确认解决');
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await this.ticketRepo.save(ticket);
    await this.logRepo.save({ ticketId: id, operatorId: user.sub, action: 'confirm', detail: '客户确认解决方案，工单关闭' });
    if (ticket.staffId) {
      await this.notifications.create(ticket.staffId, 'confirm', '客户已确认解决', `工单 ${ticket.no} 已关闭`, 'inapp', `/tickets/${ticket.id}`);
    }
    this.realtime.emitTo(`ticket:${id}`, 'ticket:updated', { ticketId: id });
    return this.detail(user, id);
  }

  private async assertAccess(user: any, ticket: Ticket) {
    if (user.role === 'customer' && ticket.customerId !== user.sub) {
      throw new ForbiddenException('只能查看自己的工单');
    }
    if (user.role === 'staff' && ticket.staffId !== user.sub) {
      throw new ForbiddenException('只能查看分配给自己的工单');
    }
  }
}
