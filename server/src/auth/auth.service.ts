import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { comparePassword } from 'src/utils/hashPassword';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) return null;

    const isDeleted = user.isDeleted;

    if (isDeleted) return null;

    //- tới được đây thì check pasword
    const { password } = user;
    const isMatch = comparePassword(pass, password);

    //- sai pass
    if (!isMatch) return null;

    return user;
  }
}
