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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, userDecorator } from 'src/common/decorator/customize';
import { FindUserQueryDto } from './dto/userDto.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import {
  ApproveCompanyDto,
  JoinCompanyDto,
} from '../company/dto/companyDto.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ResponseMessage('Tạo mới người dùng thành công')
  @ApiOperation({ summary: 'Thêm mới người dùng' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ResponseMessage('pagination + filter theo name + email + address ')
  @ApiOperation({ summary: 'Get all news by filter' })
  @Get('/filter')
  findAllByFilter(@Query() query: FindUserQueryDto) {
    return this.userService.findAllByFilter(query);
  }

  @ResponseMessage('Tìm kiếm toàn bộ người dùng thành công')
  @ApiOperation({ summary: 'get all user' })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ResponseMessage('Tìm kiếm theo email thành công')
  @ApiOperation({ summary: 'getDetail user by email' })
  @Get('/getUserByEmail')
  findUserByEmail(@Body() email: string) {
    return this.userService.findUserByEmail(email);
  }

  @ResponseMessage('Tìm kiếm theo id thành công')
  @ApiOperation({ summary: 'getDetail user' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('join-company')
  @ResponseMessage('Gửi yêu cầu gia nhập thành công')
  @ApiOperation({ summary: 'Gửi yêu cầu gia nhập công ty cho Recruiter_ADMIN' })
  joinCompany(
    @Body() joinDto: JoinCompanyDto,
    @userDecorator() user: UserDecoratorType, // Decorator lấy thông tin user từ JWT
  ) {
    return this.userService.handleJoinCompany(joinDto, user);
  }

  // Chỉ Admin công ty mới được gọi
  @Patch('approve-join-request')
  @ResponseMessage('Xử lý yêu cầu gia nhập thành công')
  @ApiOperation({ summary: 'recruiter_admin xử lý yêu cầu gia nhập công ty' })
  async approveJoinRequest(
    @Body() approveDto: ApproveCompanyDto,
    @userDecorator() admin: UserDecoratorType,
  ) {
    return await this.userService.handleApproveJoinRequest(approveDto, admin);
  }

  // API Cập nhật vai trò
  @Patch(':id/role')
  @ResponseMessage('Cập nhật vai trò người dùng thành công')
  updateRole(@Param('id') id: string, @Body('roleID') roleID: string) {
    return this.userService.updateUserRole(id, roleID);
  }

  @Patch(':id/restore')
  @ResponseMessage('Khôi phục tài khoản thành công')
  restoreUser(@Param('id') id: string) {
    return this.userService.restoreUserAndProfile(id);
  }

  @ResponseMessage('Cập nhật thông tin người dùng thành công')
  @ApiOperation({ summary: 'update user' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // @ResponseMessage('Xóa người dùng thành công')
  // @ApiOperation({ summary: 'Delete user' })
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(id);
  // }

  // API Xóa mềm đồng bộ
  @Delete(':id')
  @ResponseMessage('Xóa người dùng thành công')
  remove(@Param('id') id: string) {
    return this.userService.softDeleteUserAndProfile(id);
  }
}
