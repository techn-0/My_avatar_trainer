import { Body, Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { AuthGuard } from '@nestjs/passport';
import { WorkOut } from './schemas/workout.schema';

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  // userId와 duration에 따른 운동 기록 가져오기
  @Post()
  @UseGuards(AuthGuard())
  async getWorkouts(@Req() req:any , @Body('duration') duration: number) {
    return this.workoutService.findWorkoutsByUserAndDuration(req.user._id, duration);
  }

  @Post('/start_exercise')
  @UseGuards(AuthGuard())
    getRecord(@Req() req:any, @Body() body: { exercise: string, duration: number} ): Promise<{ count?: number; date?: string; message?: string }> {
        return this.workoutService.getRecord(req.user._id, body.exercise, body.duration);
    }
  
    // 운동 기록 생성 (end_exercise)
  @Post('/end_exercise')
  @UseGuards(AuthGuard())
  createRecord(@Body() body: { exercise: string, duration: number, count: number, date: string },
              @Req() req:any,
            ): Promise<{ message: string }> {
            return this.workoutService.createRecord(body.exercise, Number(body.duration), body.count, body.date, req.user._id, req.user.username);
          }
  
  @Post('/get_ranking')
  getRanking(@Query('exercise') exercise: string , @Body('duration') duration: string): Promise<{ username: string, score: number}[]>{
    try {
      return this.workoutService.getRanking(exercise, duration)
    } catch (error){
      console.error(error.message);
      throw new Error('랭킹을 가져 오는데 실패!');
    }
  }
}
