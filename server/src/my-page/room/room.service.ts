import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from './schema/room.schema';

interface RoomData {
    roomName: string;
    userIdList: string[];
  }
@Injectable()
export class RoomService implements OnModuleInit{
    private rooms: {[key:string]:RoomData} = {};

    constructor(@InjectModel(Room.name) private roomModel:Model<Room>){}

    async onModuleInit(){
        await this.loadRoomsIntoMemory();
    }

    async loadRoomsIntoMemory(){
        const rooms = await this.roomModel.find();
        rooms.forEach((room)=>{
            this.rooms[room.roomName] = {
                roomName:room.roomName, 
                userIdList:room.userIdList,
            };
        });
        console.log('Rooms successfully loaded into memory', this.rooms);
    }

    getRoomsInMemory(){
        return this.rooms;
    }
    
    async createRoom(roomName:string, userIdList:string[]):Promise<Room>{
        return new this.roomModel({roomName, userIdList}).save();
    }

    async getRoomName(roomName:string){
        const room = await this.roomModel.findOne({roomName}).select('roomName').exec();
        return room ? room.roomName: null ;
    }

    async checkRoomExistence(roomName:string){
        const roomExists = await this.roomModel.findOne({roomName});
        return {exists:roomExists};
    }

    async addUserToRoom(roomName:string, userId:string):Promise<Room|null>{
        return this.roomModel
        .findOneAndUpdate({roomName}, {$addToSet:{userIdList:userId}}, {new:true})
        .exec();
    }


}

