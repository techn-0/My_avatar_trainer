// services/socketService.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentNamespace = null;
  }

  connect(namespace) {
    console.log('Debug: Connect requested for namespace:', namespace);

    // If already connected to same namespace, return existing socket
    if (this.socket && this.currentNamespace === namespace) {
      console.log('Debug: Reusing existing connection');
      return this.socket;
    }

    if (this.socket) {
      console.log('Debug: Disconnecting existing socket');
      this.disconnect();
    }

    try {
      // Try original working configuration
      if (namespace === '/chat-ws') {
        console.log('Debug: Creating chat connection');
        this.socket = io('https://techn0.shop/', {
          autoConnect: true,
          withCredentials: true,
          reconnection: true,
          // Remove path configuration if it was working before
          transports: ['websocket', 'polling']
        });
      } else {
        this.socket = io('https://techn0.shop', {
          autoConnect: true,
          withCredentials: true,
          reconnection: true,
          transports: ['websocket', 'polling']
        });
      }

      this.currentNamespace = namespace;

      // Add detailed error logging
      this.socket.on('connect_error', (error) => {
        console.error('Debug: Connect Error Details:', {
          message: error.message,
          description: error.description,
          type: error.type,
          namespace: this.currentNamespace,
          transportType: this.socket.io.engine?.transport?.name
        });
      });

      this.socket.on('error', (error) => {
        console.error('Debug: Socket Error:', error);
      });

      this.socket.on('connect', () => {
        console.log('Debug: Connected Successfully:', {
          id: this.socket.id,
          namespace: this.currentNamespace,
          transport: this.socket.io.engine?.transport?.name
        });
      });

      return this.socket;
    } catch (error) {
      console.error('Debug: Socket Creation Error:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Debug: Disconnecting socket', {
        namespace: this.currentNamespace,
        id: this.socket.id,
        nsp: this.socket.nsp
      });
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.currentNamespace = null;
    }
  }

  getSocket() {
    const status = {
      exists: !!this.socket,
      connected: this.socket?.connected,
      id: this.socket?.id,
      namespace: this.socket?.nsp
    };
    console.log('Debug: GetSocket status:', status);
    return this.socket;
  }
}

export const socketService = new SocketService();