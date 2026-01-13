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
import { ResponseMessage } from 'src/common/decorator/customize';
import { FindUserQueryDto } from './dto/userDto.dto';

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

  @ResponseMessage('Cập nhật thông tin người dùng thành công')
  @ApiOperation({ summary: 'update user' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ResponseMessage('Xóa người dùng thành công')
  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
