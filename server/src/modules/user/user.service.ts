import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto, RegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserResponse } from './schemas/user.schema';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { hashPassword } from 'src/utils/hashPassword';
import mongoose, { Types } from 'mongoose';
import { DetailProfileService } from 'src/modules/detail-profile/detail-profile.service';
import { FindUserQueryDto } from './dto/userDto.dto';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../roles/roles.service';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { CompanyService } from '../company/company.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import {
  ApproveCompanyDto,
  JoinCompanyDto,
} from '../company/dto/companyDto.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    private detailProfileService: DetailProfileService,
    private readonly configService: ConfigService,
    private readonly roleService: RolesService,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
    private eventEmitter: EventEmitter2,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;

      if (password.length < 8)
        throw new BadRequestCustom('Mật khẩu phải có ít nhất 8 ký tự');

      const user = await this.userModel.findOne({ email });

      if (user) throw new BadRequestCustom('Email này đã được đăng ký', !!user);

      const hashedPassword = await hashPassword(password);

      const newUser = {
        ...createUserDto,
        password: hashedPassword,
      };

      const createdUser = await this.userModel.create(newUser);

      if (!createdUser)
        throw new BadRequestCustom('Tạo người dùng thất bại', !!createdUser);

      //- đồng thời tạo luôn detail profile cho người dùng
      await this.detailProfileService.createAuto({
        userID: createdUser._id.toString(),
      });

      return {
        _id: createdUser._id,
        name: createdUser.name,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async updateUserToOwner(
    userId: string,
    data: { roleID: string; companyID: string },
    session: any,
  ) {
    return await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          roleID: data.roleID,
          employerInfo: {
            companyID: data.companyID,
            isOwner: true,
            userStatus: 'ACTIVE',
          },
        },
      },
      { session }, //- để dính vào Transaction của CompanyService
    );
  }

  //- dành cho recruiter_admin remove recruiter khỏi công ty
  async removeRecruiterFromCompany(userId: string, companyId: string) {
    return await this.userModel.findOneAndUpdate(
      {
        _id: userId,
        'employerInfo.companyID': companyId,
      },
      {
        $unset: { employerInfo: '' },
      },
      { new: true },
    );
  }

  async createUserWithProviderSocial(userData: UserResponse, provider: string) {
    try {
      //- bỏ id đi
      const { id, ...rest } = userData;

      const data = {
        ...rest,
        provider: {
          type: provider,
          id: userData.id,
        },
      };
      const createdUser = await this.userModel.create(data);

      if (!createdUser)
        throw new BadRequestCustom('Tạo người dùng thất bại', !!createdUser);

      //- đồng thời tạo luôn detail profile cho người dùng
      await this.detailProfileService.createAuto({
        userID: createdUser._id.toString(),
      });

      return {
        _id: createdUser._id,
        name: createdUser.name,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- sau thêm api getUser by filter name, email...
  async findAllByFilter(query: FindUserQueryDto) {
    return this.detailProfileService.findAllByFilter(query);
  }

  async getProfileForResume(userId: string) {
    try {
      //- check id đã
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestCustom('ID không đúng định dạng', !!userId);
      }
      
      const user = await this.userModel
        .findById(userId)
        .select('name email avatar')
        .lean();

      if (!user) throw new BadRequestCustom('Không tìm thấy người dùng', true);

      //- Gọi sang DetailProfileService để lấy thông tin chi tiết
      const profile =
        await this.detailProfileService.findByUserIdForResume(userId);

      //- Gộp dữ liệu trả về cho FE
      return {
        personalInfo: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          gender: profile?.gender || 'Boy',
          address: profile?.address || '',
        },
        professionalSummary: profile?.sumary || '',
        education: profile?.education || [],
        skills: profile?.skillID || [],
        industries: profile?.industryID || [],
        desiredSalary: profile?.desiredSalary || { min: 0, max: 0 },
        level: profile?.level || '',
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- reset userStatus ve pending/active khi công ty dc accept/reject
  async resetUsersStatusByCompanyID(companyId: string, action: string) {
    try {
      //- tìm các user có employerInfo.companyID = companyId
      const filter = {
        'employerInfo.companyID': companyId,
      };

      //- cập nhật userStatus về PENDING
      const update = {
        $set: { 'employerInfo.userStatus': action.toUpperCase() },
      };

      const result = await this.userModel.updateMany(filter, update);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll() {
    try {
      return this.userModel
        .find({ isDeleted: false })
        .populate({
          path: 'employerInfo.companyID',
          match: { isDeleted: false },
          select: 'name _id',
        })
        .exec();
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- lấy các thành viên trong công ty theo companyID
  async getMembersByCompanyID(companyID: string) {
    try {
      if (!companyID)
        throw new BadRequestCustom(
          'companyID khong duoc de trong',
          !!companyID,
        );

      const filter = {
        'employerInfo.companyID': companyID,
      };

      const result = await this.userModel
        .find(filter)
        .populate({
          path: 'roleID',
          match: { isDeleted: false },
          select: 'name _id',
        })
        .select('-password -refresh_token -__v')
        .lean();

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findOne(id: string, getPassword = false) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID user không đúng định dạng', !!id);
      }

      const user = await this.userModel
        .findById(id)
        .populate([
          {
            path: 'employerInfo.companyID',
            match: { isDeleted: false },
            select: 'name _id',
          },
          {
            path: 'roleID',
            match: { isDeleted: false },
            select: 'name _id',
          },
        ])
        .select(
          getPassword
            ? 'password'
            : '-password -isDeleted -deletedAt -createdAt -updatedAt -__v',
        )
        .lean();

      if (!user) throw new BadRequestCustom('ID user không tìm thấy', !!id);

      if (user.isDeleted) {
        throw new BadRequestCustom('user này hiện đã bị xóa', !!user.isDeleted);
      }

      const roleID = (user.roleID as any)?._id?.toString();

      if (!roleID) {
        //- user có thể không có vai trò, nên sẽ gán quyền rỗng và trả về
        (user as any).permissions = [];
        return user;
      }

      const permissions = await this.roleService.getPermissionsByRoleID(roleID);

      return {
        ...user,
        permissions: permissions, // Mảng chứa các ID permissions
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async handleJoinCompany(joinDto: JoinCompanyDto, user: UserDecoratorType) {
    try {
      const { companyID, note } = joinDto;
      //- Kiểm tra công ty
      const company = await this.companyService.findOne(companyID);
      if (!company) throw new BadRequestException('Công ty không tồn tại');

      //- Kiểm tra User hiện tại
      const currentUser = await this.userModel.findById(user?.id);
      if (!currentUser)
        throw new BadRequestException('Người dùng không tồn tại');

      //- Kiểm tra xem đã liên kết với công ty nào khác chưa
      if (currentUser.employerInfo?.companyID) {
        throw new BadRequestException(
          'Bạn đã liên kết hoặc đang chờ duyệt tại một công ty khác',
        );
      }

      //- Cập nhật employerInfo
      const result = await this.userModel.updateOne(
        { _id: new Types.ObjectId(user.id) },
        {
          $set: {
            'employerInfo.companyID': companyID,
            'employerInfo.userStatus': 'PENDING', //- chờ RECRUITER_ADMIN duyệt
            'employerInfo.isOwner': false, //- không phải người tạo công ty
          },
        },
      );

      //- start ping event
      try {
        const recruiterAdmin =
          await this.getRecruiterAdminByCompanyID(companyID);

        if (recruiterAdmin) {
          this.eventEmitter.emit(NotificationType.COMPANY_RECRUITER_JOINED, {
            receiverId: recruiterAdmin._id,
            senderId: user.id,
            title: 'Yêu cầu gia nhập công ty',
            content: `Người dùng ${user.name} vừa gửi yêu cầu gia nhập công ty, vui lòng phê duyệt.`,
            type: NotificationType.COMPANY_RECRUITER_JOINED,
            metadata: {
              module: 'COMPANY',
              resourceId: user.id,
              action: 'RECRUITER_JOINED',
              note: note, //- lưu thêm note
            },
          });

          //- được gửi qua NotificationListener
        }
      } catch (notifyError) {
        console.error('Notification Error:', notifyError.message);
      }

      return result;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof BadRequestCustom
      )
        throw error;
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async handleApproveJoinRequest(
    approveDto: ApproveCompanyDto,
    admin: UserDecoratorType,
  ) {
    const { targetUserId, action } = approveDto;

    //- Tìm người xin gia nhập
    const targetUser = await this.userModel.findById(targetUserId);
    if (!targetUser) throw new BadRequestException('Người dùng không tồn tại');

    //- Kiểm tra tính bảo mật: Admin phải cùng companyID với người xin gia nhập
    if (
      targetUser.employerInfo?.companyID?.toString() !==
      admin.employerInfo?.companyID?.toString()
    ) {
      throw new ForbiddenException('Bạn không có quyền duyệt yêu cầu này');
    }

    //- Xử lý theo hành động
    if (action === 'REJECT') {
      //- Từ chối: Xóa trắng employerInfo để họ có thể xin vào chỗ khác
      return await this.userModel.updateOne(
        { _id: targetUserId },
        { $unset: { employerInfo: '' } },
      );
    }

    //- Chấp nhận: Chuyển status sang ACTIVE
    const result = await this.userModel.updateOne(
      { _id: targetUserId },
      {
        $set: { 'employerInfo.userStatus': 'ACTIVE' },
      },
    );

    //- Bắn Event thông báo ngược lại cho người xin gia nhập (Recruiter mới)
    this.eventEmitter.emit(NotificationType.COMPANY_JOIN_REQUEST_PROCESSED, {
      receiverId: targetUserId,
      senderId: admin.id,
      title:
        action === 'ACCEPT'
          ? 'Yêu cầu gia nhập đã được duyệt'
          : 'Yêu cầu gia nhập bị từ chối',
      content:
        action === 'ACCEPT'
          ? `Chúc mừng! Bạn đã trở thành thành viên của công ty.`
          : `Rất tiếc, yêu cầu gia nhập của bạn không được chấp nhận.`,
      type: NotificationType.COMPANY_JOIN_REQUEST_PROCESSED,
      metadata: {
        module: 'COMPANY',
        action: action === 'ACCEPT' ? 'JOIN_SUCCESS' : 'JOIN_REJECTED',
        resourceId: admin.employerInfo?.companyID,
      },
    });

    return result;
  }

  async resetUserEmployerInfo(userId: string, session: any) {
    try {
      // Lấy lại role recruiter
      const getNameRoleRecruiter =
        this.configService.get<string>('role_recruiter');

      const defaultRole = await this.roleService.getRoleByName(
        getNameRoleRecruiter!,
      );

      if (!defaultRole) throw new BadRequestException('Role không tồn tại');

      return await this.userModel.updateOne(
        { _id: userId },
        {
          $set: {
            roleID: defaultRole?._id.toString(),
            employerInfo: undefined,
          },
        },
        { session },
      );
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findOneByFilter(filter: Record<string, any>) {
    try {
      const user = await this.userModel.findOne(filter).lean();
      return user;
    } catch (error) {
      throw new BadRequestCustom(
        `Lỗi khi tìm kiếm người dùng: ${error.message}`,
        true,
      );
    }
  }

  async findOneWithRole(id: string) {
    try {
      const user = await this.userModel
        .findById(id)
        .populate({
          path: 'roleID',
          match: { isDeleted: false }, // Chỉ lấy role chưa bị xóa
          select: 'name _id', // Lấy thông tin role
          populate: {
            path: 'permissions',
            match: { isDeleted: false }, // Chỉ lấy quyền chưa bị xóa
            select: 'name apiPath method _id', // Lấy các thông tin cần để check quyền
          },
        })
        .select('-password') // Không bao giờ lấy password ở đây
        .lean();

      if (!user) throw new BadRequestCustom('ID user không tìm thấy', !!id);
      return user;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      if (!email)
        throw new BadRequestCustom('email khong duoc de trong', !!email);

      const user = await this.userModel.findOne({ email });
      return user;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async getRecruiterAdminByCompanyID(companyID: string) {
    try {
      const getNameRoleRecruiterAdmin = this.configService.get<string>(
        'role_recruiter_admin',
      );

      const roleRecruiterAdmin = await this.roleService.getRoleByName(
        getNameRoleRecruiterAdmin!,
      );

      if (!roleRecruiterAdmin) {
        throw new BadRequestCustom(
          'Hệ thống chưa cấu hình Role Admin cho Nhà tuyển dụng',
        );
      }

      const filter = {
        roleID: roleRecruiterAdmin._id.toString(), // Mongoose tự hiểu ObjectId nếu truyền trực tiếp từ model khác
        'employerInfo.companyID': companyID, // Ép kiểu để query chính xác
        'employerInfo.isOwner': true, // Lấy người sở hữu để gửi thông báo phê duyệt
      };

      const recruiterAdmin = await this.userModel.findOne(filter);

      if (!recruiterAdmin)
        throw new BadRequestCustom(
          'Không tìm thấy quản trị viên của công ty này',
        );

      return recruiterAdmin;
    } catch (error) {
      // Tránh việc throw lại BadRequestCustom lồng nhau nếu error đã là BadRequestCustom
      if (error instanceof BadRequestCustom) throw error;
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async getUserByRoleSuperAdmin(name: string) {
    try {
      if (!name) throw new BadRequestCustom('name khong duoc de trong', !!name);

      const role = await this.roleService.getRoleByName(name);

      if (!role) throw new BadRequestCustom('Không tìm thấy vai trò admin');

      const userAdmin = await this.userModel.findOne({
        roleID: role._id,
      });

      return userAdmin;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findUserByProviderIDSocial(
    idProvider: string,
  ): Promise<UserDocument | null> {
    try {
      if (!idProvider)
        throw new BadRequestCustom(
          'idProvider khong duoc de trong',
          !!idProvider,
        );

      const user = await this.userModel.findOne({ 'provider.id': idProvider });

      if (!user) return null;

      return user;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID user không đúng định dạng', !!id);
      }

      const user = await this.userModel.findById(id);
      if (!user) throw new BadRequestCustom('ID user không tìm thấy', !!id);

      const filter = {
        _id: id,
      };

      const update = {
        $set: updateUserDto,
      };

      const result = await this.userModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa user', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async updateUserByAnyBody(id: string, update: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID user không đúng định dạng', !!id);
      }

      const filter = {
        _id: id,
      };

      const result = await this.userModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa user', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- func update refresh token...
  async updateRefreshToken(id: string, refreshToken: string) {
    try {
      //- vào tới đây thì id đã chính xác rồi
      const filter = { _id: id };
      const update = { $set: { refresh_token: refreshToken } };

      const result = await this.userModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa refresh token', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- func register
  async register(registerDto: RegisterDto) {
    try {
      if (!registerDto) return;

      //- khi đăng ký người dùng bình thường
      const nameRole = this.configService.get<string>(
        'role_candidate',
      ) as string;
      const idRole = await this.roleService.getRoleByName(nameRole);

      if (!idRole) throw new BadRequestException('Role không tồn tại');

      const user = await this.userModel.create({
        ...registerDto,
        roleID: idRole,
      });

      //- đồng thời tạo luôn detail profile cho người dùng
      await this.detailProfileService.createAuto({
        userID: user._id.toString(),
      });

      return user;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- func register
  async recruiterRegister(registerDto: RegisterDto) {
    try {
      if (!registerDto) return;

      //- khi đăng ký làm nhà tuyển dụng
      const nameRole = this.configService.get<string>(
        'role_recruiter',
      ) as string;
      const idRole = await this.roleService.getRoleByName(nameRole);

      if (!idRole) throw new BadRequestException('Role không tồn tại');

      const user = await this.userModel.create({
        ...registerDto,
        roleID: idRole,
      });

      //- đồng thời tạo luôn detail profile cho người dùng
      await this.detailProfileService.createAuto({
        userID: user._id.toString(),
      });

      return user;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  // 1. Chức năng cập nhật duy nhất Vai trò
  async updateUserRole(id: string, roleID: string) {
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(roleID)
    ) {
      throw new BadRequestCustom('ID không đúng định dạng');
    }

    const result = await this.userModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: { roleID: roleID } },
    );

    if (result.modifiedCount === 0) {
      throw new BadRequestCustom(
        'Không tìm thấy người dùng hoặc vai trò không thay đổi',
      );
    }

    return result;
  }

  async restoreUserAndProfile(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('ID không đúng định dạng');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Khôi phục User
      const user = await this.userModel.findOneAndUpdate(
        { _id: id, isDeleted: true },
        { $set: { isDeleted: false, deletedAt: null } },
        { session, new: true },
      );

      if (!user) {
        throw new Error(
          'Không tìm thấy người dùng bị xóa hoặc tài khoản đang hoạt động',
        );
      }

      // 2. Gọi Service khôi phục Profile (Sửa lỗi báo đỏ ở đây)
      await this.detailProfileService.restoreByUserId(id, session);

      await session.commitTransaction();
      return { message: 'Khôi phục tài khoản thành công' };
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestCustom(error.message);
    } finally {
      session.endSession();
    }
  }

  //- Chức năng vô hiệu hóa tất cả nhân viên của công ty khi công ty bị xóa
  async deactivateByCompany(
    companyIds: string[],
    session: mongoose.ClientSession,
  ) {
    try {
      // Tìm và cập nhật tất cả User có companyID trùng với ID công ty bị xóa
      const result = await this.userModel.updateMany(
        {
          'employerInfo.companyID': { $in: companyIds },
          isDeleted: false,
        },
        {
          $set: {
            'employerInfo.userStatus': 'INACTIVE',
          },
        },
        { session },
      );
      return result;
    } catch (error) {
      throw new Error(`Lỗi khi vô hiệu hóa nhân viên: ${error.message}`);
    }
  }

  //- hàm này là đối ngược với hàm deactivateByCompany, ta sẽ kích hoạt lại tất cả nhân viên của công ty khi công ty được khôi phục
  async reactivateByCompany(
    companyId: string,
    session: mongoose.ClientSession,
  ) {
    return await this.userModel.updateMany(
      {
        'employerInfo.companyID': companyId,
        'employerInfo.userStatus': 'INACTIVE',
      },
      { $set: { 'employerInfo.userStatus': 'ACTIVE' } },
      { session },
    );
  }

  //- Chức năng xóa mềm đồng bộ cả 2 collection user & detailProfile (Transaction)
  async softDeleteUserAndProfile(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('ID không đúng định dạng');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Xóa mềm User
      const userUpdate = await this.userModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { session, new: true },
      );

      if (!userUpdate) {
        throw new Error('Người dùng không tồn tại hoặc đã bị xóa');
      }

      // 2. Gọi hàm xóa bên DetailProfileService và truyền session vào
      await this.detailProfileService.softCheckDeleteByUserId(id, session);

      // Hoàn tất transaction
      await session.commitTransaction();
      return { message: 'Đã xóa đồng bộ User và Profile' };
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestCustom(error.message);
    } finally {
      session.endSession();
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID user không đúng định dạng', !!id);
      }

      const user = await this.userModel.findById(id);
      if (!user) throw new BadRequestCustom('ID user không tìm thấy', !!id);

      const isDeleted = user.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('user này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.userModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa user', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
