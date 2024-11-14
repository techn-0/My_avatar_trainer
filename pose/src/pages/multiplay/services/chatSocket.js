// src/services/chatSocket.js
import { io } from "socket.io-client";

const chatSocket = io('https://techn0.shop/chat-ws', {
  autoConnect: true,
  withCredentials: true
});

// Add these debug listeners
chatSocket.on('connect', () => {
  console.log('Chat socket connected successfully');
  console.log('Socket ID:', chatSocket.id);
});

chatSocket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

chatSocket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Debug all events
chatSocket.onAny((eventName, ...args) => {
  console.log(`[Socket Event] ${eventName}:`, args);
});

export default chatSocket;