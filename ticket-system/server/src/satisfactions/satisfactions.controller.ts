import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import { SatisfactionsService } from './satisfactions.service';

@Controller('satisfactions')
export class SatisfactionsController {
  constructor(private readonly satisfactions: SatisfactionsService) {}

  @Roles('customer')
  @Post('tickets/:id')
  rate(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.satisfactions.rate(user, Number(id), Number(body.rating), body.comment);
  }

  @Get('tickets/:id')
  byTicket(@CurrentUser() user: any, @Param('id') id: string) {
    return this.satisfactions.byTicket(user, Number(id));
  }
}
