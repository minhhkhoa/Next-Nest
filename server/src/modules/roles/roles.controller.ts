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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, userDecorator } from 'src/common/decorator/customize';
import { FindRoleQueryDto } from './dto/roleDto.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ResponseMessage('Tạo mới vai trò thành công')
  @ApiOperation({ summary: 'Tạo mới vai trò' })
  @Post()
  create(
    @Body() createRoleDto: CreateRoleDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.rolesService.create(createRoleDto, user);
  }

  @ResponseMessage('Lấy tất cả vai trò thành công')
  @ApiOperation({ summary: 'getAll roles' })
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @ResponseMessage('pagination + filter vai trò thành công')
  @ApiOperation({ summary: 'get permission by filter' })
  @Get('filter')
  findByFilter(@Query() query: FindRoleQueryDto) {
    return this.rolesService.findByFilter(query);
  }

  @ResponseMessage('Lấy vai trò theo id thành công')
  @ApiOperation({ summary: 'get role by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @ResponseMessage('Cập nhật vai trò thành công')
  @ApiOperation({ summary: 'Cập nhật vai trò' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.rolesService.update(id, updateRoleDto, user);
  }

  @ResponseMessage('Xóa vai trò thành công')
  @ApiOperation({ summary: 'Xóa vai trò' })
  @Delete(':id')
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.rolesService.remove(id, user);
  }
}
