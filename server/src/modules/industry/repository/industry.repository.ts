import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { Industry, IndustryDocument } from '../schemas/industry.schema';

@Injectable()
export class IndustryRepository extends MongoAbstractRepository<IndustryDocument> {
  constructor(
    @InjectModel(Industry.name)
    private readonly industryModel: SoftDeleteModel<IndustryDocument>,
  ) {
    super(Industry, industryModel);
  }

  async findByIdLeanRaw(id: string): Promise<any | null> {
    return this.findByIdRaw(id, { lean: true, includeDeleted: true });
  }

  async findByIdRaw(id: string, options: any = {}): Promise<IndustryDocument | null> {
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  async findChildrenByParentIds(parentIds: string[]): Promise<any[]> {
    return this.findRaw(
      {
        parentId: { $in: parentIds },
        isDeleted: false,
      },
      {
        projection: '_id',
        lean: true,
        includeDeleted: true,
      },
    );
  }

  async findChildrenByParentId(parentId: string): Promise<any[]> {
    return this.findRaw(
      {
        parentId,
        isDeleted: false,
      },
      {
        lean: true,
        includeDeleted: true,
      },
    );
  }

  async findByFilterWithPagination(
    filter: any,
    skip: number,
    limit: number,
    population: any,
  ): Promise<IndustryDocument[]> {
    return this.findRaw(filter, {
      skip,
      limit,
      sort: { createdAt: -1 },
      populate: population,
      includeDeleted: true,
    }) as Promise<IndustryDocument[]>;
  }

  async countByFilter(filter: any): Promise<number> {
    return this.countDocumentsRaw(filter, true);
  }

  async findActiveForTree(): Promise<any[]> {
    return this.findRaw(
      { isDeleted: false },
      {
        projection: 'name parentId createdAt updatedAt',
        lean: true,
        includeDeleted: true,
      },
    );
  }

  async findMatchedByName(searchRegex: RegExp): Promise<any[]> {
    return this.findRaw(
      {
        isDeleted: false,
        $or: [{ 'name.vi': searchRegex }, { 'name.en': searchRegex }],
      },
      {
        lean: true,
        includeDeleted: true,
      },
    );
  }

  async findActiveByIdsForTree(ids: string[]): Promise<any[]> {
    return this.findRaw(
      {
        _id: {
          $in: ids,
        },
        isDeleted: false,
      },
      {
        projection: 'name parentId createdAt updatedAt',
        lean: true,
        includeDeleted: true,
      },
    );
  }

  async updateByIdRaw(id: string, updatePayload: any) {
    return this.updateOneRaw({ _id: id }, updatePayload);
  }

  async findOneByParentId(parentId: string): Promise<IndustryDocument | null> {
    return this.findOneRaw({ parentId }, { includeDeleted: true });
  }

  async softDeleteById(id: string): Promise<boolean> {
    return this.softDelete({ _id: id });
  }
}
