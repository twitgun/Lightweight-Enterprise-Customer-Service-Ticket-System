import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Roles } from '../common/decorators';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Roles('manager')
  @Get()
  list(@Query('role') role?: string, @Query('keyword') keyword?: string) {
    return this.users.list(role, keyword);
  }

  @Roles('manager')
  @Post()
  create(@Body() body: any) {
    return this.users.create(body);
  }

  @Roles('manager')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.users.update(Number(id), body);
  }

  @Get('staff')
  staffList() {
    return this.users.staffList();
  }
}
