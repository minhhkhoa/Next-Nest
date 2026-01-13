import { Module } from '@nestjs/common';
import { CateNewsService } from './cate-news.service';
import { CateNewsController } from './cate-news.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CateNews, CateNewsSchema } from './schemas/cate-new.schema';
import { BusinessModule } from 'src/common/decorator/customize';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    MongooseModule.forFeature([
      { name: CateNews.name, schema: CateNewsSchema },
    ]),
  ],
  controllers: [CateNewsController],
  providers: [CateNewsService],
  exports: [CateNewsService],
})
export class CateNewsModule {}
