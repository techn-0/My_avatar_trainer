import React, { useEffect, useState, useRef } from "react";
import "./glitch-container.css";

const ExerciseTimer = React.memo(
  ({ durationInSeconds, onTimerEnd, startTimeRef }) => {
    const [remainingTime, setRemainingTime] = useState(durationInSeconds);

    useEffect(() => {
      let animationFrameId;

      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        const timeLeft = durationInSeconds - elapsed;

        if (timeLeft >= 0) {
          setRemainingTime(timeLeft);
          animationFrameId = requestAnimationFrame(updateTimer);
        } else {
          setRemainingTime(0);
          if (onTimerEnd) onTimerEnd();
        }
      };

      animationFrameId = requestAnimationFrame(updateTimer);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [durationInSeconds, onTimerEnd, startTimeRef]);

    // 글자 색상 동적으로 설정
    const textColor = remainingTime <= 10 ? "#ff0000" : "#00ffff"; // 10초 이하일 때 색상 변경

    return (
      <div
        style={{
          textAlign: "center",
        }}
      >
        <div class="glitch-container" style={{ color: textColor }}>
          {remainingTime}
          <span>{remainingTime}</span>
          <span>{remainingTime}</span>
        </div>
      </div>
    );
  }
);

export default ExerciseTimer;
