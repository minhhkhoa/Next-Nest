import { Module } from '@nestjs/common';
import { DetailProfileService } from './detail-profile.service';
import { DetailProfileController } from './detail-profile.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DetailProfile,
  DetailProfileSchema,
} from './schemas/detail-profile.schema';
import { BusinessModule } from 'src/common/decorator/customize';

@BusinessModule()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DetailProfile.name, schema: DetailProfileSchema },
    ]),
  ],
  controllers: [DetailProfileController],
  providers: [DetailProfileService],
  exports: [DetailProfileService],
})
export class DetailProfileModule {}
