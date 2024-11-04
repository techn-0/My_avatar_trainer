import { Module } from '@nestjs/common';
import {ChatGateway} from './chat.gateway';
import {MultiplayerGateway} from './multiplayer.gateway';

@Module({
    providers:[
        ChatGateway,
        MultiplayerGateway,
    ],
    exports : [
        ChatGateway,
        MultiplayerGateway,
    ]
})


export class GatewayModule{}
