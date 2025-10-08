import { Module } from '@nestjs/common';
import { CateNewsService } from './cate-news.service';
import { CateNewsController } from './cate-news.controller';

@Module({
  controllers: [CateNewsController],
  providers: [CateNewsService],
})
export class CateNewsModule {}
