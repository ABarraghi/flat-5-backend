import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@module/user/service/user.service';
import { CreateUserDto } from '@module/user/validation/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    const user = await this.usersService.create(createUserDto);
    const payload = { email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(email);

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }
}
