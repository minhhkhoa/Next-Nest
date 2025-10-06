import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { IndustryModule } from './industry/industry.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectionFactory: (connection: Connection) => {
          //- điều này giúp sử dụng soft delete
          // connection.plugin(softDeletePlugin);
          // return connection;
        },
      }),
      inject: [ConfigService],
    }),

    //- configModule giúp sử dụng file .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    IndustryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
