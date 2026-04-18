import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { Permission, PermissionDocument } from '../schemas/permission.schema';

@Injectable()
export class PermissionsRepository extends MongoAbstractRepository<PermissionDocument> {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {
    super(Permission, permissionModel);
  }

  async createRaw(payload: any) {
    return this.create(payload);
  }

  async findAllActive() {
    return this.findRaw({ isDeleted: false }, { includeDeleted: true });
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

  async findAllRaw() {
    return this.findRaw({}, { includeDeleted: true });
  }

  async findByIdRaw(id: string) {
    return super.findByIdRaw(id, { includeDeleted: true });
  }

  async updateOneRaw(filter: any, update: any) {
    return super.updateOneRaw(filter, update);
  }

  async softDeleteRaw(filter: any) {
    return this.softDelete(filter);
  }

  async updateManyRaw(filter: any, update: any) {
    return super.updateManyRaw(filter, update);
  }
}
