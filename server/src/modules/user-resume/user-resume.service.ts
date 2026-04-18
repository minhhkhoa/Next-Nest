import { Injectable } from '@nestjs/common';
import { CreateUserResumeDto } from './dto/create-user-resume.dto';
import { UpdateUserResumeDto } from './dto/update-user-resume.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { UserResumeRepository } from './repository/user-resume.repository';

@Injectable()
export class UserResumeService {
  constructor(
    private readonly userResumeRepository: UserResumeRepository,
  ) {}

  async create(createDto: CreateUserResumeDto, user: UserDecoratorType) {
    try {
      //- Nếu CV mới là mặc định, reset các CV cũ thành không mặc định
      if (createDto.isDefault) {
        await this.userResumeRepository.resetAllDefaultsByUser(user.id);
      }

      //- Tạo CV mới
      const newResume = await this.userResumeRepository.createRaw({
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
    return this.userResumeRepository.findAllActiveByUser(user.id);
  }

  async findOne(id: string, user: UserDecoratorType) {
    try {
      //- check id
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID CV không đúng định dạng', true);
      }

      const resume = await this.userResumeRepository.findOneActiveByIdAndUser(
        id,
        user.id,
      );

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
        await this.userResumeRepository.resetOtherDefaultsByUser(
          user.id,
          id,
        );
      }

      //- Cập nhật nội dung
      const updatedResume = await this.userResumeRepository.findOneAndUpdateByIdAndUser(
        id,
        user.id,
        {
          ...updateDto,
          updatedBy: {
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        },
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID CV không đúng định dạng', true);
      }

      //- Tìm bản ghi trước để kiểm tra xem nó có đang là CV mặc định không
      const resume = await this.userResumeRepository.findOneActiveByIdAndUser(
        id,
        user.id,
      );

      if (!resume) {
        throw new BadRequestCustom(
          'Không tìm thấy CV để xóa hoặc bạn không có quyền',
          true,
        );
      }

      //- Tiến hành xóa mềm thủ công bằng findOneAndUpdate
      await this.userResumeRepository.softDeleteByIdAndUser(id, user.id, {
        _id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });

      //- Logic "Phục vụ tốt hơn": Nếu vừa xóa bản mặc định,
      // tự động tìm bản CV còn lại mới nhất để đặt làm mặc định thay thế.
      if (resume.isDefault) {
        const nextResume = await this.userResumeRepository.findNextActiveByUser(
          user.id,
        );

        if (nextResume) {
          await this.userResumeRepository.setDefaultById(
            nextResume._id.toString(),
          );
        }
      }

      return { message: 'Xóa bản CV thành công' };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async validateResumeForApplication(resumeId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      throw new BadRequestCustom('ID CV không hợp lệ');
    }
    const resume = await this.userResumeRepository.findOneActiveByIdAndUser(
      resumeId,
      userId,
    );
    if (!resume) {
      throw new BadRequestCustom(
        'CV không tồn tại hoặc không thuộc quyền sở hữu của bạn',
      );
    }
    return resume;
  }
}

