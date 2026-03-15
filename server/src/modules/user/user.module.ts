import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { DetailProfileModule } from 'src/modules/detail-profile/detail-profile.module';
import { BusinessModule } from 'src/common/decorator/customize';
import { RolesModule } from '../roles/roles.module';
import { CompanyModule } from '../company/company.module';
import { JobsModule } from '../jobs/jobs.module';

@BusinessModule()
@Module({
  imports: [
    forwardRef(() => RolesModule),
    forwardRef(() => CompanyModule),
    DetailProfileModule,
    forwardRef(() => JobsModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
