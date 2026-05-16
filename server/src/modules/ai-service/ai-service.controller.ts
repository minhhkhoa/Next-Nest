import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  PublicPermission,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { AiServiceService } from './ai-service.service';
import { ChatAiQueryDto } from './dto/chat-ai.query.dto';
import { CvScoreDto } from './dto/cv-score.dto';
import { JdMatchDto } from './dto/jd-match.dto';

@ApiTags('ai')
@Controller('ai')
@PublicPermission()
export class AiServiceController {
  constructor(private readonly aiServiceService: AiServiceService) {}

  @Sse('chat/stream')
  @ApiOperation({ summary: 'Chat AI stream theo job hien tai' })
  chatStream(@Query() query: ChatAiQueryDto): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      (async () => {
        try {
          const sessionId = query.sessionId || 'default_session';
          const generator = await this.aiServiceService.chatStream(
            sessionId,
            query.jobId,
            query.question,
          );

          for await (const chunk of generator) {
            subscriber.next({ text: chunk } as any);
          }
          subscriber.next({ done: true } as any);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }

  @Get('chat/history')
  @ApiOperation({ summary: 'Lay lich su chat AI' })
  @ResponseMessage('Lay lich su chat AI thanh cong')
  async getChatHistory(@Query('sessionId') sessionId: string) {
    if (!sessionId) return null;
    return this.aiServiceService.getChatHistory(sessionId);
  }

  @Post('cv-score')
  @ApiOperation({ summary: 'Cham diem CV' })
  @ResponseMessage('Cham diem CV thanh cong')
  async scoreCv(
    @Body() body: CvScoreDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.aiServiceService.scoreCv(body.cvId, user);
  }

  @Post('jd-match')
  @ApiOperation({ summary: 'Cham do khop CV va JD' })
  @ResponseMessage('Cham do khop CV va JD thanh cong')
  async matchCvToJob(
    @Body() body: JdMatchDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.aiServiceService.matchCvToJob(body.cvId, body.jobId, user);
  }
}
