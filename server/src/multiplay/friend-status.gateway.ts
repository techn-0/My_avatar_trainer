import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';

  interface OnlineUser {
    [userId: string]: boolean; // Dictionary to track online users
  }

@WebSocketGateway()
export class FriendStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private onlineUsers: { [userId: string]: boolean } = {}; // Store online users

  handleConnection(client: Socket) {
    // Example: Parse userId from client query parameters
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers[userId] = true;
      this.broadcastUserStatus(userId, true); // Emit status update to all clients
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      delete this.onlineUsers[userId];
      this.broadcastUserStatus(userId, false); // Emit status update to all clients
    }
  }

  // Broadcasts the online/offline status to all clients
  private broadcastUserStatus(userId: string, isOnline: boolean) {
    this.server.emit('statusUpdate', { userId, isOnline });
  }

  @SubscribeMessage('userOnline')
  handleUserOnline(@MessageBody() userId: string) {
    this.onlineUsers[userId] = true;
    this.broadcastUserStatus(userId, true); // Emit status update to all clients
  }
}


//   @WebSocketGateway({cors: true})
//   export class FriendStatusGateway
//   implements OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer()
//   server: Server;

//   private onlineUsers: { [userId: string]: boolean } = {}; // Store online users

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   handleDisconnect(client: Socket) {
//     const userId = this.getUserIdBySocket(client);
//     if (userId) {
//       delete this.onlineUsers[userId];
//       this.server.emit('statusUpdate', { userId, isOnline: false });
//     }
//     console.log(`Client disconnected: ${client.id}`);
//   }

//   @SubscribeMessage('userOnline')
//   handleUserOnline(@MessageBody() userId: string, client: Socket) {
//     this.onlineUsers[userId] = true;
//     this.server.emit('statusUpdate', { userId, isOnline: true });
//   }

//   // Event listener for explicit user logout
//   @SubscribeMessage('userLogout')
//   handleUserLogout(@MessageBody() userId: string) {
//     delete this.onlineUsers[userId];
//     this.server.emit('statusUpdate', { userId, isOnline: false });
//   }

//   private getUserIdBySocket(client: Socket): string | undefined {
//     // Implement logic to find userId by client, e.g., based on an authenticated session
//     return client.handshake.query.userId as string;
//   }
// }