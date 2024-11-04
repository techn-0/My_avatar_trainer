// src/components/Chat.js
import React, { useState, useEffect } from "react";
import socket from "../services/socket"; // 소켓 인스턴스 가져오기

function Chat({ roomName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // 메시지 수신 이벤트 설정
    socket.on("receiveMessage", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      // 컴포넌트 언마운트 시 이벤트 해제
      socket.off("receiveMessage");
    };
  }, []);

  const handleSendMessage = () => {
    const username = sessionStorage.getItem("userId");
    if (newMessage.trim()) {
      socket.emit("sendMessage", { roomName, message: newMessage, username });
      setNewMessage("");
    }
  };

  return (
    <div className="chat">
      <h2>Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="메시지를 입력하세요"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
      />
      <button onClick={handleSendMessage}>전송</button>
    </div>
  );
}

export default Chat;