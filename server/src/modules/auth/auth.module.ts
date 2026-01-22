import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport-strategy/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './passport-strategy/jwt.strategy';
import * as ms from 'ms';
import { FacebookStrategy } from './passport-strategy/facebook.strategy';
import { GoogleStrategy } from './passport-strategy/google.strategy';
import { MailModule } from 'src/modules/mail/mail.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    RolesModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') as string,
        signOptions: {
          expiresIn:
            ms(
              (configService.get<string>('JWT_ACCESS_EXPIRE') ??
                '1d') as ms.StringValue,
            ) / 1000, //- thời gian token hết hạn
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
