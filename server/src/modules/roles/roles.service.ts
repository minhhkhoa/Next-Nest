import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindRoleQueryDto } from './dto/roleDto.dto';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { TranslationService } from 'src/common/translation/translation.service';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class RolesService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: UserDecoratorType) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'role',
        createRoleDto,
      );

      const role = await this.roleModel.create({
        ...dataLang,
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });

      return {
        _id: role._id,
        name: role.name.en,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async getRoleByName(name: string) {
    try {
      const role = await this.roleModel.findOne({
        $or: [{ 'name.vi': name }, { 'name.en': name }],
      });
      return role;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async getPermissionsByRoleID(roleID: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(roleID))
        throw new BadRequestCustom('ID vai trò không đúng định dạng', !!roleID);

      // Sử dụng populate để "điền đầy" dữ liệu từ collection permissions vào
      const role = await this.roleModel
        .findById(roleID)
        .populate({
          path: 'permissions',
          select: 'code -_id',
        })
        .lean(); // Dùng lean để trả về Plain Object thay vì Mongoose Document

      if (!role)
        throw new BadRequestCustom('ID vai trò không tìm thấy', !!roleID);

      return role.permissions || [];
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll() {
    try {
      return await this.roleModel.find({ isDeleted: false, isActived: true });
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findByFilter(query: FindRoleQueryDto) {
    try {
      const { currentPage, pageSize, name } = query;

      const queryForAqp = { name };
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

      const defaultPage = currentPage > 0 ? +currentPage : 1;
      let offset = (+defaultPage - 1) * +pageSize;
      let defaultLimit = +pageSize ? +pageSize : 10;

      const totalItems = (await this.roleModel.find(filterConditions)).length;
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const result = await this.roleModel
        .find(filterConditions)
        .skip(offset)
        .limit(defaultLimit)
        .sort('-createdAt')
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
        throw new BadRequestCustom('ID vai trò không đúng định dạng', !!id);
      }

      const role = await this.roleModel.findById(id).lean();

      if (!role) throw new BadRequestCustom('ID vai trò không tìm thấy', !!id);

      return role;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    user: UserDecoratorType,
  ) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'role',
        updateRoleDto,
      );

      const filter = { _id: id };
      const update = {
        $set: {
          ...dataLang,
          updatedBy: {
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        },
      };

      const result = await this.roleModel.updateOne(filter, update);

      if (!result) throw new BadRequestCustom('Lỗi sửa vai trò', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: UserDecoratorType) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID vai trò không đúng định dạng', !!id);
      }

      const role = await this.roleModel.findById(id);
      if (!role) throw new BadRequestCustom('ID vai trò không tìm thấy', !!id);

      const filter = { _id: id };
      const result = this.roleModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa vai trò', !!id);

      //- delete by
      await this.roleModel.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            deletedBy: {
              _id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            },
          },
        },
      );

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async removeMany(ids: string[], user: UserDecoratorType) {
    try {
      if (!Array.isArray(ids)) {
        throw new BadRequestCustom(
          'Dữ liệu đầu vào không hợp lệ. `ids` phải là một mảng.',
          true,
        );
      }
      //- Validate all IDs
      const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length === 0) {
        throw new BadRequestCustom(
          'Không có ID hợp lệ nào được cung cấp.',
          true,
        );
      }

      const result = await this.roleModel.updateMany(
        { _id: { $in: validIds } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: {
              _id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            },
          },
        },
      );

      if (result.modifiedCount === 0) {
        return {
          message:
            'Không có vai trò nào được xóa. Có thể chúng đã bị xóa trước đó hoặc không tồn tại.',
          data: {
            deletedCount: 0,
          },
        };
      }

      return {
        message: `Đã xóa thành công ${result.modifiedCount} vai trò.`,
        data: {
          deletedCount: result.modifiedCount,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestCustom) {
        throw error;
      }
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
