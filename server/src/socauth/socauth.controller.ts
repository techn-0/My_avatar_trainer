import { Controller, Get, Post, Req, Res, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocauthService } from './socauth.service';
import axios from 'axios';
import { access } from 'fs';

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
    // 소셜 미디어를 통해서 로그인을 실행한다.
    const result = await this.socauthService.handleLogin(req.user);
    
    // 쿠키에 `token` 저장 (유효기간 1시간, Secure, SameSite 설정 추가)
    res.cookie('token', result.token, {
      maxAge: 3600 * 1000, // 1시간 (밀리초 단위)
      secure: false, // HTTPS에서만 작동
      sameSite: 'Lax', // SameSite 설정
      path: '/',
    });

    // 소셜 미디어로 로그인 후 최초로 회원 가입 시, 이용자의 정보를 가져오기 위해 req에 담긴 accessToken을 쿠키에 저장한다.
    const accessToken = req.user?.accessToken;

    // Check if user exists; if not, route to signup
    const userExists = await this.socauthService.userExists(req.user.id);
    if (!userExists) {
      // 소셜 로그인 정보로 로그인한 적이 없다면, 해당 정보로 회원 가입한다.
        try{
          const response = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
          );
  
          const user = response.data;
  
          // 소셜 미디어 종류를 google로 지정한다.
          const socUserCredentialDto = {
            id: user.id, 
            email: user.email, 
            provider: 'google',
          }
  
          // 소셜 로그인 데이터를 이용해서 회원 가입한다.
          await this.socauthService.signUp(socUserCredentialDto);
  
          // 소셜 로그인 데이터로 회원 가입한 이용자가 로그인한다.
          await this.socauthService.handleLogin(req.user);
            
        }catch(error){
          console.error('Token verification failed:', error);
          return res.status(401).send('Unauthorized');
        }

    }
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

    const accessToken = req.user?.accessToken;

    const userexists = await this.socauthService.userExists(req.user.id);

    if (!userexists){
      try{
        const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Send the accessToken as Bearer token
          },
        });

        const user = response.data;
        // console.log(user);

        const socUserCredentialDto = {
          id: user.id, 
          email: user.kakao_account.email, 
          provider: 'kakao',
        }
        // console.log(socUserCredentialDto);
        

        await this.socauthService.signUp(socUserCredentialDto);

        await this.socauthService.handleLogin(req.user);
      }catch(error){
        console.error('Token verification failed:', error);
          return res.status(401).send('Unauthorized');
      }

    }

    // Redirect to localhost:3000 after successful login
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

    const accessToken = req.user?.accessToken;
    const userExists = await this.socauthService.userExists(req.user.id);

    if(!userExists){
      try{
      const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use the main token directly
        },
      });

      const user = response.data;
      console.log(user);

      const socUserCredentialDto = {
        id: user.response.id, 
        email: user.response.email, 
        provider: 'naver',
      };
      console.log(socUserCredentialDto);

      await this.socauthService.signUp(socUserCredentialDto);

      await this.socauthService.handleLogin(req.user);

    }catch(error){
        console.error('Token verification failed:', error);
        return res.status(401).send('Unauthorized');
      }

    }
    
    
    return res.redirect('http://localhost:3000');
  }

}


