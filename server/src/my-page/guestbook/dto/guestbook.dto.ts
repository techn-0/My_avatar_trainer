import { IsString, IsOptional } from 'class-validator'

export class GuestbookDto{
    @IsString()
    ownerId:string;

    @IsString()
    tier:number;

    @IsOptional()
    @IsString()
    profilePic?:string;

    @IsOptional()
    @IsString()
    recLoginTIme?:string;
    
    
    // @IsString()
    // userId:string;

    // @IsString()
    // comment:string;
    
}
