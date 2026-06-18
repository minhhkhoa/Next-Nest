import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LangchainModule } from './langchain.module';
import { ChatAiService } from './services/chat-ai.service';
import { CvScoringService } from './services/cv-scoring.service';
import { JdMatchingService } from './services/jd-matching.service';
import { JobRecommendationService } from './services/job-recommendation.service';
import { AiServiceController } from './ai-service.controller';
import { JobsModule } from '../jobs/jobs.module';
import { UserResumeModule } from '../user-resume/user-resume.module';
import { DetailProfileModule } from '../detail-profile/detail-profile.module';
import { SkillModule } from '../skill/skill.module';
import { IndustryModule } from '../industry/industry.module';
import { AiServiceService } from './ai-service.service';
import {
  AiChatHistory,
  AiChatHistorySchema,
} from './schemas/ai-chat-history.schema';
import { AiChatHistoryRepository } from './repository/ai-chat-history.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiChatHistory.name, schema: AiChatHistorySchema },
    ]),
    LangchainModule,
    forwardRef(() => JobsModule),
    UserResumeModule,
    DetailProfileModule,
    SkillModule,
    IndustryModule,
  ],
  controllers: [AiServiceController],
  providers: [
    AiServiceService,
    ChatAiService,
    CvScoringService,
    JdMatchingService,
    JobRecommendationService,
    AiChatHistoryRepository,
  ],
  exports: [
    AiServiceService,
    ChatAiService,
    CvScoringService,
    JdMatchingService,
    JobRecommendationService,
  ],
})
export class AiServiceModule {}
