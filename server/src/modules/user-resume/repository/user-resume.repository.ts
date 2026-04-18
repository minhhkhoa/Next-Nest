import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UserResume, UserResumeDocument } from '../schemas/user-resume.schema';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';

@Injectable()
export class UserResumeRepository extends MongoAbstractRepository<UserResumeDocument> {
  constructor(
    @InjectModel(UserResume.name)
    private readonly resumeModel: SoftDeleteModel<UserResumeDocument>,
  ) {
    super(UserResume, resumeModel);
  }

  async resetAllDefaultsByUser(userId: string) {
    return this.updateManyRaw(
      { userID: userId },
      { $set: { isDefault: false } },
    );
  }

  async createRaw(payload: any) {
    return this.create(payload);
  }

  async findAllActiveByUser(userId: string) {
    return this.findRaw(
      { userID: userId, isDeleted: false },
      {
        sort: { updatedAt: -1 },
        includeDeleted: true,
      },
    );
  }

  async findOneActiveByIdAndUser(id: string, userId: string) {
    return this.findOneRaw(
      {
        _id: id,
        userID: userId,
        isDeleted: false,
      },
      { includeDeleted: true },
    );
  }

  async resetOtherDefaultsByUser(userId: string, resumeId: string) {
    return this.updateManyRaw(
      { userID: userId, _id: { $ne: resumeId } },
      { $set: { isDefault: false } },
    );
  }

  async findOneAndUpdateByIdAndUser(id: string, userId: string, payload: any) {
    return this.findOneAndUpdateRaw({ _id: id, userID: userId }, payload, {
      new: true,
    });
  }

  async softDeleteByIdAndUser(id: string, userId: string, deletedBy: any) {
    return this.findOneAndUpdateRaw(
      { _id: id, userID: userId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
          isDefault: false,
        },
      },
    );
  }

  async findNextActiveByUser(userId: string) {
    return this.findOneRaw(
      { userID: userId, isDeleted: false },
      {
        sort: { updatedAt: -1 },
        includeDeleted: true,
      },
    );
  }

  async setDefaultById(id: string) {
    return this.updateOneRaw({ _id: id }, { $set: { isDefault: true } });
  }
}
