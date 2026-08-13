import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Message, Satisfaction, Ticket, User } from '../entities';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(Satisfaction) private readonly satRepo: Repository<Satisfaction>,
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,
  ) {}

  async dashboard() {
    const [tickets, staff, customers, categories, satisfactions, allUsers] = await Promise.all([
      this.ticketRepo.find(),
      this.userRepo.find({ where: { role: 'staff', status: 1 } }),
      this.userRepo.count({ where: { role: 'customer' } }),
      this.catRepo.find(),
      this.satRepo.find(),
      this.userRepo.find(),
    ]);
    const userNameMap = new Map(allUsers.map((u) => [u.id, u.name]));
    const messages = await this.msgRepo.find({ where: { senderType: 'staff' }, order: { id: 'ASC' } });
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const total = tickets.length;
    const byStatus = { pending: 0, processing: 0, waiting: 0, closed: 0 };
    for (const t of tickets) byStatus[t.status]++;
    const overdue = tickets.filter((t) => t.status !== 'closed' && t.slaResolveAt && new Date(t.slaResolveAt) < now).length;
    const todayNew = tickets.filter((t) => new Date(t.createdAt) >= todayStart).length;

    // 近 14 天趋势
    const trend: Array<{ date: string; created: number; closed: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const created = tickets.filter((t) => {
        const c = new Date(t.createdAt);
        return c >= d && c < next;
      }).length;
      const closed = tickets.filter((t) => {
        if (!t.closedAt) return false;
        const c = new Date(t.closedAt);
        return c >= d && c < next;
      }).length;
      trend.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, created, closed });
    }

    // 首次客服响应时长（分钟）
    const firstReplyAt = new Map<number, Date>();
    for (const m of messages) {
      if (!firstReplyAt.has(m.ticketId)) firstReplyAt.set(m.ticketId, m.createdAt);
    }
    const repliedTickets = tickets.filter((t) => firstReplyAt.has(t.id));
    const avgResponseMinutes = repliedTickets.length
      ? Math.round(
          repliedTickets.reduce((sum, t) => {
            const diff = firstReplyAt.get(t.id)!.getTime() - new Date(t.createdAt).getTime();
            return sum + Math.max(0, diff / 60000);
          }, 0) / repliedTickets.length,
        )
      : 0;

    // 平均解决时长（小时）
    const closedTickets = tickets.filter((t) => t.status === 'closed' && t.closedAt);
    const avgResolveHours = closedTickets.length
      ? Math.round(
          (closedTickets.reduce((sum, t) => sum + (new Date(t.closedAt!).getTime() - new Date(t.createdAt).getTime()), 0) /
            closedTickets.length /
            3600000) *
            10,
        ) / 10
      : 0;

    // 满意度
    const csatAvg = satisfactions.length
      ? Math.round((satisfactions.reduce((s, x) => s + x.rating, 0) / satisfactions.length) * 10) / 10
      : 0;
    const csatDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const s of satisfactions) csatDist[s.rating] = (csatDist[s.rating] || 0) + 1;

    // 分类分布
    const catNameMap = new Map(categories.map((c) => [c.id, c.name]));
    const catCount = new Map<number | null, number>();
    for (const t of tickets) catCount.set(t.categoryId, (catCount.get(t.categoryId) || 0) + 1);
    const categoryDist = Array.from(catCount.entries())
      .map(([id, count]) => ({ name: id ? catNameMap.get(id) || '未分类' : '未分类', count }))
      .sort((a, b) => b.count - a.count);

    // 客服绩效
    const staffNameMap = new Map(staff.map((s) => [s.id, s.name]));
    const satMap = new Map(satisfactions.map((s) => [s.ticketId, s.rating]));
    const staffPerformance = staff.map((s) => {
      const mine = tickets.filter((t) => t.staffId === s.id);
      const openCount = mine.filter((t) => t.status !== 'closed').length;
      const closedCount = mine.filter((t) => t.status === 'closed').length;
      const replied = mine.filter((t) => firstReplyAt.has(t.id));
      const avgResponse = replied.length
        ? Math.round(
            replied.reduce((sum, t) => sum + Math.max(0, (firstReplyAt.get(t.id)!.getTime() - new Date(t.createdAt).getTime()) / 60000), 0) /
              replied.length,
          )
        : 0;
      const rated = mine.filter((t) => satMap.has(t.id));
      const avgRating = rated.length
        ? Math.round((rated.reduce((sum, t) => sum + (satMap.get(t.id) || 0), 0) / rated.length) * 10) / 10
        : 0;
      return {
        staffId: s.id,
        name: s.name,
        openCount,
        closedCount,
        avgResponse,
        avgRating,
      };
    });
    const staffLoad = staffPerformance.map((p) => ({ staffId: p.staffId, name: p.name, count: p.openCount }));

    // 最近 10 条
    const recent = [...tickets]
      .sort((a, b) => b.id - a.id)
      .slice(0, 10)
      .map((t) => {
        return {
          id: t.id,
          no: t.no,
          title: t.title,
          status: t.status,
          priority: t.priority,
          createdAt: t.createdAt,
          customerName: t.customerId ? userNameMap.get(t.customerId) || null : '外部客户',
          staffName: t.staffId ? userNameMap.get(t.staffId) || null : null,
        };
      });

    return {
      total,
      byStatus,
      overdue,
      todayNew,
      trend,
      avgResponseMinutes,
      avgResolveHours,
      csatAvg,
      csatCount: satisfactions.length,
      csatDist,
      staffCount: staff.length,
      customerCount: customers,
      categoryDist,
      staffLoad,
      staffPerformance,
      recent,
    };
  }

  async my(user: any) {
    const tickets = await this.ticketRepo.find({ where: { staffId: user.sub } });
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const processing = tickets.filter((t) => t.status !== 'closed').length;
    const closed = tickets.filter((t) => t.status === 'closed').length;
    const todayClosed = tickets.filter((t) => t.closedAt && new Date(t.closedAt) >= todayStart).length;
    const overdue = tickets.filter((t) => t.status !== 'closed' && t.slaResolveAt && new Date(t.slaResolveAt) < now).length;
    return { processing, closed, todayClosed, overdue };
  }
}
