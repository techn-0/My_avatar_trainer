import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WorkoutModule } from './workout/workout.module';
import { SocauthModule } from './socauth/socauth.module';
import { ConfigModule } from '@nestjs/config';
import { MultiplayerGateway } from './multiplay/multiplayer.gateway';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://3.36.101.189:27017'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    WorkoutModule,
    SocauthModule,
  ],
  providers: [MultiplayerGateway], // MultiplayerGateway 추가
})
export class AppModule {}
