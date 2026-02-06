import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserResumeService } from './user-resume.service';
import { UpdateUserResumeDto } from './dto/update-user-resume.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  PublicPermission,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { CreateUserResumeDto } from './dto/create-user-resume.dto';

@ApiTags('user-resumes')
@Controller('user-resume')
export class UserResumeController {
  constructor(private readonly userResumeService: UserResumeService) {}

  @PublicPermission()
  @ApiOperation({ summary: 'Tạo mới bản CV' })
  @Post()
  @ResponseMessage('Tạo mới bản CV thành công')
  create(
    @Body() createDto: CreateUserResumeDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.userResumeService.create(createDto, user);
  }

  //- lấy tất cả CV của user
  @PublicPermission()
  @ApiOperation({ summary: 'Lấy danh sách CV' })
  @Get()
  @ResponseMessage('Lấy danh sách CV thành công')
  findAll(@userDecorator() user: UserDecoratorType) {
    return this.userResumeService.findAllByUser(user);
  }

  @PublicPermission()
  @ApiOperation({ summary: 'Lấy chi tiết CV' })
  @Get(':id')
  @ResponseMessage('Lấy chi tiết CV thành công')
  findOne(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.userResumeService.findOne(id, user);
  }

  @PublicPermission()
  @ApiOperation({ summary: 'Cập nhật bản CV' })
  @Patch(':id')
  @ResponseMessage('Cập nhật bản CV thành công')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserResumeDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.userResumeService.update(id, updateDto, user);
  }

  @PublicPermission()
  @ApiOperation({ summary: 'Xóa bản CV' })
  @Delete(':id')
  @ResponseMessage('Xóa bản CV thành công')
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.userResumeService.remove(id, user);
  }
}
