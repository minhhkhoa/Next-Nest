import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessModule } from 'src/common/decorator/customize';
import { AdPaymentController } from './ad-payment.controller';
import { AdPaymentService } from './ad-payment.service';
import { AdPaymentRepository } from './repository/ad-payment.repository';
import { AdPayment, AdPaymentSchema } from './schemas/ad-payment.schema';
import { AdBookingModule } from '../ad-booking/ad-booking.module';

@BusinessModule()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdPayment.name, schema: AdPaymentSchema },
    ]),
    forwardRef(() => AdBookingModule),
  ],
  controllers: [AdPaymentController],
  providers: [AdPaymentService, AdPaymentRepository],
  exports: [AdPaymentService, AdPaymentRepository, MongooseModule],
})
export class AdPaymentModule {}
