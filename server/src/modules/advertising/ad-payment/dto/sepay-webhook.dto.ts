import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SePayWebhookDto {
  @IsNumber()
  id: number; //- ID giao dịch trên SePay

  @IsString()
  gateway: string; //- Ngân hàng (VCB, ACB, ...)

  @IsString()
  transactionDate: string; //- Ngày giao dịch

  @IsString()
  accountNumber: string; //- Số tài khoản nhận

  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  content: string; //- Nội dung chuyển khoản (Đây là trường quan trọng để map đơn hàng)

  @IsString()
  transferType: string; //- Loại giao dịch (in/out)

  @IsNumber()
  transferAmount: number; //- Số tiền chuyển

  @IsNumber()
  accumulated: number; //- Số dư sau giao dịch

  @IsOptional()
  @IsString()
  subAccount?: string;

  @IsString()
  referenceCode: string; //- Mã tham chiếu của ngân hàng

  @IsString()
  description: string; //- Mô tả giao dịch
}
