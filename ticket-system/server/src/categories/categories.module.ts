import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Ticket } from '../entities';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Ticket])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
