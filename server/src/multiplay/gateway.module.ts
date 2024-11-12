import { Module } from '@nestjs/common';
import {ChatGateway} from './chat.gateway';
import {MultiplayerGateway} from './multiplayer.gateway';

import {MongooseModule} from '@nestjs/mongoose';
import {Message, MessageSchema} from '../my-page/message/schema/message.schema'
import {User, UserSchema} from '../auth/schemas/user.schema';
import {MessageService} from '../my-page/message/message.service'
import { FriendStatusGateway } from './friend-status.gateway';

@Module({
    imports:[
        MongooseModule.forFeature([
            {name:Message.name, schema:MessageSchema},
            {name:User.name, schema:UserSchema}
        ])
    ]
    ,
    providers:[
        ChatGateway,
        MultiplayerGateway,
        FriendStatusGateway,
        MessageService,
    ],
    exports : [
        ChatGateway,
        MultiplayerGateway,
        FriendStatusGateway,
    ]
})


export class GatewayModule{}
