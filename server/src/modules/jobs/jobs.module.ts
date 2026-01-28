import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { BusinessModule } from 'src/common/decorator/customize';
import { UserModule } from '../user/user.module';
import { JobCronService } from 'src/common/service/job-cron.service';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    UserModule,
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
  ],
  controllers: [JobsController],
  providers: [JobsService, JobCronService],
})
export class JobsModule {}
