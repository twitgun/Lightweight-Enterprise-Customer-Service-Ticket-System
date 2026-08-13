import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly system: SystemService) {}

  @Roles('manager')
  @Get('sla')
  slaList() {
    return this.system.slaList();
  }

  @Roles('manager')
  @Put('sla/:priority')
  updateSla(@Param('priority') priority: string, @Body() body: any) {
    return this.system.updateSla(priority, body);
  }
}
