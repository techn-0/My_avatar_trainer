import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { SocauthController } from './socauth.controller';
import { SocauthService } from './socauth.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema : UserSchema}]),
    PassportModule,
    JwtModule.register({
      secret: 'My trainer hides his identity',
      signOptions:{ expiresIn:'1h'},
    })
  ],
  controllers: [SocauthController],
  providers: [SocauthService, GoogleStrategy, KakaoStrategy, NaverStrategy],
  exports: [PassportModule, MongooseModule]
})
export class SocauthModule {}


// configure(consumer: MiddlewareConsumer) {
//   consumer
//     .apply(
//       // Session 생성 시, Session Id를 Cookie에 저장한다.
//       // Secret key를 통해서 형성한 Hash Signature를 사용해서, session Id가 맞는지 확인한다.
//       session({
//         secret: 'siwon-yammy-boy', // Replace with a secure, random key
//         resave: true,
//         saveUninitialized: true,
//         cookie: {
//           maxAge: 3600 * 1000, // 1 hour
//           secure: false, // Set to true for HTTPS in production
//           sameSite: 'lax',
//         },
//       }),
//     )
//     .forRoutes('*'); // 모든 주소에서 Session 정보에 대한 접근을 허용한다.
// }


