import { Controller, Post, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('chatRoom')
export class MessageController {
    constructor( private readonly messageService:MessageService){}

    @Post('create')
    async getOrCreateRoomData(@Body()body:{user1:string, user2:string}){
        const {user1, user2} = body;

        const roomName = [user1, user2].sort().join('&');

        return await this.messageService.getOrCreateRoomData(roomName);

    }
    
    @Post('add')
    async addMessage(@Body()body:{roomName, sender, content}){
        const {roomName, sender, content} = body;

        return await this.messageService.addMessage(roomName, sender, content);
    }
    
    @Post(':roomName')
    async getMessage(@Param('roomName') roomName:string){
        return await this.messageService.getMessages(roomName);
    }



}
