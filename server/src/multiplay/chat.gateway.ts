import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { MessageService} from '../my-page/message/message.service';
  // import { RoomService} from '../my-page/room/room.service';

  interface Room {
    host: string;
    users: string[];
  }
  
  @WebSocketGateway({ cors: true })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly messageService:MessageService,
                // private readonly roomService:RoomService,
    ){}

    @WebSocketServer() server: Server;
    private rooms: { [key: string]: Room } = {};
  
    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
        client.onAny((event, ...args) => {
            console.log(`Event received: ${event}`, args);
        });
        // // Directly call handleSendMessage to test if it processes messages correctly
        // const testPayload = { roomName: 'exampleRoom', message: 'Test Message', username: 'TestUser' };
        // this.handleSendMessage(client, testPayload);  // Simulate a sendMessage event
    }
  
    handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const username = client.data.username;
  
    Object.keys(this.rooms).forEach((roomName) => {
      const room = this.rooms[roomName];
      if (room.users.includes(username)) {
        room.users = room.users.filter((user) => user !== username);
        delete client.data.username;
  
        // if (room.users.length === 0) {
        //   delete this.rooms[roomName];
        //   console.log(`Room ${roomName} deleted as it's now empty.`);
        // } 
        if(room.users.length!==0) {
          // Emit updated user list to remaining users in the room
          console.log(`Emitting updateUsers for room ${roomName}:`, room.users);
          this.server.to(roomName).emit('updateUsers', room.users);
        }
      }
    });
  }
  
    @SubscribeMessage('createRoom')
    handleCreateRoom(
    client: Socket,
    payload: { roomName: string; username: string },
  ) {
    const { roomName, username } = payload;
  
    if (!roomName) {
      client.emit('error', 'Room name is required.');
      return;
    }
  
    console.log(`Creating room with name: ${roomName} by user: ${username}`);
  
    // Initialize the room with host and users
    this.rooms[roomName] = {
      host: username,
      users: [username],
    };
    client.join(roomName);
    client.data.username = username;
  
    // Emit updated user list to all users in the room
    this.server.to(roomName).emit('updateUsers', this.rooms[roomName].users);
    client.emit('joinedRoom', { roomName });
  
    // Log room list to debug
    const roomsWithNames = Object.entries(this.rooms).map(([name, room]) => ({
      roomName: name,
      ...room,
    }));
    console.log('Current room list with names:', roomsWithNames);
  
    // Broadcast updated room list to all clients
    this.server.emit('updateRooms', roomsWithNames);
  }
  
    @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    payload: { roomName: string; username: string },
  ) {
    const { roomName, username } = payload;

    if (this.rooms[roomName]) {
      // Add user to the room if they are not already in it
      if (!this.rooms[roomName].users.includes(username)) {
        this.rooms[roomName].users.push(username);
        console.log(`User ${username} joined room ${roomName}`);
      }
      client.join(roomName);
      client.data.username = username;

      const messageHistory = await this.messageService.getMessages(roomName);
      client.emit('messageHistory', messageHistory);
  
      // Emit updated user list to all users in the room
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
  
  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: { roomName: string; message: string;username: string }) {
    console.log('handleSendMessage invoked');

    const { roomName, message, username } = payload;
    
    console.log('Message received on backend:', payload);
  
    // Check if message is empty or contains only whitespace
    if (!message || message.trim() === "") {
      console.error("Cannot send an empty message.");
      return; // Do not proceed if the message is empty
    }
  
    if (this.rooms[roomName]) {
      console.log(`Broadcasting message from ${username} to room ${roomName}: ${message}`);
        
      // Broadcast the message to all users in the specified room
      this.server.to(roomName).emit('receiveMessage', { sender: username, content: message });
      
      await this.messageService.addMessage(roomName, username, message);
    
    } else {
      console.log(`Room ${roomName} does not exist for message broadcasting.`);
    }
  }
  
    @SubscribeMessage('getRooms')
    handleGetRooms(client: Socket) {
      const roomsWithNames = Object.keys(this.rooms).map((name) => ({ roomName: name }));
      console.log('Sending room list to client:', roomsWithNames);
      client.emit('updateRooms', roomsWithNames);
    }

    // @SubscribeMessage('ping')
    // handlePing(client: Socket) {
    //     console.log('Ping event received on backend');
    //     client.emit('pong', 'Pong from backend');  // Send "pong" response to the frontend
    // }


  }
  

// // Backend (ChatGateway.ts)
// import {
//     SubscribeMessage,
//     WebSocketGateway,
//     WebSocketServer,
//     OnGatewayConnection,
//     OnGatewayDisconnect,
//     OnGatewayInit,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//     cors: {
//         origin: '*',  // Be more specific in production
//         methods: ['GET', 'POST'],
//         credentials: true,
//     },
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
//     @WebSocketServer()
//     server: Server;

//     afterInit(server: Server) {
//         console.log('WebSocket Gateway initialized');
//     }

//     handleConnection(client: Socket) {
//         console.log('Client connected:', client.id);
//         // Send an immediate test message to verify connection
//         client.emit('connectionConfirmed', { status: 'connected', clientId: client.id });
//     }

//     handleDisconnect(client: Socket) {
//         console.log('Client disconnected:', client.id);
//     }

//     @SubscribeMessage('ping')
//     handlePing(client: Socket) {
//         console.log('Ping received from client:', client.id);
//         try {
//             client.emit('pong', 'Pong from backend');
//             console.log('Pong sent to client:', client.id);
//             // Also try broadcasting to ensure message is sent
//             this.server.emit('pong', 'Pong from backend (broadcast)');
//         } catch (error) {
//             console.error('Error sending pong:', error);
//         }
//     }
// }