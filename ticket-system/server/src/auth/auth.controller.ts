import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser, Public } from '../common/decorators';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: { account: string; password: string }) {
    return this.auth.login((body.account || '').trim(), body.password || '');
  }

  @Public()
  @Post('register')
  register(@Body() body: any) {
    return this.auth.register(body);
  }

  @Get('me')
  me(@CurrentUser() user: any) {
    return this.auth.me(user.sub);
  }
}
