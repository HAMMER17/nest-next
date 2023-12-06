import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService,
    private passwordService: PasswordService,
    private jwtService: JwtService
  ) { }
  async signUp(email: string, password: string) {
    const user = await this.userService.findUser(email)

    if (user) {

      throw new BadRequestException({ type: 'Такой пользователь уже есть' })
    }
    const salt = this.passwordService.getSalt()
    const hash = this.passwordService.getHash(password, salt)
    const newUser = await this.userService.createUser(email, hash, salt)
    const accessToken = await this.jwtService.signAsync({ id: newUser.id, email: newUser.email })
    return { accessToken };
  }
  async signIn(email: string, password: string) {
    const user = await this.userService.findUser(email)

    if (!user) {
      throw new UnauthorizedException()
    }
    const hash = this.passwordService.getHash(password, user.salt);

    if (hash !== user.hash) {

      throw new UnauthorizedException();
    }

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
