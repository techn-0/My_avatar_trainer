import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestbookDto } from './dto/guestbook.dto';
import { User } from '../../auth/schemas/user.schema';

@Injectable()
export class GuestbookService {
    constructor(@InjectModel(User.name) private userModel : Model<User>){}

    async getPageOwner(ownerId:string){
        const user = await this.userModel.findOne({'username': ownerId}).exec();

        if(!user){
            return null;
        }
        
        return {
           ownerId:user.username,
           tier:user.tier,
           profilePic:user.profilepic,
        //    recLoginTime:user.recLoginTime,
        }
    
    }

}
