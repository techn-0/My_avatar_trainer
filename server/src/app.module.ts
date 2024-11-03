import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WorkoutModule } from './workout/workout.module';
import { SocauthModule } from './socauth/socauth.module';
import { ConfigModule } from '@nestjs/config';
import { MultiplayerGateway } from './multiplay/multiplayer.gateway';
import { AppController } from './app.controller'; // AppController 추가
import { MyPageModule } from './my-page/my-page.module';
import { TierModule } from './tier/tier.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://15.165.191.221:27017'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    WorkoutModule,
    SocauthModule,
    MyPageModule,
    TierModule,
  ],
  controllers: [AppController], // AppController 추가
  providers: [MultiplayerGateway], // MultiplayerGateway 추가
})
export class AppModule {}
