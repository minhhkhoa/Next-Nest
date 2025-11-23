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
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage, userDecorator } from 'src/decorator/customize';
import { FindNewsQueryDto } from './dto/newsDto-dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ResponseMessage('Tạo mới tin tức thành công')
  @ApiOperation({ summary: 'Thêm mới tin tức' })
  @Post()
  create(
    @Body() createNewsDto: CreateNewsDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.newsService.create(createNewsDto, user);
  }

  @ResponseMessage('Lấy danh sách tin tức thành công')
  @ApiOperation({ summary: 'GetAll' })
  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Public()
  @ResponseMessage('get all public news thành công')
  @ApiOperation({ summary: 'get all public news' })
  @Get('news-dashboard')
  findAllNewsDashboard() {
    return this.newsService.findAllNewsDashboard();
  }

  @Public()
  @ResponseMessage('pagination + filter theo title + cateNewsID')
  @ApiOperation({ summary: 'Get all news by filter' })
  @Get('filter')
  findAllByFilter(@Query() query: FindNewsQueryDto) {
    return this.newsService.findAllByFilter(query);
  }

  @Public()
  @ResponseMessage('Lấy tin tức theo id thành công')
  @ApiOperation({ summary: 'GetById' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @ResponseMessage('Cập nhật tin tức thành công')
  @ApiOperation({ summary: 'Cập nhật tin tức' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.newsService.update(id, updateNewsDto, user);
  }

  @ResponseMessage('Xóa tin tức thành công')
  @ApiOperation({ summary: 'Xóa tin tức' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
