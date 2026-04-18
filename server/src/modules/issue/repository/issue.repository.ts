import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { Issue, IssueDocument } from '../schemas/issue.schema';

@Injectable()
export class IssueRepository extends MongoAbstractRepository<IssueDocument> {
  constructor(
    @InjectModel(Issue.name)
    private readonly issueModel: SoftDeleteModel<IssueDocument>,
  ) {
    super(Issue, issueModel);
  }

  async countByFilter(filter: any): Promise<number> {
    return this.countDocumentsRaw(filter, true);
  }

  async findByFilterWithPagination(
    filter: any,
    offset: number,
    limit: number,
  ): Promise<IssueDocument[]> {
    return this.findRaw(filter, {
      skip: offset,
      limit,
      sort: { createdAt: -1 },
      includeDeleted: true,
    }) as Promise<IssueDocument[]>;
  }

  async findByIdLeanRaw(id: string): Promise<any | null> {
    return this.findByIdRaw(id, { lean: true, includeDeleted: true });
  }

  async findByIdRaw(id: string, options: any = {}): Promise<IssueDocument | null> {
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  async findByIdAndUpdateRaw(id: string, update: any, options: any = {}) {
    return this.findOneAndUpdateRaw({ _id: id }, update, options);
  }

  async updateByIdRaw(id: string, update: any) {
    return this.updateOneRaw({ _id: id }, update);
  }

  async updateManyByIdsRaw(ids: string[], update: any) {
    return this.updateManyRaw(
      { _id: { $in: ids } },
      {
        $set: update,
      },
    );
  }
}
