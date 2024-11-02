import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WorkoutModule } from './workout/workout.module';
import { SocauthModule } from './socauth/socauth.module';
import { ConfigModule } from '@nestjs/config';
import { MultiplayerGateway } from './multiplay/multiplayer.gateway';
import { TierModule } from './tier/tier.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017'),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    WorkoutModule,
    SocauthModule,
    TierModule,
  ],
  providers: [MultiplayerGateway], // MultiplayerGateway 추가
})
export class AppModule {}
