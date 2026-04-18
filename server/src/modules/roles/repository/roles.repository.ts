import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { User, UserDocument } from 'src/modules/user/schemas/user.schema';
import { Role, RoleDocument } from '../schemas/role.schema';

@Injectable()
export class RolesRepository extends MongoAbstractRepository<RoleDocument> {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: SoftDeleteModel<RoleDocument>,
    @InjectModel(User.name)
    private readonly userModel: SoftDeleteModel<UserDocument>,
  ) {
    super(Role, roleModel);
  }

  async createRaw(payload: any) {
    return this.create(payload);
  }

  async findOneByNameAnyLang(name: string) {
    return this.findOneRaw(
      {
        $or: [{ 'name.vi': name }, { 'name.en': name }],
      },
      { includeDeleted: true },
    );
  }

  async findByIdWithPermissionCodes(id: string) {
    return this.findByIdRaw(id, {
      includeDeleted: true,
      lean: true,
      populate: {
        path: 'permissions',
        select: 'code -_id',
      },
    });
  }

  async findAllActive() {
    return this.findRaw(
      { isDeleted: false, isActived: true },
      { includeDeleted: true },
    );
  }

  async countByFilter(filter: any): Promise<number> {
    return this.countDocumentsRaw(filter, true);
  }

  async findByFilterWithPagination(filter: any, skip: number, limit: number) {
    return this.findRaw(filter, {
      skip,
      limit,
      sort: { createdAt: -1 },
      includeDeleted: true,
    });
  }

  async findByIdLeanRaw(id: string) {
    return this.findByIdRaw(id, { includeDeleted: true, lean: true });
  }

  async findByIdRaw(id: string, options: any = {}) {
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  async updateOneRaw(filter: any, update: any) {
    return super.updateOneRaw(filter, update);
  }

  async findUserIdsByRoleId(roleId: string) {
    return this.userModel
      .find({ roleID: new mongoose.Types.ObjectId(roleId) })
      .select('_id')
      .exec();
  }

  async softDeleteRaw(filter: any) {
    return this.softDelete(filter);
  }

  async updateManyRaw(filter: any, update: any) {
    return super.updateManyRaw(filter, update);
  }
}
