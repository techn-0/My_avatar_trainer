import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  // userId로 운동 기록 가져오기
  @Get()
  async getWorkouts(@Query('userId') userId: string) {
    return this.workoutService.findWorkoutsByUser(userId);
  }

  // 새로운 운동 기록 생성
  @Post()
  async createWorkout(@Body() createWorkoutDto: CreateWorkoutDto) {
    return this.workoutService.createWorkout(createWorkoutDto);
  }
}
