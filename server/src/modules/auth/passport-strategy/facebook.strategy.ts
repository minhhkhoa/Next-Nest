import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { RolesService } from 'src/modules/roles/roles.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private roleService: RolesService,
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

    //- gán quyền là người dùng bình thường
    const nameRole = this.configService.get<string>('role_gest') as string;
    const idRole = await this.roleService.getRoleByName(nameRole);

    if (!idRole) throw new BadRequestException('Role không tồn tại');

    const userData = {
      provider: 'facebook',
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      avatar: photos?.[0]?.value,
      roleID: idRole._id,
    };

    return userData; //- gắn vào req.user
  }
}
