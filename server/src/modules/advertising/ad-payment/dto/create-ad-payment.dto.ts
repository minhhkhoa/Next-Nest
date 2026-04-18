import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  AD_PAYMENT_PROVIDER_OPTIONS,
  AD_PAYMENT_STATUS_OPTIONS,
} from 'src/common/constants/ad-const';

export class CreateAdPaymentDto {
  @ApiProperty({ example: '6752cc5331e2d424074213d5' })
  @IsMongoId()
  bookingId: string;

  @ApiPropertyOptional({ enum: AD_PAYMENT_PROVIDER_OPTIONS, default: 'SEPAY' })
  @IsOptional()
  @IsEnum(AD_PAYMENT_PROVIDER_OPTIONS)
  provider?: string;

  @ApiProperty({ example: 'AD_ORDER_20260418_0001' })
  @IsString()
  @IsNotEmpty()
  orderCode: string;

  @ApiProperty({ example: 'NAPTIEN AD_ORDER_20260418_0001' })
  @IsString()
  @IsNotEmpty()
  transferContent: string;

  @ApiProperty({ example: 700000 })
  @IsInt()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ enum: AD_PAYMENT_STATUS_OPTIONS, default: 'PENDING' })
  @IsOptional()
  @IsEnum(AD_PAYMENT_STATUS_OPTIONS)
  status?: string;

  @ApiPropertyOptional({ example: '2026-04-18T09:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  webhookPayload?: Record<string, any>;
}
