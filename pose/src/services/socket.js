import { io } from "socket.io-client";

const socket = io("http://15.165.191.221:3002", { autoConnect: false });

export default socket;
