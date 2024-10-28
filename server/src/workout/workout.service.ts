import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkOut } from './schemas/workout.schema';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutService {
  constructor(
    @InjectModel(WorkOut.name) private workoutModel: Model<WorkOut>
  ) {}

  // userId와 duration에 따른 운동 기록 조회
  async findWorkoutsByUserAndDuration(
    userId: string,
    duration: number,
  ): Promise<WorkOut[]> {
    return this.workoutModel.find({ userId, duration }).exec(); // userId와 duration으로 필터링
  }

  async getRecord(
    userId: string,
    exercise: string,
    duration: number,
  ): Promise<{ count?: number; date?: string; message?: string }> {
    try {
      const workout = await this.workoutModel
        .findOne({ userId, exercise, duration })
        .sort({ count: -1 })
        .exec();

      if (!workout || workout.count == null || workout.date == null) {
        return { message : '현재 선택한 운동종목, 운동시간에 해당하는 과거 기록이 없습니다!'};
      }
      
      return {
        count: workout.count,
        date: workout.date,
      };
    } catch (error) {
      throw new Error(`기록을 가져오는데 실패했습니다! : ${error.message}`);
    }
  }
  
  async createRecord( 
    exercise: string,
    duration: number,
    count: number,
    date: string,
    userId : string
  ) : Promise<{ message : string}>{
    try{
      await this.workoutModel.create({
            exercise,
            duration,
            count,
            date,
            userId
        });
        return { message : '기록 저장 성공!'};    
    } catch (error){
        console.log(error.message);
        throw new Error('기록 저장 실패!');
    }
  }

  /*
  일: 가중치
  1: 0.1
  2: 0.25
  3: 0.4
  4: 0.55
  5: 0.7
  6: 0.85
  7: 1
  
  지난 일주일 간의 카운트 횟수를 합치고 기록이 있는 만큼을 나눠서, 가중치를 곱해서
  평균을 구하려는데 우선 기록이 평균을 어떻게 구하지? 기록이 없는것과 기록이 있음을 어떻게 구하지?
  */
  async getRanking(exercise: string, duration: number) : Promise<WorkOut[]>{
    try{
      //7일전 날짜 구하기
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() -7);
      const workouts = await this.workoutModel.aggregate([
        {
          $match: {
            exercise,
            duration,
            date: { $gte: lastWeek},
          },
        },
        { 
          $sort: {date: 1, count: -1},
        },
        {
          $group: {
            _id: { userId: '$userId', date: '$date'},
            count: { $first: '$count'},
          }
        },
        {
          $group: {
            _id: '$_id.userId',
            records: { $push: '$count'},
          }
        }
      ]);
      
      if (workouts.length === 0){
        throw new Error("랭킹이 존재하지 않습니다");
      }
      
      const weigthedScores = workouts.map((workout) => {
        const { _id: userId, records } = workout;
        let totalScore = 0;
        let totlaWeight = 0;

        records.forEach((count, index) => {
          const weight = 0.1 + 0.15 * index;
          totalScore += count * weight;
          totlaWeight += weight;
        });
    
        return { userId, score: totlaWeight ? totalScore / totlaWeight : 0 };
      });
    } catch (error){
      throw new error('랭킹을 가져오는데 오류가 발생!');
    }
  }
}
