import React, { useEffect } from "react";
import "./exerciseResult.css";

function ExerciseResultModal({ onClose, bestScore, userScore }) {
  // 비교 결과 메시지 생성
  let resultMessage;
  let soundEffect;

  if (bestScore === null || bestScore === undefined || bestScore === 0) {
    // 이전 기록이 없거나, 0으로 첫 운동 기록인 경우
    if (userScore > 0) {
      resultMessage = "첫 운동 기록입니다!";
      soundEffect = new Audio(`${process.env.PUBLIC_URL}/sound/win.mp3`);
    } else {
      resultMessage = "운동하세요!"; // 이전 기록도 없고, 현재도 0인 경우 무승부
      soundEffect = new Audio(`${process.env.PUBLIC_URL}/sound/fail.mp3`);
    }
  } else if (userScore > bestScore) {
    resultMessage = "승리!";
    soundEffect = new Audio(`${process.env.PUBLIC_URL}/sound/victory.mp3`);
  } else if (userScore < bestScore) {
    resultMessage = "패배...";
    soundEffect = new Audio(`${process.env.PUBLIC_URL}/sound/fail.mp3`);
  } else {
    resultMessage = "무승부";
    soundEffect = new Audio(`${process.env.PUBLIC_URL}/sound/fail2.mp3`);
  }

  useEffect(() => {
    if (soundEffect) {
      soundEffect.play();
    }
  }, [soundEffect]);

  return (
    <div className="modal-overlay">
      <div className="card">
        <div className="modal-content">
          <button
            className="Btn"
            onClick={() => {
              onClose();
              window.location.reload(); // 새로고침 추가
            }}
          >
            <div className="sign">
              <svg viewBox="0 0 512 512">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
              </svg>
            </div>
            <div className="text">닫기</div>
          </button>
          <h1>운동 결과</h1>
          <h2>아바타: {bestScore}</h2>
          <h2>나: {userScore}</h2>
          <h2>결과: {resultMessage}</h2>
        </div>
      </div>
    </div>
  );
}

export default ExerciseResultModal;
