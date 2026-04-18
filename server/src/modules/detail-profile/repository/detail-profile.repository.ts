import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import {
  DetailProfile,
  DetailProfileDocument,
} from '../schemas/detail-profile.schema';

@Injectable()
export class DetailProfileRepository extends MongoAbstractRepository<DetailProfileDocument> {
  constructor(
    @InjectModel(DetailProfile.name)
    private readonly detailProfileModel: SoftDeleteModel<DetailProfileDocument>,
  ) {
    super(DetailProfile, detailProfileModel);
  }

  async aggregateWithPipeline<T = any>(pipeline: any[]): Promise<T[]> {
    return this.aggregateRaw<T>(pipeline);
  }

  async findAllWithPopulate() {
    return this.findRaw(
      { isDeleted: false },
      {
        includeDeleted: true,
        populate: [
          {
            path: 'userID',
            match: { isDeleted: false },
            select: 'name _id avatar',
          },
          {
            path: 'industryID',
            match: { isDeleted: false },
            select: 'name _id',
          },
          {
            path: 'skillID',
            match: { isDeleted: false },
            select: 'name _id',
          },
        ],
      },
    );
  }

  async findByUserIdForResume(userId: string) {
    return this.findOneRaw(
      { userID: userId, isDeleted: false },
      {
        includeDeleted: true,
        lean: true,
        populate: [
          { path: 'industryID', select: 'name' },
          { path: 'skillID', select: 'name' },
        ],
      },
    );
  }

  async findOneByUserIdWithPopulate(userId: string) {
    return this.findOneRaw(
      { userID: userId },
      {
        includeDeleted: true,
        populate: [
          {
            path: 'userID',
            match: { isDeleted: false },
            select: 'name _id avatar',
          },
          {
            path: 'industryID',
            match: { isDeleted: false },
            select: 'name _id',
          },
          {
            path: 'skillID',
            match: { isDeleted: false },
            select: 'name _id',
          },
        ],
      },
    );
  }

  async findByIdRaw(id: string) {
    return super.findByIdRaw(id, { includeDeleted: true });
  }

  async updateByIdRaw(id: string, payload: any) {
    return this.updateOneRaw({ _id: id }, payload);
  }

  async restoreByUserId(userID: string, session: ClientSession) {
    return this.findOneAndUpdateRaw(
      { userID },
      { $set: { isDeleted: false, deletedAt: null } },
      { session, new: true },
    );
  }

  async softCheckDeleteByUserId(userID: string, session: ClientSession) {
    return this.findOneAndUpdateRaw(
      { userID, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      { session, new: true },
    );
  }

  async softDeleteById(id: string): Promise<boolean> {
    return this.softDelete({ _id: id });
  }
}
