import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {
  CreateConversationDto,
  AssignConversationDto,
} from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  // 1. Tạo phòng chat mới (hoặc trả về phòng hiện tại nếu đã có)
  @Post()
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationService.create(createConversationDto);
  }

  // 2. Lấy danh sách phòng chat của tôi (Candidate thì lấy của candidate, Recruiter thì lấy của công ty)
  @Get()
  findAll(@Query() query: any) {
    return this.conversationService.findAll();
  }

  // 3. Lấy detail 1 phòng chat
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(+id);
  }

  // 4. Admin phần quyền phân công cuộc chat cho Recruiter khác
  @Patch(':id/assign')
  assignRecruiter(
    @Param('id') id: string,
    @Body() assignDto: AssignConversationDto,
  ) {
    // return this.conversationService.assign(id, assignDto);
    return null;
  }

  // 5. Đánh dấu đã đọc
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    // return this.conversationService.markAsRead(id, req.user);
    return null;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }
}
