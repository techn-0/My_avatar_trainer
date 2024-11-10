import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

@Schema()
export class Room extends Document{
    @Prop({required:true, unique:true})
    roomName:string;

    @Prop({required:true, default:[]})
    users:string[];

}

export const RoomSchema = SchemaFactory.createForClass(Room);

