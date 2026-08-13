import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Public, Roles } from '../common/decorators';
import { FormsService } from './forms.service';

@Controller('forms')
export class FormsController {
  constructor(private readonly forms: FormsService) {}

  @Public()
  @Get()
  list() {
    return this.forms.list(true);
  }

  @Roles('manager')
  @Get('all')
  listAll() {
    return this.forms.list(false);
  }

  @Roles('manager')
  @Post()
  create(@Body() body: any) {
    return this.forms.create(body);
  }

  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.forms.update(Number(id), body);
  }

  @Roles('manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.forms.remove(Number(id));
  }
}
