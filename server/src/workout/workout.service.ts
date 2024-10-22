import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkOut } from './schemas/workout.schema';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutService {
  constructor(
    @InjectModel(WorkOut.name) private workoutModel: Model<WorkOut>,
  ) {}

  // userId와 duration에 따른 운동 기록 조회
  async findWorkoutsByUserAndDuration(
    userId: string,
    duration: number,
  ): Promise<WorkOut[]> {
    return this.workoutModel.find({ userId, duration }).exec(); // userId와 duration으로 필터링
  }

  // 새로운 운동 기록 생성
  async createWorkout(createWorkoutDto: CreateWorkoutDto): Promise<WorkOut> {
    const workout = new this.workoutModel(createWorkoutDto);
    return workout.save(); // 새로운 운동 기록 저장
  }

  async getRecord(
    exercise: string,
    duration: string,
  ): Promise<{ count: number; date: Date }> {
    try {
      const workout = await this.workoutModel
        .findOne({ exercise, duration })
        .sort({ count: -1 })
        .exec();

      if (!workout || workout.count == null || workout.date == null) {
        throw new Error('해당 종목이나 운동시간에 해당하는 기록이 없습니다!');
      }

      return {
        count: workout.count,
        date: workout.date,
      };
    } catch (error) {
      throw new Error(`기록을 가져오는데 실패했습니다! : ${error.message}`);
    }
  }
}
