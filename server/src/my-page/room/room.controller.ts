import { Controller, Res, Post, Get, Param, Body, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { RoomService } from './room.service';
import { MessageService } from '../message/message.service';

@Controller('chat')
export class RoomController {
    constructor(private readonly roomService:RoomService,
        private readonly messageService:MessageService
    ){}

    @Post('join')
    async getOrCreateRoom( @Body()body:{user1:string, user2:string}){
        const {user1, user2} = body;
        const roomName = [user1, user2].sort().join('&');
        
        const room = await this.roomService.getOrCreateRoom(roomName);
        
        if(!room){
            throw new NotFoundException('Room not found!');
        }
        
        const messages = await this.messageService.getMessages(roomName);

        return {room, messages};
        // res.redirect(`/chatroom/${roomName}`);
    }
}
