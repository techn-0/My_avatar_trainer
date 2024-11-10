import { Module } from '@nestjs/common';

import { FriendModule } from './friend/friend.module';
import { MessageModule } from './message/message.module';
import { CommentModule } from './comment/comment.module';
import { RoomModule } from './room/room.module';

@Module({
  controllers: [],
  providers: [],
  imports: [
    FriendModule,
    MessageModule,
    CommentModule,
    RoomModule
  ]
})
export class MyPageModule {}
