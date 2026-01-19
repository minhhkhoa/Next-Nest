import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema } from './schemas/news.schema';
import { CateNewsModule } from 'src/modules/cate-news/cate-news.module';
import { BusinessModule } from 'src/common/decorator/customize';
import { UserModule } from '../user/user.module';

@BusinessModule()
@Module({
  imports: [
    UserModule,
    TranslationModule,
    CateNewsModule,
    MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
  ],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
