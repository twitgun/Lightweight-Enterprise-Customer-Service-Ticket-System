import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Satisfaction, Ticket } from '../entities';
import { SatisfactionsController } from './satisfactions.controller';
import { SatisfactionsService } from './satisfactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Satisfaction, Ticket])],
  controllers: [SatisfactionsController],
  providers: [SatisfactionsService],
})
export class SatisfactionsModule {}
