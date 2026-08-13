import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bulletin } from '../entities';

@Injectable()
export class BulletinsService {
  constructor(@InjectRepository(Bulletin) private readonly bulletinRepo: Repository<Bulletin>) {}

  list(activeOnly = true) {
    return this.bulletinRepo.find({
      where: activeOnly ? { status: 1 } : {},
      order: { id: 'DESC' },
    });
  }

  async create(body: { title: string; content: string }) {
    if (!body.title?.trim() || !body.content?.trim()) throw new BadRequestException('公告标题和内容都不能为空');
    return this.bulletinRepo.save(this.bulletinRepo.create({ title: body.title.trim(), content: body.content.trim(), status: 1 }));
  }

  async update(id: number, body: { title?: string; content?: string; status?: number }) {
    const bulletin = await this.bulletinRepo.findOne({ where: { id } });
    if (!bulletin) throw new NotFoundException('公告不存在');
    if (body.title !== undefined) bulletin.title = body.title.trim();
    if (body.content !== undefined) bulletin.content = body.content.trim();
    if (body.status !== undefined) bulletin.status = body.status;
    return this.bulletinRepo.save(bulletin);
  }

  async remove(id: number) {
    const bulletin = await this.bulletinRepo.findOne({ where: { id } });
    if (!bulletin) throw new NotFoundException('公告不存在');
    await this.bulletinRepo.delete(id);
    return { success: true };
  }
}
