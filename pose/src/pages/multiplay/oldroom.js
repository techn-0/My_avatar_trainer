import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./Room.css";

const socket = io("http://15.165.191.221:3002");

function Room() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [readyStates, setReadyStates] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [startMessage, setStartMessage] = useState(false);

  useEffect(() => {
    const username = sessionStorage.getItem("userId");

    if (!socket.connected) {
      socket.connect();
    }

    if (username) {
      socket.emit("joinRoom", { roomName, username });

      // 방 상태를 새로 입장한 클라이언트가 즉시 받을 수 있도록 이벤트 처리
      socket.on("roomState", ({ users, readyStates }) => {
        setUsers(users);
        setReadyStates(readyStates);

        // 모든 유저가 준비 상태인지 확인하여 시작 메시지 표시 여부 설정
        const allReady = Object.values(readyStates).every((state) => state === true);
        setStartMessage(allReady);
      });
    }

    socket.on("updateUsers", (users) => {
      setUsers(users);
    });

    socket.on("updateReadyStates", (states) => {
      setReadyStates(states);

      const allReady = Object.values(states).every((state) => state === true);
      setStartMessage(allReady);
    });

    socket.on("receiveMessage", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      socket.off("roomState");
      socket.off("updateUsers");
      socket.off("updateReadyStates");
      socket.off("receiveMessage");
    };
  }, [roomName]);

  const toggleReady = () => {
    setIsReady((prev) => !prev);
    socket.emit("toggleReady", roomName);
  };

  const handleSendMessage = () => {
    const username = sessionStorage.getItem("userId");
    if (newMessage.trim()) {
      socket.emit("sendMessage", { roomName, message: newMessage, username });
      setNewMessage("");
    }
  };

  const handleExitRoom = () => {
    navigate("/lobby");
  };

  return (
    <div>
      <h1>Welcome to Room: {roomName}</h1>
      <div>
        <h2>Players in Room:</h2>
        {users.map((user, index) => (
          <div key={index}>
            {user} - {readyStates[user] ? "Ready" : "Not Ready"}
          </div>
        ))}
      </div>
      <button onClick={toggleReady}>
        {isReady ? "Cancel Ready" : "Ready"}
      </button>
      <button onClick={handleExitRoom}>나가기</button>

      {startMessage && (
        <div className="start-message">
          <h2>게임이 시작됩니다!</h2>
        </div>
      )}

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
    </div>
  );
}

export default Room;
