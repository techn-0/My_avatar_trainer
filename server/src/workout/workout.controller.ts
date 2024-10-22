import { Controller, UseGuards, Get, Post, Body } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('workout')
// @UseGuards(AuthGuard())
export class WorkoutController {
    constructor(private workOutService: WorkoutService){}

    @Post('/start_exercise')
    getRecord(@Body() body: { exercise: string, duration: string}): Promise<{ count: number; date: Date }> {
        return this.workOutService.getRecord(body.exercise, body.duration);
    }
}
