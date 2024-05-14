import { Response } from 'express';
import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  signUp(@Body() signUpDto: Record<string, any>) {
    return this.authService.signUp({ email: signUpDto.email, password: signUpDto.password });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() body: Record<string, any>, @Res() res: Response) {
    const { email, password } = body;
    const { access_token } = await this.authService.signIn(email, password);

    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 7 * 24 * 3600 * 1000) // 1 week
    });

    return res.status(HttpStatus.OK).send({ access_token });
  }
}
