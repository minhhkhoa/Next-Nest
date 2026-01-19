import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';

import { NotificationsGateway } from './notifications.gateway';
import { NotificationsListener } from './notifications.listener';

@Module({
  imports: [
    AuthModule,
    TranslationModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsListener,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
