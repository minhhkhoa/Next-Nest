import { Module, forwardRef } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { JobsModule } from '../jobs/jobs.module';
import { UserResumeModule } from '../user-resume/user-resume.module';
import { UserModule } from '../user/user.module';
import { BusinessModule } from 'src/common/decorator/customize';
import { ApplicationRepository } from './repository/application.repository';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
    forwardRef(() => JobsModule),
    UserResumeModule,
    forwardRef(() => UserModule),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplicationRepository],
  exports: [ApplicationService],
})
export class ApplicationModule {}
