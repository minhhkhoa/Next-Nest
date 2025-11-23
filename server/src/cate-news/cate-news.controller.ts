import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CateNewsService } from './cate-news.service';
import { CreateCateNewsDto } from './dto/create-cate-new.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateCateNewsDto } from './dto/update-cate-new.dto';
import {
  Public,
  ResponseMessage,
  userDecorator,
} from 'src/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@ApiTags('cate-news')
@Controller('cate-news')
export class CateNewsController {
  constructor(private readonly cateNewsService: CateNewsService) {}

  @ResponseMessage('Tạo danh mục tin tức thành công')
  @ApiOperation({ summary: 'Thêm mới danh mục tin tức' })
  @Post()
  create(
    @Body() createCateNewsDto: CreateCateNewsDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.cateNewsService.create(createCateNewsDto, user);
  }

  @Public()
  @ResponseMessage('Lấy danh sách danh mục tin tức thành công')
  @ApiOperation({ summary: 'getAll' })
  @Get()
  findAll() {
    return this.cateNewsService.findAll();
  }

  @Public()
  @ResponseMessage('Lấy danh mục tin tức theo id thành công')
  @ApiOperation({ summary: 'Lấy danh mục tin tức theo id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cateNewsService.findOne(id);
  }

  @ResponseMessage('Cập nhật danh mục tin tức thành công')
  @ApiOperation({ summary: 'Cập nhật danh mục tin tức' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCateNewsDto: UpdateCateNewsDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.cateNewsService.update(id, updateCateNewsDto, user);
  }

  @ResponseMessage('Xóa danh mục tin tức thành công')
  @ApiOperation({ summary: 'Xóa danh mục tin tức' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cateNewsService.remove(id);
  }
}
