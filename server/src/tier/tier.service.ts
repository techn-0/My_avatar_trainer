import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { WorkOut } from 'src/workout/schemas/workout.schema';
@Injectable()
export class TierService {
  constructor(
    @InjectModel(WorkOut.name) private workoutModel: Model<WorkOut>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getTier(userId: string): Promise<{ tier: number }> {
    try {
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
            _id: '$_id.userId',
            records: {
              $push: {
                count: '$count',
                exercise: '$_id.exercise',
                duration: '$_id.duration',
              },
            },
          },
        },
      ]);
      if (workouts.length === 0) {
        throw new NotFoundException('티어 배정에 필요한 기록이 없습니다!');
      }
      for (let i = 0; i < workouts.length; i++) {
        console.log('기록임\n\n', workouts[i]);
      }
      const weightedScores = workouts.map((workout) => {
        const userIdStr = workout._id.toString(); // ObjectId를 문자열로 변환
        const { records } = workout;

        // 전체 점수 계산 (각 운동에 대한 점수를 합산)
        const totalScore = records.reduce((sum, record) => {
          const { count, duration } = record;
          // 운동 횟수와 운동 시간에 따라 점수 계산 (일주일 동안 운동한 횟수에 대한 가중치 적용)
          const weightTable = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1];
          const weight =
            weightTable[Math.min(records.length - 1, weightTable.length - 1)]; // 기록의 길이에 따라 가중치 선택
          const averageCount = count * weight; // 평균 횟수에 대한 가중치 적용

          // 운동 시간에 대한 가중치를 로그 스케일로 적용하여 최종 점수 계산
          const score = averageCount * (1 / Math.log(duration + 1));
          return sum + score;
        }, 0);

        return { userId: userIdStr, score: totalScore }; // 사용자 ID와 종합 점수를 반환
      });

      // 점수에 따라 내림차순 정렬
      weightedScores.sort((a, b) => b.score - a.score);

      // 전체 사용자 수
      const totalUsers = weightedScores.length;

      // 티어별 비율 설정
      const tierPercentages = [
        { tier: 1, percentage: 15 },
        { tier: 2, percentage: 20 },
        { tier: 3, percentage: 30 },
        { tier: 4, percentage: 20 },
        { tier: 5, percentage: 15 },
      ];

      // 사용자들에게 티어 할당
      let currentIndex = 0;
      const usersWithTiers = [];

      //티어 배정
      for (const tierInfo of tierPercentages) {
        const { tier, percentage } = tierInfo;
        //전체 유저 몇 명이 해당 티어에 속할지 계산
        const numberOfUsersInTier = Math.round((percentage / 100) * totalUsers);

        for (
          let i = 0;
          i < numberOfUsersInTier && currentIndex < totalUsers;
          i++
        ) {
          usersWithTiers.push({
            userId: weightedScores[currentIndex].userId,
            score: weightedScores[currentIndex].score,
            tier: tier,
          });
          currentIndex++;
        }
      }

      // 남은 사용자 처리 (총합이 모자랄 수 있음)
      while (currentIndex < totalUsers) {
        usersWithTiers.push({
          userId: weightedScores[currentIndex].userId,
          score: weightedScores[currentIndex].score,
          tier: tierPercentages[tierPercentages.length - 1].tier, // 가장 낮은 티어로 할당
        });
        currentIndex++;
      }

      // 사용자들의 티어를 업데이트
      const bulkOperations = usersWithTiers.map((user) => ({
        updateOne: {
          filter: { _id: user.userId },
          update: { $set: { tier: user.tier } },
        },
      }));

      await this.userModel.bulkWrite(bulkOperations);

      // 요청한 사용자의 티어 정보를 DB에서 조회
      const user = await this.userModel.findById(userId).select('tier');
      console.log(user);
      if (!user) {
        throw new NotFoundException('사용자의 티어를 찾을 수 없습니다!');
      }

      return { tier: user.tier };
    } catch (error) {
      console.error(error);
      throw new Error('티어를 가져오는 데 오류가 발생했습니다.');
    }
  }

  // async getSomeoneTier(userId: string): Promise< {tier: number} >{
  //   const user = await this.userModel.findById(userId).select('tier');

  //   return
  // }
}
