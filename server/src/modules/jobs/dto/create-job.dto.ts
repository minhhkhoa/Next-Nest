import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LEVEL_OPTIONS,
} from 'src/common/constants/company-const';

class SalaryRangeDto {
  @IsNumber()
  @IsNotEmpty()
  min: number;

  @IsNumber()
  @IsNotEmpty()
  max: number;

  @IsString()
  @IsEnum(['VND', 'USD'])
  @IsOptional()
  currency: string;
}

export class CreateJobDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsMongoId({ message: 'ID phải là MongoId hợp lệ' })
  @IsNotEmpty()
  companyID: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  industryID: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  skills: string[];

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salary: SalaryRangeDto;

  @IsString()
  @IsEnum(LEVEL_OPTIONS.map((option) => option.value))
  @IsNotEmpty()
  level: string;

  @IsString()
  @IsEnum(EMPLOYEE_TYPE_OPTIONS.map((option) => option.value))
  @IsNotEmpty()
  employeeType: string;

  @IsString()
  @IsEnum(EXPERIENCE_OPTIONS.map((option) => option.value))
  @IsNotEmpty()
  experience: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
