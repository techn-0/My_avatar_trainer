// src/components/Chat.js
import React, { useState, useEffect, useRef } from "react";
import socket from "../services/Socket"; // 소켓 인스턴스 가져오기
import { getToken } from "../../login/AuthContext";
import { jwtDecode } from 'jwt-decode';
import "./Chat.css"; // CSS 파일 추가

function Chat({ roomName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); // 스크롤을 위한 참조

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

  useEffect(() => {
    // 새로운 메시지가 추가될 때마다 스크롤을 최신 메시지로 이동
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    const token = getToken();
    const decodedToken = jwtDecode(token);
    const username = decodedToken.id;
    if (newMessage.trim()) {
      socket.emit("sendMessage", { roomName, message: newMessage, username });
      setNewMessage("");
    }
  };

  return (
    <div className="ch_card">
      <div className="chat-header">Chat</div>
      <div className="chat-window">
        <ul className="message-list">
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.username}:</strong> {msg.message}
            </li>
          ))}
          <div ref={messagesEndRef} /> {/* 스크롤 위치를 위한 요소 */}
        </ul>
      </div>
      <div className="chat-input">
        <input
          type="text"
          className="message-input"
          placeholder="메시지를 입력하세요"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button className="send-button" onClick={handleSendMessage}>
          전송
        </button>
      </div>
    </div>
  );
}

export default Chat;
