import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phrase } from '../entities';
import { PhrasesController } from './phrases.controller';
import { PhrasesService } from './phrases.service';

@Module({
  imports: [TypeOrmModule.forFeature([Phrase])],
  controllers: [PhrasesController],
  providers: [PhrasesService],
})
export class PhrasesModule {}
