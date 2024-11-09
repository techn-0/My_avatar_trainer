import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { getToken } from "../login/AuthContext";
import { jwtDecode } from "jwt-decode";
import "./Lobby.css";
import NoRoom from "./components/ui/noRoom";
const justUrl = process.env.REACT_APP_FRONTEND_just_UR; // url 리다이렉트

const socket = io(`http://localhost:3002`); // 서버 URL

function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [duration, setDuration] = useState("60초");
  const [exercise, setExercise] = useState("플랭크");

  const glitchSoundRef = useRef(null); // 버튼 효과음 레퍼런스

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
  const handleCreateRoom = (e) => {
    e.preventDefault(); // 기본 제출 방지

    const token = getToken();
    const decodedToken = jwtDecode(token);
    const username = decodedToken.id;
    const roomName = newRoomTitle.trim();
    setNewRoomTitle("");

    if (!roomName) {
      alert("방 이름을 입력해 주세요.");
      return;
    }

    // roomName과 username만 포함하여 방을 생성
    socket.emit("createRoom", { roomName, username });

    // 방 생성 후 최신 목록 요청
    socket.emit("getRooms");
  };

  const handleJoinRoom = (roomName) => {
    const token = getToken();
    const decodedToken = jwtDecode(token);
    const username = decodedToken.id;
    socket.emit("joinRoom", { roomName, username });
    navigate(`/room/${roomName}`);
  };

  const handleMouseEnter = () => {
    if (glitchSoundRef.current) {
      glitchSoundRef.current.currentTime = 0;
      glitchSoundRef.current.play().catch((error) => {
        console.log(
          "Sound play prevented due to user interaction requirement."
        );
      });
    }
  };

  const handleMainClick = () => {
    navigate("/"); // 메인 페이지로 이동
  };

  return (
    <div className="multi-container">
      <div className="lobby">
        {/* 상단 헤더 */}
        <header className="myPage-header">
          <div className="radio-wrapper cyberpunk">
            <input
              className="input"
              type="radio"
              name="btn"
              id="mainPage"
              onClick={handleMainClick}
              onMouseEnter={handleMouseEnter}
            />
            <div className="btn" onClick={handleMainClick}>
              <span aria-hidden="true"></span>메인페이지
              <span className="btn__glitch" aria-hidden="true">
                메인페이지
              </span>
            </div>
          </div>

          <h1 className="my_User_name">로비</h1>
        </header>
      </div>
      <div className="lobby-body">
        <section className="create-room glow-container">
          <div className="create-room-content">
            <h2 className="create-room-title">방 만들기</h2>
            <form className="create-room-form" onSubmit={handleCreateRoom}>
              <input
                type="text"
                placeholder="방 이름을 입력하세요"
                className="create-room-input"
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
              />
              <button type="submit" className="create-room-button">
                생성하기
              </button>
            </form>
          </div>
        </section>
        <section className="rooms glow-container">
          {rooms.length === 0 ? (
            <NoRoom />
          ) : (
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
          )}
        </section>
      </div>
    </div>
  );
}

export default Lobby;
