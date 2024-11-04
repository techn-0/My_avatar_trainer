import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Friend } from './schemas/friend.schema';
import { User } from '../../auth/schemas/user.schema';
import { NotFound } from '@aws-sdk/client-s3';

@Injectable()
export class FriendService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Friend.name) private friendModel: Model<Friend>) {}

    // 친구 추가하기 위한 코드이다.
    // friendUserId 가 User DB에 존재하는지 확인하고, 추가할 수 있도록 한다.
    async addFriend( userId: string, friendUserId:string){
        const existingFriendship = await this.friendModel.findOne({
            $or:[
                {userId, friendUserId},
                {userId:friendUserId, friendUserId : userId},
            ]
        });

        if(existingFriendship){
            throw new ConflictException('Friendship already exists');
        }

        const newFriend = new this.friendModel({
            userId,
            friendUserId,
            status:'pending',
        });

        return await newFriend.save();
    }

    // 친구 요청을 받아들이기 위해 요청하는 코드이다.
    async acceptFriendRequest(userId:string, friendUserId:string){
        const friendship =  await this.friendModel.findOneAndUpdate(
            {
                $or:[
                    {userId, friendUserId, status:'pending'},
                    {userId:friendUserId, friendUserId:userId, status:'pending'},
                ]
            },
            {status:'accepted'},
            { new : true }
        );

        if(!friendship){
            throw new NotFoundException('Friendship not found');
        }

        return friendship

    }

    // 친구 요청을 거절하기 위한 코드이다.
    // 상대방이 친구 요청을 거절했을 때, 6시간 이후에 재요청 가능하다.
    async declineFriendRequest(userId:string, friendUserId:string){
        const friendship = await this.friendModel. findOneAndUpdate(
            {
                userId,
                friendUserId,
                status:'pending',
            },
            {
                status:'declined',
                declineExpiry: new Date(Date.now() + 6 * 60 * 60 * 1000 )
            },
            { new : true }

        )

        if(!friendship){
            throw new NotFoundException('Friend request Not Found');
        }

        return {
            message:'Friend request declined',
            friendship,
        }
    }


    // 친구 목록에서 친구를 삭제하기 위한 코드이다.
    async removeFriend(userId:string, friendUserId:string){
        const removeFriendship = this.friendModel.findOneAndDelete({
            $or:[
                {userId, friendUserId, status:'accepted'},
                {userId:friendUserId, friendUserId:userId, status:'accepted'},
            ]
        });

        if(!removeFriendship){
            throw new NotFoundException('User does not exist');
        }

        return removeFriendship;

    }

    // username을 가진 사용자가 존재하는지 확인하는 코드이다.
    async findUser(userId:string){
        const user = await this.userModel.findOne({
           username:userId
        }).select('username')

        
        if(!user){
            throw new NotFoundException('User does not Exist');
        }

        return user


    }

    // 사용자 목록에서 친구가 존재하는지 확인하는 코드이다.
    async findFriend(userId:string, friendUserId:string){
        const friend = await this.friendModel.findOne({
            $or:[
                {userId, friendUserId},
                {userId:friendUserId, friendUserId:userId},
            ]
        })

        if(!friend){
            throw new NotFoundException('Friend does not exist');
        }

        const otherUser = friend.userId === userId ? friend.friendUserId: friend.userId;

        return otherUser
    }


    // userId의 친구목록을 가져오는 함수이다.
    async getFriends(userId:string){
        const friends = await this.friendModel.find({
            $or:[
                {userId, status:'accepted'},
                {friendUserId:userId, status:'accepted'}
            ],
        });

        const otherUsers = [];
        for (const friend of friends){
            const otherUser = friend.userId === userId ? friend.friendUserId : friend.userId;
            otherUsers.push(otherUser);
        }

        return otherUsers;

    }

    // userId가 보낸 요청을 가져오는 함수이다. 
    async getSendRequest(userId:string){
        const friends = await this.friendModel.find({
                userId : userId,
                status:'pending'
        }).select('friendUserId');

        return friends;


    }

    // userId에게 들어온 요청을 가져오는 함수이다.
    async getRequest(userId:string){
        const friends = await this.friendModel.find({
                friendUserId:userId, 
                status:'pending'
        }).select('userId');

        return friends;

    }


}
