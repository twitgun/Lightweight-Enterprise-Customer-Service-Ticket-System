import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { PhrasesService } from './phrases.service';

@Controller('phrases')
export class PhrasesController {
  constructor(private readonly phrases: PhrasesService) {}

  @Roles('staff', 'manager')
  @Get()
  list() {
    return this.phrases.list(true);
  }

  @Roles('manager')
  @Get('all')
  listAll() {
    return this.phrases.list(false);
  }

  @Roles('manager')
  @Post()
  create(@Body() body: any) {
    return this.phrases.create(body);
  }

  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.phrases.update(Number(id), body);
  }

  @Roles('manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phrases.remove(Number(id));
  }
}
