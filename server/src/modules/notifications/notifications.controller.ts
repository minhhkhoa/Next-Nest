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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ResponseMessage, userDecorator } from 'src/common/decorator/customize';
import { ApiOperation } from '@nestjs/swagger';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { FindNotifycationQueryDto } from './dto/notifycationDto-dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ResponseMessage('Tạo mới thông báo thành công')
  @ApiOperation({ summary: 'tạo mới thông báo' })
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @ResponseMessage('Lấy tất cả thông báo có lọc nâng cao')
  @ApiOperation({ summary: 'get notification by filter' })
  @Get()
  findAll(
    @userDecorator() user: UserDecoratorType,
    @Query() query: FindNotifycationQueryDto,
  ) {
    return this.notificationsService.findAllByUser(user.id, query);
  }

  // Đánh dấu 1 thông báo là đã đọc
  @Patch(':id')
  @ResponseMessage('Đã đánh dấu là đã đọc')
  @ApiOperation({ summary: 'Đánh dấu là đã đọc' })
  update(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
