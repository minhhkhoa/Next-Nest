import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserResponse } from './schemas/user.schema';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { hashPassword } from 'src/utils/hashPassword';
import mongoose from 'mongoose';
import { DetailProfileService } from 'src/modules/detail-profile/detail-profile.service';
import { FindUserQueryDto } from './dto/userDto.dto';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    private detailProfileService: DetailProfileService,
    private readonly configService: ConfigService,
    private readonly roleService: RolesService,
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
      const nameRole = this.configService.get<string>('role_gest') as string;
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

  // 2. Chức năng xóa mềm đồng bộ cả 2 collection user & detailProfile (Transaction)
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
