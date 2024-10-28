import React from "react";
import "./exerciseResult.css";

function ExerciseResultModal({ onClose, bestScore, userScore }) {
  // 비교 결과 메시지 생성
  let resultMessage;
  if (userScore > bestScore) {
    resultMessage = "승리!";
  } else if (userScore < bestScore) {
    resultMessage = "패배...";
  } else {
    resultMessage = "무승부";
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>운동 결과</h2>
        <p>아바타: {bestScore}</p>
        <p>나: {userScore}</p>
        <p>결과: {resultMessage}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export default ExerciseResultModal;
