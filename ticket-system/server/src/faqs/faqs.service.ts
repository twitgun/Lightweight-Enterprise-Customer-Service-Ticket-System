import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../entities';

@Injectable()
export class FaqsService {
  constructor(@InjectRepository(Faq) private readonly faqRepo: Repository<Faq>) {}

  list(activeOnly = true) {
    return this.faqRepo.find({
      where: activeOnly ? { status: 1 } : {},
      order: { sort: 'ASC', id: 'ASC' },
    });
  }

  async create(body: { question: string; answer: string; sort?: number }) {
    if (!body.question?.trim() || !body.answer?.trim()) throw new BadRequestException('问题和答案都不能为空');
    return this.faqRepo.save(this.faqRepo.create({ question: body.question.trim(), answer: body.answer.trim(), sort: body.sort || 0, status: 1 }));
  }

  async update(id: number, body: { question?: string; answer?: string; sort?: number; status?: number }) {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException('常见问题不存在');
    if (body.question !== undefined) faq.question = body.question.trim();
    if (body.answer !== undefined) faq.answer = body.answer.trim();
    if (body.sort !== undefined) faq.sort = body.sort;
    if (body.status !== undefined) faq.status = body.status;
    return this.faqRepo.save(faq);
  }

  async remove(id: number) {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException('常见问题不存在');
    await this.faqRepo.delete(id);
    return { success: true };
  }
}
