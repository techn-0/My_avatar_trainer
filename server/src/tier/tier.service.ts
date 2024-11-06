import { InjectQueue } from '@nestjs/bull';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { WorkOut } from 'src/workout/schemas/workout.schema';

@Injectable()
export class TierService {
  constructor(
    @InjectModel(WorkOut.name) private workoutModel: Model<WorkOut>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectQueue('tier-update') private tierQueue: Queue,
  ) {}

  //티어 배정을 위한 전체 유저 점수 계산
  private async calUserScore(): Promise<Array<{ userId: string; score: number }>>{
      try{
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekDateString = lastWeek.toISOString().split('T')[0];

        const workouts = await this.workoutModel.aggregate([
          {
            $match: {
              date: { $gte: lastWeekDateString },
            },
          },
          {
            //날짜에서 시간 부분을 제거하여 "YYYY-MM-DD" 형식으로 만듦
            $addFields: {
              dateOnly: { $substr: ['$date', 0, 10] },
            },
          },
          {
            // 동일 사용자 및 날짜 기준으로 기록을 그룹화하고, 최대 운동 횟수를 추출
            $group: {
              _id: {
                userId: '$userId',
                date: '$dateOnly',
                exercise: '$exercise',
                duration: '$duration',
              },
              count: { $max: '$count' },
            },
          },
          {
            // 사용자별로 모든 운동 횟수를 배열로 수집
            $group: {
              _id: {
                userId: '$_id.userId',
                exercise: '$_id.exercise',
                duration: '$_id.duration',
              },
              records: {
                $push: {
                  count: '$count',
                  duration: '$_id.duration',
                  date: '$_id.date',
                },
              },
            },
          },
        ]);
        if (workouts.length === 0) {
          throw new NotFoundException('티어 배정에 필요한 기록이 없습니다!');
        }

        const userScoresMap = new Map();
        workouts.forEach((workout) => {
          const userIdStr = workout._id.userId.toString(); // ObjectId를 문자열로 변환
          const { records } = workout;
          const duration = workout._id.duration;
          const totlacount = records.reduce(
            (sum, record) => sum + record.count,
            0,
          );
          const averageCount = totlacount / records.length;
          const weight = 0.1 + 0.15 * records.length; // 가중치 계산
          const score = averageCount * weight * (1 / Math.log(duration + 1));

          if (userScoresMap.has(userIdStr)) {
            userScoresMap.set(userIdStr, userScoresMap.get(userIdStr) + score);
          } else {
            userScoresMap.set(userIdStr, score);
          }
        });
        const finalScores = Array.from(userScoresMap, ([userId, score]) => ({
          userId,
          score,
        }));
        finalScores.sort((a, b) => b.score - a.score);
        return finalScores;
      } catch(error){
        throw new Error('티어 배정을 위한 유저 점수를 계산하는데 오류가 발생했습니다!');
      }
  }
  
  async addUpdateTierWork(): Promise<void>{
    console.log('티어 업데이트 작업 큐 추가!');
    await this.tierQueue.add('tier-update-job',{});
  }
  
  async updateAllUserTier(): Promise<void> {
    console.log('티어 업데이트 !!!');
    try {
      const finalScores = await this.calUserScore();
      const totalUsers = finalScores.length;
      
      const tierPercentages = [
        { tier: 1, maxPercentile: 20 },
        { tier: 2, maxPercentile: 40 },
        { tier: 3, maxPercentile: 60 },
        { tier: 4, maxPercentile: 80 },
        { tier: 5, maxPercentile: 100 },
      ];

      const usersWithTiers = [];

      for(let i =0; i < totalUsers; i++){
        const user = finalScores[i];
        const percentile = (( i + 1) / totalUsers) * 100;
        
        const userTier = tierPercentages.find(tierInfo => percentile <= tierInfo.maxPercentile);
        usersWithTiers.push({
          userId: user.userId,
          score: user.score,
          tier: userTier.tier,
          percentile: Math.round(percentile),
        });
      }
      const bulkOperations = usersWithTiers.map((user) => ({
        updateOne: {
          filter: { _id: user.userId },
          update: { $set: { tier: user.tier, percentile: user.percentile } },
        },
      }));

      await this.userModel.bulkWrite(bulkOperations);
    } catch (error) {
      console.error(error);
      throw new Error('티어를 가져오는 데 오류가 발생했습니다.');
    }
  }

  async getSomeoneTier(username: string): Promise<{ tier: number, percentile: number }> {
    const user = await this.userModel.findOne({ username }).select('tier percentile');
    return { tier: user.tier, percentile: user.percentile };
  }

  async getTier(userId: string): Promise<{ tier: number }> {
    const user = await this.userModel.findById(userId).select('tier');
    return { tier: user.tier };
  }
}