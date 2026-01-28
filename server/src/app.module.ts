import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { IndustryModule } from './modules/industry/industry.module';
import { TranslationModule } from './common/translation/translation.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { SkillModule } from './modules/skill/skill.module';
import { CateNewsModule } from './modules/cate-news/cate-news.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { NewsModule } from './modules/news/news.module';
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DetailProfileModule } from './modules/detail-profile/detail-profile.module';
import { MailModule } from './modules/mail/mail.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JobsModule } from './modules/jobs/jobs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    //- cronjob schedule
    ScheduleModule.forRoot(),

    //- config connect redis
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get<string>('REDIS_URL'),
          ttl: 600000, //- time to live: 10 phút
        }),
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectionFactory: (connection: Connection) => {
          //- điều này giúp sử dụng soft delete
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    //- config socket
    EventEmitterModule.forRoot({
      global: true, //- giúp các module khác có thể dùng mà không cần import
      wildcard: false, // Không cần dùng ký tự đại diện để tối ưu hiệu năng
      delimiter: '.',
    }),

    //- configModule giúp sử dụng file .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    IndustryModule,
    TranslationModule,
    SkillModule,
    CateNewsModule,
    CloudinaryModule,
    NewsModule,
    CompanyModule,
    UserModule,
    AuthModule,
    DetailProfileModule,
    MailModule,
    PermissionsModule,
    RolesModule,
    NotificationsModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
