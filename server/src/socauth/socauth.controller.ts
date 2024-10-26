import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocauthService } from './socauth.service';

@Controller('socauth')
export class SocauthController {
  constructor(private readonly socauthService: SocauthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates Google OAuth login
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res) {
    // Handle user data using socauthService
    const result = await this.socauthService.handleLogin(req.user);

    // 쿠키에 `token` 저장 (유효기간 1시간, Secure, SameSite 설정 추가)
    res.cookie('token', result.token, {
      maxAge: 3600 * 1000, // 1시간 (밀리초 단위)
      secure: true, // HTTPS에서만 작동
      sameSite: 'Strict', // SameSite 설정
      path: '/',
    });
    
    // Redirect to localhost:3000 after successful login
    return res.redirect('http://localhost:3000');
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    // Initiates Kakao OAuth login
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Req() req, @Res() res) {
    const result = await this.socauthService.handleLogin(req.user);

    // 쿠키에 `token` 저장 (유효기간 1시간, Secure, SameSite 설정 추가)
    res.cookie('token', result.token, {
      maxAge: 3600 * 1000, // 1시간 (밀리초 단위)
      secure: true, // HTTPS에서만 작동
      sameSite: 'Strict', // SameSite 설정
      path: '/',
    });

    return res.redirect('http://localhost:3000') 
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin() {
    // Initiates Naver OAuth login
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverLoginCallback(@Req() req, @Res() res) {
    const result = await this.socauthService.handleLogin(req.user);

    // 쿠키에 `token` 저장 (유효기간 1시간, Secure, SameSite 설정 추가)
    res.cookie('token', result.token, {
      maxAge: 3600 * 1000, // 1시간 (밀리초 단위)
      secure: true, // HTTPS에서만 작동
      sameSite: 'Strict', // SameSite 설정
      path: '/',
    });

    return res.redirect('http://localhost:3000');
  }
}

  // @Get('kakao/callback')
  // @UseGuards(AuthGuard('kakao')) 
  // async kakaoLoginCallback(@Req() req, @Res() res) { 
  //   try{
  //     console.log('kakao user:', req.user); 
  //     // return this.socauthservice.handlelogin(req.user); 

  //     await this.socauthService.handleLogin(req.user);
  //     return res.redirect('http://localhost:3000') }
  //   catch(error){ 
  //     console.error('kakao login callback error:', error); 
    
  //     return res.status(500).send('internal server error during kakao login');
  //   }
  // }