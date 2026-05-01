import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessModule } from 'src/common/decorator/customize';
import { AdBookingController } from './ad-booking.controller';
import { AdBookingService } from './ad-booking.service';
import { AdBookingRepository } from './repository/ad-booking.repository';
import { AdBooking, AdBookingSchema } from './schemas/ad-booking.schema';
import { AdPaymentModule } from '../ad-payment/ad-payment.module';
import { AdSlotModule } from '../ad-slot/ad-slot.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { UserModule } from 'src/modules/user/user.module';

@BusinessModule()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdBooking.name, schema: AdBookingSchema },
    ]),
    forwardRef(() => AdPaymentModule),
    AdSlotModule,
    NotificationsModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AdBookingController],
  providers: [AdBookingService, AdBookingRepository],
  exports: [AdBookingService, AdBookingRepository, MongooseModule],
})
export class AdBookingModule {}
