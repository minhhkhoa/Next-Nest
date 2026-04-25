import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BusinessModule } from 'src/common/decorator/customize';
import { AdSlotController } from './ad-slot.controller';
import { AdSlotService } from './ad-slot.service';
import { AdSlotRepository } from './repository/ad-slot.repository';
import { AdSlot, AdSlotSchema } from './schemas/ad-slot.schema';

@BusinessModule()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdSlot.name, schema: AdSlotSchema }]),
    //- Inject ConfigService để đọc biến môi trường phân quyền
    ConfigModule,
  ],
  controllers: [AdSlotController],
  providers: [AdSlotService, AdSlotRepository],
  exports: [AdSlotService, AdSlotRepository, MongooseModule],
})
export class AdSlotModule {}
