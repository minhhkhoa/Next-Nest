import { Module } from '@nestjs/common';
import { IndustryService } from './industry.service';
import { IndustryController } from './industry.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Industry, IndustrySchema } from './schemas/industry.schema';
import { BusinessModule } from 'src/common/decorator/customize';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    MongooseModule.forFeature([
      { name: Industry.name, schema: IndustrySchema },
    ]),
  ],
  controllers: [IndustryController],
  providers: [IndustryService],
})
export class IndustryModule {}
