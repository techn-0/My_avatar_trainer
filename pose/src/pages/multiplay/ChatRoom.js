import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from './services/Socket';
import { getToken } from "../login/AuthContext";
import { jwtDecode } from 'jwt-decode';

function ChatRoom() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [message, setMessage] = useState('');
  const token = getToken();
  const decodedToken = jwtDecode(token);
  const username = decodedToken.id;

  useEffect(() => {
    console.log(`Joining room: ${roomName} as user: ${username}`);
    
    // Frontend의 코드가 Backend와 연결 돼 있는지 확인하는 코드이다.
    socket.on('connect', () => {
      console.log('Connected to backend');
    });

    if (username && roomName) {
      socket.emit('joinRoom', { roomName, username });
    }
  
    // Listen for user updates in the room
    socket.on("updateUsers", (updatedUsers) => {
      console.log("Updated users in room:", updatedUsers);
      setUsers(updatedUsers);
    });
  
    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]); // Add new message to the message list
    });

    // // Send a "ping" event to the backend
    // socket.emit('ping');  

    // // Listen for the "pong" response from the backend
    // socket.on('pong', (message) => {
    //     console.log(message);  // Should log "Pong from backend" if successful
    // });



    // Clean up listeners on component unmount
    return () => {
      socket.off("connect");
      socket.off("updateUsers");
      socket.off("receiveMessage");
      // socket.off('pong');
    };
  }, [roomName, username]);
  
const sendMessage = () => {
  if (newMessage.trim()) {
    const payload = { roomName, message: newMessage, username };
    console.log('Frontend payload :',payload);
    // Emit the message to the server
    socket.emit('sendMessage', payload);

    // Clear the message input
    setNewMessage('');
  }

  // // Immediately add the new message to the messages state
  // setMessages((prevMessages) => [
  //   ...prevMessages,
  //   { sender: username, content: newMessage }
  // ]);

};


  const handleExitRoom = () => {
    navigate('/chat');
  };

  return (
    <div className="chat-room">
      <h1>Chat Room: {roomName}</h1>
      
      <div>
        <h2>Users in Room:</h2>
        {users.length > 0 ? (
          users.map((user, index) => <div key={index}>{user}</div>)
        ) : (
          <div>No users in the room</div>
        )}
      </div>

      <div className="chat-window" style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === username ? 'right' : 'left', margin: '10px 0' }}>
            <span style={{ fontWeight: 'bold', color: msg.sender === username ? 'blue' : 'green' }}>
              {msg.sender}:
            </span>
            <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: '10px', backgroundColor: msg.sender === username ? '#e0f7fa' : '#f1f1f1', marginLeft: '10px' }}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)} // Update newMessage on input change
        placeholder="Type a message..."
        style={{ width: '80%', padding: '10px', marginTop: '10px' }}
      />
      <button onClick={sendMessage} style={{ padding: '10px 20px', marginLeft: '10px' }}>Send</button>
      <button onClick={handleExitRoom} style={{ padding: '10px 20px', marginLeft: '10px' }}>Exit Room</button>
    </div>
  );
}

export default ChatRoom;