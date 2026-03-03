import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SystemCvDataDto {
  @ApiProperty({
    example: '64b0f1c9e1a2b3c4d5e6f7g8',
    description: 'ID của CV hệ thống',
  })
  @IsNotEmpty()
  @IsMongoId()
  userResumeId: string;

  @ApiProperty({
    example: 'modern-01',
    description: 'ID của mẫu giao diện CV',
  })
  @IsNotEmpty()
  @IsString()
  templateId: string;

  @ApiProperty({
    description: 'Nội dung data của CV (Snapshot)',
  })
  @IsNotEmpty()
  resumeContent: any;
}

export class CreateApplicationDto {
  @ApiProperty({
    example: '64b0f1c9e1a2b3c4d5e6f7g8',
    description: 'ID của công việc ứng tuyển',
  })
  @IsNotEmpty()
  @IsMongoId()
  jobId: string;

  //- không cần gửi userID lên vì có thể lấy từ req.user.
  //- không cần gửi companyID lên vì có thể lấy từ jobId tại BE sẽ query cho chính xác không có FE gửi sai hoặc bị tấn công.

  @ApiProperty({ example: 'ungvien@gmail.com', description: 'Email liên hệ' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'UPLOAD_CV',
    enum: ['UPLOAD_CV', 'SYSTEM_CV'],
    description: 'Loại hồ sơ nộp (File PDF tải lên hoặc CV hệ thống)',
    default: 'UPLOAD_CV',
  })
  @IsOptional()
  @IsString()
  resumeType?: string;

  @ApiProperty({
    example: 'https://example.com/cv.pdf',
    description: 'Link CV (Bắt buộc nếu resumeType = UPLOAD_CV)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cvUrl?: string;

  @ApiProperty({
    description: 'Dữ liệu CV hệ thống (Bắt buộc nếu resumeType = SYSTEM_CV)',
    type: SystemCvDataDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SystemCvDataDto)
  systemCvData?: SystemCvDataDto;

  @ApiProperty({
    example: 'Tôi rất thích công ty...',
    description: 'Thư giới thiệu',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverLetter?: string;
}
