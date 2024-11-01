import { io } from "socket.io-client";

const socket = io("http://3.36.101.189:3002", { autoConnect: false });

export default socket;
