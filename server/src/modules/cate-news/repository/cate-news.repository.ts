import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { CateNews, CateNewsDocument } from '../schemas/cate-new.schema';

@Injectable()
export class CateNewsRepository extends MongoAbstractRepository<CateNewsDocument> {
  constructor(
    @InjectModel(CateNews.name)
    private readonly cateNewsModel: SoftDeleteModel<CateNewsDocument>,
  ) {
    super(CateNews, cateNewsModel);
  }

  async findAllNotDeleted(): Promise<CateNewsDocument[]> {
    return this.find({
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });
  }

  async findByIdIncludingDeleted(id: string): Promise<CateNewsDocument | null> {
    return this.findById(id, undefined, undefined, true);
  }
}
