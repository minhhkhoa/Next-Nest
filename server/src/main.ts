import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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
