import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Room extends Document{
    @Prop({required:true, unique:true})
    roomName:string;

    @Prop({type:[String], ref:'User', default:[]})
    userIdList:string[]

}

export const RoomSchema = SchemaFactory.createForClass(Room);
