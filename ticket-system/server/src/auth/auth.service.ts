import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async login(account: string, password: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.account = :account', { account })
      .getOne();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('账号或密码错误');
    }
    if (user.status !== 1) throw new UnauthorizedException('账号已被禁用');
    return { token: this.sign(user), user: this.safeUser(user) };
  }

  async register(body: { account: string; password: string; name: string; phone?: string; company?: string }) {
    const account = (body.account || '').trim();
    if (!/^[A-Za-z0-9_]{3,32}$/.test(account)) {
      throw new BadRequestException('账号需为 3-32 位字母、数字或下划线');
    }
    if (!body.password || body.password.length < 6) throw new BadRequestException('密码至少 6 位');
    if (!body.name) throw new BadRequestException('请填写姓名或称呼');
    const exists = await this.userRepo.findOne({ where: { account } });
    if (exists) throw new BadRequestException('该账号已被注册');

    const user = this.userRepo.create({
      account,
      password: bcrypt.hashSync(body.password, 10),
      name: body.name,
      phone: body.phone || null,
      company: body.company || null,
      role: 'customer',
      status: 1,
    });
    await this.userRepo.save(user);
    return { token: this.sign(user), user: this.safeUser(user) };
  }

  async me(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    return this.safeUser(user);
  }

  private sign(user: User) {
    return this.jwt.sign({ sub: user.id, account: user.account, role: user.role, name: user.name });
  }

  private safeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
