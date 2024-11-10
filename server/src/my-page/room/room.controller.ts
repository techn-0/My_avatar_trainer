import { Controller, Res, Post, Get, Param, Body, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { RoomService } from './room.service';
import { MessageService } from '../message/message.service';

@Controller('chat')
export class RoomController {
    constructor(private readonly roomService:RoomService,
        private readonly messageService:MessageService
    ){}

    @Post('joinRoom')
    async joinRoom( @Body()body:{user1:string, user2:string}){
        //방이 있다면 방 정보를 가져오고, 없다면 방 정보를 형성한다.
        const {user1, user2} = body;
        const roomName = [user1, user2].sort().join('&');
        
        const room = await this.roomService.getOrCreateRoom(roomName);
        
        if(!room){
            throw new NotFoundException('Room not found!');
        }

        // 형성된 방의 메시지 정보를 가져온다.
        const messages = await this.messageService.getMessages(roomName);

        return {room, messages};
        // res.redirect(`/chatroom/${roomName}`);
    }
}
