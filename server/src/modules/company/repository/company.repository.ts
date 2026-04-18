import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { Company, CompanyDocument } from '../schemas/company.schema';

@Injectable()
export class CompanyRepository extends MongoAbstractRepository<CompanyDocument> {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: SoftDeleteModel<CompanyDocument>,
  ) {
    super(Company, companyModel);
  }

  async createWithSession(
    dto: Partial<CompanyDocument>,
    session: ClientSession,
  ) {
    return this.create(dto, session);
  }

  async updateUserFollow(companyId: string, userId: string, isFollow: boolean) {
    if (isFollow) {
      return this.findOneAndUpdateRaw(
        { _id: companyId } as any,
        {
          $addToSet: { userFollow: new Types.ObjectId(userId) },
        },
        { new: true },
      );
    }

    return this.findOneAndUpdateRaw(
      { _id: companyId } as any,
      {
        $pull: { userFollow: new Types.ObjectId(userId) },
      },
      { new: true },
    );
  }

  async countByFilter(filter: any): Promise<number> {
    return this.countDocumentsRaw(filter, true);
  }

  async aggregateWithPipeline<T = any>(pipeline: any[]): Promise<T[]> {
    return this.aggregateRaw<T>(pipeline);
  }

  async findAllActiveWithoutUserFollow() {
    return this.findRaw({ isDeleted: false } as any, {
      projection: '-userFollow',
      includeDeleted: true,
    });
  }

  async findByTaxCodeIncludeDeleted(taxCode: string) {
    return this.findOneRaw({ taxCode } as any, { includeDeleted: true });
  }

  async findByIdWithIndustry(id: string) {
    return this.findByIdRaw(id, {
      includeDeleted: true,
      lean: true,
      populate: [
        {
          path: 'industryID',
          select: 'name _id',
        },
      ],
    });
  }

  async findOneForInternal(id: string, session: ClientSession) {
    return this.findByIdRaw(id, { session, lean: true, includeDeleted: true });
  }

  async findByIdRaw(id: string, options: any = {}) {
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  async restoreSoftDeleted(
    id: string,
    user: UserDecoratorType,
    session: ClientSession,
  ) {
    return this.findOneAndUpdateRaw(
      { _id: id, isDeleted: true } as any,
      {
        isDeleted: false,
        updatedBy: {
          _id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        $unset: { deletedAt: 1, deletedBy: 1 },
      } as any,
      { session, new: true },
    );
  }

  async hardDeleteById(id: string, session?: ClientSession) {
    return this.deleteOneRaw({ _id: id } as any, { session });
  }

  async updateStatus(
    companyId: string,
    status: string,
    session: ClientSession,
  ) {
    return this.updateOneRaw(
      { _id: companyId } as any,
      { $set: { status } } as any,
      { session },
    );
  }

  async updateByIdRaw(id: string, update: any) {
    return this.updateOneRaw({ _id: id } as any, update);
  }

  async softDeleteMany(
    ids: string[],
    user: UserDecoratorType,
    session: ClientSession,
  ) {
    return this.updateManyRaw(
      { _id: { $in: ids } } as any,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: {
            _id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        },
      } as any,
      { session },
    );
  }

  async softDeleteOne(
    companyId: string,
    user: UserDecoratorType,
    session: ClientSession,
  ) {
    return this.updateOneRaw(
      { _id: companyId } as any,
      {
        isDeleted: true,
        deletedBy: {
          _id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      } as any,
      { session },
    );
  }
}
