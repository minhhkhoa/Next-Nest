import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { CreateAdSlotDto } from './dto/create-ad-slot.dto';
import { UpdateAdSlotDto } from './dto/update-ad-slot.dto';
import { FindAdSlotQueryDto } from './dto/find-ad-slot-query.dto';
import { AdSlotRepository } from './repository/ad-slot.repository';

@Injectable()
export class AdSlotService {
  constructor(
    private readonly adSlotRepository: AdSlotRepository,
    private readonly configService: ConfigService,
  ) {}

  //- Chỉ super_admin mới được tạo slot quảng cáo
  async create(dto: CreateAdSlotDto, user: UserDecoratorType) {
    try {
      const roleSuperAdmin = this.configService.get<string>('role_super_admin');
      if (user.roleCodeName !== roleSuperAdmin) {
        throw new ForbiddenException(
          'Chỉ Super Admin mới được tạo slot quảng cáo.',
        );
      }

      //- Kiểm tra code đã tồn tại chưa (kể cả đã xóa mềm)
      const existingSlot = await this.adSlotRepository.findByCode(dto.code);
      if (existingSlot) {
        throw new BadRequestCustom(
          `Slot với mã "${dto.code.toUpperCase()}" đã tồn tại trong hệ thống.`,
        );
      }

      const newSlot = await this.adSlotRepository.createRaw({
        ...dto,
        code: dto.code.toUpperCase(),
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });

      return {
        _id: newSlot._id,
        code: newSlot.code,
        name: newSlot.name,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestCustom
      ) {
        throw error;
      }
      throw new BadRequestCustom(error.message);
    }
  }

  //- Lấy danh sách slot có lọc/phân trang (Dành cho Admin)
  async findAll(query: FindAdSlotQueryDto) {
    try {
      const {
        currentPage = 1,
        pageSize = 10,
        keyword,
        page,
        adModeAllowed,
        isActive,
        isDeleted,
      } = query;

      const skip = (+currentPage - 1) * +pageSize;

      //- Build filter động
      const filter: Record<string, any> = {};

      //- Mặc định không lấy bản ghi đã xóa mềm
      if (isDeleted !== undefined) {
        filter.isDeleted = isDeleted;
      } else {
        filter.isDeleted = false;
      }

      if (keyword) {
        filter.$or = [
          { code: { $regex: keyword, $options: 'i' } },
          { name: { $regex: keyword, $options: 'i' } },
        ];
      }

      if (page) filter.page = page;
      if (adModeAllowed) filter.adModeAllowed = adModeAllowed;
      if (isActive !== undefined) filter.isActive = isActive;

      const [totalItems, result] = await Promise.all([
        this.adSlotRepository.countDocumentsRaw(filter, true),
        this.adSlotRepository.findRaw(filter, {
          sort: { createdAt: -1 },
          skip,
          limit: +pageSize,
          lean: true,
          includeDeleted: true,
        }),
      ]);

      return {
        meta: {
          current: +currentPage,
          pageSize: +pageSize,
          totalPages: Math.ceil(totalItems / +pageSize),
          totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom('Lỗi truy vấn AdSlot: ' + error.message);
    }
  }

  //- Lấy danh sách slot đang hoạt động (Public - không cần login)
  async findAllPublic() {
    try {
      const slots = await this.adSlotRepository.findRaw(
        { isActive: true, isDeleted: false },
        { sort: { page: 1, code: 1 }, lean: true },
      );
      return slots;
    } catch (error) {
      throw new BadRequestCustom(
        'Lỗi lấy danh sách slot công khai: ' + error.message,
      );
    }
  }

  //- Lấy chi tiết một slot theo ID
  async findOne(id: string) {
    try {
      const slot = await this.adSlotRepository.findByIdRaw(id, { lean: true });
      if (!slot) {
        throw new BadRequestCustom(`Không tìm thấy slot với ID: ${id}`);
      }
      return slot;
    } catch (error) {
      if (error instanceof BadRequestCustom) throw error;
      throw new BadRequestCustom(error.message);
    }
  }

  //- Cập nhật thông tin slot (Chỉ super_admin)
  async update(id: string, dto: UpdateAdSlotDto, user: UserDecoratorType) {
    try {
      const roleSuperAdmin = this.configService.get<string>('role_super_admin');
      if (user.roleCodeName !== roleSuperAdmin) {
        throw new ForbiddenException(
          'Chỉ Super Admin mới được cập nhật slot quảng cáo.',
        );
      }

      const slot = await this.adSlotRepository.findByIdRaw(id);
      if (!slot || slot.isDeleted) {
        throw new BadRequestCustom(`Slot không tồn tại hoặc đã bị xóa.`);
      }

      //- Nếu đổi code thì kiểm tra trùng với slot khác
      if (dto.code && dto.code.toUpperCase() !== slot.code) {
        const existing = await this.adSlotRepository.findByCode(dto.code);
        if (existing && existing._id.toString() !== id) {
          throw new BadRequestCustom(
            `Slot với mã "${dto.code.toUpperCase()}" đã tồn tại.`,
          );
        }
      }

      const updated = await this.adSlotRepository.findOneAndUpdateRaw(
        { _id: id, isDeleted: false },
        {
          $set: {
            ...dto,
            ...(dto.code && { code: dto.code.toUpperCase() }),
            updatedBy: {
              _id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            },
          },
        },
        { new: true },
      );

      return updated;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestCustom
      ) {
        throw error;
      }
      throw new BadRequestCustom(error.message);
    }
  }

  //- Bật/tắt trạng thái active của slot (Chỉ super_admin)
  async toggleActive(id: string, user: UserDecoratorType) {
    try {
      const roleSuperAdmin = this.configService.get<string>('role_super_admin');
      if (user.roleCodeName !== roleSuperAdmin) {
        throw new ForbiddenException(
          'Chỉ Super Admin mới được thay đổi trạng thái slot.',
        );
      }

      const slot = await this.adSlotRepository.findByIdRaw(id, { lean: true });
      if (!slot || slot.isDeleted) {
        throw new BadRequestCustom(`Slot không tồn tại hoặc đã bị xóa.`);
      }

      const newActiveStatus = !slot.isActive;

      const updated = await this.adSlotRepository.findOneAndUpdateRaw(
        { _id: id },
        {
          $set: {
            isActive: newActiveStatus,
            updatedBy: {
              _id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            },
          },
        },
        { new: true, lean: true },
      );

      return {
        _id: updated._id,
        code: updated.code,
        isActive: updated.isActive,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestCustom
      ) {
        throw error;
      }
      throw new BadRequestCustom(error.message);
    }
  }

  //- Xóa mềm slot (Chỉ super_admin)
  async remove(id: string, user: UserDecoratorType) {
    try {
      const roleSuperAdmin = this.configService.get<string>('role_super_admin');
      if (user.roleCodeName !== roleSuperAdmin) {
        throw new ForbiddenException(
          'Chỉ Super Admin mới được xóa slot quảng cáo.',
        );
      }

      const slot = await this.adSlotRepository.findByIdRaw(id, { lean: true });
      if (!slot || slot.isDeleted) {
        throw new BadRequestCustom(
          `Slot không tồn tại hoặc đã bị xóa trước đó.`,
        );
      }

      await this.adSlotRepository.findOneAndUpdateRaw(
        { _id: id },
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
        { new: true },
      );

      return { message: `Slot "${slot.code}" đã được xóa thành công.` };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestCustom
      ) {
        throw error;
      }
      throw new BadRequestCustom(error.message);
    }
  }

  //- Khôi phục slot đã xóa mềm (Chỉ super_admin)
  async restore(id: string, user: UserDecoratorType) {
    try {
      const roleSuperAdmin = this.configService.get<string>('role_super_admin');
      if (user.roleCodeName !== roleSuperAdmin) {
        throw new ForbiddenException(
          'Chỉ Super Admin mới được khôi phục slot.',
        );
      }

      const slot = await this.adSlotRepository.findByIdRaw(id, {
        lean: true,
        includeDeleted: true,
      });
      if (!slot) {
        throw new BadRequestCustom(`Slot không tồn tại.`);
      }
      if (!slot.isDeleted) {
        throw new BadRequestCustom(`Slot chưa bị xóa.`);
      }

      const restored = await this.adSlotRepository.findOneAndUpdateRaw(
        { _id: id },
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            updatedBy: {
              _id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            },
          },
        },
        { new: true },
      );

      return restored;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestCustom
      ) {
        throw error;
      }
      throw new BadRequestCustom(error.message);
    }
  }

  //- Tìm slot theo code mục đích để lấy kích thước(width, height) của slot
  async findByCode(code: string) {
    const slot = await this.adSlotRepository.findByCode(code.toUpperCase());
    if (!slot || slot.isDeleted) {
      throw new BadRequestCustom(`Không tìm thấy slot với mã: ${code}`);
    }
    return slot;
  }
}
