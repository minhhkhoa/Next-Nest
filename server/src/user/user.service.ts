import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { hashPassword } from 'src/utils/hashPassword';
import mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
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

      const user = await this.userModel.findById(id).populate([
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
      ]);

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
