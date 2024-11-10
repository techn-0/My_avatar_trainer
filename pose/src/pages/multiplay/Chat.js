// src/components/Chat.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./services/Socket";
import { jwtDecode } from "jwt-decode";
import { getToken } from '../login/AuthContext';

function Chat() {
  const [rooms, setRooms] = useState([]);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  const navigate = useNavigate();
  
  useEffect(() => {
    socket.emit("getRooms");

    socket.on("updateRooms", (rooms) => {
      console.log("Rooms received from server:", rooms);
      setRooms(rooms);
    });

    socket.on("joinedRoom", ({ roomName }) => {
      navigate(`/chatroom/${roomName}`);
    });

    return () => {
      socket.off("updateRooms");
      socket.off("joinedRoom");
    };
  }, [navigate]);

  const handleCreateRoom = () => {
    const token = getToken();
    console.log(token);
    if(!token || typeof token !=="string"||token.trim() === ""){
      alert('User not logged in');
      return;
    }

    const decodedToken = jwtDecode(token);
    const username = decodedToken.id;
    const user2 = 'sw'; // Hardcoded for testing, but needs friend username for actual function implementation.

    const roomName = [username, user2].sort().join("&");

    if (!roomName) {
      alert("Please enter a room name.");
      return;
    }

    socket.emit("createRoom", { roomName, username });
    setShowCreateRoomModal(false);
  };

  const handleJoinRoom = (roomName) => {
    const username = sessionStorage.getItem("userId");
    socket.emit("joinRoom", { roomName, username });
    navigate(`/chatroom/${roomName}`);
  };

  return (
    <div className="chat">
      <h1>Chat Lobby</h1>
      <button onClick={() => setShowCreateRoomModal(true)}>Create Room</button>

      {showCreateRoomModal && (
        <div className="modal">
          <h2>Create Room</h2>
          <input
            type="text"
            placeholder="Room Title"
            value={newRoomTitle}
            onChange={(e) => setNewRoomTitle(e.target.value)}
          />
          <button onClick={handleCreateRoom}>Create</button>
        </div>
      )}

      <ul>
        {rooms.map((room, index) => (
          <li key={index}>
            {room.roomName || "No Room Name"}
            <button onClick={() => handleJoinRoom(room.roomName)}>
              Join
            </button>
          </li>     
                  ))}
      </ul>
      </div>
  );
}

export default Chat;


// // Frontend (ChatRoom.tsx)
// import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

// function Chat() {
//     const [socket, setSocket] = useState(null);
//     const [connectionStatus, setConnectionStatus] = useState('Connecting...');
//     const [messages, setMessages] = useState([]);

//     useEffect(() => {
//         // Create socket connection
//         const newSocket = io('http://localhost:3002', {
//             transports: ['websocket'],
//             reconnection: true,
//             reconnectionAttempts: 5,
//             reconnectionDelay: 1000,
//         });

//         // Connection event handlers
//         newSocket.on('connect', () => {
//             console.log('Connected to WebSocket server');
//             setConnectionStatus('Connected');
//         });

//         newSocket.on('connect_error', (error) => {
//             console.error('Connection error:', error);
//             setConnectionStatus('Connection error');
//         });

//         newSocket.on('connectionConfirmed', (data) => {
//             console.log('Connection confirmed:', data);
//             setMessages(prev => [...prev, `Connection confirmed: ${JSON.stringify(data)}`]);
//         });

//         // Set up ping-pong handlers
//         newSocket.on('pong', (message) => {
//             console.log('Received pong:', message);
//             setMessages(prev => [...prev, `Received: ${message}`]);
//         });

//         setSocket(newSocket);

//         // Cleanup on unmount
//         return () => {
//             if (newSocket) {
//                 newSocket.off('connect');
//                 newSocket.off('connect_error');
//                 newSocket.off('connectionConfirmed');
//                 newSocket.off('pong');
//                 newSocket.close();
//             }
//         };
//     }, []);

//     const sendPing = () => {
//         if (socket) {
//             console.log('Sending ping...');
//             socket.emit('ping');
//             setMessages(prev => [...prev, 'Sent: ping']);
//         }
//     };

//     return (
//         <div>
//             <h1>WebSocket Test</h1>
//             <p>Status: {connectionStatus}</p>
//             <button onClick={sendPing}>Send Ping</button>
//             <div style={{ marginTop: '20px' }}>
//                 <h3>Messages:</h3>
//                 {messages.map((msg, index) => (
//                     <div key={index}>{msg}</div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// export default Chat;