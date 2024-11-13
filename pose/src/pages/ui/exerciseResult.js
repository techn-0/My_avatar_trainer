import React, { useEffect} from "react";
import "./exerciseResult.css";

function ExerciseResultModal({ onClose, bestScore, userScore, opponentScore }) {
  // 비교 결과 메시지 생성
  
  let resultMessage;
  let soundEffect;
  let resultClass; // 결과에 따라 CSS 클래스 설정

  if (opponentScore !== undefined && opponentScore !== null) {
    if (userScore > opponentScore) {
      resultMessage = "승리!";
      resultClass = "result-win";
      soundEffect = "/sound/victory.mp3";
    } else if (userScore < opponentScore) {
      resultMessage = "패배!";
      resultClass = "result-lose";
      soundEffect = "/sound/fail.mp3";
    } else {
      resultMessage = "무승부!";
      resultClass = "result-draw";
      soundEffect = "/sound/fail2.mp3";
    }
  } else {
    if (bestScore === null || bestScore === undefined || bestScore === 0) {
      // 이전 기록이 없거나, 0으로 첫 운동 기록인 경우
      if (userScore > 0) {
        resultMessage = "첫 운동 기록입니다!";
        resultClass = "result-draw";
        soundEffect = "/sound/victory.mp3";
       
      } else {
        resultMessage = "운동하세요!"; // 이전 기록도 없고, 현재도 0인 경우 무승부
        resultClass = "result-draw";
        soundEffect = "/sound/fail.mp3";
      }
    } else if (userScore > bestScore) {
      resultMessage = "승리!";
      resultClass = "result-win";
      soundEffect = "/sound/victory.mp3";
    } else if (userScore < bestScore) {
      resultMessage = "패배!";
      resultClass = "result-lose";
      soundEffect = "/sound/fail.mp3";
    } else {
      resultMessage = "무승부!";
      resultClass = "result-draw";
      soundEffect = "/sound/fail2.mp3";
    }
  }
  
  useEffect(() => {
    // 오디오가 초기화되지 않고 딱 한 번만 재생되도록 설정
    const audio = new Audio(soundEffect);
    audio.play();

    return () => {
      // 컴포넌트가 언마운트될 때 오디오 정지
      audio.pause();
      audio.currentTime = 0;
    };
  }, [resultMessage]); // resultMessage가 설정될 때만 실행
  
  return (
    <div className="fullscreen-wrapper">
      {/* 닫기 버튼 */}
      <div className="button-pos">
        <button className="button tracking-in-contract-bck-bottom"
            onClick={() => {
              onClose();
              window.location.reload();
            }}
          >
           <span>돌아가기</span> 
          </button>
        </div>
        
      {/* 전체 화면 메시지 */}
        <div className="fullscreen-message">
          {opponentScore !== undefined && opponentScore !== null ? (
           <>
            <h1 className={`tracking-in-contract-bck-top ${resultClass}`}>{resultMessage}</h1>
            <div className="score-container tracking-in-contract-bck-bottom">
              <span className="score-item">{userScore}</span>
              <span className="separator">:</span>
              <span className="score-item">{opponentScore}</span>
            </div>
          </>
          ) : (
         <>
           <h1 className={`tracking-in-contract-bck-top ${resultClass}`}>{resultMessage}</h1>
           <div className="score-container tracking-in-contract-bck-bottom">
            <span className="score-item">{bestScore}</span>
            <span className="separator">:</span>
            <span className="score-item">{userScore}</span>
           </div>
        </>
          )}
        </div>
    </div>
  );
}

export default ExerciseResultModal;
