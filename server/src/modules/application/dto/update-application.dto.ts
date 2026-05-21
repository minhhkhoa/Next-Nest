import { PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsDate,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { APPLICATION_STATUS } from 'src/common/constants';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @ApiProperty({
    enum: APPLICATION_STATUS.map((status) => status.value),
    description: 'Trạng thái đơn ứng tuyển',
    required: false,
  })
  @IsOptional()
  @IsIn(APPLICATION_STATUS.map((status) => status.value))
  status?: string;

  @ApiProperty({
    description: 'Đã xem bởi nhà tuyển dụng chưa',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isViewed?: boolean;

  @ApiProperty({
    description: 'Đánh giá ứng viên (0-100 điểm)',
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiProperty({ description: 'Ghi chú nội bộ của recruiter', required: false })
  @IsOptional()
  @IsString()
  recruiterNote?: string;

  @ApiProperty({ description: 'Thời gian phỏng vấn', required: false })
  @IsOptional()
  @IsDate()
  interviewTime?: Date;

  @ApiProperty({ description: 'Lý do từ chối', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
