// greenFlashEffect.js

import { useRef } from "react";

export function useGreenFlashEffect() {
  const greenFlashRef = useRef({ isActive: false, startTime: 0 });
  const goodBoxRef = useRef({ isActive: false, startTime: 0 });

  function triggerGreenFlash() {
    greenFlashRef.current.isActive = true;
    greenFlashRef.current.startTime = Date.now();
  }

  function triggerGoodBox() {
    goodBoxRef.current.isActive = true;
    goodBoxRef.current.startTime = Date.now();
  }

  function drawEffects(canvasCtx, canvasWidth, canvasHeight) {
    const currentTime = Date.now();

    // 초록색 반짝임 효과 그리기
    if (greenFlashRef.current.isActive) {
      const elapsedTime = currentTime - greenFlashRef.current.startTime;
      const duration = 500; // 애니메이션 지속 시간(ms)
      if (elapsedTime > duration) {
        greenFlashRef.current.isActive = false;
      } else {
        const opacity = 1 - elapsedTime / duration;
        canvasCtx.save();
        canvasCtx.lineWidth = 10; // 테두리 두께
        canvasCtx.strokeStyle = `rgba(0, 255, 0, ${opacity})`;
        canvasCtx.strokeRect(
          canvasCtx.lineWidth / 2,
          canvasCtx.lineWidth / 2,
          canvasWidth - canvasCtx.lineWidth,
          canvasHeight - canvasCtx.lineWidth
        );
        canvasCtx.restore();
      }
    }

    // "Good!" 박스 그리기
    if (goodBoxRef.current.isActive) {
      const elapsedTime = currentTime - goodBoxRef.current.startTime;
      const duration = 1000; // 박스 표시 시간(ms)
      if (elapsedTime > duration) {
        goodBoxRef.current.isActive = false;
      } else {
        const opacity = 1 - elapsedTime / duration;
        canvasCtx.save();

        // 박스 위치와 크기 설정
        const boxWidth = 200;
        const boxHeight = 60;
        const x = (canvasWidth - boxWidth) / 2;
        const y = canvasHeight - boxHeight - 20; // 하단에서 20px 위

        // 박스 스타일 설정
        canvasCtx.fillStyle = `rgba(0, 128, 0, ${opacity})`; // 초록색 배경
        canvasCtx.strokeStyle = `rgba(255, 255, 255, ${opacity})`; // 흰색 테두리
        canvasCtx.lineWidth = 4;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, y, boxWidth, boxHeight, 30);
        canvasCtx.fill();
        canvasCtx.stroke();

        // 텍스트 설정
        canvasCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`; // 흰색 텍스트
        canvasCtx.font = "30px Arial";
        canvasCtx.textAlign = "center";
        canvasCtx.textBaseline = "middle";
        canvasCtx.fillText("Good!", canvasWidth / 2, y + boxHeight / 2);

        canvasCtx.restore();
      }
    }
  }

  return { triggerGreenFlash, triggerGoodBox, drawEffects };
}
