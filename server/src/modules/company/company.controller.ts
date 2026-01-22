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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorator/customize';
import { FindCompanyWithTaxCode } from './dto/companyDto.dto';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ResponseMessage('Thêm công ty thành công')
  @ApiOperation({ summary: 'Thêm mới công ty' })
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @ResponseMessage('Lấy tất cả công ty thành công')
  @ApiOperation({ summary: 'GettAll company' })
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @ResponseMessage('Lấy tất cả công ty thành công')
  @ApiOperation({ summary: 'GettAll company' })
  @Get()
  checkTaxCode(@Query() query: FindCompanyWithTaxCode) {
    return this.companyService.checkTaxCodeExist(query.taxCode);
  }

  @ResponseMessage('Lấy công ty theo id thành công')
  @ApiOperation({ summary: 'Get detail company by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @ResponseMessage('Cập nhật công ty thành công')
  @ApiOperation({ summary: 'Cập nhật công ty' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @ResponseMessage('Xóa công ty thành công')
  @ApiOperation({ summary: 'Xóa công ty' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
