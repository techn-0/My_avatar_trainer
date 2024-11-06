// src/services/socket.js
import { io } from "socket.io-client";
//주소 예외(지우지 마시오)
const socket = io("https://techn0.shop", {
  autoConnect: true,
});

export default socket;
