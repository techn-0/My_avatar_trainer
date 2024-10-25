import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../login/AuthContext"; // Import your token management functions
import "./mainButtons.css";
import "./exerciseButtons.css";

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
    <div className="r_card-container">
      <div className="btn_box">
        <div >
          <div>
            {/* 글리치 버튼 - 메인 페이지 */}
            <div className="radio-wrapper">
              <input
                className="input"
                type="radio"
                name="btn"
                id="mainPage"
                onClick={onMainPageClick}
              />
              <div className="btn">
                <span aria-hidden="true"></span>메인 페이지
                <span className="btn__glitch" aria-hidden="true">
                  _메인 페이지_
                </span>
              </div>
            </div>

            {/* 글리치 버튼 - 성장 추이 보기 */}
            <div className="radio-wrapper">
              <input
                className="input"
                type="radio"
                name="btn"
                id="progress"
                onClick={onResultClick}
              />
              <div className="btn">
                스테이터스
                <span className="btn__glitch" aria-hidden="true">
                  _스테이터스_
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* 운동 선택 UI */}
          <div style={{}}>
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

            <div className="radio-wrapper">
              <input
                className="input"
                type="radio"
                name="btn"
                id="mainPage"
                onClick={onSelectionComplete}
                disabled={!selectedExercise || !selectedDuration}
              />
              <div className="btn">
                <span aria-hidden="true"></span>선텍 완료
                <span className="btn__glitch" aria-hidden="true">
                  _선택 완료_
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Buttons;
