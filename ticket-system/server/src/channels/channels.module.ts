import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Ticket } from '../entities';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Ticket])],
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}
