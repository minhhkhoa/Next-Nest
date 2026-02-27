import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { Bookmark, BookmarkDocument } from './schemas/bookmark.schema';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { FindBookmarkQueryDto } from './dto/bookmarkDto.dto';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel(Bookmark.name)
    private bookmarkModel: SoftDeleteModel<BookmarkDocument>,
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

      return newBookmark;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAllByUser(user: UserDecoratorType, query: FindBookmarkQueryDto) {
    try {
      const { currentPage, pageSize, itemType } = query;
      
      const filterConditions: any = {
        userId: user.id,
        isDeleted: false,
      };

      if (itemType) {
        filterConditions.itemType = itemType;
      }

      const defaultPage = +currentPage > 0 ? +currentPage : 1;
      const defaultLimit = +pageSize > 0 ? +pageSize : 10;
      const skip = (defaultPage - 1) * defaultLimit;

      const totalItems = await this.bookmarkModel.countDocuments(filterConditions);
      const totalPages = Math.ceil(totalItems / defaultLimit);

      //- Populate động dựa trên itemType? 
      // Tuy nhiên Mongoose populate ref dynamic hơi phức tạp nếu schema không set ref cứng ở itemId.
      // Ở schema thiết kế `itemId` là ObjectId thuần, không ref. 
      // Nên ta phải dùng $lookup trong aggregate hoặc populate thủ công (nếu refPath).
      
      // Cách đơn giản nhất với Schema hiện tại là lấy list bookmark về, sau đó client tự fetch detail,
      // HOẶC ta dùng $lookup manual.
      
      //- hiện tại chủ yếu là Bookmark JO => $lookup sang jobs.
      const pipeline: any[] = [
        { $match: filterConditions },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: defaultLimit }
      ];

      // Nếu muốn join data:
      if (itemType === 'JOB' || !itemType) {
         pipeline.push({
            $lookup: {
               from: 'jobs',
               localField: 'itemId',
               foreignField: '_id',
               as: 'jobDetail'
            }
         });
         // Nếu itemType = JOB thì có thể unwind, còn nếu mix nhiều loại thì cẩn thận khi unwind
         // pipeline.push({ $unwind: { path: '$jobDetail', preserveNullAndEmptyArrays: true } });
      }

       // join company
       if (itemType === 'COMPANY' || !itemType) {
        pipeline.push({
           $lookup: {
              from: 'companies',
              localField: 'itemId',
              foreignField: '_id',
              as: 'companyDetail'
           }
        });
     }

      const result = await this.bookmarkModel.aggregate(pipeline);

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
        isDeleted: false
      });

      if (!bookmark) {
        throw new BadRequestCustom('Không tìm thấy bookmark hoặc bạn không có quyền xóa', true);
      }

      // Soft delete
      return await this.bookmarkModel.updateOne(
        { _id: id },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: {
             _id: user.id,
             name: user.name,
             email: user.email
          }
        }
      );

    } catch (error) {
        throw new BadRequestCustom(error.message, !!error.message);
    }
  }
  
  //- Xóa theo itemId (Ví dụ nút bookmark toggle trên UI Job Detail)
  async removeByItemId(itemId: string, user: UserDecoratorType) {
     try {
       const result = await this.bookmarkModel.updateOne(
         { userId: user.id, itemId: itemId, isDeleted: false },
         {
           isDeleted: true,
           deletedAt: new Date(),
            deletedBy: {
             _id: user.id,
             name: user.name,
             email: user.email
          }
         }
       );
       
       if (result.matchedCount === 0) {
          throw new BadRequestCustom('Không tìm thấy bookmark để xóa', true);
       }

       return result;

     } catch (error) {
        throw new BadRequestCustom(error.message, !!error.message);
     }
  }

  async getAllBookmarkedIds(user: UserDecoratorType, query: FindBookmarkQueryDto) {
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
      const bookmarks = await this.bookmarkModel.find(filterConditions).select('itemId itemType').lean();
      
      return bookmarks;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
