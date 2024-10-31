import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:3002"); // 서버 URL

function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [duration, setDuration] = useState("60초");
  const [exercise, setExercise] = useState("플랭크");
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("updateRooms", (rooms) => {
      console.log("Rooms received from server:", rooms); // 방 목록 디버깅 로그
      setRooms(rooms);
    });

    return () => {
      socket.off("updateRooms");
    };
  }, []);

  const handleCreateRoom = () => {
    const username = sessionStorage.getItem("userId");
    const roomName = newRoomTitle.trim();

    if (!roomName) {
      alert("방 이름을 입력해 주세요.");
      return;
    }

    socket.emit("createRoom", { roomName, duration, exercise, username });
    setShowCreateRoomModal(false);
    navigate(`/room/${roomName}`); // 방 생성 후 Room으로 이동
  };

  const handleJoinRoom = (roomName) => {
    const username = sessionStorage.getItem("userId");
    socket.emit("joinRoom", { roomName, username });
    navigate(`/room/${roomName}`); // 참여 시 해당 Room으로 이동
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
          <select
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
          </select>
          <button onClick={handleCreateRoom}>생성</button>
        </div>
      )}

      <ul>
        {rooms.map((room, index) => (
          <li key={index}>
            {room.roomName || "방 이름 없음"} - {room.options?.duration} -{" "}
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
