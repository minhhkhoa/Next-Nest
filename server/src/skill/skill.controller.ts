import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { ApiOperation } from '@nestjs/swagger';

@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @ResponseMessage('Tạo mới kỹ năng thành công')
  @ApiOperation({ summary: 'Thêm mới kỹ năng' })
  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillService.create(createSkillDto);
  }

  @ResponseMessage('Lấy danh sách kỹ năng')
  @ApiOperation({ summary: 'Get all skills' })
  @Get()
  findAll() {
    return this.skillService.findAll();
  }

  @ResponseMessage('Lấy kỹ năng theo id')
  @ApiOperation({ summary: 'Get skill by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(+id);
  }

  @ResponseMessage('Sửa kỹ năng thành công')
  @ApiOperation({ summary: 'Sửa kỹ năng' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillService.update(+id, updateSkillDto);
  }

  @ResponseMessage('Xóa kỹ năng thành công')
  @ApiOperation({ summary: 'Xóa kỹ năng' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillService.remove(+id);
  }
}
