import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Roles('customer')
  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.tickets.create(user, body);
  }

  @Get()
  list(@CurrentUser() user: any, @Query() query: any) {
    return this.tickets.list(user, query);
  }

  @Roles('staff', 'manager')
  @Get('staff-feed')
  staffFeed(@CurrentUser() user: any) {
    return this.tickets.staffFeed(user);
  }

  @Get(':id')
  detail(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tickets.detail(user, Number(id));
  }

  @Post(':id/messages')
  reply(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.tickets.reply(user, Number(id), body.content);
  }

  @Roles('staff', 'manager')
  @Put(':id/status')
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.tickets.updateStatus(user, Number(id), body.status, body.note);
  }

  @Roles('manager')
  @Put(':id/assign')
  assign(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.tickets.assign(user, Number(id), Number(body.staffId));
  }

  @Roles('customer')
  @Put(':id/confirm')
  confirm(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tickets.confirm(user, Number(id));
  }
}
