import React from "react";
import { useNavigate } from "react-router-dom";

function Buttons({
  onMainPageClick,
  onLoginPageClick,
  onExerciseClick,
  onResultClick,
  onPlayIdleClick,
  onPlayRunClick,
}) {
  const navigate = useNavigate();

  const handleResultClick = () => {
    navigate("/progress"); // /progress 경로로 이동
  };
  const handleExerciseClick = () => {
    navigate("/exercise"); // /progress 경로로 이동
  };

  return (
    <div>
      <button onClick={onMainPageClick}>메인 페이지</button>
      <button onClick={onLoginPageClick}>로그인 페이지</button>
      <button onClick={handleExerciseClick}>운동하러 가기</button>
      <button onClick={handleResultClick}>성장 추이 보기</button>
      <button onClick={onPlayIdleClick}>Play Idle Animation</button>
      <button onClick={onPlayRunClick}>Play Run Animation</button>
    </div>
  );
}

export default Buttons;
