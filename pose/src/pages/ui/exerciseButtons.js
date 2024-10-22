import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../login/AuthContext"; // Import your token management functions

function Buttons({
  onMainPageClick,
  onResultClick,
  selectedExercise,
  handleExerciseSelect,
  selectedDuration,
  handleDurationSelect,
  exercises,
  durations,
  onSelectionComplete,
}) {
  return (
    <div>
      <button onClick={onMainPageClick}>메인 페이지</button>
      <button onClick={onResultClick}>성장 추이 보기</button>

      {/* 운동 선택 UI */}
      <div
        style={{
          marginTop: "20px",
          background: "rgba(255, 255, 255, 0.8)",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
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

        <button
          onClick={onSelectionComplete}
          disabled={!selectedExercise || !selectedDuration}
          style={{ marginTop: "10px" }}
        >
          선택 완료
        </button>
      </div>
    </div>
  );
}

export default Buttons;
