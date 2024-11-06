import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
const justUrl = process.env.REACT_APP_FRONTEND_just_UR; // url 리다이렉트

const socket = io(`http://localhost:3002`); // 서버 URL

function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [duration, setDuration] = useState("60초");
  const [exercise, setExercise] = useState("플랭크");
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // 로비에 접속 시 서버에 최신 방 목록 요청
    socket.emit("getRooms");

    socket.on("updateRooms", (rooms) => {
      console.log("Rooms received from server:", rooms); // 디버깅 로그
      setRooms(rooms);
    });

    return () => {
      socket.off("updateRooms");
    };
  }, []);

  // 방 생성
  const handleCreateRoom = () => {
    const username = sessionStorage.getItem("userId");
    const roomName = newRoomTitle.trim();

    if (!roomName) {
      alert("방 이름을 입력해 주세요.");
      return;
    }

    // roomName과 username만 포함하여 방을 생성
    socket.emit("createRoom", { roomName, username });
    setShowCreateRoomModal(false);
    navigate(`/room/${roomName}`);
  };

  const handleJoinRoom = (roomName) => {
    const username = sessionStorage.getItem("userId");
    socket.emit("joinRoom", { roomName, username });
    navigate(`/room/${roomName}`);
  };

  return (
    <div className="lobby">
      <h1>Lobby</h1>
      <button onClick={() => setShowCreateRoomModal(true)}>방 만들기</button>

      {showCreateRoomModal && (
        <div className="modal">
          <h2>방 만들기</h2>
          <input
            type="text"
            placeholder="방 제목"
            value={newRoomTitle}
            onChange={(e) => setNewRoomTitle(e.target.value)}
          />
          {/* <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="60초">60초</option>
            <option value="120초">120초</option>
          </select>
          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
          >
            <option value="플랭크">플랭크</option>
            <option value="푸시업">푸시업</option>
          </select> */}
          <button onClick={handleCreateRoom}>생성</button>
        </div>
      )}

      <ul>
        {rooms.map((room, index) => (
          <li key={index}>
            {room.roomName || "방 이름 없음"}
            {room.options?.exercise}
            <button onClick={() => handleJoinRoom(room.roomName)}>
              참여하기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Lobby;
