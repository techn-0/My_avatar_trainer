import React, { useEffect, useState, useRef } from "react";

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

    return (
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "black",
            fontSize: "70px",
            border: "4px solid",
            borderRadius: "30px",
            height: "110px",
            width: "150px",
            backgroundColor: "white",
          }}
        >
          {remainingTime}
        </h2>
      </div>
    );
  }
);

export default ExerciseTimer;
