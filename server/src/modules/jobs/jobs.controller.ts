import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Ip,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  PublicPermission,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import {
  DeleteManyJobDto,
  FindJobQueryDto,
  RecruiteAdminApproveJobDto,
} from './dto/jobDto.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ResponseMessage('Tạo mới công việc thành công')
  @ApiOperation({ summary: 'Thêm mới công việc' })
  @Post()
  create(
    @Body() createJobDto: CreateJobDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.jobsService.create(createJobDto, user);
  }

  @ResponseMessage('Tìm tất cả công việc có lọc nâng cao')
  @ApiOperation({ summary: 'get all by filter' })
  @Get('filter')
  findJobFilter(
    @Query() query: FindJobQueryDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.jobsService.findJobFilter(query, user);
  }

  @ResponseMessage('Tìm tất cả công việc thành công')
  @ApiOperation({ summary: 'Tìm tất cả công việc' })
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  //- chỉ super_admin mới có quyền này
  @ResponseMessage('Khôi phục công việc thành công')
  @ApiOperation({ summary: 'Super_Admin khôi phục công việc đã xóa mềm' })
  @Patch('restore/:id')
  async restore(
    @Param('id') id: string,
    @userDecorator() user: UserDecoratorType,
  ) {
    return await this.jobsService.restore(id, user);
  }

  //- chỉ recruiter_admin mới có quyền này
  @Patch('verify-job')
  @ApiOperation({ summary: 'Recruiter_Admin xử lý phê duyệt công việc' })
  @ResponseMessage('Xử lý phê duyệt công việc thành công')
  async recruiterAdminVerifyJob(
    @Body() verifyDto: RecruiteAdminApproveJobDto,
    @userDecorator() recruiter_admin: UserDecoratorType,
  ) {
    return await this.jobsService.handleVerifyJob(verifyDto, recruiter_admin);
  }

  @PublicPermission()
  @ResponseMessage('Tìm công việc theo ID thành công')
  @ApiOperation({ summary: 'Tìm công việc theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string, @Ip() ip: string) {
    //- lấy ip của người xem để xử lý tính view
    return this.jobsService.findOne(id, ip);
  }

  @ResponseMessage('Cập nhật công việc thành công')
  @ApiOperation({ summary: 'Cập nhật công việc' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @ResponseMessage('Xóa nhiều công việc thành công')
  @ApiOperation({ summary: 'Xóa nhiều công việc' })
  @Delete('deleteMany')
  removeMany(
    @Body() deleteDto: DeleteManyJobDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.jobsService.removeMany(deleteDto.ids, user);
  }

  @ResponseMessage('Xóa công việc thành công')
  @ApiOperation({ summary: 'Xóa công việc' })
  @Delete(':id')
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.jobsService.remove(id, user);
  }
}
