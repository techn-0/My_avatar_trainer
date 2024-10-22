import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WorkOut } from './schemas/workout.schema';
import { Model } from 'mongoose';
import { WorkOutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutService {
    constructor(
        @InjectModel(WorkOut.name) private workoutModel: Model<WorkOut>,
    ){}

    async getRecord( exercise: string, duration: string ): Promise<{ count: number, date: Date}>{
        try{
            const workout = await this.workoutModel
            .findOne({exercise, duration})
            .sort({count: -1})
            .exec();

            if( !workout || workout.count == null || workout.date == null){
                throw new Error('해당 종목이나 운동시간에 해당하는 기록이 없습니다!');
            }
            
            return {
                count: workout.count,
                date: workout.date,
            };
        } catch (error){
            throw new Error(`기록을 가져오는데 실패했습니다! : ${error.message}`);
        }
    }
}
