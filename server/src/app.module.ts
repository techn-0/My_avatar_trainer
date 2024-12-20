import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WorkoutModule } from './workout/workout.module';
import { SocauthModule } from './socauth/socauth.module';
import { ConfigModule } from '@nestjs/config';
import { MyPageModule } from './my-page/my-page.module';
import { TierModule } from './tier/tier.module';
import { GatewayModule } from './multiplay/gateway.module';
import { CommentModule } from './my-page/comment/comment.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/M_A_T'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    WorkoutModule,
    SocauthModule,
    MyPageModule,
    TierModule,
    GatewayModule,
    CommentModule,
  ],
})
export class AppModule {}
