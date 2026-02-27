import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RequestHotJobDto {
  @ApiProperty({ example: 'Công việc này cần được lên top...' })
  @IsNotEmpty({ message: 'Nội dung mô tả không được để trống' })
  @IsString()
  description: string;

  @ApiProperty({ example: '6752cc5331e2d424074213d2' })
  @IsNotEmpty({ message: 'Job ID không được để trống' })
  @IsMongoId({ message: 'Job ID không hợp lệ' })
  targetId: string;
}
