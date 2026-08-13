import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Ticket } from '../entities';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
  ) {}

  list(activeOnly = true) {
    return this.catRepo.find({
      where: activeOnly ? { status: 1 } : {},
      order: { sort: 'ASC', id: 'ASC' },
    });
  }

  async create(body: { name: string; sort?: number }) {
    if (!body.name || !body.name.trim()) throw new BadRequestException('分类名称不能为空');
    const cat = this.catRepo.create({ name: body.name.trim(), sort: body.sort || 0, status: 1 });
    return this.catRepo.save(cat);
  }

  async update(id: number, body: { name?: string; sort?: number; status?: number }) {
    const cat = await this.catRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('分类不存在');
    if (body.name !== undefined) {
      if (!body.name.trim()) throw new BadRequestException('分类名称不能为空');
      cat.name = body.name.trim();
    }
    if (body.sort !== undefined) cat.sort = body.sort;
    if (body.status !== undefined) cat.status = body.status;
    return this.catRepo.save(cat);
  }

  async remove(id: number) {
    const cat = await this.catRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('分类不存在');
    const used = await this.ticketRepo.count({ where: { categoryId: id } });
    if (used > 0) throw new BadRequestException(`该分类下已有 ${used} 张工单，不能删除`);
    await this.catRepo.delete(id);
    return { success: true };
  }
}
