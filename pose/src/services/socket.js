import { io } from "socket.io-client";

const socket = io("https://techn0.shop", { autoConnect: false });

export default socket;
