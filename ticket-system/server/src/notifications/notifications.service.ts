import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifRepo: Repository<Notification>) {}

  create(userId: number, type: string, title: string, content?: string, channel = 'inapp', link?: string) {
    return this.notifRepo.save(
      this.notifRepo.create({ userId, type, title, content: content || null, channel, link: link || null, isRead: 0 }),
    );
  }

  list(userId: number) {
    return this.notifRepo.find({ where: { userId }, order: { id: 'DESC' }, take: 50 });
  }

  unreadCount(userId: number) {
    return this.notifRepo.count({ where: { userId, isRead: 0 } });
  }

  async markRead(userId: number, id?: number) {
    if (id) {
      await this.notifRepo.update({ id, userId }, { isRead: 1 });
    } else {
      await this.notifRepo.update({ userId }, { isRead: 1 });
    }
    return { success: true };
  }
}
