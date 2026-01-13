import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DetailProfileService } from './detail-profile.service';
import { CreateDetailProfileDto } from './dto/create-detail-profile.dto';
import { UpdateDetailProfileDto } from './dto/update-detail-profile.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorator/customize';

@ApiTags('detail-profile')
@Controller('detail-profile')
export class DetailProfileController {
  constructor(private readonly detailProfileService: DetailProfileService) {}

  @ResponseMessage('Thêm chi tiết người dùng thành công')
  @ApiOperation({ summary: 'Thêm mới thông tin chi tiết người dùng' })
  @Post()
  create(@Body() createDetailProfileDto: CreateDetailProfileDto) {
    return this.detailProfileService.create(createDetailProfileDto);
  }

  @ResponseMessage('Lấy thông tin chi tiết người dùng thành công')
  @ApiOperation({ summary: 'getAll chi tiết người dùng' })
  @Get()
  findAll() {
    return this.detailProfileService.findAll();
  }

  @ResponseMessage('Tìm chi tiết người dùng thành công')
  @ApiOperation({ summary: 'find by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detailProfileService.findOne(id);
  }

  @ResponseMessage('Cập nhật chi tiết người dùng thành công')
  @ApiOperation({ summary: 'update' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDetailProfileDto: UpdateDetailProfileDto,
  ) {
    return this.detailProfileService.update(id, updateDetailProfileDto);
  }

  @ResponseMessage('Xóa chi tiết người dùng thành công')
  @ApiOperation({ summary: 'delete' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detailProfileService.remove(id);
  }
}
