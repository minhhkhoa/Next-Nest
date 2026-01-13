import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { BusinessModule } from 'src/common/decorator/customize';
import { DiscoveryService } from './discovery.service';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, DiscoveryService],
})
export class PermissionsModule {}
