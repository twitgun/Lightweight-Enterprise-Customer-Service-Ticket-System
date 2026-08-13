import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async list(role?: string, keyword?: string) {
    const qb = this.userRepo.createQueryBuilder('user');
    if (role) qb.andWhere('user.role = :role', { role });
    if (keyword) {
      qb.andWhere('(user.account LIKE :kw OR user.name LIKE :kw OR user.phone LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    qb.orderBy('user.id', 'DESC');
    return qb.getMany();
  }

  async create(body: any) {
    const account = (body.account || '').trim();
    if (!/^[A-Za-z0-9_]{3,32}$/.test(account)) {
      throw new BadRequestException('账号需为 3-32 位字母、数字或下划线');
    }
    if (!['customer', 'staff'].includes(body.role)) {
      throw new BadRequestException('只能创建客户或客服账号');
    }
    const exists = await this.userRepo.findOne({ where: { account } });
    if (exists) throw new BadRequestException('账号已存在');

    const user = this.userRepo.create({
      account,
      password: bcrypt.hashSync(body.password || '123456', 10),
      name: body.name || account,
      phone: body.phone || null,
      company: body.company || null,
      role: body.role,
      status: body.status === 0 ? 0 : 1,
    });
    return this.userRepo.save(user);
  }

  async update(id: number, body: any) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role === 'manager' && body.status === 0) throw new BadRequestException('不能禁用主管账号');
    if (body.password) user.password = bcrypt.hashSync(body.password, 10);
    if (body.name !== undefined) user.name = body.name;
    if (body.phone !== undefined) user.phone = body.phone || null;
    if (body.company !== undefined) user.company = body.company || null;
    if (body.status !== undefined) user.status = body.status;
    return this.userRepo.save(user);
  }

  async staffList() {
    return this.userRepo.find({ where: { role: 'staff', status: 1 }, order: { id: 'ASC' } });
  }
}
