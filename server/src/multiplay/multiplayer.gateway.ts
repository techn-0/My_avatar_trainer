// 서버의 MultiplayerGateway.ts
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

  // 클라이언트 연결 처리
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // 클라이언트 연결 해제 처리
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const username = client.data.username;

    Object.keys(this.rooms).forEach((roomName) => {
      const room = this.rooms[roomName];
      room.users = room.users.filter((user) => user !== username);
      delete room.readyStates[username];

      if (room.users.length === 0) {
        delete this.rooms[roomName];
        console.log(`Room ${roomName} deleted as it's now empty.`);
      } else {
        console.log(`Emitting updateUsers for room ${roomName}:`, room.users);
        this.server.to(roomName).emit('updateUsers', room.users);
      }
    });

    // WebRTC 연결 해제를 위해 피어들에게 알림
    client.broadcast.emit('removePeer', client.id);
  }

  // 방 생성 처리
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

    const roomsWithNames = Object.entries(this.rooms).map(([name, room]) => ({
      roomName: name,
      ...room,
    }));

    console.log('Current room list with names:', roomsWithNames);
    this.server.emit('updateRooms', roomsWithNames); // 방 목록 전송
    client.emit('joinedRoom', { roomName });
  }

  // 방 참여 처리
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: Socket,
    payload: { roomName: string; username: string },
  ) {
    const { roomName, username } = payload;

    if (this.rooms[roomName]) {
      if (!this.rooms[roomName].users.includes(username)) {
        this.rooms[roomName].users.push(username);
        this.rooms[roomName].readyStates[username] = false;
        console.log(`User ${username} joined room ${roomName}`);
      }
      client.join(roomName);
      client.data.username = username;

      // 방의 현재 상태를 새로운 사용자에게 전송
      client.emit('roomState', {
        users: this.rooms[roomName].users,
        readyStates: this.rooms[roomName].readyStates,
      });

      // 모든 사용자에게 업데이트된 유저 목록 전송
      this.server.to(roomName).emit('updateUsers', this.rooms[roomName].users);
    } else {
      client.emit('error', 'Room does not exist');
    }
  }

  // 레디 상태 전환 처리
  @SubscribeMessage('toggleReady')
  handleToggleReady(client: Socket, roomName: string) {
    const username = client.data.username;

    if (this.rooms[roomName]) {
      this.rooms[roomName].readyStates[username] =
        !this.rooms[roomName].readyStates[username];
      this.server
        .to(roomName)
        .emit('updateReadyStates', this.rooms[roomName].readyStates);

      const allReady = Object.values(this.rooms[roomName].readyStates).every(
        (ready) => ready,
      );
      const enoughPlayers =
        Object.keys(this.rooms[roomName].readyStates).length >= 2;

      if (allReady && enoughPlayers) {
        console.log(`Starting game in room ${roomName}`);
        this.server.to(roomName).emit('startGame');
      }
    }
  }

  // 플레이어가 OK 포즈로 준비 완료를 알릴 때 처리
  @SubscribeMessage('playerReady')
  handlePlayerReady(client: Socket, payload: { roomName: string }) {
    const { roomName } = payload;
    const username = client.data.username;

    if (this.rooms[roomName]) {
      this.rooms[roomName].readyStates[username] = true;
      console.log(`Player ${username} is ready in room ${roomName}`);

      // 모든 사용자가 준비되었는지 확인
      const allReady = Object.values(this.rooms[roomName].readyStates).every(
        (ready) => ready,
      );

      if (allReady) {
        console.log(`All players are ready in room ${roomName}`);
        // 모든 사용자에게 준비 완료 알림
        this.server.to(roomName).emit('bothPlayersReady');
      }
    }
  }

  // 현재 방 목록 요청 처리
  @SubscribeMessage('getRooms')
  handleGetRooms(client: Socket) {
    const roomsWithNames = Object.entries(this.rooms).map(([name, room]) => ({
      roomName: name,
      ...room,
    }));
    console.log('Sending current room list to client:', roomsWithNames);
    client.emit('updateRooms', roomsWithNames);
  }

  // 채팅 메시지 전송 처리
  @SubscribeMessage('sendMessage')
  handleChatMessage(
    client: Socket,
    payload: { roomName: string; message: string; username: string },
  ) {
    const { roomName, message, username } = payload;
    console.log(`Message from ${username} in room ${roomName}: ${message}`);
    this.server.to(roomName).emit('receiveMessage', { username, message });
  }

  // 현재 방 상태 요청 처리
  @SubscribeMessage('getRoomState')
  handleGetRoomState(client: Socket, roomName: string) {
    const room = this.rooms[roomName];
    if (room) {
      client.emit('roomState', {
        users: room.users,
        readyStates: room.readyStates,
      });
    }
  }

  // WebRTC 신호 처리

  @SubscribeMessage('joinWebRTC')
  handleJoinWebRTC(client: Socket, roomName: string) {
    client.join(roomName);
    // 현재 방의 다른 사용자들에게 새로운 피어가 참여했음을 알림
    client.to(roomName).emit('newPeer', client.id);
    // 현재 방에 있는 다른 피어들의 ID를 새로운 클라이언트에게 전송
    const socketsInRoom = this.server.sockets.adapter.rooms.get(roomName);
    const otherPeerIds = Array.from(socketsInRoom || []).filter(
      (id) => id !== client.id,
    );
    client.emit('existingPeers', otherPeerIds);
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: { to: string; offer: any }) {
    this.server
      .to(payload.to)
      .emit('offer', { from: client.id, offer: payload.offer });
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: { to: string; answer: any }) {
    this.server
      .to(payload.to)
      .emit('answer', { from: client.id, answer: payload.answer });
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(client: Socket, payload: { to: string; candidate: any }) {
    this.server
      .to(payload.to)
      .emit('iceCandidate', { from: client.id, candidate: payload.candidate });
  }
  @SubscribeMessage('squatCountUpdate')
  handleSquatCountUpdate(
    client: Socket,
    payload: { roomName: string; count: number },
  ) {
    const { roomName, count } = payload;
    const username = client.data.username;

    // 같은 방의 다른 사용자들에게 스쿼트 횟수 업데이트 브로드캐스트
    client.to(roomName).emit('remoteSquatCountUpdate', { username, count });
  }

  @SubscribeMessage('pushupCountUpdate')
  handlePushupCountUpdate(
    client: Socket,
    payload: { roomName: string; count: number },
  ) {
    const { roomName, count } = payload;
    const username = client.data.username;

    // 같은 방의 다른 사용자들에게 스쿼트 횟수 업데이트 브로드캐스트
    client.to(roomName).emit('remotePushupCountUpdate', { username, count });
  }

  @SubscribeMessage('startExerciseTimer')
  handleStartExerciseTimer(client: Socket, payload: { roomName: string, duration: number}) {
    const { roomName, duration } = payload;
    const startTime = Date.now();

    this.server.to(roomName).emit('exerciseTimerStarted', {startTime, duration});
  }
}
