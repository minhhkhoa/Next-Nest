import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Application,
  ApplicationDocument,
} from '../schemas/application.schema';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';

@Injectable()
export class ApplicationRepository extends MongoAbstractRepository<ApplicationDocument> {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: SoftDeleteModel<ApplicationDocument>,
  ) {
    super(Application, applicationModel);
  }

  async aggregateWithPipeline<T = any>(pipeline: any[]): Promise<T[]> {
    return this.aggregateRaw<T>(pipeline);
  }

  async findByIdWithDetails(id: string): Promise<ApplicationDocument | null> {
    return this.findByIdRaw(id, {
      includeDeleted: true,
      populate: [
        { path: 'jobId', select: 'title salary slug' },
        { path: 'userId', select: '-password -refresh_token' },
        { path: 'companyId', select: 'name logo' },
        { path: 'systemCvData.userResumeId' },
      ],
    });
  }

  async findByIdForStatusUpdate(
    id: string,
  ): Promise<ApplicationDocument | null> {
    return this.findByIdRaw(id, {
      includeDeleted: true,
      populate: [
        { path: 'jobId', select: 'title' },
        { path: 'userId', select: 'email name' },
      ],
    });
  }

  async findByIdRaw(id: string, options: any = {}): Promise<ApplicationDocument | null> {
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  async softDeleteRaw(filter: FilterQuery<ApplicationDocument>) {
    return this.softDelete(filter);
  }
}
