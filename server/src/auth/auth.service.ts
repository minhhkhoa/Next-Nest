import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserResponse } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { comparePassword } from 'src/utils/hashPassword';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) return null;

    const isDeleted = user.isDeleted;

    if (isDeleted) return null;

    //- tới được đây thì check pasword
    const { password } = user;
    const isMatch = await comparePassword(pass, password);

    //- sai pass
    if (!isMatch) return null;

    const { password: _, refresh_token, ...result } = user.toObject();
    return result;
  }

  async login(user: UserResponse) {
    const { avatar, email, name, companyID, roleID, _id } = user;
    const payload = { email, id: _id, name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        avatar,
        email,
        name,
        companyID,
        roleID,
      },
    };
  }
}
