import React, { useEffect, useState } from "react";

const ExerciseTimer = React.memo(({ durationInSeconds, onTimerEnd }) => {
  const [remainingTime, setRemainingTime] = useState(durationInSeconds);

  useEffect(() => {
    let animationFrameId;
    let startTime = null;

    const updateTimer = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = Math.floor((timestamp - startTime) / 1000);
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
  }, [durationInSeconds, onTimerEnd]);

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h2>남은 시간: {remainingTime}초</h2>
    </div>
  );
});

export default ExerciseTimer;
