import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phrase } from '../entities';

@Injectable()
export class PhrasesService {
  constructor(@InjectRepository(Phrase) private readonly phraseRepo: Repository<Phrase>) {}

  list(activeOnly = true) {
    return this.phraseRepo.find({
      where: activeOnly ? { status: 1 } : {},
      order: { sort: 'ASC', id: 'ASC' },
    });
  }

  async create(body: { content: string; sort?: number }) {
    if (!body.content?.trim()) throw new BadRequestException('快捷回复内容不能为空');
    return this.phraseRepo.save(this.phraseRepo.create({ content: body.content.trim(), sort: body.sort || 0, status: 1 }));
  }

  async update(id: number, body: { content?: string; sort?: number; status?: number }) {
    const phrase = await this.phraseRepo.findOne({ where: { id } });
    if (!phrase) throw new NotFoundException('快捷回复不存在');
    if (body.content !== undefined) phrase.content = body.content.trim();
    if (body.sort !== undefined) phrase.sort = body.sort;
    if (body.status !== undefined) phrase.status = body.status;
    return this.phraseRepo.save(phrase);
  }

  async remove(id: number) {
    const phrase = await this.phraseRepo.findOne({ where: { id } });
    if (!phrase) throw new NotFoundException('快捷回复不存在');
    await this.phraseRepo.delete(id);
    return { success: true };
  }
}
