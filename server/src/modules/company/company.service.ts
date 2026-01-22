import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { TranslationService } from 'src/common/translation/translation.service';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose, { Connection, Model } from 'mongoose';
import { RolesService } from '../roles/roles.service';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from 'src/common/constants/notification-type.enum';

@Injectable()
export class CompanyService {
  constructor(
    private readonly translationService: TranslationService,
    private readonly roleService: RolesService,
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectConnection() private readonly connection: Connection, //- để dùng Mongoose Transaction
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, user: UserDecoratorType) {
    //- Nếu tạo Company thành công nhưng Update User thất bại, hệ thống sẽ rơi vào tình trạng "Company mồ côi" ==> dùng transaction.
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      //- Xử lý đa ngôn ngữ
      const dataLang = await this.translationService.translateModuleData(
        'company',
        createCompanyDto,
      );

      //- Tạo bản ghi Company với status: 'PENDING'
      const newCompany = new this.companyModel({
        ...dataLang,
        status: 'PENDING',
      });
      const company = await newCompany.save({ session });

      //- Lấy Role ID của RECRUITER_ADMIN
      const textRoleRecruiterAdmin = this.configService.get<string>(
        'role_recruiter_admin',
      );
      const roleAdmin = await this.roleService.getRoleByName(
        textRoleRecruiterAdmin!,
      );

      if (!roleAdmin)
        throw new BadRequestCustom(
          'Quyền quản trị nhà tuyển dụng không tồn tại',
        );
      //- Cập nhật User hiện tại thành Chủ sở hữu (Owner)
      await this.userService.updateUserToOwner(
        user.id,
        {
          roleID: roleAdmin?._id.toString(),
          companyID: company._id.toString(),
        },
        session,
      );

      //- Nếu mọi thứ ok, commit transaction
      await session.commitTransaction();

      //- start ping
      try {
        // Tìm Super Admin để gửi thông báo (Bạn có thể dùng hàm tương tự getRecruiterAdminByCompanyID nhưng cho Super Admin)
        const textRoleAdmin =
          this.configService.get<string>('role_super_admin');
        const superAdmin = await this.userService.getUserByRoleSuperAdmin(
          textRoleAdmin!,
        );

        if (superAdmin) {
          this.eventEmitter.emit(NotificationType.COMPANY_CREATED, {
            receiverId: superAdmin._id,
            senderId: user.id,
            title: 'Doanh nghiệp mới đăng ký',
            content: `Doanh nghiệp "${createCompanyDto.name}" vừa được tạo và đang chờ bạn phê duyệt.`,
            type: NotificationType.COMPANY_CREATED,
            metadata: {
              module: 'COMPANY',
              resourceId: company._id.toString(),
              action: 'APPROVE_NEEDED',
            },
          });
        }
      } catch (notifError) {
        // Log lỗi notify nhưng không làm crash luồng chính vì DB đã lưu xong
        console.error(
          'Notification Error after company creation:',
          notifError.message,
        );
      }
      //- end ping

      return {
        _id: company._id,
        name: company.name.en,
      };
    } catch (error) {
      // Nếu có lỗi, rollback lại toàn bộ dữ liệu đã tạo
      await session.abortTransaction();
      throw new BadRequestCustom(error.message, !!error.message);
    } finally {
      session.endSession();
    }
  }

  async findAll() {
    try {
      //- sau này cần bổ sung thêm có bao job cho mỗi công ty
      return this.companyModel.find({ isDeleted: false }).select('-userFollow');
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async checkTaxCodeExist(taxCode: string) {
    try {
      if (!taxCode)
        throw new BadRequestCustom('taxCode không được để trống', !!taxCode);

      const company = await this.companyModel.findOne({ taxCode });

      if (company)
        throw new BadRequestCustom(
          `Công ty ${company.name.vi} đã được đăng ký trên hệ thống!`,
          !!taxCode,
        );

      return true;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- còn thiếu 1 vài api nữa, nào code tới FE mình làm thêm

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID company không đúng định dạng', !!id);
      }

      const company = await this.companyModel
        .findById(id)
        .populate([
          {
            path: 'industryID',
            match: { isDeleted: false },
            select: 'name _id',
          },
          // {
          //   path: 'userFollow',
          //   match: { isDeleted: false },
          //   select: 'name _id',
          // },
        ])
        .lean();

      if (!company)
        throw new BadRequestCustom('ID company không tìm thấy', !!id);

      if (company?.isDeleted) {
        throw new BadRequestCustom(
          'company này hiện đã bị xóa',
          !!company?.isDeleted,
        );
      }

      return company;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID company không đúng định dạng', !!id);
      }

      const company = await this.companyModel.findById(id);
      if (!company)
        throw new BadRequestCustom('ID company không tìm thấy', !!id);

      //- cần translation trước đã
      const dataTranslation = await this.translationService.translateModuleData(
        'company',
        updateCompanyDto,
      );
      const filter = { _id: id };
      const update = { $set: dataTranslation };

      const result = await this.companyModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa company', !!id);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID company không đúng định dạng', !!id);
      }

      const company = await this.companyModel.findById(id);
      if (!company)
        throw new BadRequestCustom('ID company không tìm thấy', !!id);

      const isDeleted = company.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('company này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.companyModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa company', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
