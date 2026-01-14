import { Injectable } from '@nestjs/common';
import {
  AutoCreateDetailProfileDto,
  CreateDetailProfileDto,
} from './dto/create-detail-profile.dto';
import { UpdateDetailProfileDto } from './dto/update-detail-profile.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  DetailProfile,
  DetailProfileDocument,
} from './schemas/detail-profile.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { FindUserQueryDto } from 'src/modules/user/dto/userDto.dto';

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

  async findAllByFilter(query: FindUserQueryDto) {
    const { currentPage = 1, pageSize = 10, name, email, address } = query;

    const page = Number(currentPage) > 0 ? Number(currentPage) : 1;
    const limit = Number(pageSize) > 0 ? Number(pageSize) : 10;
    const skip = (page - 1) * limit;

    const profileMatch: any = { isDeleted: false };

    if (address) {
      profileMatch.address = { $regex: address, $options: 'i' };
    }

    const userMatch: any = {};
    if (name) userMatch['user.name'] = { $regex: name, $options: 'i' };
    if (email) userMatch['user.email'] = { $regex: email, $options: 'i' };

    const pipeline: any[] = [
      { $match: profileMatch },

      {
        $addFields: {
          userObjectId: {
            $cond: [
              { $eq: [{ $type: '$userID' }, 'objectId'] },
              '$userID',
              { $toObjectId: '$userID' },
            ],
          },
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'user',
        },
      },

      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },

      Object.keys(userMatch).length ? { $match: userMatch } : null,

      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                userObjectId: 0,
                'user.password': 0,
                'user.refresh_token': 0,
                'user.resetToken': 0,
                'user.resetTokenExpiresAt': 0,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ].filter(Boolean);

    const result = await this.detailProfileModel.aggregate(pipeline);

    const totalItems = result[0]?.total[0]?.count || 0;

    return {
      meta: {
        current: page,
        pageSize: limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
      result: result[0]?.data || [],
    };
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
        throw new BadRequestCustom(
          'ID detailProfile không đúng định dạng',
          !!id,
        );
      }

      const detailProfile = await this.detailProfileModel
        .findOne({ userID: id })
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
        throw new BadRequestCustom(
          'ID detailProfile không đúng định dạng',
          !!id,
        );
      }

      const detailProfile = await this.detailProfileModel.findById(id);
      if (!detailProfile)
        throw new BadRequestCustom('ID detailProfile không tìm thấy', !!id);

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
        throw new BadRequestCustom(
          'ID detailProfile không đúng định dạng',
          !!id,
        );
      }

      const detailProfile = await this.detailProfileModel.findById(id);
      if (!detailProfile)
        throw new BadRequestCustom('ID detailProfile không tìm thấy', !!id);

      const isDeleted = detailProfile.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom(
          'detailProfile này đã được xóa',
          !!isDeleted,
        );

      const filter = { _id: id };
      const result = this.detailProfileModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa detailProfile', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async createAuto(createDetailProfileDto: AutoCreateDetailProfileDto) {
    try {
      const detailProfile = await this.detailProfileModel.create({
        ...createDetailProfileDto,
        sumary: '',
        gender: 'Nam',
        industryID: [],
        skillID: [],
        desiredSalary: { min: 0, max: 0 },
        education: [],
        level: '',
        address: '',
      });

      return {
        _id: detailProfile._id,
        createdAt: detailProfile.createdAt,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
