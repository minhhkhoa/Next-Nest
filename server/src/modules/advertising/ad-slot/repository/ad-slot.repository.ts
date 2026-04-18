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

  async findByCode(code: string) {
    return this.findOneRaw(
      { code: code.toUpperCase() } as any,
      { includeDeleted: true, lean: true },
    );
  }
}
