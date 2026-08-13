import { Controller, Get } from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Roles('manager')
  @Get('dashboard')
  dashboard() {
    return this.stats.dashboard();
  }

  @Roles('staff')
  @Get('my')
  my(@CurrentUser() user: any) {
    return this.stats.my(user);
  }
}
