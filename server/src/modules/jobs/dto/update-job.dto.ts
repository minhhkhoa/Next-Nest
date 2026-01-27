import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  //- recruiter có thể chủ động đóng mở tin tuyển dụng
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  //- cái này là cho recruiter_admin set phe duyệt mới thấy được
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  //- cái này là cho super_admin set
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;
}
