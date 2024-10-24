import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WorkoutModule } from './workout/workout.module';
import { SocauthModule } from './socauth/socauth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017'), 
  ConfigModule.forRoot({
    isGlobal:true
  }),
  AuthModule, 
  WorkoutModule, 
  SocauthModule],
})

export class AppModule {}
