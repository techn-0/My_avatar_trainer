import { IsNotEmpty } from 'class-validator';

export class CreateWorkoutDto {
  @IsNotEmpty()
  exercise: string;  // 운동 종목

  @IsNotEmpty()
  duration: number;  // 운동 시간

  @IsNotEmpty()
  count: number;  // 운동 횟수

  @IsNotEmpty()
  date: Date;  // 운동 날짜

  @IsNotEmpty()
  userId: string;  // 유저 ID
}
