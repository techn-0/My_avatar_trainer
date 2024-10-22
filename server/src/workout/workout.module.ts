import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { WorkOut, WorkOutSchema } from './schemas/workout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkOut.name, schema: WorkOutSchema }])  // WorkOut 스키마 등록
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
})
export class WorkoutModule {}
