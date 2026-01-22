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
import { ResponseMessage, userDecorator } from 'src/common/decorator/customize';
import {
  AdminApproveCompanyDto,
  FindCompanyQueryDto,
  FindCompanyWithTaxCode,
  FindJoinRequestDto,
} from './dto/companyDto.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ResponseMessage('Thêm công ty thành công')
  @ApiOperation({ summary: 'Thêm mới công ty' })
  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.companyService.create(createCompanyDto, user);
  }

  //- dành cho recruiter_admin
  @Get('join-requests')
  @ResponseMessage('Lấy thông tin yêu cầu gia nhập công ty thành công')
  @ApiOperation({ summary: 'Lấy thông tin yêu cầu gia nhập công ty' })
  async getJoinRequests(
    @userDecorator() user: UserDecoratorType,
    @Query() query: FindJoinRequestDto,
  ) {
    return await this.companyService.getRecruiterJoinRequests(user.id, query);
  }

  @ResponseMessage('Lấy tất cả công ty có lọc nâng cao thành công')
  @ApiOperation({ summary: 'GettAll company with filter' })
  @Get("filter")
  findAllByFilter(@Query() query: FindCompanyQueryDto) {
    return this.companyService.findAllByFilter(query);
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

  //- chỉ super_admin mới có quyền này
  @Patch('admin-verify')
  @ApiOperation({ summary: 'Super_Admin xử lý phê duyệt công ty' })
  @ResponseMessage('Xử lý phê duyệt công ty thành công')
  async adminVerifyCompany(
    @Body() verifyDto: AdminApproveCompanyDto,
    @userDecorator() admin: UserDecoratorType,
  ) {
    return await this.companyService.handleVerifyCompany(verifyDto, admin);
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
