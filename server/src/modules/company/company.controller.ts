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
  DeleteManyCompanyDto,
  FindCompanyQueryDto,
  FindCompanyWithTaxCode,
  FindJoinRequestDto,
} from './dto/companyDto.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ResponseMessage('Kiển tra mã số thuế đã tồn tại hay không thành công')
  @ApiOperation({ summary: 'check tax code đã tồn tại chưa' })
  @Post('check-tax-code')
  checkTaxCode(@Body() body: FindCompanyWithTaxCode) {
    return this.companyService.checkTaxCodeExist(body.taxCode);
  }

  @ResponseMessage('Thêm công ty thành công')
  @ApiOperation({ summary: 'Thêm mới công ty' })
  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.companyService.create(createCompanyDto, user);
  }

  @ResponseMessage('Lấy tất cả công ty thành công')
  @ApiOperation({ summary: 'GettAll company' })
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  //- dành cho recruiter_admin
  @Get('join-requests')
  @ResponseMessage('Lấy thông tin yêu cầu gia nhập công ty thành công')
  @ApiOperation({
    summary: 'Lấy thông tin yêu cầu gia nhập công ty cho recruiter_admin',
  })
  async getJoinRequests(
    @userDecorator() user: UserDecoratorType,
    @Query() query: FindJoinRequestDto,
  ) {
    return await this.companyService.getRecruiterJoinRequests(user.id, query);
  }

  //- Lấy ra các thành viên trong công ty của recruiter_admin
  @Get('get-member-company')
  @ResponseMessage('Lấy thông tin thành viên công ty thành công')
  @ApiOperation({
    summary: 'Lấy thông tin yêu thành viên công ty cho recruiter_admin',
  })
  async getMemberCompany(@userDecorator() user: UserDecoratorType) {
    return await this.companyService.getMemberCompany(
      user?.employerInfo?.companyID!,
    );
  }

  //- endpoint này lấy cả đã xóa và chưa xóa mềm
  @ResponseMessage('Lấy tất cả công ty có lọc nâng cao thành công')
  @ApiOperation({ summary: 'GettAll company with filter' })
  @Get('filter')
  findAllByFilter(@Query() query: FindCompanyQueryDto) {
    return this.companyService.findAllByFilter(query);
  }

  @ResponseMessage('Lấy công ty theo id thành công')
  @ApiOperation({ summary: 'Get detail company by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  //- dành cho super_admin khôi phục công ty đã xóa mềm
  @ResponseMessage('Khôi phục công ty thành công')
  @ApiOperation({ summary: 'Super_Admin khôi phục công ty đã xóa mềm' })
  @Patch('restore/:id')
  restore(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.companyService.restore(id, user);
  }

  //- chỉ super_admin mới có quyền này
  @Patch('admin-verify')
  @ApiOperation({ summary: 'Super_Admin xử lý phê duyệt công ty' })
  @ResponseMessage('Xử lý phê duyệt công ty thành công')
  adminVerifyCompany(
    @Body() verifyDto: AdminApproveCompanyDto,
    @userDecorator() admin: UserDecoratorType,
  ) {
    return this.companyService.handleVerifyCompany(verifyDto, admin);
  }

  @ResponseMessage('Cập nhật công ty thành công')
  @ApiOperation({ summary: 'Cập nhật công ty' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.companyService.update(id, updateCompanyDto, user);
  }

  @Delete('members/:id')
  @ResponseMessage('Đã mời thành viên rời khỏi công ty thành công')
  @ApiOperation({ summary: 'Recruiter_Admin đuổi thành viên khỏi công ty' })
  async kickMember(
    @Param('id') memberId: string,
    @userDecorator() admin: UserDecoratorType,
  ) {
    return await this.companyService.kickMember(memberId, admin);
  }

  @ResponseMessage('Xóa nhiều công ty thành công')
  @ApiOperation({ summary: 'Xóa nhiều công ty' })
  @Delete('deleteMany')
  removeMany(
    @Body() deleteDto: DeleteManyCompanyDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.companyService.removeMany(deleteDto.ids, user);
  }

  @ResponseMessage('Xóa công ty thành công')
  @ApiOperation({ summary: 'Xóa công ty' })
  @Delete(':id')
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.companyService.remove(id, user);
  }
}
