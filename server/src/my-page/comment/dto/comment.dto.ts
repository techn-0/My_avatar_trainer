import {IsString, IsDate, IsOptional} from 'class-validator';
import { Type } from 'class-transformer';

export class CommentDto{
    @IsString()
    ownerId:string;

    @IsString()
    userId:string;

    @IsOptional()
    @IsString()
    profilePic?:string;

    @IsString()
    comment:string;

    // @IsDate()
    // @Type(() => Date)
    // createdAt:Date;

}