import { Injectable } from '@nestjs/common';
import { FriendService } from './friend/friend.service';
import { MessageService } from './message/message.service';


@Injectable()
export class MyPageService {
    constructor(
        private readonly friendService: FriendService,
        private readonly messageService: MessageService,
        // private readonly userService: UserService,
        // private readonly pokeService: PokeService,
      ) {}

    //   async getUserProfile(userId: string) {
    //     return this.userService.findById(userId);
    //   }

    //   async getUserFriends(userId: string) {
    //     return this.friendService.getFriendsByUserId(userId);
    //   }
    
    //   async getUserPokes(userId: string) {
    //     return this.pokeService.getReceivedPokes(userId);
    //   }
    
    //   async getUserMessages(userId: string) {
    //     return this.messageService.getMessagesByUserId(userId);
    //   }
}
