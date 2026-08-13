import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlaPolicy } from '../entities';

@Injectable()
export class SystemService {
  constructor(@InjectRepository(SlaPolicy) private readonly slaRepo: Repository<SlaPolicy>) {}

  slaList() {
    return this.slaRepo.find({ order: { id: 'ASC' } });
  }

  async updateSla(priority: string, body: { responseHours?: number; resolveHours?: number }) {
    const policy = await this.slaRepo.findOne({ where: { priority } });
    if (!policy) throw new NotFoundException('SLA 策略不存在');
    if (body.responseHours !== undefined) policy.responseHours = Math.max(1, Number(body.responseHours) || 1);
    if (body.resolveHours !== undefined) policy.resolveHours = Math.max(1, Number(body.resolveHours) || 1);
    return this.slaRepo.save(policy);
  }
}
