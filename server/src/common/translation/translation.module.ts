import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';

@Module({
  controllers: [TranslationController],
  providers: [TranslationService],
  exports: [TranslationService], //- để các module khác có thể dùng
})
export class TranslationModule {}
