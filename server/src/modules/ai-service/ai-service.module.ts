import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LangchainModule } from './langchain.module';
import { ChatAiService } from './services/chat-ai.service';
import { CvScoringService } from './services/cv-scoring.service';
import { JdMatchingService } from './services/jd-matching.service';
import { AiServiceController } from './ai-service.controller';
import { JobsModule } from '../jobs/jobs.module';
import { UserResumeModule } from '../user-resume/user-resume.module';
import { AiServiceService } from './ai-service.service';
import { AiChatHistory, AiChatHistorySchema } from './schemas/ai-chat-history.schema';
import { AiChatHistoryRepository } from './repository/ai-chat-history.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiChatHistory.name, schema: AiChatHistorySchema }]),
    LangchainModule,
    JobsModule,
    UserResumeModule,
  ],
  controllers: [AiServiceController],
  providers: [
    AiServiceService,
    ChatAiService,
    CvScoringService,
    JdMatchingService,
    AiChatHistoryRepository,
  ],
  exports: [AiServiceService, ChatAiService, CvScoringService, JdMatchingService],
})
export class AiServiceModule {}
