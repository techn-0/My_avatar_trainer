import React, { useState } from "react";
import "./selectExerciseGuide.css";

const ExerciseGuide = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="guideBox">
      <button className="closeButton" onClick={handleClose}>
        &times;
      </button>
      <div>
        <h2>플레이 방법!</h2>
        <p>운동 종목과 운동 시간을 선택하고 선택 완료 버튼을 누르세요.</p>
        <br />
        <p>
          아바타 트레이너는 사용자님이 과거에 실시한 해당 종목의 최고기록을
          재연합니다.
        </p>
        <br />
        <p>즐거운 운동 되세요!</p>
      </div>
    </div>
  );
};

export default ExerciseGuide;
