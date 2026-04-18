import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { Skill, SkillDocument } from '../schemas/skill.schema';

@Injectable()
export class SkillRepository extends MongoAbstractRepository<SkillDocument> {
  constructor(
    @InjectModel(Skill.name)
    private readonly skillModel: SoftDeleteModel<SkillDocument>,
  ) {
    super(Skill, skillModel);
  }

  async createRaw(payload: any) {
    return this.create(payload);
  }

  async findAllActiveWithIndustry() {
    return this.findRaw(
      { isDeleted: false },
      {
        populate: 'industryID',
        includeDeleted: true,
      },
    );
  }

  async countByFilter(filter: any): Promise<number> {
    return this.countDocumentsRaw(filter, true);
  }

  async findByFilterWithPagination(
    filter: any,
    offset: number,
    limit: number,
  ) {
    return this.findRaw(filter, {
      skip: offset,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'industryID', select: '_id name parentId' },
      lean: true,
      includeDeleted: true,
    });
  }

  async findByIdWithIndustry(id: string) {
    return this.findByIdRaw(id, {
      includeDeleted: true,
      populate: {
        path: 'industryID',
        match: { isDeleted: false },
        select: 'name _id',
      },
    });
  }

  async findByIdRaw(id: string, options: any = {}) {
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  async updateOneRaw(filter: any, update: any) {
    return super.updateOneRaw(filter, update);
  }

  async softDeleteRaw(filter: any) {
    return this.softDelete(filter);
  }
}
