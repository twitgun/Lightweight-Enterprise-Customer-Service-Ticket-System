import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlaPolicy } from '../entities';
import { SettingsModule } from '../settings/settings.module';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [TypeOrmModule.forFeature([SlaPolicy]), SettingsModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
