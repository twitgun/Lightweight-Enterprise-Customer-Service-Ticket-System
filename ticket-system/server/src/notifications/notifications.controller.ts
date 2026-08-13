import { Controller, Get, Param, Put } from '@nestjs/common';
import { CurrentUser } from '../common/decorators';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.notifications.list(user.sub);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: any) {
    return this.notifications.unreadCount(user.sub);
  }

  @Put('read')
  markAllRead(@CurrentUser() user: any) {
    return this.notifications.markRead(user.sub);
  }

  @Put('read/:id')
  markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notifications.markRead(user.sub, Number(id));
  }
}
