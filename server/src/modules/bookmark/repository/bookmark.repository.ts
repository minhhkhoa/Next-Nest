import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { Bookmark, BookmarkDocument } from '../schemas/bookmark.schema';

@Injectable()
export class BookmarkRepository extends MongoAbstractRepository<BookmarkDocument> {
  constructor(
    @InjectModel(Bookmark.name)
    private readonly bookmarkModel: SoftDeleteModel<BookmarkDocument>,
  ) {
    super(Bookmark, bookmarkModel);
  }

  async countByFilter(filter: any): Promise<number> {
    return this.countDocumentsRaw(filter, true);
  }

  async aggregateWithPipeline<T = any>(pipeline: any[]): Promise<T[]> {
    return this.aggregateRaw<T>(pipeline);
  }

  async findActiveByIdAndUser(
    id: string,
    userId: string,
  ): Promise<BookmarkDocument | null> {
    return this.findOneRaw({ _id: id, userId, isDeleted: false }, {
      includeDeleted: true,
    });
  }

  async findActiveByUserAndItemId(
    userId: string,
    itemId: string,
  ): Promise<BookmarkDocument | null> {
    return this.findOneRaw(
      {
        userId: new Types.ObjectId(userId),
        itemId: new Types.ObjectId(itemId),
        isDeleted: false,
      },
      { includeDeleted: true },
    );
  }

  async hardDeleteById(id: string) {
    return this.deleteOneRaw({ _id: id });
  }

  async hardDeleteByUserAndItemId(userId: string, itemId: string) {
    return this.deleteOneRaw({
      userId: new Types.ObjectId(userId),
      itemId: new Types.ObjectId(itemId),
    });
  }

  async findAllItemIds(filter: any): Promise<any[]> {
    return this.findRaw(filter, {
      projection: 'itemId itemType',
      lean: true,
      includeDeleted: true,
    });
  }
}
