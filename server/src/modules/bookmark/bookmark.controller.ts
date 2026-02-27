import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { FindBookmarkQueryDto } from './dto/bookmarkDto.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import {
  PublicPermission,
  ResponseMessage,
} from 'src/common/decorator/customize';

@ApiTags('Bookmark - Đánh dấu')
@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @PublicPermission()
  @ResponseMessage('Tạo bookmark thành công')
  @ApiOperation({ summary: 'Tạo bookmark mới' })
  @Post()
  create(@Body() createBookmarkDto: CreateBookmarkDto, @Req() req: any) {
    const user: UserDecoratorType = req.user;
    return this.bookmarkService.create(createBookmarkDto, user);
  }

  @PublicPermission()
  @ResponseMessage('Lấy danh sách ID đã bookmark thành công')
  @ApiOperation({ summary: 'Lấy tất cả các ID item đã bookmark của user để check trạng thái' })
  @Get('ids')
  async getAllBookmarkedIds(@Req() req: any, @Query() query: FindBookmarkQueryDto) {
    const user: UserDecoratorType = req.user;
    return this.bookmarkService.getAllBookmarkedIds(user, query);
  }

  @PublicPermission()
  @ResponseMessage('Lấy bookmark theo user thành công')
  @ApiOperation({ summary: 'Lấy tất cả bookmark của user' })
  @Get()
  findAllByUser(@Query() query: FindBookmarkQueryDto, @Req() req: any) {
    const user: UserDecoratorType = req.user;
    return this.bookmarkService.findAllByUser(user, query);
  }

  @PublicPermission()
  @ResponseMessage('Xóa bookmark thành công')
  @ApiOperation({ summary: 'Xóa bookmark theo ID' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const user: UserDecoratorType = req.user;
    return this.bookmarkService.remove(id, user);
  }

  // Xóa theo Item ID (Sử dụng khi toggle button trên UI Job Detail)
  @PublicPermission()
  @ResponseMessage('Xóa bookmark theo Item ID thành công')
  @ApiOperation({
    summary: 'Xóa bookmark theo Item ID (jobId, companyId, newsId)',
  })
  @Delete('item/:itemId')
  removeByItemId(@Param('itemId') itemId: string, @Req() req: any) {
    const user: UserDecoratorType = req.user;
    return this.bookmarkService.removeByItemId(itemId, user);
  }
}
