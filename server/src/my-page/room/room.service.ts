import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Room} from './schema/room.schema';

@Injectable()
export class RoomService {
    constructor(@InjectModel(Room.name) private roomModel:Model<Room>){}

    async getOrCreateRoom(roomName:string):Promise<Room>{
        let room = await this.roomModel.findOne({roomName});

        if(!room){
            room = new this.roomModel({roomName})
            await room.save();
        }

        return room;
    }

    async updateRoomUsers(roomName:string,users:string[]){
        await this.roomModel.updateOne({roomName}, {users});
    }
}
