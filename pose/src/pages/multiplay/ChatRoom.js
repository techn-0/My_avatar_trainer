import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from "../login/AuthContext";
import { jwtDecode } from 'jwt-decode';
import {socketService} from './services/socketService';

function ChatRoom() {
  const glitchSoundRef = useRef(null); // 버튼 효과음 레퍼런스
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [message, setMessage] = useState('');
  const [username, setUserName] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);


  useEffect(() => {  
    const socket = socketService.connect('/chat-ws');
  
    const token = getToken();
    if(!token|| token.trim()===""){
      alert('User not logged in');
      navigate('/');
      return;
    }
    try{
      const decodedToken = jwtDecode(token);
      setUserName(decodedToken.id);
    }catch(error){
      alert('Invalid token');
      navigate('/');
      return;
    }


    // Connect to chat namespace
    socketRef.current = socket;

    // Frontend의 코드가 Backend와 연결 돼 있는지 확인하는 코드이다.
    socket.on('connect', () => {
      console.log('Connected to backend');
    });

    if (username && roomName) {
      socket.emit('joinRoom', { roomName, username });
    }
    
     // Set up event listeners
     const setupSocketListeners = () => {
    // Listen for incoming messages 
    socket.on("receiveMessage", (messageData) => {
      console.log("Received Message", messageData)

       if (!messageData.message || messageData.message.trim() === "") {
        console.warn("Received empty message; ignoring.");
        return; // Skip empty messages
      }

      const formattedMessage = {
        sender:messageData.username,
        content:messageData.message,
      }

      setMessages((prev) => [...prev, formattedMessage]); // Add new message to the message list
    });
    
    socket.on("messageHistory", (messageHistory)=>{
      if (messageHistory){
        console.log("Message History received");
        setMessages(messageHistory);
      }else{
        console.log("Message History not received");
      }
      
    })

    // Listen for user updates in the room
    socket.on("updateUsers", (updatedUsers) => {
      console.log("Updated users in room:", updatedUsers);
      setUsers(updatedUsers);
    });
  };

  setupSocketListeners();


    // Clean up listeners on component unmount
    return () => {
      if(socketRef.current){
        socket.off("connect");
        socket.off("updateUsers");
        socket.off("receiveMessage");
        // socket.off('pong');
      };
    }  
  }, [roomName, username]);
  
  const sendMessage = () => {
  
  if (newMessage.trim() === "") {
    console.error("Cannot send an empty message.");
    return;
  }
 else{
  const socket = socketService.getSocket();
  if (socket) {
    const payload = { roomName, message: newMessage, username:username};
    console.log('Frontend payload :',payload);

     // Add message locally with correct format
     const formattedMessage = {
      sender: username,
      content: newMessage
    };

    setMessages(prev => [...prev, formattedMessage]);

    // Emit the message to the server
    socket.emit('sendMessage', payload);

    // Clear the message input
    setNewMessage('');
  } else {
    console.error('Debug: Socket not available for sending message');
  }
  };

  // // Immediately add the new message to the messages state
  // setMessages((prevMessages) => [
  //   ...prevMessages,
  //   { sender: username, content: newMessage }
  // ]);

};

  const handleExitRoom = () => {
    if(username){
      navigate(`/user/${username}`);  
    }else{
      navigate('/');
    }
    
  };

  // 페이지 이동
  const handleMainClick = () => {
    navigate("/"); // 메인 페이지로 이동
  };
  
  const handleMultiplayerClick = () =>{
    socketService.disconnect(); 
    navigate("/lobby");
  }

  const handleMouseEnter = () => {
    if (glitchSoundRef.current) {
      glitchSoundRef.current.currentTime = 0;
      glitchSoundRef.current.play().catch((error) => {
        // play() failed due to lack of user interaction. We can ignore this error.
        console.log(
          "Sound play prevented due to user interaction requirement."
        );
      });
    }
  };

  useEffect(()=>{
     // Scroll to the bottom whenever messages change
     if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-room">
        <header className="myPage-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '0 20px' }}>
          <p
            className="My_MAIN_btn"
            onClick={handleMainClick}
            onMouseEnter={handleMouseEnter}
            style={{ fontSize: '50px', padding: '5px 10px', marginRight:'50px'}}
          >
            메인페이지
          </p>
          <p
          className="My_MAIN_btn"
          onClick={handleMultiplayerClick} // Add a function to handle this button click
          style={{ fontSize: '50px', padding: '5px 10px' }}
        >
          멀티플레이
        </p>
        </header>
      

      {/* Increase the height of the message box */}
      <div className="chat-window" style={{ border: '1px solid #ccc', padding: '10px', height: '500px', overflowY: 'scroll' }}>
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
        <div ref={messagesEndRef} />
      </div>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)} // Update newMessage on input change
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()} // Send message on Enter key press
        placeholder="메시지를 입력하세요."
        style={{ width: '80%', padding: '10px', marginTop: '10px' }}
      />
      <button onClick={sendMessage} style={{ padding: '10px 20px', marginLeft: '10px' }}>보내기</button>
      <button onClick={handleExitRoom} style={{ padding: '10px 20px', marginLeft: '10px' }}>방 나가기</button>
    </div>
  );
}

export default ChatRoom;