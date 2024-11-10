import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { MessageService } from '../message/message.service';

import {Room, RoomSchema} from './schema/room.schema';
import {Message, MessageSchema} from '../message/schema/message.schema';
import {User, UserSchema} from '../../auth/schemas/user.schema';
import {MongooseModule} from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:Room.name, schema:RoomSchema},
      {name:Message.name, schema:MessageSchema},
      {name:User.name, schema:UserSchema},
    ])
  ],
  providers: [RoomService, MessageService],
  controllers: [RoomController],
  exports:[RoomService]
})
export class RoomModule {}
