import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import {
  AD_BOOKING_STATUS_OPTIONS,
  AD_TYPE_OPTIONS,
} from 'src/common/constants/ad-const';

export class CreateAdBookingDto {
  @ApiPropertyOptional({ example: '6752cc5331e2d424074213d2' })
  @IsOptional()
  @IsMongoId()
  companyId?: string;

  @ApiPropertyOptional({ example: '6752cc5331e2d424074213d3' })
  @IsOptional()
  @IsMongoId()
  recruiterId?: string;

  @ApiProperty({ example: '6752cc5331e2d424074213d5' })
  @IsMongoId()
  @IsNotEmpty()
  slotId: string;

  @ApiProperty({ enum: AD_TYPE_OPTIONS, example: 'NON_DISMISSIBLE' })
  @IsEnum(AD_TYPE_OPTIONS)
  adType: string;

  @ApiProperty({ example: 'https://cdn.example.com/banner-home-top.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({ example: 'https://example.com/company/acme' })
  @IsUrl()
  targetUrl: string;

  @ApiProperty({ example: '2026-04-19T00:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2026-04-25T23:59:59.000Z' })
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({
    enum: AD_BOOKING_STATUS_OPTIONS,
    default: 'PENDING_PAYMENT',
  })
  @IsOptional()
  @IsEnum(AD_BOOKING_STATUS_OPTIONS)
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  queueNo?: number;

  @ApiPropertyOptional({ example: 700000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: '6752cc5331e2d424074213d4' })
  @IsOptional()
  @IsMongoId()
  paymentId?: string;
}
