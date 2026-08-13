import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(Setting) private readonly settingRepo: Repository<Setting>) {}

  async get(key: string, def = ''): Promise<string> {
    const row = await this.settingRepo.findOne({ where: { key } });
    return row?.value ?? def;
  }

  async set(key: string, value: string) {
    let row = await this.settingRepo.findOne({ where: { key } });
    if (row) {
      row.value = value;
      return this.settingRepo.save(row);
    }
    return this.settingRepo.save(this.settingRepo.create({ key, value }));
  }

  async getJson(key: string, def: unknown = null) {
    const v = await this.get(key, '');
    if (!v) return def;
    try {
      return JSON.parse(v);
    } catch {
      return def;
    }
  }

  async setJson(key: string, value: unknown) {
    return this.set(key, JSON.stringify(value));
  }
}
