import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormField } from '../entities';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';

@Module({
  imports: [TypeOrmModule.forFeature([FormField])],
  controllers: [FormsController],
  providers: [FormsService],
})
export class FormsModule {}
