import { Module } from '@nestjs/common';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOut, WorkOutSchema } from './schemas/workout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkOut.name, schema : WorkOutSchema }])
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService]
})
export class WorkoutModule {}
