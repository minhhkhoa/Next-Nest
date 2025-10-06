import { Body, Controller, Post, Query } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { allModules } from './translation.config';

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  async translate(@Query('module') module: allModules, @Body() data: any) {
    if (!module) {
      return { error: 'Module name is required (jobs | news)' };
    }
    const translated = await this.translationService.translateModuleData(
      module,
      data,
    );
    return translated;
  }
}
