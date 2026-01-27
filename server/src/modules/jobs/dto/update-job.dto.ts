import { CreateJobDto } from './create-job.dto';
import { IsBoolean, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  //- recruiter có thể chủ động đóng mở tin tuyển dụng
  @ApiProperty()
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  //- cái này là cho recruiter_admin set phe duyệt mới thấy được
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  //- cái này là cho super_admin set
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  //- số ngày muốn bài viết Hot
  @ApiProperty({ example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  hotDays?: number;
}
