import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LEVEL_OPTIONS,
} from 'src/common/constants/company-const';
import { ApiProperty } from '@nestjs/swagger';

class SalaryRangeDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  min: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  max: number;

  @ApiProperty()
  @IsString()
  @IsEnum(['VND', 'USD'])
  @IsOptional()
  currency: string;
}

export class CreateJobDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsMongoId({ message: 'ID phải là MongoId hợp lệ' })
  @IsNotEmpty()
  companyID: string;

  @ApiProperty()
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  industryID: string[];

  @ApiProperty()
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  skills: string[];

  @ApiProperty({
    description: 'Kỹ năng tự nhập thêm',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @IsOptional() //- trường này không bắt buộc
  otherSkills?: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salary: SalaryRangeDto;

  @ApiProperty()
  @IsString()
  @IsEnum(LEVEL_OPTIONS.map((option) => option.value))
  @IsNotEmpty()
  level: string;

  @ApiProperty()
  @IsString()
  @IsEnum(EMPLOYEE_TYPE_OPTIONS.map((option) => option.value))
  @IsNotEmpty()
  employeeType: string;

  @ApiProperty()
  @IsString()
  @IsEnum(EXPERIENCE_OPTIONS.map((option) => option.value))
  @IsNotEmpty()
  experience: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
