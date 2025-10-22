import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, Min, ValidateNested } from 'class-validator';
import { Gender } from 'src/utils/typeSchemas';

export class DesiredSalaryDto {
  @ApiProperty({ example: 1000 })
  @IsNumber({}, { message: 'Mức lương tối thiểu phải là số' })
  @Min(0, { message: 'Lương tối thiểu không được âm' })
  min: number;

  @ApiProperty({ example: 2000 })
  @IsNumber({}, { message: 'Mức lương tối đa phải là số' })
  @Min(0, { message: 'Lương tối đa không được âm' })
  max: number;
}

export class EducationDto {
  @ApiProperty({ example: 'Đại học Thủy Lợi' })
  @IsNotEmpty({ message: 'Tên trường không được để trống' })
  school: string;

  @ApiProperty({ example: 'Cử nhân Công nghệ thông tin' })
  @IsNotEmpty({ message: 'Bằng cấp không được để trống' })
  degree: string;

  @ApiProperty({ example: '2021-09-01' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  startDate: Date;

  @ApiProperty({ example: '2026-06-01' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  endDate: Date;
}

export class CreateDetailProfileDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  @IsMongoId({ message: 'ID người dùng phải là MongoId hợp lệ' })
  userID: string;

  @ApiProperty()
  @IsOptional()
  sumary: string;

  @ApiProperty({ required: false, default: Gender.Boy })
  @IsOptional()
  gender: string;

  @ApiProperty()
  @IsArray({ message: 'industryID phải là mảng' })
  @IsMongoId({
    each: true,
    message: 'Mỗi ID trong industryID phải là MongoId hợp lệ',
  })
  industryID: string[];

  @ApiProperty()
  @IsArray({ message: 'SkillsID phải là mảng' })
  @IsMongoId({
    each: true,
    message: 'Mỗi ID trong industryID phải là MongoId hợp lệ',
  })
  skillID: string[];

  @ApiProperty({ type: DesiredSalaryDto })
  @ValidateNested()
  @Type(() => DesiredSalaryDto)
  @IsObject({ message: 'desiredSalary phải là object' })
  desiredSalary: DesiredSalaryDto;

  @ApiProperty({ type: [EducationDto] })
  @IsArray({ message: 'education phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education: EducationDto[];

  @ApiProperty()
  @IsNotEmpty({ message: 'Level người dùng không được để trống' })
  level: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Địa chỉ người dùng không được để trống' })
  address: string;
}
