import { Module } from '@nestjs/common';
import { UserResumeService } from './user-resume.service';
import { UserResumeController } from './user-resume.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserResume, UserResumeSchema } from './schemas/user-resume.schema';
import { UserResumeRepository } from './repository/user-resume.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserResume.name, schema: UserResumeSchema },
    ]),
  ],
  controllers: [UserResumeController],
  providers: [UserResumeService, UserResumeRepository],
  exports: [UserResumeService],
})
export class UserResumeModule {}
