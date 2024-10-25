import { Module } from '@nestjs/common';
import { SocauthController } from './socauth.controller';
import { SocauthService } from './socauth.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PassportModule,
    JwtModule.register({
      secret: 'My trainer hides his identity',
      signOptions:{ expiresIn:'1h'},
    })
  ],
  controllers: [SocauthController],
  providers: [SocauthService, GoogleStrategy, KakaoStrategy, NaverStrategy],
})
export class SocauthModule {}



