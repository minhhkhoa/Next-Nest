import { PartialType } from '@nestjs/swagger';
import { CreateIssueDto } from './create-issue.dto';
import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { ISSUE_STATUS_OPTIONS } from 'src/common/constants/issue-const';

//- User chỉ dùng cái này để sửa tiêu đề/mô tả nếu họ viết sai lúc đầu
export class UpdateIssueDto extends PartialType(CreateIssueDto) {}

export class UpdateIssueAdminDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(ISSUE_STATUS_OPTIONS.map((opt) => opt.value), {
    message: 'Trạng thái không hợp lệ',
  })
  status: string;

  @IsNotEmpty({ message: 'Nội dung phản hồi không được để trống' })
  @IsString()
  adminReply: string; //- Đây chính là content sẽ bay vào adminResponse trong Schema
}
