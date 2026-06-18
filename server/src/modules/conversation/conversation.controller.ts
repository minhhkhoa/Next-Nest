import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {
  CreateConversationDto,
  AssignConversationDto,
} from './dto/create-conversation.dto';
import {
  PublicPermission,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@PublicPermission() //- Cho phép truy cập công khai (bypass auth) nhưng vẫn có thể lấy thông tin user nếu có token
@ApiTags('conversation')
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ResponseMessage('Tạo mới phòng chat thành công')
  @ApiOperation({ summary: 'Tạo mới phòng chat' })
  create(
    @Body() createConversationDto: CreateConversationDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.conversationService.create(createConversationDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách phòng chat thành công')
  @ApiOperation({ summary: 'Lấy danh sách phòng chat' })
  findAll(@userDecorator() user: UserDecoratorType) {
    //- Api này sẽ trả về tất cả phòng chat mà user có liên quan (dù là candidate hay recruiter). Backend sẽ tự động lọc dựa trên companyId hoặc candidateId tuỳ theo role của user.
    return this.conversationService.findAll(user);
  }

  @Get('unread-count')
  @ResponseMessage('Lấy tổng số tin nhắn chưa đọc thành công')
  @ApiOperation({ summary: 'Lấy tổng số tin nhắn chưa đọc của người dùng' })
  getUnreadCount(@userDecorator() user: UserDecoratorType) {
    return this.conversationService.countUnreadMessages(user);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin phòng chat thành công')
  @ApiOperation({ summary: 'Lấy thông tin phòng chat' })
  findOne(
    @Param('id') id: string,
    @userDecorator() user: UserDecoratorType,
  ) {
    //- Api này để lấy thông tin chi tiết của một phòng chat cụ thể, bao gồm cả thông tin về công ty, ứng viên và nhà tuyển dụng (nếu đã được gán). Dùng để hiển thị ở header của trang chat, hoặc khi click vào một phòng chat từ danh sách để xem chi tiết.
    return this.conversationService.findOne(id, user);
  }

  @Patch(':id/assign')
  @ResponseMessage('Gán nhà tuyển dụng cho phòng chat thành công')
  @ApiOperation({ summary: 'Gán nhà tuyển dụng cho phòng chat' })
  assignRecruiter(
    @Param('id') id: string,
    @Body() assignDto: AssignConversationDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.conversationService.assign(id, assignDto, user);
  }

  @Patch(':id/read')
  @ResponseMessage('Đánh dấu đã đọc tin nhắn trong phòng chat thành công')
  @ApiOperation({ summary: 'Đánh dấu đã đọc tin nhắn trong phòng chat' })
  markAsRead(
    @Param('id') id: string,
    @userDecorator() user: UserDecoratorType,
  ) {
    //- Api này sẽ được gọi khi user vào xem phòng chat, để đánh dấu tất cả tin nhắn trong phòng đó là đã đọc (reset unread count về 0). Backend sẽ tự động xác định user là candidate hay recruiter để cập nhật trường unreadCandidate hoặc unreadRecruiter tương ứng.
    return this.conversationService.markAsRead(id, user);
  }
}
