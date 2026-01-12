import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TranslationService } from 'src/translation/translation.service';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { FindPermissionQueryDto } from './dto/permissionDto.dto';
import aqp from 'api-query-params';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'permission',
        createPermissionDto,
      );

      const permission = await this.permissionModel.create(dataLang);

      return {
        _id: permission._id,
        name: permission.name.en,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll() {
    try {
      return await this.permissionModel.find({ isDeleted: false });
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findByFilter(query: FindPermissionQueryDto) {
    try {
      const { currentPage, pageSize, name, method, module } = query;

      const queryForAqp = { name, method, module };
      const { filter, sort } = aqp(queryForAqp);

      //- Xây dựng điều kiện lọc
      let filterConditions: any = { ...filter };

      //- Xử lý filter cho name nếu truyền lên
      if (name) {
        delete filterConditions.name;
        const searchRegex = new RegExp(name, 'i');
        filterConditions.$or = [
          { 'name.vi': { $regex: searchRegex } },
          { 'name.en': { $regex: searchRegex } },
        ];
      }

      if (method) {
        filterConditions.method = method.toUpperCase();
      }
      if (module) {
        filterConditions.module = module.toUpperCase();
      }

      const defaultPage = currentPage > 0 ? +currentPage : 1;
      let offset = (+defaultPage - 1) * +pageSize;
      let defaultLimit = +pageSize ? +pageSize : 10;

      const totalItems = (await this.permissionModel.find(filterConditions))
        .length;
      const totalPages = Math.ceil(totalItems / defaultLimit);

      // delete filterConditions.industryID;

      const result = await this.permissionModel
        .find(filterConditions)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .exec();

      return {
        meta: {
          current: defaultPage,
          pageSize: pageSize,
          totalPages: totalPages,
          totalItems: totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID quyền hạn không đúng định dạng', !!id);
      }

      const permission = await this.permissionModel.findById(id);

      if (!permission)
        throw new BadRequestCustom('ID quyền hạn không tìm thấy', !!id);

      if (permission?.isDeleted) {
        throw new BadRequestCustom(
          'quyền hạn này hiện đã bị xóa',
          !!permission?.isDeleted,
        );
      }

      return permission;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: UserDecoratorType,
  ) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'permission',
        updatePermissionDto,
      );

      const filter = { _id: id };
      const update = {
        $set: {
          ...dataLang,
          updatedBy: {
            _id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      };

      const result = await this.permissionModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa quyền hạn', !!id);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID quyền hạn không đúng định dạng', !!id);
      }

      const permission = await this.permissionModel.findById(id);
      if (!permission) throw new BadRequestCustom('ID quyền hạn không tìm thấy', !!id);

      const isDeleted = permission.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('Quyền hạn này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.permissionModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa quyền hạn', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
