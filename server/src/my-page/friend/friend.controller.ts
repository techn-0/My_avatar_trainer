import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Friend } from './schemas/friend.schema';
import { FriendService } from './friend.service';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  // userId가 다른 이용자를 찾기 위한 코드이다.
  @Get('findUser')
  async findUser(@Query() query: { userId: string }) {
    const { userId } = query;
    const user = await this.friendService.findUser(userId);

    if (user) {
      return {
        message: 'User exists',
        user,
      };
    } else {
      return {
        message: 'User does not exist',
      };
    }
  }

  // userId가 friendId를 추가하기 위한 코드이다.
  @Post('add')
  async addFriend(@Body() body: { userId: string; friendUserId: string }) {
    const { userId, friendUserId } = body;
    return this.friendService.addFriend(userId, friendUserId);
  }

  // userId가 friendId의 친구 추가 요청을 받아들이기 위한 코드이다.
  @Post('accept')
  async acceptFriendRequest(
    @Body() body: { userId: string; friendUserId: string },
  ) {
    const { userId, friendUserId } = body;
    return this.friendService.acceptFriendRequest(userId, friendUserId);
  }

  // userId가 friendId의 친구 추가 요청을 거절하기 위한 코드이다.
  @Post('decline')
  async declineFriendRequest(
    @Body() body: { userId: string; friendUserId: string },
  ) {
    const { userId, friendUserId } = body;
    return this.friendService.declineFriendRequest(userId, friendUserId);
  }

  //userId가 자기 자신의 친구 목록에서 friendUserId를 찾기 위한 코드이다.
  @Get('findFriend')
  async findFriend(@Query() query: { userId; friendUserId }) {
    const { userId, friendUserId } = query;
    const friendUsername = await this.friendService.findFriend(
      userId,
      friendUserId,
    );

    if (friendUsername) {
      return {
        message: 'Friend exists',
        friendUsername,
      };
    } else {
      return {
        message: 'Friend does not exist',
        friendUsername,
      };
    }
  }

  // userId가 friendId를 삭제하기 위한 코드이다.
  @Delete('delete')
  async removeFriend(@Body() body: { userId: string; friendUserId: string }) {
    const { userId, friendUserId } = body;
    return this.friendService.removeFriend(userId, friendUserId);
  }

  // userId의 모든 친구 목록을 가져오기 위한 코드이다.
  @Get('list')
  async getFriends(@Query('userId') userId: string) {
    return this.friendService.getFriends(userId);
  }

  // userId가 보낸 요청을 가져오기 위한 코드이다.
  @Get('sendRequestList')
  async getSendRequest(@Query('userId') userId: string) {
    return this.friendService.getSendRequest(userId);
  }

  // userId에게 들어온 요청을 가져오기 위한 코드이다.
  @Get('pendingRequestList')
  async getRequest(@Query('userId') userId: string) {
    return this.friendService.getRequest(userId);
  }
}
