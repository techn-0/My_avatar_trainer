import io from "socket.io-client";
//주소 예외(지우지 마시오)
const socket = io("https://techn0.shop/"); // Server URL

export default socket;