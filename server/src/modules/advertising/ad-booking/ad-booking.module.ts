import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessModule } from 'src/common/decorator/customize';
import { AdBookingController } from './ad-booking.controller';
import { AdBookingService } from './ad-booking.service';
import { AdBookingRepository } from './repository/ad-booking.repository';
import { AdBooking, AdBookingSchema } from './schemas/ad-booking.schema';

@BusinessModule()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdBooking.name, schema: AdBookingSchema }]),
  ],
  controllers: [AdBookingController],
  providers: [AdBookingService, AdBookingRepository],
  exports: [AdBookingService, AdBookingRepository, MongooseModule],
})
export class AdBookingModule {}
