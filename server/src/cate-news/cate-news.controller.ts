import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CateNewsService } from './cate-news.service';
import { CreateCateNewDto } from './dto/create-cate-new.dto';
import { UpdateCateNewDto } from './dto/update-cate-new.dto';

@Controller('cate-news')
export class CateNewsController {
  constructor(private readonly cateNewsService: CateNewsService) {}

  @Post()
  create(@Body() createCateNewDto: CreateCateNewDto) {
    return this.cateNewsService.create(createCateNewDto);
  }

  @Get()
  findAll() {
    return this.cateNewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cateNewsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCateNewDto: UpdateCateNewDto) {
    return this.cateNewsService.update(+id, updateCateNewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cateNewsService.remove(+id);
  }
}
