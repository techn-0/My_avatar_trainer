// src/services/gameSocket.js
import { io } from "socket.io-client";

// gameSocket.js - Update your configuration
const gameSocket = io('https://techn0.shop', {
  autoConnect: true,
  withCredentials: true
}).connect('/game-ws');

// Add these debug listeners
gameSocket.on('connect', () => {
  console.log('Chat socket connected successfully');
  console.log('Socket ID:', gameSocket.id);
});

gameSocket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

gameSocket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Debug all events
gameSocket.onAny((eventName, ...args) => {
  console.log(`[Socket Event] ${eventName}:`, args);
});

export default gameSocket;