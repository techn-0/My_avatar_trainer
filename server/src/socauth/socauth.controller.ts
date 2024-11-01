import { Controller, Get, Post, Req, Res, Body, UseGuards } from '@nestjs/common';
import { socUserCredentialDto } from './dto/socauth-credential.dto';
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
  async googleLoginCallback(@Req() req, @Res() res){
    // 소셜 미디어를 통한 로그인 과정을 거친다.
    const result = await this.socauthService.handleLogin(req.user);

    // Cookie에 JWT 토큰을 저장한다.
    res.cookie('token', result.token, {
      maxAge: 3600 * 1000,
      secure: true,
      sameSite: 'Strict',
      path: '/',
    });

    const accessToken = req.user?.accessToken;

    // if (accessToken) {
    //   res.cookie('accessToken', accessToken, {
    //     maxAge: 3600 * 1000, // 1 hour
    //     secure: false,        // Set to true for HTTPS in production
    //     sameSite: 'Lax',
    //     path: '/',
    //   });
    // }

    // Check if user exists in your database
    const userExists = await this.socauthService.userExists(req.user.id);
    if (!userExists) {
      try {
        // Retrieve user info from Google API using access token
        const response = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
        );

        const user = response.data;
        console.log('User Info from Google:', user);

        // Construct DTO with Google user info for signup
        const socUserCredentialDto = {
          id: user.id,
          email: user.email,
          social: 'google',
        };

        // Register new user with Google info
        await this.socauthService.signUp(socUserCredentialDto);

        // Re-perform login after signup, if necessary
        await this.socauthService.handleLogin(user);
      } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).send('Unauthorized');
      }
  }

  // Redirect to the frontend after successful login or signup
  return res.redirect('http://localhost:3000');


  }


  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // async googleLoginCallback(@Req() req, @Res() res) {    
  //   // 소셜 미디어를 통해서 로그인을 실행한다.
  //   console.log('callback');
  //   const result = await this.socauthService.handleLogin(req.user);
    
  //   // 쿠키에 `token` 저장 (유효기간 1시간, Secure, SameSite 설정 추가)
  //   res.cookie('token', result.token, {
  //     maxAge: 3600 * 1000, // 1시간 (밀리초 단위)
  //     secure: false, // HTTPS에서만 작동
  //     sameSite: 'Lax', // SameSite 설정
  //     path: '/',
  //   });
    
  //   // Check if user exists; if not, route to signup
  //   console.log('before');
  //   const userExists = await this.socauthService.userExists(req.user.id);
  //   console.log(req.user.id);
  //   if (!userExists) {
  //     // 소셜 로그인 정보로 로그인한 적이 없다면, 해당 정보로 회원 가입한다.
  //     const accessToken = req.cookies?.accessToken;
  //     console.log(accessToken);
      
  //     if(accessToken){
  //       try{
  //         const response = await axios.get(
  //           `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
  //         );
  
  //         const user = accessToken.data;
  
  //         console.log(user)
  
  //         // 소셜 미디어 종류를 google로 지정한다.
  //         const socUserCredentialDto = {
  //           id: req.user.id, 
  //           email: req.user.email, 
  //           social: 'google',
  //         }
  
  //         console.log(socUserCredentialDto);
  
  //         // 소셜 로그인 데이터를 이용해서 회원 가입한다.
  //         const newUser = await this.socauthService.signUp(socUserCredentialDto);
  
  //         // 소셜 로그인 데이터로 회원 가입한 이용자가 로그인한다.
  //         const result = await this.socauthService.handleLogin(req.user);
          
  //         return res.redirect('http://localhost:3000');
  
  //       }catch(error){
  //         console.error('Token verification failed:', error);
  //         return res.status(401).send('Unauthorized');
  //       }
  
  //     }


  //   }
  //   console.log('after');  

  //   // Redirect to localhost:3000 after successful login
  //   return res.redirect('http://localhost:3000');
  // }

  
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

  @Post('kakao/signup')
  kakaoSignUp(
    @Body() socUserCredentialDto: socUserCredentialDto,
  ): Promise<{ message: string }> {
    return this.socauthService.signUp(socUserCredentialDto);
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

  @Post('naver/signup')
  naverSignUp(
    @Body() socUserCredentialDto: socUserCredentialDto,
  ): Promise<{ message: string }> {
    return this.socauthService.signUp(socUserCredentialDto);
  }

}


