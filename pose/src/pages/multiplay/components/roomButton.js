// roomButton.js

import React from "react";
// import "./roomButtons.css";

function RoomButtons({
  onLeaveRoomClick,
  onStartExerciseClick,
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
  return (
    <div className="r_card-container">
      <div className="btn_box">
        {/* 방 나가기 버튼 */}
        <div className="radio-wrapper">
          <input
            className="input"
            type="button"
            name="btn"
            id="leaveRoom"
            onClick={onLeaveRoomClick}
          />
          <div className="btn">
            <span aria-hidden="true"></span>나가기
            <span className="btn__glitch" aria-hidden="true">
              _나가기_
            </span>
          </div>
        </div>

        {/* 운동 설정 UI */}
        <div>
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

          {/* 운동 시작 버튼 */}
          <div className="radio-wrapper">
            <input
              className="input"
              type="button"
              name="btn"
              id="startExercise"
              onClick={onStartExerciseClick}
              disabled={!selectedExercise || !selectedDuration}
            />
            <div className="btn">
              <span aria-hidden="true"></span>운동 시작
              <span className="btn__glitch" aria-hidden="true">
                _운동 시작_
              </span>
            </div>
          </div>
          {/* 준비 완료 버튼 */}
          <div className="radio-wrapper">
            <input
              className="input"
              type="button"
              name="btn"
              id="ready"
              onClick={handleReadyClick}
              disabled={!selectedExercise || !selectedDuration}
            />
            <div className={`btn ready-button ${isReady ? "ready" : ""}`}>
              <span aria-hidden="true"></span>
              {isReady ? "준비 완료" : "준비하기"}
              <span className="btn__glitch" aria-hidden="true">
                {isReady ? "_준비 완료_" : "_준비하기_"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomButtons;
