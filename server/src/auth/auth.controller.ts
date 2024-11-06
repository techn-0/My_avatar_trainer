import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserCredentialDto } from './dto/auth-credential.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body() userCredentialDto: UserCredentialDto,
  ): Promise<{ message: string }> {
    return await this.authService.signUp(userCredentialDto);
  }
  
  @Post('/signin')
  async signIn(
    @Body() userCredentialDto: UserCredentialDto, @Res() res
  ){
    const { accessToken } = await this.authService.signIn(userCredentialDto);
    res.cookie('token', accessToken, {
      httpOnly: false,
      secure: true, // 개발 중에는 false, 배포 시 true로 변경
      sameSite: 'None', // 포트가 다를 경우 'None' 사용
      maxAge: 60 * 60 * 1000 * 12
    });
    res.send({accessToken});
  }
}
