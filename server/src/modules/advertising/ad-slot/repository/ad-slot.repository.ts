import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { AdSlot, AdSlotDocument } from '../schemas/ad-slot.schema';

@Injectable()
export class AdSlotRepository extends MongoAbstractRepository<AdSlotDocument> {
  constructor(
    @InjectModel(AdSlot.name)
    private readonly adSlotModel: SoftDeleteModel<AdSlotDocument>,
  ) {
    super(AdSlot, adSlotModel);
  }

  //- Tìm slot theo code (bao gồm cả đã xóa mềm để kiểm tra trùng)
  async findByCode(code: string) {
    return this.findOneRaw(
      { code: code.toUpperCase() },
      { includeDeleted: true, lean: true },
    );
  }

  //- Tạo slot mới
  async createRaw(payload: any) {
    return this.create(payload);
  }

  //- Override findByIdRaw mặc định để include deleted
  async findByIdRaw(id?: string | any, options: any = {}) {
    return super.findByIdRaw(id, { includeDeleted: true, ...options });
  }

  //- Aggregate pipeline (dùng khi cần thống kê phức tạp)
  async aggregateWithPipeline<T = any>(pipeline: any[]): Promise<T[]> {
    return this.aggregateRaw<T>(pipeline);
  }
}
