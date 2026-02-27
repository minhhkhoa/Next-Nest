import { forwardRef, Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { BusinessModule } from 'src/common/decorator/customize';
import { UserModule } from '../user/user.module';
import { JobCronService } from 'src/common/service/job-cron.service';
import { CompanyModule } from '../company/company.module';
import { CompanyStatusGuard } from 'src/common/guard/company-status.guard';

import { IssueModule } from '../issue/issue.module';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    forwardRef(() => CompanyModule),
    IssueModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobCronService, CompanyStatusGuard],
  exports: [JobsService],
})
export class JobsModule {}
