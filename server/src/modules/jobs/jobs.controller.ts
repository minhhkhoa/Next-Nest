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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, userDecorator } from 'src/common/decorator/customize';
import { DeleteManyJobDto, FindJobQueryDto } from './dto/jobDto.dto';
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
  @Get()
  findAllByFilter(@Query() query: FindJobQueryDto) {
    return this.jobsService.findAllByFilter(query);
  }

  @ResponseMessage('Tìm tất cả công việc thành công')
  @ApiOperation({ summary: 'Tìm tất cả công việc' })
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @ResponseMessage('Tìm công việc theo ID thành công')
  @ApiOperation({ summary: 'Tìm công việc theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
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
