import { Injectable } from '@nestjs/common';
import { CreateUserResumeDto } from './dto/create-user-resume.dto';
import { UpdateUserResumeDto } from './dto/update-user-resume.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { UserResume, UserResumeDocument } from './schemas/user-resume.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';

@Injectable()
export class UserResumeService {
  constructor(
    @InjectModel(UserResume.name)
    private resumeModel: SoftDeleteModel<UserResumeDocument>,
  ) {}

  async create(createDto: CreateUserResumeDto, user: UserDecoratorType) {
    try {
      //- Nếu CV mới là mặc định, reset các CV cũ thành không mặc định
      if (createDto.isDefault) {
        await this.resumeModel.updateMany(
          { userID: user.id },
          { $set: { isDefault: false } },
        );
      }

      //- Tạo CV mới
      const newResume = await this.resumeModel.create({
        ...createDto,
        userID: user.id,
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });

      return newResume;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAllByUser(user: UserDecoratorType) {
    return await this.resumeModel
      .find({ userID: user.id, isDeleted: false })
      .sort('-updatedAt');
  }

  async findOne(id: string, user: UserDecoratorType) {
    try {
      //- check id
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID CV không đúng định dạng', true);
      }

      const resume = await this.resumeModel.findOne({
        _id: id,
        userID: user.id,
        isDeleted: false,
      });

      if (!resume) {
        throw new BadRequestCustom('Không tìm thấy bản CV yêu cầu', true);
      }

      return resume;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(
    id: string,
    updateDto: UpdateUserResumeDto,
    user: UserDecoratorType,
  ) {
    try {
      //- check id
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID CV không đúng định dạng', true);
      }

      //- Nếu cập nhật này đặt làm mặc định, reset các bản CV khác thành không mặc định
      if (updateDto.isDefault) {
        await this.resumeModel.updateMany(
          { userID: user.id, _id: { $ne: id } }, //- loại trừ bản thân CV đang cập nhật
          { $set: { isDefault: false } },
        );
      }

      //- Cập nhật nội dung
      const updatedResume = await this.resumeModel.findOneAndUpdate(
        { _id: id, userID: user.id },
        {
          ...updateDto,
          updatedBy: {
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        },
        { new: true },
      );

      if (!updatedResume) {
        throw new BadRequestCustom(
          'Cập nhật thất bại hoặc không tìm thấy CV',
          true,
        );
      }

      return updatedResume;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: UserDecoratorType) {
    try {
      //- check id
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID CV không đúng định dạng', true);
      }
      
      const result = await this.resumeModel.findOneAndUpdate(
        { _id: id, userID: user.id },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: {
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        },
        { new: true },
      );

      if (!result) {
        throw new BadRequestCustom(
          'Không tìm thấy CV để xóa hoặc bạn không có quyền',
          true,
        );
      }

      return { message: 'Xóa bản CV thành công' };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
