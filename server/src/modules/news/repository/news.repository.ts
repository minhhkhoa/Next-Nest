import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PopulateOptions, SortOrder } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { News, NewsDocument } from '../schemas/news.schema';

@Injectable()
export class NewsRepository extends MongoAbstractRepository<NewsDocument> {
  private readonly cateNewsPopulate: PopulateOptions = {
    path: 'cateNewsID',
    match: { isDeleted: false },
    select: 'name _id summary',
  };

  constructor(
    @InjectModel(News.name)
    private readonly newsModel: SoftDeleteModel<NewsDocument>,
  ) {
    super(News, newsModel);
  }

  async findAllNotDeletedWithCateNews(): Promise<any[]> {
    return this.findRaw(
      { isDeleted: false },
      {
        populate: this.cateNewsPopulate,
        lean: true,
        includeDeleted: true,
      },
    );
  }

  async findByIdWithCateNews(id: string): Promise<NewsDocument | null> {
    return this.findByIdRaw(id, {
      includeDeleted: true,
      populate: this.cateNewsPopulate,
    });
  }

  async findByIdIncludingDeleted(id: string): Promise<NewsDocument | null> {
    return this.findByIdRaw(id, { includeDeleted: true });
  }

  async findActiveByCateNewsIds(cateNewsIDs: unknown[]): Promise<NewsDocument[]> {
    return this.findRaw(
      {
        cateNewsID: { $in: cateNewsIDs },
        isDeleted: false,
        status: 'active',
      },
      {
        sort: { createdAt: -1 },
        populate: this.cateNewsPopulate,
        projection: '_id title image summary status createdBy createdAt',
        includeDeleted: true,
      },
    ) as Promise<NewsDocument[]>;
  }

  async findLatestActiveByCate(
    cateNewsID: unknown,
    limit = 5,
  ): Promise<NewsDocument[]> {
    return this.findRaw(
      {
        cateNewsID,
        isDeleted: false,
        status: 'active',
      },
      {
        sort: { createdAt: -1 },
        limit,
        populate: this.cateNewsPopulate,
        projection: '_id title image summary status createdBy createdAt',
        includeDeleted: true,
      },
    ) as Promise<NewsDocument[]>;
  }

  async countByFilter(filter: FilterQuery<NewsDocument>): Promise<number> {
    return this.countDocumentsRaw(filter, true);
  }

  async findByFilter(
    filter: FilterQuery<NewsDocument>,
    skip: number,
    limit: number,
    sort: Record<string, SortOrder>,
    population?: unknown,
  ): Promise<NewsDocument[]> {
    return this.findRaw(filter, {
      skip,
      limit,
      sort: sort as any,
      populate: population as any,
      includeDeleted: true,
    }) as Promise<NewsDocument[]>;
  }
}
