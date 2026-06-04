import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { ElasticsearchService } from './elasticsearch.service';

//- khai báo module toàn cục để có thể sử dụng ở các module khác mà không cần import lại
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
  ],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
