import React, { useEffect, useState, useRef } from "react";
import "./glitch-container.css";

const ExerciseTimer = React.memo(
  ({ durationInSeconds, onTimerEnd, startTimeRef }) => {
    const [remainingTime, setRemainingTime] = useState(durationInSeconds);
    const audioRef = useRef(null); // 음악 재생을 위한 오디오 요소 참조
    const warningAudioRef = useRef(null); // 10초 이하일 때 재생할 경고음 참조

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

      // 운동 시작 시 음악 재생
      if (audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.play();
      }

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [durationInSeconds, onTimerEnd, startTimeRef]);

    // 카운트다운이 0이 될 때 페이드아웃과 음악 중지
    useEffect(() => {
      if (remainingTime === 0 && audioRef.current) {
        // 1초 동안 페이드아웃
        const fadeOutInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.1) {
            audioRef.current.volume -= 0.1; // 0.1씩 줄임
          } else if (audioRef.current) {
            audioRef.current.volume = 0;
            audioRef.current.pause(); // 음악 멈춤
            clearInterval(fadeOutInterval);
          }
        }, 100); // 100ms 간격으로 볼륨 감소
      }
    }, [remainingTime]);

    // 10초 남았을 때 경고음 재생
    useEffect(() => {
      if (remainingTime <= 10 && warningAudioRef.current) {
        warningAudioRef.current.play();
      }
    }, [remainingTime]);

    // 글자 색상 동적으로 설정
    const textColor = remainingTime <= 10 ? "#ff0000" : "#00ffff"; // 10초 이하일 때 색상 변경

    // 20초 이하일 때만 글리치 효과를 적용
    const glitchClass =
      remainingTime <= 20 ? "glitch-container" : "normal-container";

    return (
      <div
        style={{
          textAlign: "center",
        }}
      >
        {/*노래 재생 */}
        <audio ref={audioRef} src="/sound/playMusic.mp3" loop />

        {/* 10초 남았을 때 재생할 경고음 */}
        <audio ref={warningAudioRef} src="/sound/10secCount.mp3" />

        {remainingTime <= 20 ? (
          <div className={glitchClass} style={{ color: textColor }}>
            {remainingTime}
            <span>{remainingTime}</span>
            <span>{remainingTime}</span>
          </div>
        ) : (
          <div className={glitchClass} style={{ color: textColor }}>
            {remainingTime}
          </div>
        )}
      </div>
    );
  }
);

export default ExerciseTimer;
