import { IsMongoId, IsOptional } from 'class-validator';

export class CreateConversationDto {
  //- Cả companyId và candidateId đều để optional ở mức DTO.
  //- Vì tuỳ thuộc vào ai là người chủ động tạo chat, Backend sẽ tự điền biến còn thiếu từ Token (req.user).

  @IsMongoId({ message: 'Company ID không hợp lệ' })
  @IsOptional()
  companyId?: string;

  @IsMongoId({ message: 'Candidate ID không hợp lệ' })
  @IsOptional()
  candidateId?: string;

  //- Job ID nếu tạo conversation từ trang chi tiết Job (Tuỳ chọn)
  @IsMongoId({ message: 'Job ID không hợp lệ' })
  @IsOptional()
  jobId?: string;
}

export class AssignConversationDto {
  @IsMongoId({ message: 'Recruiter ID không hợp lệ' })
  @IsOptional()
  assignedRecruiterId: string;
}
