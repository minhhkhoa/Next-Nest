import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { Job, JobDocument } from '../schemas/job.schema';

@Injectable()
export class JobsRepository extends MongoAbstractRepository<JobDocument> {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: SoftDeleteModel<JobDocument>,
  ) {
    super(Job, jobModel);
  }

  async findByIdRaw(id: string, options: any = {}) {
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  async findOneRaw(filter: any, options: any = {}) {
    return super.findOneRaw(filter, { includeDeleted: true, ...options });
  }

  async findOneWithCompanyAndSkills(id: string) {
    return this.findOneRaw(
      {
        _id: id,
        isDeleted: false,
      },
      {
        includeDeleted: true,
        populate: [
          { path: 'companyID', model: 'Company' },
          { path: 'skills', model: 'Skill' },
        ],
      },
    );
  }

  async createRaw(payload: any) {
    return this.create(payload);
  }

  async aggregateWithPipeline<T = any>(pipeline: any[]): Promise<T[]> {
    return this.aggregateRaw<T>(pipeline);
  }

  async findAllRaw() {
    return this.findRaw({}, { includeDeleted: true });
  }

  async findByIdAndUpdateRaw(id: string, update: any, options: any = {}) {
    return this.findOneAndUpdateRaw({ _id: id }, update, options);
  }

  async updateOneRaw(filter: any, update: any, options: any = {}) {
    return super.updateOneRaw(filter, update, options);
  }

  async updateManyRaw(filter: any, update: any, options: any = {}) {
    return super.updateManyRaw(filter, update, options);
  }

  async findByIdSelectIndustry(id: string) {
    return this.findByIdRaw(id, {
      projection: 'industryID',
      includeDeleted: true,
    });
  }

  async findRelatedJobsByIndustry(
    id: string,
    industryIDs: any[],
    skip: number,
    limit: number,
  ) {
    const query = {
      _id: { $ne: id },
      industryID: { $in: industryIDs },
      isActive: true,
      status: 'active',
      isDeleted: false,
    };

    const [relatedJobs, totalItems] = await Promise.all([
      this.findRaw(query, {
        skip,
        limit,
        populate: ['companyID', 'skills', 'industryID'],
        includeDeleted: true,
      }),
      this.countDocumentsRaw(query as any, true),
    ]);

    return {
      relatedJobs,
      totalItems,
    };
  }

  async softDeleteManyByCompanyIds(
    companyIds: string[],
    session: mongoose.ClientSession,
  ) {
    return this.updateManyRaw(
      {
        companyID: {
          $in: companyIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        isDeleted: false,
      },
      { $set: { isDeleted: true, status: 'inactive' } },
      { session },
    );
  }

  async restoreManyByCompanyId(
    companyId: string,
    session: mongoose.ClientSession,
  ) {
    return this.updateManyRaw(
      {
        companyID: new mongoose.Types.ObjectId(companyId),
        isDeleted: true,
        status: 'inactive',
      },
      { $set: { isDeleted: false, status: 'active' } },
      { session },
    );
  }
}
