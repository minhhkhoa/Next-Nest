import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  AD_MODE_ALLOWED_OPTIONS,
  AD_PAGE_OPTIONS,
} from 'src/common/constants/ad-const';

export class FindAdSlotQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  currentPage?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  //- Tìm theo code hoặc tên slot
  @ApiPropertyOptional({ example: 'HOME_TOP' })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsString()
  keyword?: string;

  //- Lọc theo trang - bỏ qua nếu là chuỗi rỗng
  @ApiPropertyOptional({ enum: AD_PAGE_OPTIONS })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsEnum(AD_PAGE_OPTIONS)
  page?: string;

  //- Lọc theo adModeAllowed - bỏ qua nếu là chuỗi rỗng
  @ApiPropertyOptional({ enum: AD_MODE_ALLOWED_OPTIONS })
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  @IsEnum(AD_MODE_ALLOWED_OPTIONS)
  adModeAllowed?: string;

  //- Lọc theo trạng thái active - bỏ qua nếu là chuỗi rỗng
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  //- Có include slot đã xóa mềm không
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    return value === 'true';
  })
  @IsBoolean()
  isDeleted?: boolean;
}
