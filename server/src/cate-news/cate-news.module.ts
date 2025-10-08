import { Module } from '@nestjs/common';
import { CateNewsService } from './cate-news.service';
import { CateNewsController } from './cate-news.controller';
import { TranslationModule } from 'src/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CateNews, CateNewsSchema } from './schemas/cate-new.schema';

@Module({
  imports: [
    TranslationModule,
    MongooseModule.forFeature([
      { name: CateNews.name, schema: CateNewsSchema },
    ]),
  ],
  controllers: [CateNewsController],
  providers: [CateNewsService],
})
export class CateNewsModule {}
