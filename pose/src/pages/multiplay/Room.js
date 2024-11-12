// src/pages/Room.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "./services/Socket";
import Chat from "./components/Chat";
import VideoStream from "./components/VideoStream";
import { getToken } from "../login/AuthContext";
import { jwtDecode } from "jwt-decode";
import RoomButtons from "./components/roomButton";
import MultiSquatCam from "./components/multiCam/multiSquatCam"; // 컴포넌트 임포트
import "./Room.css";

function Room() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [readyStates, setReadyStates] = useState({});
  const [isReady, setIsReady] = useState(false);
  const [startMessage, setStartMessage] = useState(false);

  // roomButton.js에서 사용되는 상태 및 함수 추가
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const exercises = ["squat", "pushup"]; // 운동 종목 리스트
  const durations = ["30초", "60초"]; // 운동 시간 리스트

  // 운동 종목 선택 핸들러
  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
  };

  // 운동 시간 선택 핸들러
  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  // 운동 시작 버튼 클릭 핸들러
  const handleStartExerciseClick = () => {
    if (!selectedExercise || !selectedDuration) {
      alert("운동 종류와 지속 시간을 선택하세요.");
      return;
    }

    // 선택한 운동 및 시간 정보를 서버에 전송
    socket.emit("startExercise", {
      roomName,
      duration: selectedDuration,
      exercise: selectedExercise,
    });
  };

  // 방 나가기 버튼 클릭 핸들러
  const handleLeaveRoomClick = () => {
    socket.emit("leaveRoom", { roomName });
    navigate("/lobby"); // 로비 페이지로 이동
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
        const allReady = Object.values(readyStates).every(
          (state) => state === true
        );
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

    // **bothPlayersReady 이벤트 처리 추가**
    socket.on("bothPlayersReady", () => {
      setStartMessage(true);
    });

    return () => {
      socket.off("roomState");
      socket.off("updateUsers");
      socket.off("updateReadyStates");
      socket.off("bothPlayersReady"); // 이벤트 리스너 해제
    };
  }, [roomName]);

  // 레디 상태 토글 함수 (사용하지 않는다면 삭제 가능)
  const toggleReady = () => {
    setIsReady((prev) => !prev);
    socket.emit("toggleReady", roomName);
  };

  return (
    <div
      className="roomss"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <h1 className="Players_in_room" style={{ textAlign: "center" }}>
        Welcome to Room: {roomName}
      </h1>

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
              toggleReady={toggleReady}
            />
          </div>

          <div style={{ flex: 2 }} className="videoDiv">
            {/* VideoStream 컴포넌트 */}
            <VideoStream roomName={roomName} />

            <div className="romm_bottom_box">
              {/* Ready Status and Start Message */}
              <div style={{ marginTop: "1rem" }}>
                <h2 className="green">Players in Room:</h2>
                {users.map((user, index) => (
                  <div className="Players_in_room" key={index}>
                    {user} - {readyStates[user] ? "Ready" : "Not Ready"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Room;
