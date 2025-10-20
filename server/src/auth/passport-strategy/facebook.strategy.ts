import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID') as string,
      clientSecret: configService.get<string>(
        'FACEBOOK_CLIENT_SECRET',
      ) as string,
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') as string,
      //- điền các field cần lấy của profile vào đây nhưng sẽ có hạn chế của fb cần đk với nó
      profileFields: [
        'id',
        'emails',
        'name',
        'photos',
        'displayName',
        'gender',
        'birthday',
        'age_range',
      ],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { name, emails, photos, id } = profile;

    const userData = {
      provider: 'facebook',
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      avatar: photos?.[0]?.value,
    };

    return userData; //- gắn vào req.user
  }
}
