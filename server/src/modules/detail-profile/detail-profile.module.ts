import { Module } from '@nestjs/common';
import { DetailProfileService } from './detail-profile.service';
import { DetailProfileController } from './detail-profile.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DetailProfile,
  DetailProfileSchema,
} from './schemas/detail-profile.schema';
import { BusinessModule } from 'src/common/decorator/customize';
import { DetailProfileRepository } from './repository/detail-profile.repository';

@BusinessModule()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DetailProfile.name, schema: DetailProfileSchema },
    ]),
  ],
  controllers: [DetailProfileController],
  providers: [DetailProfileService, DetailProfileRepository],
  exports: [DetailProfileService],
})
export class DetailProfileModule {}
