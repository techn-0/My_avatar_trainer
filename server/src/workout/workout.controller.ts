import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  // userId와 duration에 따른 운동 기록 가져오기
  @Get()
  async getWorkouts(@Query('userId') userId: string, @Query('duration') duration: number) {
    return this.workoutService.findWorkoutsByUserAndDuration(userId, duration);
  }

  // 새로운 운동 기록 생성 ***백엔드 작업자가 수정 가능!
  @Post()
  async createWorkout(@Body() createWorkoutDto: CreateWorkoutDto) {
    return this.workoutService.createWorkout(createWorkoutDto);
  }
}
