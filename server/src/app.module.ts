import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { IssueModule } from './modules/issue/issue.module';
import { UserResumeModule } from './modules/user-resume/user-resume.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { ApplicationModule } from './modules/application/application.module';
import { TraceMiddleware } from './common/middleware/trace.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { ConversationModule } from './modules/conversation/conversation.module';
import { MessageModule } from './modules/message/message.module';
import { RedisModule } from './common/redis/redis.module';
import { AdvertisingModule } from './modules/advertising/advertising.module';
import { AiServiceModule } from './modules/ai-service/ai-service.module';
import { ElasticsearchModule } from './modules/elasticsearch/elasticsearch.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    //- cronjob schedule
    ScheduleModule.forRoot(),

    RedisModule,

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        maxPoolSize: 5, //- Số lượng kết nối tối đa
        serverSelectionTimeoutMS: 7000, //- Chờ server phản hồi bao lâu?
        socketTimeoutMS: 10000, //- Chờ kết quả query bao lâu?
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

    AiServiceModule, // - module cung cấp GeminiChatProvider và các AI service
    ElasticsearchModule, //- đăng ký module elasticsearch toàn cục

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
    IssueModule,
    UserResumeModule,
    BookmarkModule,
    ApplicationModule,
    ConversationModule,
    MessageModule,
    AdvertisingModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    //- global interceptor để log thời gian xử lý ở controller, giúp theo dõi hiệu năng của từng endpoint
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //- áp dụng TraceMiddleware cho TẤT CẢ các routes (*)
    consumer.apply(TraceMiddleware).forRoutes('{*path}');
  }
}
