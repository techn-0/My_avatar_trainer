import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkOut } from './schemas/workout.schema';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutService {
  constructor(@InjectModel(WorkOut.name) private workoutModel: Model<WorkOut>) {}

  // 특정 유저의 운동 기록 조회
  async findWorkoutsByUser(userId: string): Promise<WorkOut[]> {
    return this.workoutModel.find({ userId }).exec();  // userId로 필터링하여 반환
  }

  // 새로운 운동 기록 생성
  async createWorkout(createWorkoutDto: CreateWorkoutDto): Promise<WorkOut> {
    const workout = new this.workoutModel(createWorkoutDto);
    return workout.save();  // 새로운 운동 기록 저장
  }
}
