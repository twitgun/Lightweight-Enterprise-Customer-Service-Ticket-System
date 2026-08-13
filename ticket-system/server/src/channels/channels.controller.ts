import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Public, Roles } from '../common/decorators';
import { ChannelsService } from './channels.service';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channels: ChannelsService) {}

  @Roles('manager')
  @Get()
  list() {
    return this.channels.list();
  }

  @Roles('manager')
  @Put(':type')
  update(@Param('type') type: string, @Body() body: any) {
    return this.channels.update(type, body);
  }

  @Public()
  @Post('inbound/:type')
  inbound(@Param('type') type: string, @Body() body: any) {
    return this.channels.inbound(type, body);
  }
}
