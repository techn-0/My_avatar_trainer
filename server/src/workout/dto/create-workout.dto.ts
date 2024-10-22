import { IsNotEmpty } from "class-validator";

export class WorkOutDto {
    
    @IsNotEmpty()
    exercise: string;
    
    duration: string;
    
    count: string;
    
    date: string;
}