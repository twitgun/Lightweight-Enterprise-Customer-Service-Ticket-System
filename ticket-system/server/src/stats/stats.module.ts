import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Message, Satisfaction, Ticket, User } from '../entities';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User, Message, Satisfaction, Category])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
