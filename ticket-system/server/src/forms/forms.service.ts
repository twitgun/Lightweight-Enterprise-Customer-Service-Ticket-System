import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormField } from '../entities';

const FIELD_TYPES = ['text', 'textarea', 'select', 'date'];

@Injectable()
export class FormsService {
  constructor(@InjectRepository(FormField) private readonly fieldRepo: Repository<FormField>) {}

  list(activeOnly = true) {
    return this.fieldRepo.find({
      where: activeOnly ? { status: 1 } : {},
      order: { sort: 'ASC', id: 'ASC' },
    });
  }

  async create(body: any) {
    if (!body.label?.trim()) throw new BadRequestException('字段名称不能为空');
    if (!FIELD_TYPES.includes(body.type)) throw new BadRequestException('无效的字段类型');
    const field = this.fieldRepo.create({
      label: body.label.trim(),
      type: body.type,
      required: body.required ? 1 : 0,
      options: body.type === 'select' ? JSON.stringify(body.options || []) : null,
      sort: body.sort || 0,
      status: body.status === 0 ? 0 : 1,
    });
    return this.fieldRepo.save(field);
  }

  async update(id: number, body: any) {
    const field = await this.fieldRepo.findOne({ where: { id } });
    if (!field) throw new NotFoundException('字段不存在');
    if (body.label !== undefined) field.label = body.label.trim();
    if (body.type !== undefined) {
      if (!FIELD_TYPES.includes(body.type)) throw new BadRequestException('无效的字段类型');
      field.type = body.type;
    }
    if (body.required !== undefined) field.required = body.required ? 1 : 0;
    if (body.options !== undefined) field.options = JSON.stringify(body.options || []);
    if (body.sort !== undefined) field.sort = body.sort;
    if (body.status !== undefined) field.status = body.status;
    return this.fieldRepo.save(field);
  }

  async remove(id: number) {
    const field = await this.fieldRepo.findOne({ where: { id } });
    if (!field) throw new NotFoundException('字段不存在');
    await this.fieldRepo.delete(id);
    return { success: true };
  }
}
