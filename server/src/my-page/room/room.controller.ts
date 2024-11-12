import { Controller,  Body, Param, Post, Patch } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
    constructor (private readonly roomService:RoomService){}

    @Post('create')
    async createRoom(@Body()body:{roomName:string, userIdList:string[]}){
        const {roomName, userIdList} = body;
        return this.roomService.createRoom(roomName, userIdList);
    }

    @Post('get')
    async getRoomName(@Body()body:{roomName:string}){
        const {roomName} = body;
        return this.roomService.getRoomName(roomName);
    }

    @Post('checkRoom/:roomName')
    async checkRoomExistence(@Param('roomName')roomName:string){
        return this.roomService.checkRoomExistence(roomName);
    }

    @Patch('addUser/:roomName')
    async addUserToRoom(@Param('roomName')roomName:string,@Body('userId')userId:string ){
        return this.roomService.addUserToRoom(roomName, userId);
    }

}
