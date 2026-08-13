import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Public, Roles } from '../common/decorators';
import { BulletinsService } from './bulletins.service';

@Controller('bulletins')
export class BulletinsController {
  constructor(private readonly bulletins: BulletinsService) {}

  @Public()
  @Get()
  list() {
    return this.bulletins.list(true);
  }

  @Roles('manager')
  @Get('all')
  listAll() {
    return this.bulletins.list(false);
  }

  @Roles('manager')
  @Post()
  create(@Body() body: any) {
    return this.bulletins.create(body);
  }

  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bulletins.update(Number(id), body);
  }

  @Roles('manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bulletins.remove(Number(id));
  }
}
