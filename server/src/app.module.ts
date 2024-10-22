import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
=======
import { WorkoutModule } from './workout/workout.module';

@Module({
  imports: [BoardsModule, MongooseModule.forRoot('mongodb://localhost:27017'), AuthModule, WorkoutModule],
})
export class AppModule {}
