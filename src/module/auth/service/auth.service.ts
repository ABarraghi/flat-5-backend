import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Schema } from 'mongoose';
import { UserService } from '@module/user/service/user.service';
import { CreateUserDto } from '@module/user/validation/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  createPayload(email: string, _id: Schema.Types.ObjectId) {
    const payload = { email, id: _id.toString() };

    return payload;
  }

  async signUp(createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    const user = await this.usersService.create(createUserDto);
    const payload = this.createPayload(user.email, user._id);

    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(email);

    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = this.createPayload(user.email, user._id);

    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }
}
