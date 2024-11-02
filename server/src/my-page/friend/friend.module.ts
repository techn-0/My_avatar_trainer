import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { Friend, FriendSchema } from './schemas/friend.schema';
import { User, UserSchema } from '../../auth/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports:[
        MongooseModule.forFeature([
            {name:Friend.name, schema:FriendSchema},
            {name:User.name, schema:UserSchema}
        ])
    ],
    providers:[FriendService],
    controllers:[FriendController],
    exports: [FriendService],
})
export class FriendModule {}
