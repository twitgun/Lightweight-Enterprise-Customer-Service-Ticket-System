import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Public, Roles } from '../common/decorators';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Public()
  @Get()
  list() {
    return this.categories.list(true);
  }

  @Roles('manager')
  @Get('all')
  listAll() {
    return this.categories.list(false);
  }

  @Roles('manager')
  @Post()
  create(@Body() body: any) {
    return this.categories.create(body);
  }

  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.categories.update(Number(id), body);
  }

  @Roles('manager')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categories.remove(Number(id));
  }
}
