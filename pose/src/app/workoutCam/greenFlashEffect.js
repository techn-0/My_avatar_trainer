// greenFlashEffect.js

import { useRef } from "react";

export function useGreenFlashEffect() {
  const greenFlashRef = useRef({ isActive: false, startTime: 0 });

  function triggerGreenFlash() {
    greenFlashRef.current.isActive = true;
    greenFlashRef.current.startTime = Date.now();
  }

  function drawGreenFlash(canvasCtx, canvasWidth, canvasHeight) {
    if (greenFlashRef.current.isActive) {
      const elapsedTime = Date.now() - greenFlashRef.current.startTime;
      const duration = 500; // 애니메이션 지속 시간(ms)
      if (elapsedTime > duration) {
        greenFlashRef.current.isActive = false;
      } else {
        // 투명도 계산 (1에서 0으로 감소)
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
  }

  return { triggerGreenFlash, drawGreenFlash };
}
