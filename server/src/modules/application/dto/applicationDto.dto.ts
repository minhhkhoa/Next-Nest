import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { APPLICATION_STATUS } from 'src/common/constants';

export class FindApplicationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  currentPage: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Type(() => Number)
  pageSize: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đơn ứng tuyển',
    enum: APPLICATION_STATUS.map((s) => s.value),
  })
  @IsOptional()
  @IsIn(APPLICATION_STATUS.map((s) => s.value))
  status?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo công việc cụ thể',
    example: '64b0f1c9e1a2b3c4d5e6f7g8',
  })
  @IsOptional()
  @IsMongoId()
  jobId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đã xem/chưa xem (true/false)',
    example: false,
  })
  @IsOptional()
  @IsString()
  isViewed?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo đánh giá tối thiểu (0-5)',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo từ khóa (email, tên ứng viên...)',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Lọc ứng viên đã xóa (true/false)',
    default: 'false',
  })
  @IsOptional()
  @IsString()
  isDeleted?: string;
}

