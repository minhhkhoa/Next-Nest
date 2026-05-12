import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Get('chat')
  @ApiOperation({ summary: 'Chat AI theo job hien tai' })
  @ResponseMessage('Chat AI thanh cong')
  async chat(@Query() query: ChatAiQueryDto) {
    return this.aiServiceService.chat(query.jobId, query.question);
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
