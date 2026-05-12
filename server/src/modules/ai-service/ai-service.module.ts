import { Module } from '@nestjs/common';
import { LangchainModule } from './langchain.module';
import { ChatAiService } from './services/chat-ai.service';
import { CvScoringService } from './services/cv-scoring.service';
import { JdMatchingService } from './services/jd-matching.service';
import { AiServiceController } from './ai-service.controller';
import { JobsModule } from '../jobs/jobs.module';
import { UserResumeModule } from '../user-resume/user-resume.module';
import { AiServiceService } from './ai-service.service';

@Module({
  imports: [LangchainModule, JobsModule, UserResumeModule],
  controllers: [AiServiceController],
  providers: [AiServiceService, ChatAiService, CvScoringService, JdMatchingService],
  exports: [AiServiceService, ChatAiService, CvScoringService, JdMatchingService],
})
export class AiServiceModule {}
