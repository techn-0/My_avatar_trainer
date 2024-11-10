import { Module } from '@nestjs/common';

import { FriendModule } from './friend/friend.module';
import { MessageModule } from './message/message.module';
import { CommentModule } from './comment/comment.module';

@Module({
  controllers: [],
  providers: [],
  imports: [FriendModule, MessageModule, CommentModule],
})
export class MyPageModule {}
