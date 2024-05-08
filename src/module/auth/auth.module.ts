import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UserModule } from '@module/user/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { jwtConstants } from './const/auth.constant';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' }
    })
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
