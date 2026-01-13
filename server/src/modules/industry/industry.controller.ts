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
import { IndustryService } from './industry.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorator/customize';
import { FindIndustryQueryDto, FindIndustryWithName } from './dto/industryDto.dto';

@ApiTags('industry')
@Controller('industry')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @ResponseMessage('Tạo mới ngành nghề thành công') //- thông báo thành công, false sẽ handle ở service
  @ApiOperation({ summary: 'Thêm mới ngành nghề' })
  @Post()
  create(@Body() createIndustryDto: CreateIndustryDto) {
    return this.industryService.create(createIndustryDto);
  }

  @ResponseMessage('Lấy tất cả ngành nghề thành công')
  @ApiOperation({ summary: 'GettAll' })
  @Get()
  findAll(@Query() query: FindIndustryQueryDto) {
    return this.industryService.findAll(
      query.currentPage,
      query.pageSize,
      query.name!,
    );
  }

  @ResponseMessage('Lấy tất cả ngành nghề theo cây thành công')
  @ApiOperation({ summary: 'Get build tree' })
  @Get('tree')
  async getTree(@Query() query?: FindIndustryWithName) {
    if (query?.name) {
      return this.industryService.searchIndustryTree(query?.name);
    }
    return this.industryService.getTreeIndustry();
  }

  @ResponseMessage('Tìm kiếm ngành nghề theo ID thành công')
  @ApiOperation({ summary: 'Tìm kiếm ngành nghề theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.industryService.findOne(id);
  }

  @ResponseMessage('Sửa ngành nghề thành công')
  @ApiOperation({ summary: 'chỉnh sửa ngành nghề' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIndustryDto: UpdateIndustryDto,
  ) {
    return this.industryService.update(id, updateIndustryDto);
  }

  @ResponseMessage('Xóa ngành nghề thành công')
  @ApiOperation({ summary: 'xóa ngành nghề' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.industryService.remove(id);
  }
}
