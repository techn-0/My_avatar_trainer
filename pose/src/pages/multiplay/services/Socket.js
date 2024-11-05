// src/services/socket.js
import { io } from "socket.io-client";

const socket = io("https://techn0.shop", {
  autoConnect: true,
});

export default socket;
