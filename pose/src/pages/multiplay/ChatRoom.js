import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatSocket from './services/chatSocket';
import { getToken } from "../login/AuthContext";
import { jwtDecode } from 'jwt-decode';

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

  useEffect(() => {
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
    

    // console.log(`Joining room: ${roomName} as user: ${username}`);
    
    // Frontend의 코드가 Backend와 연결 돼 있는지 확인하는 코드이다.
    chatSocket.on('connect', () => {
      console.log('Connected to backend');
    });

    if (username && roomName) {
      chatSocket.emit('joinRoom', { roomName, username });
    }

    // Listen for incoming messages 
    chatSocket.on("receiveMessage", (messageData) => {
      console.log("Received Message", messageData)

      const messageSender = messageData.username;
      const messageContent = messageData.message;
      // if (!message.content || message.content.trim() === "") {
      //   console.warn("Received empty message; ignoring.");
      //   return; // Skip empty messages
      // }

      const formattedMessage = {
        sender:messageSender,
        content:messageContent,
      }

      setMessages((prev) => [...prev, formattedMessage]); // Add new message to the message list
    });
    
    chatSocket.on("messageHistory", (messageHistory)=>{
      if (messageHistory){
        console.log("Message History received");
        setMessages(messageHistory);
      }else{
        console.log("Message History not received");
      }
      
    })

    // Listen for user updates in the room
    chatSocket.on("updateUsers", (updatedUsers) => {
      console.log("Updated users in room:", updatedUsers);
      setUsers(updatedUsers);
    });
  

    // // Send a "ping" event to the backend
    // socket.emit('ping');  

    // // Listen for the "pong" response from the backend
    // socket.on('pong', (message) => {
    //     console.log(message);  // Should log "Pong from backend" if successful
    // });



    // Clean up listeners on component unmount
    return () => {
      chatSocket.off("connect");
      chatSocket.off("updateUsers");
      chatSocket.off("receiveMessage");
      // socket.off('pong');
    };
  }, [roomName, username]);
  
  const sendMessage = () => {
  
  if (newMessage.trim() === "") {
    console.error("Cannot send an empty message.");
    return;
  }
 else{
    const payload = { roomName, message: newMessage, username:username};
    console.log('Frontend payload :',payload);
    // Emit the message to the server
    chatSocket.emit('sendMessage', payload);

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
        <p
            className="My_MAIN_btn"
            onClick={handleMainClick}
            onMouseEnter={handleMouseEnter}
            style = {{marginRight:'1000px'}}
          >
            메인페이지
          </p>
      
      <div>
      {/* <h2 style={{ color: 'white' }}>Users in Room:</h2>  */}
        {users.length > 0 ? (
          users.map((user, index) => 
          <div key={index} style={{ color: 'white' }}> {/* Set text color to white */}
          {user}
        </div>)
        ) : (
          <div>No users in the room</div>
        )}
      </div>

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
        placeholder="메시지를 입력하세요."
        style={{ width: '80%', padding: '10px', marginTop: '10px' }}
      />
      <button onClick={sendMessage} style={{ padding: '10px 20px', marginLeft: '10px' }}>보내기</button>
      <button onClick={handleExitRoom} style={{ padding: '10px 20px', marginLeft: '10px' }}>방 나가기</button>
    </div>
  );
}

export default ChatRoom;