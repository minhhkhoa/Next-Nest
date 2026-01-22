import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import { BusinessModule } from 'src/common/decorator/customize';
import { RolesModule } from '../roles/roles.module';
import { UserModule } from '../user/user.module';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    RolesModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
