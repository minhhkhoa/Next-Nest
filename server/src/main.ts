import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  //- use global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //- loại bỏ các field khong khai bao trong DTO tức là làm sạch dữ liệu trước khi vào controller đó
      // transform: true, // ép kiểu theo DTO - tắt đi vì nó khá nặng
      transformOptions: {
        enableImplicitConversion: true, // tự động convert string -> number, v.v.
      },
    }),
  ); //- sử dụng pipe để validate dữ liệu trước khi vào controller

  //- config cors
  app.enableCors({
    origin: true, //- domain client
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });
  //- end config cors

  //- config swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API Document')
    .setDescription('The NestJS API description')
    .setVersion('1.0')
    //-add bearer auth
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    //-add bearer auth
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true, //- ghi nho token khi refresh
    },
  });
  //- end config swagger

  await app.listen(configService.get<string>('PORT') ?? 6009);
}
bootstrap();
