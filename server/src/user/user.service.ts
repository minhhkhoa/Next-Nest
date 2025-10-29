import { Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserResponse } from './schemas/user.schema';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { hashPassword } from 'src/utils/hashPassword';
import mongoose from 'mongoose';
import { DetailProfileService } from 'src/detail-profile/detail-profile.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    private detailProfileService: DetailProfileService,
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

  async findAll() {
    try {
      return this.userModel.find({ isDeleted: false }).populate({
        path: 'companyID',
        match: { isDeleted: false },
        select: 'name _id',
      });
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID user không đúng định dạng', !!id);
      }

      const user = await this.userModel
        .findById(id)
        .populate([
          {
            path: 'companyID',
            match: { isDeleted: false },
            select: 'name _id',
          },
          // {
          //   path: 'roleID',
          //   match: { isDeleted: false },
          //   select: 'name _id',
          // },
        ])
        .select(
          '-password -isDeleted -deletedAt -createdAt -updatedAt -refresh_token -__v',
        );

      if (!user) throw new BadRequestCustom('ID user không tìm thấy', !!id);

      if (user?.isDeleted) {
        throw new BadRequestCustom(
          'user này hiện đã bị xóa',
          !!user?.isDeleted,
        );
      }

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

  async updateUserResetToken(id: string, update: any) {
    try {
      if(!mongoose.Types.ObjectId.isValid(id)) {
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
    if (!registerDto) return;

    const user = await this.userModel.create(registerDto);
    return user;
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
