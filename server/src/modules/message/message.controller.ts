import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import {
  PublicPermission,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@PublicPermission()
@ApiTags('message')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ResponseMessage('Gửi tin nhắn thành công')
  @ApiOperation({ summary: 'Gửi tin nhắn' })
  create(
    @Body() createMessageDto: CreateMessageDto,
    @userDecorator() user: UserDecoratorType,
    @Headers('x-socket-id') socketId?: string,
  ) {
    return this.messageService.create(createMessageDto, user, socketId);
  }

  @Get('conversation/:conversationId')
  @ResponseMessage('Lấy tin nhắn theo conversationId thành công')
  @ApiOperation({ summary: 'Lấy tin nhắn theo conversationId' })
  findByConversation(
    @Param('conversationId') conversationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.messageService.findByConversation(
      conversationId,
      +page,
      +limit,
      user,
    );
  }
}
