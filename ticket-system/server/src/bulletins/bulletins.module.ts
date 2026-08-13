import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bulletin } from '../entities';
import { BulletinsController } from './bulletins.controller';
import { BulletinsService } from './bulletins.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bulletin])],
  controllers: [BulletinsController],
  providers: [BulletinsService],
})
export class BulletinsModule {}
