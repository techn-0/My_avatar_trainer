import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageSchema } from './schema/message.schema'
import {User, UserSchema} from '../../auth/schemas/user.schema'

@Injectable()
export class MessageService {
    constructor(
                @InjectModel(Message.name) private messageModel:Model<Message>,
                @InjectModel(User.name) private userModel:Model<User>
            ){}

    async getOrCreateRoom(roomName:string){

        const messages = await this.getMessages(roomName);

        if(messages.length ===0){
            await this.addMessage(roomName, 'System', '방이 생성 됐습니다.');
        }

        return messages;

    }

    async addMessage(roomName:string, sender:string, content:string):Promise<Message>{
        const userExists = await this.userModel.exists({username:sender});
        if(!userExists){
            throw new NotFoundException(`Sender ${sender} does not exist`);
        }

        const message = new this.messageModel({roomName, sender, content});
        return await message.save();

    }

    async getMessages(roomName:string):Promise<Message[]>{
        return await this.messageModel
        .find({roomName})
        .sort({timestamp:1})
        .exec();
    }

    



}
