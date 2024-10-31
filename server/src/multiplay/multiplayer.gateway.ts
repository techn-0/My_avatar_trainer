import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Room {
  host: string;
  users: string[];
  options: {
    duration: string;
    exercise: string;
  };
  readyStates: { [username: string]: boolean };
}

@WebSocketGateway({ cors: true })
export class MultiplayerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private rooms: { [key: string]: Room } = {};

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    Object.keys(this.rooms).forEach((roomName) => {
      const room = this.rooms[roomName];
      room.users = room.users.filter((user) => user !== client.data.username);
      delete room.readyStates[client.data.username];

      if (room.users.length === 0) {
        delete this.rooms[roomName];
      } else {
        console.log(`Emitting updateUsers for room ${roomName}:`, room.users);
        this.server.to(roomName).emit('updateUsers', room.users);
      }
    });
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    client: Socket,
    payload: {
      roomName: string;
      duration: string;
      exercise: string;
      username: string;
    },
  ) {
    const { roomName, duration, exercise, username } = payload;

    if (!roomName) {
      client.emit('error', 'Room name is required.');
      return;
    }

    console.log(`Creating room with name: ${roomName}`);

    this.rooms[roomName] = {
      host: username,
      users: [username],
      options: { duration, exercise },
      readyStates: { [username]: false },
    };
    client.join(roomName);
    client.data.username = username;

    // roomName을 포함하여 방 목록 전송
    const roomsWithNames = Object.entries(this.rooms).map(([name, room]) => ({
      roomName: name, // roomName 필드를 추가
      ...room,
    }));

    console.log('Current room list with names:', roomsWithNames);
    this.server.emit('updateRooms', roomsWithNames); // 방 목록 전송
    client.emit('joinedRoom', { roomName });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: Socket,
    payload: { roomName: string; username: string },
  ) {
    const { roomName, username } = payload;

    if (this.rooms[roomName]) {
      // 중복 방지
      if (!this.rooms[roomName].users.includes(username)) {
        this.rooms[roomName].users.push(username);
        this.rooms[roomName].readyStates[username] = false;
        console.log(`User ${username} joined room ${roomName}`); // 디버깅 로그
      }
      client.join(roomName);
      client.data.username = username;

      // 모든 클라이언트에 업데이트된 유저 목록 전송
      console.log(
        `Emitting updateUsers for room ${roomName}:`,
        this.rooms[roomName].users,
      );
      this.server.to(roomName).emit('updateUsers', this.rooms[roomName].users);

      client.emit('joinedRoom', { roomName });
    } else {
      client.emit('error', 'Room does not exist');
    }
  }

  @SubscribeMessage('toggleReady')
  handleToggleReady(client: Socket, roomName: string) {
    const username = client.data.username;

    if (this.rooms[roomName]) {
      this.rooms[roomName].readyStates[username] =
        !this.rooms[roomName].readyStates[username];
      this.server
        .to(roomName)
        .emit('updateReadyStates', this.rooms[roomName].readyStates);

      // 최소 2명 이상의 유저가 준비 완료 상태일 때만 게임 시작
      const allReady = Object.values(this.rooms[roomName].readyStates).every(
        (ready) => ready,
      );
      const enoughPlayers =
        Object.keys(this.rooms[roomName].readyStates).length >= 2;

      if (allReady && enoughPlayers) {
        console.log(`Starting game in room ${roomName}`); // 디버깅 로그
        this.server.to(roomName).emit('startGame');
      }
    }
  }
}
