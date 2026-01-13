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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Public,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { DeleteManyPermissionsDto, FindPermissionQueryDto } from './dto/permissionDto.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { DiscoveryService } from './discovery.service';

@ApiTags('permission')
@Controller('permission')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  @ResponseMessage('Tạo mới quyền hạn thành công')
  @ApiOperation({ summary: 'Thêm mới quyền hạn' })
  @Post()
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.permissionsService.create(createPermissionDto, user);
  }

  @ResponseMessage('Lấy tất cả quyền hạn thành công')
  @ApiOperation({ summary: 'getAll permission' })
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @ResponseMessage('pagination + filter quyền hạn thành công')
  @ApiOperation({ summary: 'get permission by filter' })
  @Get('filter')
  findByFilter(@Query() query: FindPermissionQueryDto) {
    return this.permissionsService.findByFilter(query);
  }

  @Get('modules')
  async getModules() {
    //- lấy các module đã được đánh dấu bởi decorator: @BusinessModule()
    const modules = this.discoveryService.getBusinessModules();
    return modules;
  }

  @ResponseMessage('Lấy quyền hạn theo id thành công')
  @ApiOperation({ summary: 'GetById' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @ResponseMessage('Cập nhật quyền hạn thành công')
  @ApiOperation({ summary: 'Cập nhật quyền hạn' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.permissionsService.update(id, updatePermissionDto, user);
  }

  @ResponseMessage('Xóa nhiều quyền hạn thành công')
  @ApiOperation({ summary: 'Xóa nhiều quyền hạn' })
  @Delete('deleteMany')
  removeMany(
    @Body() deleteDto: DeleteManyPermissionsDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.permissionsService.removeMany(deleteDto.ids, user);
  }

  @ResponseMessage('Xóa quyền hạn thành công')
  @ApiOperation({ summary: 'Xóa quyền hạn' })
  @Delete(':id')
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.permissionsService.remove(id, user);
  }
}
