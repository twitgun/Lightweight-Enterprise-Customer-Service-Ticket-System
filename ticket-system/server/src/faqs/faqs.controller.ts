import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Public, Roles } from '../common/decorators';
import { FaqsService } from './faqs.service';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Public()
  @Get()
  list() {
    return this.faqs.list(true);
  }

  @Roles('manager')
  @Get('all')
  listAll() {
    return this.faqs.list(false);
  }

  @Roles('manager')
  @Post()
  create(@Body() body: any) {
    return this.faqs.create(body);
  }

  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.faqs.update(Number(id), body);
  }

  @Roles('manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqs.remove(Number(id));
  }
}
