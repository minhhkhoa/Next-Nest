import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { Bookmark, BookmarkDocument } from './schemas/bookmark.schema';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { FindBookmarkQueryDto } from './dto/bookmarkDto.dto';
import { CompanyService } from '../company/company.service';
import { generateMultiLangSlug } from 'src/utils/generate-slug';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel(Bookmark.name)
    private bookmarkModel: SoftDeleteModel<BookmarkDocument>,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService,
  ) {}

  async create(createBookmarkDto: CreateBookmarkDto, user: UserDecoratorType) {
    try {
      const { itemId, itemType } = createBookmarkDto;

      //- Check exist
      const existingBookmark = await this.bookmarkModel.findOne({
        userId: user.id,
        itemId: itemId,
        itemType: itemType,
        isDeleted: false,
      });

      if (existingBookmark) {
        throw new BadRequestCustom('Bạn đã đánh dấu mục này rồi');
      }

      // TODO: Nếu muốn kĩ hơn, có thể check xem itemId có tồn tại trong collection tương ứng (Job, Company, News) hay không.
      // Nhưng để đơn giản và linh hoạt, tạm thời tin tưởng client gửi đúng.
      // Hoặc nếu cần thiết, inject các service/model tương ứng vào kiểm tra.

      const newBookmark = await this.bookmarkModel.create({
        userId: user.id,
        itemId: itemId,
        itemType: itemType,
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });

      //- Nếu là company thì update userFollow
      if (itemType === 'company') {
        await this.companyService.updateUserFollow(itemId, user.id, true);
      }

      return newBookmark;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAllByUser(user: UserDecoratorType, query: FindBookmarkQueryDto) {
    try {
      const { currentPage, pageSize, itemType } = query;

      const filterConditions: any = {
        userId: new mongoose.Types.ObjectId(user.id),
        isDeleted: false,
      };

      if (itemType) {
        filterConditions.itemType = itemType;
      }

      const defaultPage = +currentPage > 0 ? +currentPage : 1;
      const defaultLimit = +pageSize > 0 ? +pageSize : 10;
      const skip = (defaultPage - 1) * defaultLimit;

      const totalItems =
        await this.bookmarkModel.countDocuments(filterConditions);
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const pipeline: any[] = [
        { $match: filterConditions },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: defaultLimit },
      ];

      //- join theo job:
      if (itemType === 'job' || !itemType) {
        pipeline.push({
          $lookup: {
            from: 'jobs',
            localField: 'itemId',
            foreignField: '_id',
            as: 'job',
          },
        });

        pipeline.push({
          $unwind: {
            path: '$job',
            preserveNullAndEmptyArrays: true,
          },
        });

        pipeline.push({
          $lookup: {
            from: 'companies',
            localField: 'job.companyID',
            foreignField: '_id',
            as: 'companyInfo',
          },
        });

        pipeline.push({
          $unwind: {
            path: '$companyInfo',
            preserveNullAndEmptyArrays: true,
          },
        });

        //- Lookup skills
        pipeline.push({
          $lookup: {
            from: 'skills',
            localField: 'job.skills',
            foreignField: '_id',
            as: 'skillList',
          },
        });

        //- Set job.company and job.skills
        pipeline.push({
          $addFields: {
            'job.company': { $ifNull: ['$companyInfo', null] },
            'job.skills': {
              $cond: {
                //- condition - điều kiện kiểm tra nếu skillList là mảng hay không
                if: { $isArray: '$skillList' },
                then: '$skillList', //- Nếu skillList là mảng thì dùng skillList đã lookup
                else: '$job.skills', //- Nếu không phải mảng (ví dụ null) thì giữ nguyên job.skills (có thể là mảng ObjectId hoặc null)
              },
            },
          },
        });

        //- Remove temp fields tạm đi, 2 field đó chỉ dùng để lookup và set lại job.company và job.skills thôi, không cần trả về client
        pipeline.push({
          $project: {
            companyInfo: 0,
            skillList: 0,
          },
        });
      }

      //- join company
      if (itemType === 'company' || !itemType) {
        pipeline.push({
          $lookup: {
            from: 'companies',
            localField: 'itemId',
            foreignField: '_id',
            as: 'companyDetail',
          },
        });

        pipeline.push({
          $unwind: {
            path: '$companyDetail',
            preserveNullAndEmptyArrays: true,
          },
        });
      }

      const result = await this.bookmarkModel.aggregate(pipeline);

      //- Thêm slug cho companyDetail nếu có
      if (itemType === 'company' || !itemType) {
        result.forEach((item) => {
          if (item.companyDetail && item.companyDetail.name) {
            item.companyDetail.slug = generateMultiLangSlug({
              vi: item.companyDetail.name,
              en: item.companyDetail.name,
            }).vi;
          }
        });
      }

      return {
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          totalPages,
          totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: UserDecoratorType) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID không hợp lệ', true);
      }

      const bookmark = await this.bookmarkModel.findOne({
        _id: id,
        userId: user.id,
        isDeleted: false,
      });

      if (!bookmark) {
        throw new BadRequestCustom(
          'Không tìm thấy bookmark hoặc bạn không có quyền xóa',
          true,
        );
      }

      //- xóa luôn
      const result = await this.bookmarkModel.deleteOne({ _id: id });

      if (bookmark.itemType === 'company') {
        const itemIdStr = bookmark.itemId.toString();
        await this.companyService.updateUserFollow(itemIdStr, user.id, false);
      }

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- Xóa theo itemId (Ví dụ nút bookmark toggle trên UI Job Detail)
  async removeByItemId(itemId: string, user: UserDecoratorType) {
    try {
      const bookmark = await this.bookmarkModel.findOne({
        userId: new mongoose.Types.ObjectId(user.id),
        itemId: new mongoose.Types.ObjectId(itemId),
        isDeleted: false,
      });

      if (!bookmark) {
        throw new BadRequestCustom('Không tìm thấy bookmark để xóa', true);
      }

      //- xóa luôn
      const result = await this.bookmarkModel.deleteOne({
        userId: new mongoose.Types.ObjectId(user.id),
        itemId: new mongoose.Types.ObjectId(itemId),
      });

      if (bookmark.itemType === 'company') {
        const itemIdStr = bookmark.itemId.toString();
        await this.companyService.updateUserFollow(itemIdStr, user.id, false);
      }

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async getAllBookmarkedIds(
    user: UserDecoratorType,
    query: FindBookmarkQueryDto,
  ) {
    try {
      const { itemType } = query;
      const filterConditions: any = {
        userId: user.id,
        isDeleted: false,
      };

      if (itemType) {
        filterConditions.itemType = itemType;
      }

      // Chỉ lấy itemId để client check
      const bookmarks = await this.bookmarkModel
        .find(filterConditions)
        .select('itemId itemType')
        .lean();

      return bookmarks;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
