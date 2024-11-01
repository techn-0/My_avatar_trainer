import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkOut } from './schemas/workout.schema';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { last } from 'rxjs';
import { type } from 'os';

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
        throw new UnauthorizedException('기록 저장 실패!');
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
  
  지난 일주일 간의 기록을 기반으로 가중치를 적용하여 
  각 유저의 최종 점수를 계산하고 상위 5명의 기록을 반환하는 코드입니다.  
  각 유저의 동일 날짜의 여러 기록 중 카운트가 가장 높은 기록만 고려합니다.
  */
  async getRanking(exercise: string, duration: string) : Promise<{ username: string, score: number}[]>{
    try{
      //7일전 날짜 구하기
      const lastWeek = new Date();// 예: 2024-10-28T12:34:56.789Z
      lastWeek.setDate(lastWeek.getDate() -7);
      const workouts = await this.workoutModel.aggregate([
        {
          $match: {
            exercise,
            duration: parseFloat(duration),
            date: { $gte: lastWeek.toISOString().split('T')[0] },
          },
        },
        {
          // 날짜에서 시간 부분을 제거하기 위해 date 문자열을 부분 추출
          $addFields: {
            dateOnly: { $substr: ["$date", 0, 10] } // "YYYY-MM-DD" 형식으로 자르기
          }
        },
        {
          $group: {
            _id: { userId: '$userId', date: '$dateOnly'},
            count: { $max: '$count'},
          }
        },
        {
          $group: {
            _id: '$_id.userId',
            records: { $push: '$count'},
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          }
        },
        {
          $unwind: "$userDetails"
        }
      ]);
      if (workouts.length === 0){
        throw new Error("랭킹이 존재하지 않습니다");
      }
      console.log(workouts)
      const weigthedScores = workouts.map((workout) => {
        const {records, userDetails } = workout;
        const totalCount = records.reduce((sum, count) => sum + count, 0);
        const averageCount = records.length ? totalCount / records.length : 0;

        const weightTalble = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1];
        const weight = weightTalble[records.length -1];
        const finalScore = averageCount * weight;

        return {username: userDetails.username , score: finalScore};
      });
      console.log(weigthedScores.sort((a, b) => b.score - a.score));
      return weigthedScores.slice(0,5);
    } catch (error){
      console.error(error);
      throw new Error('랭킹을 가져오는데 오류가 발생!');
    }
  }
}
