import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  AD_MODE_ALLOWED_OPTIONS,
  AD_PAGE_OPTIONS,
} from 'src/common/constants/ad-const';

export class CreateAdSlotDto {
  @ApiProperty({ example: 'HOME_TOP' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Home Top Banner' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AD_PAGE_OPTIONS, example: 'HOME' })
  @IsEnum(AD_PAGE_OPTIONS)
  page: string;

  @ApiPropertyOptional({ enum: AD_MODE_ALLOWED_OPTIONS, default: 'BOTH' })
  @IsOptional()
  @IsEnum(AD_MODE_ALLOWED_OPTIONS)
  adModeAllowed?: string;

  @ApiProperty({ example: 1200 })
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(1)
  height: number;

  @ApiProperty({ example: 100000 })
  @IsInt()
  @Min(1)
  pricePerDay: number;

  @ApiPropertyOptional({ example: 14, default: 14 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxDurationDays?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
