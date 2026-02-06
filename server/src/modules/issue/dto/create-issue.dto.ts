import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsString,
  IsMongoId,
} from 'class-validator';
import { ISSUE_TYPE_OPTIONS } from 'src/common/constants/issue-const';

export class CreateIssueDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Nội dung mô tả không được để trống' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Loại yêu cầu không hợp lệ' })
  @IsEnum(ISSUE_TYPE_OPTIONS.map((opt) => opt.value), {
    message:
      'Loại yêu cầu phải thuộc: REPORT_JOB, REPORT_COMPANY, SUPPORT, hoặc FEEDBACK',
  })
  type: string;

  @IsOptional()
  @IsMongoId({ message: 'ID đối tượng liên quan không hợp lệ' })
  targetId?: string; //- để là optional vì không phải issue nào cũng có targetId vd: SUPPORT, FEEDBACK

  @IsOptional()
  @IsArray({ message: 'Danh sách ảnh phải là một mảng' })
  @IsString({ each: true, message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
  attachments?: string[]; //- Mảng URL ảnh bằng chứng đính kèm optional
}
