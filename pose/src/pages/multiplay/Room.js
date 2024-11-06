// src/pages/Room.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "./services/Socket";
import Chat from "./components/Chat";
import VideoStream from "./components/VideoStream";
import { getToken } from "../login/AuthContext";
import { jwtDecode } from "jwt-decode";
import RoomButtons from "./components/roomButton";
import MultiSquatCam from "./components/multiCam/multiSquatCam";

function Room() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [readyStates, setReadyStates] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [startMessage, setStartMessage] = useState(false);

  // 운동 선택 상태
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const exercises = ["squat", "pushup"];
  const durations = [60, 120];

  // 운동 종목 선택 핸들러
  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
  };

  // 운동 시간 선택 핸들러
  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  // 준비 완료 버튼 클릭 핸들러
  const handleReadyClick = () => {
    if (!selectedExercise || !selectedDuration) {
      alert("운동 종류와 시간을 선택해주세요.");
      return;
    }
    setIsReady((prev) => !prev);
    socket.emit("toggleReady", {
      roomName,
      exercise: selectedExercise,
      duration: selectedDuration,
    });
  };

  // 방 나가기 버튼 클릭 핸들러
  const handleLeaveRoomClick = () => {
    socket.emit("leaveRoom", { roomName });
    navigate("/lobby");
  };

  useEffect(() => {
    const token = getToken();
    const decodedToken = jwtDecode(token);
    const username = decodedToken.id;

    if (!socket.connected) {
      socket.connect();
    }

    if (username) {
      socket.emit("joinRoom", { roomName, username });

      // 방 상태 수신 이벤트 설정
      socket.on("roomState", ({ users, readyStates }) => {
        setUsers(users);
        setReadyStates(readyStates);
      });
    }

    // 유저 목록 및 레디 상태 업데이트
    socket.on("updateUsers", (users) => {
      setUsers(users);
    });

    socket.on("updateReadyStates", (states) => {
      setReadyStates(states);
    });

    // 게임 시작 이벤트 처리
    socket.on("startGame", () => {
      setStartMessage(true);
    });

    return () => {
      socket.off("roomState");
      socket.off("updateUsers");
      socket.off("updateReadyStates");
      socket.off("startGame");
    };
  }, [roomName]);

  return (
    <div
      className="rooms"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <h1 style={{ textAlign: "center" }}>Welcome to Room: {roomName}</h1>

      {startMessage ? (
        // 모든 플레이어가 준비되었을 때 multiSquatCam 렌더링
        <MultiSquatCam roomName={roomName} />
      ) : (
        // 그 외의 경우 기존 컴포넌트 렌더링
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            padding: "0 1rem",
          }}
        >
          <div style={{ flex: 1, marginRight: "1rem" }}>
            <RoomButtons
              onLeaveRoomClick={handleLeaveRoomClick}
              selectedExercise={selectedExercise}
              handleExerciseSelect={handleExerciseSelect}
              selectedDuration={selectedDuration}
              handleDurationSelect={handleDurationSelect}
              exercises={exercises}
              durations={durations}
              isReady={isReady}
              handleReadyClick={handleReadyClick} // 수정: 함수 이름 변경
            />
          </div>

          <div style={{ flex: 2 }} className="videoDiv">
            {/* VideoStream 컴포넌트 */}
            <VideoStream roomName={roomName} />

            {/* Chat 컴포넌트 */}
            <Chat roomName={roomName} />

            {/* Ready Status */}
            <div style={{ marginTop: "1rem" }}>
              <h2>Players in Room:</h2>
              {users.map((user, index) => (
                <div key={index}>
                  {user} - {readyStates[user] ? "Ready" : "Not Ready"}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Room;
