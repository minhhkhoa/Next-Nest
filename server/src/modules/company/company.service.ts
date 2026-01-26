import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { TranslationService } from 'src/common/translation/translation.service';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose, { Connection, Types } from 'mongoose';
import { RolesService } from '../roles/roles.service';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import {
  AdminApproveCompanyDto,
  FindCompanyQueryDto,
  FindJoinRequestDto,
} from './dto/companyDto.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly translationService: TranslationService,
    private readonly roleService: RolesService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
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
        createdBy: {
          _id: new Types.ObjectId(user.id),
          name: user.name,
          email: user.email,
          avatar: user.avatar
        },
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
        name: company.name,
      };
    } catch (error) {
      // Nếu có lỗi, rollback lại toàn bộ dữ liệu đã tạo
      await session.abortTransaction();
      throw new BadRequestCustom(error.message, !!error.message);
    } finally {
      session.endSession();
    }
  }

  //- hàm lấy thông tin người gửi yêu cầu gia nhập công ty cho recruiter_admin
  async getRecruiterJoinRequests(adminId: string, query: FindJoinRequestDto) {
    // Gọi thông qua Service
    return await this.notificationsService.getJoinRequestsForAdmin(
      adminId,
      query,
    );
  }

  async findAllByFilter(query: FindCompanyQueryDto) {
    try {
      const { currentPage, pageSize, name, address, status } = query;

      // 1. Xây dựng mảng AND để chứa các điều kiện lọc độc lập
      const andConditions: any[] = [];

      // Filter theo Name (Đa ngôn ngữ)
      if (name) {
        andConditions.push({
          $or: [
            { 'name': { $regex: name, $options: 'i' } },
            { 'name': { $regex: name, $options: 'i' } },
          ],
        });
      }

      // Filter theo Address
      if (address) {
        andConditions.push({
          address: { $regex: address, $options: 'i' },
        });
      }

      // Filter theo Status
      if (status) {
        andConditions.push({ status });
      }

      // Tổng hợp điều kiện lọc
      const filterConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

      // 2. Tính toán Phân trang
      const defaultPage = +currentPage > 0 ? +currentPage : 1;
      const defaultLimit = +pageSize > 0 ? +pageSize : 10;
      const offset = (defaultPage - 1) * defaultLimit;

      // 3. Thực thi query song song để tối ưu tốc độ
      const [totalItems, result] = await Promise.all([
        this.companyModel.countDocuments(filterConditions), // Đếm nhanh hơn .length
        this.companyModel
          .find(filterConditions)
          .skip(offset)
          .limit(defaultLimit)
          .sort('-createdAt')
          .lean()
          .exec(),
      ]);

      const totalPages = Math.ceil(totalItems / defaultLimit);

      return {
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          totalPages: totalPages,
          totalItems: totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
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

      //- có công ty rồi
      if (company)
        return {
          exists: true,
          company
        };

      return {
        exists: false,
      };
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

  async handleVerifyCompany(
    verifyDto: AdminApproveCompanyDto,
    admin: UserDecoratorType,
  ) {
    const { companyID, action } = verifyDto;
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      //- tìm công ty
      const company = await this.companyModel.findById(companyID);
      if (!company) throw new BadRequestException('Công ty không tồn tại');

      //- Tìm người sở hữu công ty (Owner) để thông báo
      const owner = await this.userService.findOneByFilter({
        'employerInfo.companyID': companyID,
        'employerInfo.isOwner': true,
      });

      //- xét hành động
      if (action === 'REJECT') {
        // 1. Xóa công ty
        await this.companyModel.findByIdAndDelete(companyID, { session });

        // 2. Reset User về trạng thái ban đầu (Xóa role admin, xóa info công ty)
        if (owner) {
          await this.userService.resetUserEmployerInfo(
            owner._id.toString(),
            session,
          );
        }
      } else {
        // 3. Chấp nhận: Đổi trạng thái Company sang ACTIVE
        await this.companyModel.updateOne(
          { _id: companyID },
          { $set: { status: 'ACTIVE' } },
          { session },
        );
      }

      await session.commitTransaction();

      //- start ping
      try {
        // 4. Bắn thông báo cho Owner Company sau khi DB đã xong
        if (owner) {
          this.eventEmitter.emit(
            NotificationType.COMPANY_ADMIN_REQUEST_PROCESSED,
            {
              receiverId: owner._id.toString(),
              senderId: admin.id,
              title:
                action === 'ACCEPT'
                  ? 'Công ty của bạn đã được phê duyệt'
                  : 'Yêu cầu tạo công ty bị từ chối',
              content:
                action === 'ACCEPT'
                  ? `Chúc mừng! Công ty ${company.name} đã có thể bắt đầu đăng tin tuyển dụng.`
                  : `Rất tiếc, yêu cầu tạo công ty ${company.name} không được chấp nhận.`,
              type: NotificationType.COMPANY_ADMIN_REQUEST_PROCESSED,
              metadata: {
                module: 'COMPANY',
                action:
                  action === 'ACCEPT'
                    ? 'COMPANY_ADMIN_REQUEST_PROCESSED_ACTIVE'
                    : 'COMPANY_ADMIN_REQUEST_PROCESSED_REJECTED',
                resourceId: companyID,
              },
            },
          );
        }
      } catch (error) {
        console.error('Notification Error:', error.message);
      }
      //- end ping

      return { status: action };
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestCustom(error.message, !!error.message);
    } finally {
      session.endSession();
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
