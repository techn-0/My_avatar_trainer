import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { FriendModule } from './friend/friend.module';
import { MessageModule } from './message/message.module';

import { UserSchema, User } from '../auth/schemas/user.schema';
import { FriendSchema, Friend } from './friend/schemas/friend.schema';
// import { MessageSchema, Message } from './schemas/message.schema';
import { CommentModule } from './comment/comment.module';

@Module({
  controllers: [],
  providers: [],
  imports: [
    // Used to make dependency Injection available

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Friend.name, schema: FriendSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    FriendModule,
    MessageModule,
    CommentModule,
  ],
})
export class MyPageModule {}
