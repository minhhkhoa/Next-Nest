import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { AdBooking, AdBookingDocument } from '../schemas/ad-booking.schema';

@Injectable()
export class AdBookingRepository extends MongoAbstractRepository<AdBookingDocument> {
  constructor(
    @InjectModel(AdBooking.name)
    private readonly adBookingModel: SoftDeleteModel<AdBookingDocument>,
  ) {
    super(AdBooking, adBookingModel);
  }

  async findBySlotCode(slotCode: string) {
    return this.findRaw(
      { slotCode: slotCode.toUpperCase() } as any,
      {
        includeDeleted: true,
        lean: true,
        sort: { createdAt: -1 },
      },
    );
  }
}
