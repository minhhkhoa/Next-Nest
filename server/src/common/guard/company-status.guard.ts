import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/modules/company/schemas/company.schema';

//- CompanyStatusGuard sẽ check trạng thái của công ty và chặn đứng request ngay lập tức nếu công ty chưa được phê duyệt

@Injectable()
export class CompanyStatusGuard implements CanActivate {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy từ AuthGuard

    //- lấy text role super_admin
    const textSuperAdmin = this.configService.get<string>('role_super_admin');

    //- Nếu là Super Admin thì cho qua
    if (user.role?.name === textSuperAdmin) return true;

    const companyID = user.employerInfo?.companyID;

    //- Không có công ty thì không có quyền làm gì với Job
    if (!companyID) {
      throw new ForbiddenException(
        'Tài khoản của bạn chưa liên kết với công ty nào',
      );
    }

    //- Truy vấn trạng thái công ty
    const company = await this.companyModel
      .findById(companyID)
      .select('status isDeleted')
      .lean();

    if (!company || company.isDeleted) {
      throw new ForbiddenException('Công ty không tồn tại hoặc đã bị xóa');
    }

    if (company.status !== 'ACCEPT') {
      throw new ForbiddenException(
        'Công ty của bạn đang chờ phê duyệt. Vui lòng quay lại sau khi công ty đã được xác thực.',
      );
    }

    return true;
  }
}
