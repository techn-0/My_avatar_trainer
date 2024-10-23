import { Module } from '@nestjs/common';
import { SocauthController } from './socauth.controller';
import { SocauthService } from './socauth.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';

@Module({
  imports: [PassportModule],
  controllers: [SocauthController],
  providers: [SocauthService, GoogleStrategy, KakaoStrategy, NaverStrategy],
})
export class SocauthModule {}



