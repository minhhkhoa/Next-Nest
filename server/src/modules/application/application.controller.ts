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
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  PublicPermission,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { FindApplicationQueryDto } from './dto/applicationDto.dto';

@ApiTags('application')
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @PublicPermission()
  @ResponseMessage('Tạo đơn ứng tuyển thành công')
  @ApiOperation({ summary: 'Ứng viên nộp hồ sơ ứng tuyển' })
  @Post()
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.applicationService.create(createApplicationDto, user);
  }

  @ResponseMessage('Lấy danh sách đơn ứng tuyển thành công')
  @ApiOperation({ summary: 'Recruiter xem danh sách đơn' })
  @Get()
  findAll(
    @Query() query: FindApplicationQueryDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.applicationService.findAll(query, user);
  }

  @PublicPermission()
  @ResponseMessage('Lấy lịch sử ứng tuyển thành công')
  @ApiOperation({ summary: 'Ứng viên xem lịch sử ứng tuyển của mình' })
  @Get('my-applications')
  findMyApplications(
    @Query() query: FindApplicationQueryDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.applicationService.findMyApplications(query, user);
  }

  @PublicPermission()
  @ResponseMessage('Lấy chi tiết đơn ứng tuyển thành công')
  @ApiOperation({ summary: 'Xem chi tiết đơn (Ứng viên hoặc Recruiter)' })
  @Get(':id')
  findOne(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.applicationService.findOne(id, user);
  }

  @ResponseMessage('Cập nhật đơn ứng tuyển thành công')
  @ApiOperation({ summary: 'Recruiter cập nhật trạng thái đơn' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.applicationService.update(id, updateApplicationDto, user);
  }

  @ResponseMessage('Xóa đơn ứng tuyển thành công')
  @ApiOperation({ summary: 'Xóa đơn ứng tuyển' })
  @Delete(':id')
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.applicationService.remove(id, user);
  }
}
