import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import { PassportStrategy } from "@nestjs/passport";
import { Model } from "mongoose";
import { ExtractJwt, Strategy } from "passport-jwt";
import axios from 'axios';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, 
    ){
        super({
            secretOrKey : 'My trainer hides his identity',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }
    
    async validate(payload){
        const { id } = payload;
        // DB에 해당 User가 존재하는지 확인한다.
        const user: User = await this.userModel.findOne({username : id});
        // 소셜 미디어를 통해서 로그인한 계정이면 user 정보를 반환한다.
        if (payload.accessToken){
            try{
            const response = await axios.get(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${payload.accessToken}`
            )
            const user = response.data
            return user;
        }catch(error){
            console.error('Error verifying token', error);
            return null;
        }
        }


        if(!user){
            throw new UnauthorizedException('회원이 아닙니다!');
        }

        return user;
    }
}