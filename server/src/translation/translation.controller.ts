import { Body, Controller, Post, Query } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { allModules } from './translation.config';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  @ApiOperation({ summary: 'api dịch dữ liệu' })
  @ApiBody({
    //- custom show field lên swagger, vì data để any nên cần dùng cái này
    schema: {
      type: 'object',
      example: {
        title: 'Xin chào',
        name: 'Đoạn mã dịch',
        description: 'Nội dung cần dịch',
      },
    },
  })
  async translate(@Query('module') module: allModules, @Body() data: any) {
    if (!module) {
      return { error: 'Module name is required' };
    }
    const translated = await this.translationService.translateModuleData(
      module,
      data,
    );
    return translated;
  }
}
