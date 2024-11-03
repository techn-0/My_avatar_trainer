import { IsString, IsOptional, IsIn} from 'class-validator';

export class FriendCredentialDto {
    @IsString()
    userId:string;

    @IsString()
    friendUserId:string;

    //특정 문자열만 지정할 수 있는 decorator를 쓴다.
    @IsOptional()
    @IsIn(['pending', 'accepted', 'rejected'])
    status?:string;
}