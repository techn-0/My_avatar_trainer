// src/pages/Room.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "./Socket";
import Chat from "./Chat";
import VideoStream from "./VideoStream";

function Room() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [readyStates, setReadyStates] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [startMessage, setStartMessage] = useState(false);

  useEffect(() => {
    const username = sessionStorage.getItem("userId");
  
    if (!socket.connected) {
      socket.connect();
    }
  
    if (username) {
      socket.emit("joinRoom", { roomName, username });
  
      // 방 상태 수신 이벤트 설정
      socket.on("roomState", ({ users, readyStates }) => {
        setUsers(users);
        setReadyStates(readyStates);
        const allReady = Object.values(readyStates).every((state) => state === true);
        setStartMessage(allReady);
      });
    }
  
    // 유저 목록 및 레디 상태 업데이트
    socket.on("updateUsers", (users) => {
      setUsers(users);
    });
  
    socket.on("updateReadyStates", (states) => {
      setReadyStates(states);
      const allReady = Object.values(states).every((state) => state === true);
      setStartMessage(allReady);
    });
  
    return () => {
      socket.off("roomState");
      socket.off("updateUsers");
      socket.off("updateReadyStates");
    };
  }, [roomName]);

  const toggleReady = () => {
    setIsReady((prev) => !prev);
    socket.emit("toggleReady", roomName);
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

      {/* VideoStream 컴포넌트 */}
      <VideoStream roomName={roomName} />

      {/* Chat 컴포넌트 */}
      <Chat roomName={roomName} />
    </div>
  );
}

export default Room;