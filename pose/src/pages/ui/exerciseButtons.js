import React, { useState, useEffect, useRef } from "react";
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
  const [isComplete, setIsComplete] = useState(false); // 선택 완료 여부 상태 추가
  const glitchSoundRef = useRef(null); // 버튼 효과음 레퍼런스
  const handleSelectionClick = () => {
    setIsComplete(true); // 선택 완료 클릭 시 버튼 숨기기
    onSelectionComplete(); // 외부에서 정의된 onSelectionComplete 함수 호출
  };

  if (isComplete) return null; // 선택 완료 시 전체 컨테이너 숨김

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
      <div className="EX_btn_box">
        <div>
          <div>
            {/* 글리치 버튼 - 메인 페이지 */}
            <div className="radio-wrapper Ex_btn">
              <input
                className="input"
                type="radio"
                name="btn"
                id="mainPage"
                onClick={onMainPageClick}
                onMouseEnter={handleMouseEnter}
              />
              <div className="btn">
                <span aria-hidden="true"></span>메인페이지
                <span className="btn__glitch" aria-hidden="true">
                  메인페이지
                </span>
              </div>
            </div>

            {/* 글리치 버튼 - 마이페이지 보기 */}
            <div className="radio-wrapper">
              <input
                className="input"
                type="radio"
                name="btn"
                id="user"
                onClick={onResultClick}
                onMouseEnter={handleMouseEnter}
              />
              <div className="btn">
                마이페이지
                <span className="btn__glitch" aria-hidden="true">
                  마이페이지
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* 운동 선택 UI */}
          <div className="exercise-selection-container">
            <h3>운동 종목 선택</h3>
            <div className="exercise-selection">
              {exercises.map((exercise) => (
                <label key={exercise} className="exercise-label">
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
            <div className="duration-selection">
              {durations.map((duration) => (
                <label key={duration} className="duration-label">
                  <input
                    type="radio"
                    name="duration"
                    value={duration}
                    checked={selectedDuration === duration}
                    onChange={() => handleDurationSelect(duration)}
                  />
                  {typeof duration === "number"
                    ? `${duration * 60}초`
                    : duration}
                </label>
              ))}
            </div>

            {/* 선택 완료 버튼 */}
            <div className="radio-wrapper" onMouseEnter={handleMouseEnter}>
              <input
                className="input"
                type="radio"
                name="btn"
                id="mainPage"
                onClick={handleSelectionClick}
                disabled={!selectedExercise || !selectedDuration}
              />
              <div className="btn">
                <span aria-hidden="true"></span>선택 완료
                <span className="btn__glitch" aria-hidden="true">
                  선택 완료
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <audio ref={glitchSoundRef} src="/sound/Glitch.wav" />
    </div>
  );
}

export default Buttons;
