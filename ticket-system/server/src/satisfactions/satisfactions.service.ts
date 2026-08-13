import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Satisfaction, Ticket } from '../entities';

@Injectable()
export class SatisfactionsService {
  constructor(
    @InjectRepository(Satisfaction) private readonly satRepo: Repository<Satisfaction>,
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
  ) {}

  async rate(user: any, ticketId: number, rating: number, comment?: string) {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('工单不存在');
    if (ticket.customerId !== user.sub) throw new ForbiddenException('只能评价自己的工单');
    if (ticket.status !== 'closed') throw new BadRequestException('工单完结后才能评价');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BadRequestException('评分需为 1-5 分');
    const exists = await this.satRepo.findOne({ where: { ticketId } });
    if (exists) throw new BadRequestException('该工单已评价过');
    return this.satRepo.save(this.satRepo.create({ ticketId, rating, comment: comment || null }));
  }

  async byTicket(user: any, ticketId: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('工单不存在');
    if (user.role === 'customer' && ticket.customerId !== user.sub) throw new ForbiddenException('无权查看');
    if (user.role === 'staff' && ticket.staffId !== user.sub) throw new ForbiddenException('无权查看');
    return this.satRepo.findOne({ where: { ticketId } });
  }
}
