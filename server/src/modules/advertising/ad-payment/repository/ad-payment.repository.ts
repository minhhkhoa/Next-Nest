import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { MongoAbstractRepository } from 'src/common/service/mongo.abstract.repository';
import { AdPayment, AdPaymentDocument } from '../schemas/ad-payment.schema';

@Injectable()
export class AdPaymentRepository extends MongoAbstractRepository<AdPaymentDocument> {
  constructor(
    @InjectModel(AdPayment.name)
    private readonly adPaymentModel: SoftDeleteModel<AdPaymentDocument>,
  ) {
    super(AdPayment, adPaymentModel);
  }

  async findByOrderCode(orderCode: string) {
    return this.findOneRaw(
      { orderCode } as any,
      { includeDeleted: true, lean: true },
    );
  }
}
