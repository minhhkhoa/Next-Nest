import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';

@Injectable()
export class UserRepository extends MongoAbstractRepository<UserDocument> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: SoftDeleteModel<UserDocument>,
  ) {
    super(User, userModel);
  }

  async findByEmail(email: string) {
    return this.findOneRaw({ email }, { includeDeleted: true });
  }

  async createRaw(payload: any) {
    return this.create(payload);
  }

  async findRecruitersByCompany(companyId: string) {
    return this.findRaw(
      { 'employerInfo.companyID': companyId },
      {
        projection: 'name email avatar',
        includeDeleted: true,
      },
    );
  }

  async findByIdBasicForResume(userId: string) {
    return this.findByIdRaw(userId, {
      projection: 'name email avatar',
      lean: true,
      includeDeleted: true,
    });
  }

  async findMembersByCompany(companyId: string) {
    return this.findRaw(
      {
        'employerInfo.companyID': companyId,
        isDeleted: false,
        'employerInfo.userStatus': 'ACTIVE',
      },
      {
        projection: 'name email avatar',
        lean: true,
        includeDeleted: true,
      },
    );
  }

  async findAllActiveWithCompany() {
    return this.findRaw(
      { isDeleted: false },
      {
        populate: {
          path: 'employerInfo.companyID',
          match: { isDeleted: false },
          select: 'name _id',
        },
        includeDeleted: true,
      },
    );
  }

  async findMembersByCompanyID(companyId: string) {
    return this.findRaw(
      { 'employerInfo.companyID': companyId },
      {
        projection: '-password -refresh_token -__v',
        populate: {
          path: 'roleID',
          match: { isDeleted: false },
          select: 'name _id',
        },
        lean: true,
        includeDeleted: true,
      },
    );
  }

  async findByIdWithCompanyAndRole(id: string, getPassword = false) {
    return this.findByIdRaw(id, {
      populate: [
        {
          path: 'employerInfo.companyID',
          match: { isDeleted: false },
          select: 'name _id',
        },
        {
          path: 'roleID',
          match: { isDeleted: false },
          select: 'name _id',
        },
      ],
      projection:
        getPassword
          ? 'password'
          : '-password -isDeleted -deletedAt -createdAt -updatedAt -__v',
      lean: true,
      includeDeleted: true,
    });
  }

  async findByIdWithRoleAndPermissions(id: string) {
    return this.findByIdRaw(id, {
      populate: {
        path: 'roleID',
        match: { isDeleted: false },
        select: 'name _id',
        populate: {
          path: 'permissions',
          match: { isDeleted: false },
          select: 'name apiPath method _id',
        },
      },
      projection: '-password',
      lean: true,
      includeDeleted: true,
    });
  }

  async findOneLean(filter: Record<string, any>) {
    return this.findOneRaw(filter, { lean: true, includeDeleted: true });
  }

  async findByIdRaw(id?: string | Types.ObjectId, options: any = {}) {
    if (!id) return null;
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  async findByIdWithSession(id: string, session: ClientSession) {
    return super.findByIdRaw(id, { session, includeDeleted: true });
  }

  async findByProviderId(providerId: string) {
    return this.findOneRaw({ 'provider.id': providerId }, {
      includeDeleted: true,
    });
  }

  async countByFilter(filter: any): Promise<number> {
    return this.countDocumentsRaw(filter as any, true);
  }

  async softDeleteRaw(filter: any) {
    return this.softDelete(filter);
  }

  async startSession() {
    return super.startSession();
  }

  async updateEmployerInfoByJoinRequest(userId: string, companyId: string) {
    return this.updateOneRaw(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          'employerInfo.companyID': companyId,
          'employerInfo.userStatus': 'PENDING',
          'employerInfo.isOwner': false,
        },
      },
    );
  }

  async countOtherStaffInCompany(companyId: string, exceptUserId: string) {
    return this.countDocumentsRaw({
      'employerInfo.companyID': companyId,
      _id: { $ne: exceptUserId },
      isDeleted: false,
    }, true);
  }

  async setCompanyOwnerAndRole(
    newOwnerId: string,
    roleId: Types.ObjectId,
    session: ClientSession,
  ) {
    return this.updateOneRaw(
      { _id: newOwnerId },
      {
        $set: {
          'employerInfo.isOwner': true,
          roleID: roleId,
        },
      },
      { session },
    );
  }

  async unsetCompanyOwnerAndSetRole(
    userId: string,
    roleId: Types.ObjectId,
    session: ClientSession,
  ) {
    return this.updateOneRaw(
      { _id: userId },
      {
        $set: {
          'employerInfo.isOwner': false,
          roleID: roleId,
        },
      },
      { session },
    );
  }

  async reactivateEmployerStatus(userId: string, session: ClientSession) {
    return this.updateOneRaw(
      { _id: userId },
      { $set: { 'employerInfo.userStatus': 'ACTIVE' } },
      { session },
    );
  }
}
