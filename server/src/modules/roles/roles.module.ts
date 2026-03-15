import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { BusinessModule } from 'src/common/decorator/customize';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/schemas/user.schema';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema }
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
