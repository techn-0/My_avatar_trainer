// roomButton.js

import { React, useRef } from "react";
import "./roomButton.css";

function RoomButtons({
  onLeaveRoomClick,
  selectedExercise,
  handleExerciseSelect,
  selectedDuration,
  handleDurationSelect,
  exercises,
  durations,
  isReady, // 준비 상태 추가
  toggleReady, // 준비 상태 토글 함수 추가
}) {
  const handleReadyClick = () => {
    toggleReady(); // 준비 상태 토글 함수 호출
  };
  const glitchSoundRef = useRef(null); // 버튼 효과음 레퍼런스

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

  return (
    <div className="r_card-container">
      <div className="room_btn_box">
        {/* 방 나가기 버튼 */}
        <p
          className="EX_btn"
          onClick={onLeaveRoomClick}
          onMouseEnter={handleMouseEnter}
        >
          메인페이지
        </p>

        {/* 운동 설정 UI */}
        <div className="room_tx_box">
          <h3>운동 종목 선택</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {exercises.map((exercise) => (
              <label key={exercise} style={{ marginBottom: "8px" }}>
                <input
                  type="radio"
                  name="exercise"
                  value={exercise}
                  checked={selectedExercise === exercise}
                  onChange={() => handleExerciseSelect(exercise)}
                />
                {exercise}
              </label>
            ))}
          </div>

          <h3>운동 시간 선택</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {durations.map((duration) => (
              <label key={duration} style={{ marginBottom: "8px" }}>
                <input
                  type="radio"
                  name="duration"
                  value={duration}
                  checked={selectedDuration === duration}
                  onChange={() => handleDurationSelect(duration)}
                />
                {duration}
              </label>
            ))}
          </div>
          {/* 준비 완료 버튼 */}
          {/* <button
            className={`EX_btn ${isReady ? "ready" : ""} ${
              !selectedExercise || !selectedDuration ? "disabled" : ""
            }`}
            onClick={handleReadyClick}
            disabled={!selectedExercise || !selectedDuration}
            onMouseEnter={handleMouseEnter}
          >
            {isReady ? "준비 완료" : "준비하기"}
          </button> */}
          {/* 준비 완료 버튼 */}
          <div className="input-div" onClick={handleReadyClick}>
            <button
              className={`btn ready-button ${isReady ? "ready" : ""} ${
                !selectedExercise || !selectedDuration ? "disabled" : ""
              }`}
              disabled={!selectedExercise || !selectedDuration}
              onMouseEnter={handleMouseEnter}
            >
              {isReady ? "Wait" : "Ready"}
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              stroke-linejoin="round"
              stroke-linecap="round"
              viewBox="0 0 24 24"
              stroke-width="2"
              fill="none"
              stroke="currentColor"
              className="icon"
            ></svg>
          </div>
        </div>
      </div>
      <audio ref={glitchSoundRef} src="/sound/Glitch.wav" />
    </div>
  );
}

export default RoomButtons;
