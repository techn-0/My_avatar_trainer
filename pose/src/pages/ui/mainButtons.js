import React from "react";

function Buttons({
  onMainPageClick,
  onLoginPageClick,
  onExerciseClick,
  onResultClick,
  onPlayIdleClick,
  onPlayRunClick,
}) {
  // yes
  return (
    <div>
      <button onClick={onMainPageClick}>메인 페이지</button>
      <button onClick={onLoginPageClick}>로그인 페이지</button>
      <button onClick={onExerciseClick}>운동하러 가기</button>
      <button onClick={onResultClick}>성장 추이 보기</button>
      <button onClick={onPlayIdleClick}>Play Idle Animation</button>
      <button onClick={onPlayRunClick}>Play Run Animation</button>
    </div>
  );
}

export default Buttons;
