import { Injectable } from '@nestjs/common';
import { CreateDetailProfileDto } from './dto/create-detail-profile.dto';
import { UpdateDetailProfileDto } from './dto/update-detail-profile.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  DetailProfile,
  DetailProfileDocument,
} from './schemas/detail-profile.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';

@Injectable()
export class DetailProfileService {
  constructor(
    @InjectModel(DetailProfile.name)
    private detailProfileModel: SoftDeleteModel<DetailProfileDocument>,
  ) {}
  async create(createDetailProfileDto: CreateDetailProfileDto) {
    try {
      const detailProfile = await this.detailProfileModel.create(
        createDetailProfileDto,
      );

      return {
        _id: detailProfile._id,
        createdAt: detailProfile.createdAt,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll() {
    try {
      return this.detailProfileModel.find({ isDeleted: false }).populate([
        {
          path: 'userID',
          match: { isDeleted: false },
          select: 'name _id avatar',
        },
        {
          path: 'industryID',
          match: { isDeleted: false },
          select: 'name _id',
        },
        {
          path: 'skillID',
          match: { isDeleted: false },
          select: 'name _id',
        },
      ]);
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID detailProfile không đúng định dạng', !!id);
      }

      const detailProfile = await this.detailProfileModel
        .findById(id)
        .populate([
          {
            path: 'userID',
            match: { isDeleted: false },
            select: 'name _id avatar',
          },
          {
            path: 'industryID',
            match: { isDeleted: false },
            select: 'name _id',
          },
          {
            path: 'skillID',
            match: { isDeleted: false },
            select: 'name _id',
          },
        ]);

      if (!detailProfile)
        throw new BadRequestCustom('ID detailProfile không tìm thấy', !!id);

      if (detailProfile?.isDeleted) {
        throw new BadRequestCustom(
          'detailProfile này hiện đã bị xóa',
          !!detailProfile?.isDeleted,
        );
      }

      return detailProfile;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateDetailProfileDto: UpdateDetailProfileDto) {
   try {
         if (!mongoose.Types.ObjectId.isValid(id)) {
           throw new BadRequestCustom('ID detailProfile không đúng định dạng', !!id);
         }
   
         const detailProfile = await this.detailProfileModel.findById(id);
         if (!detailProfile) throw new BadRequestCustom('ID detailProfile không tìm thấy', !!id);
   
         const filter = { _id: id };
         const update = { $set: updateDetailProfileDto };
   
         const result = await this.detailProfileModel.updateOne(filter, update);
   
         if (result.modifiedCount === 0)
           throw new BadRequestCustom('Lỗi sửa detailProfile', !!id);
         return result;
       } catch (error) {
         throw new BadRequestCustom(error.message, !!error.message);
       }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID detailProfile không đúng định dạng', !!id);
      }

      const detailProfile = await this.detailProfileModel.findById(id);
      if (!detailProfile) throw new BadRequestCustom('ID detailProfile không tìm thấy', !!id);

      const isDeleted = detailProfile.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('detailProfile này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.detailProfileModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa detailProfile', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
