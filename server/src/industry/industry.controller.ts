import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndustryService } from './industry.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('industry')
@Controller('industry')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @ApiOperation({ summary: 'Thêm mới ngành nghề' })
  @Post()
  create(@Body() createIndustryDto: CreateIndustryDto) {
    return this.industryService.create(createIndustryDto);
  }

  @ApiOperation({ summary: 'GettAll' })
  @Get()
  findAll() {
    return this.industryService.findAll();
  }

  @ApiOperation({ summary: 'Tìm kiếm ngành nghề theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.industryService.findOne(id);
  }

  @ApiOperation({ summary: 'chỉnh sửa ngành nghề' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIndustryDto: UpdateIndustryDto,
  ) {
    return this.industryService.update(id, updateIndustryDto);
  }

  @ApiOperation({ summary: 'xóa ngành nghề' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.industryService.remove(id);
  }
}
