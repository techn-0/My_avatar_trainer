import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WorkoutModule } from './workout/workout.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017'),
    AuthModule,
    WorkoutModule,
  ],
})
export class AppModule {}
