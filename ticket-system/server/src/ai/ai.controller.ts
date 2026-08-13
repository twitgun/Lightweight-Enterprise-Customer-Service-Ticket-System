import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { Public, Roles } from '../common/decorators';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Roles('staff', 'manager')
  @Post('reply')
  suggestReply(@Body() body: any) {
    return this.ai.suggestReply(Number(body.ticketId), body.draft);
  }

  @Roles('staff', 'manager')
  @Post('summarize')
  summarize(@Body() body: any) {
    return this.ai.summarize(Number(body.ticketId));
  }

  @Roles('staff', 'manager')
  @Post('classify')
  classify(@Body() body: any) {
    return this.ai.classify(Number(body.ticketId));
  }

  @Public()
  @Post('ask')
  ask(@Body() body: any) {
    return this.ai.ask(body.question);
  }

  @Roles('manager')
  @Get('config')
  getConfig() {
    return this.ai.getConfig();
  }

  @Roles('manager')
  @Put('config')
  saveConfig(@Body() body: any) {
    return this.ai.saveConfig(body);
  }
}
