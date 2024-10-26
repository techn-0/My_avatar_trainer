// MediapipeSquatTracking.js

import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { angleCalc } from "./angleCalc";
import { useGreenFlashEffect } from "./greenFlashEffect"; // 초록색 반짝임 효과 모듈 임포트

let poseSingleton = null; // Pose 인스턴스를 싱글톤으로 선언

// 포즈 연결선 정의
const POSE_CONNECTIONS = [
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 12],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
  [27, 29],
  [28, 30],
  [29, 31],
  [30, 32],
];

function MediapipeSquatTracking({ onCanvasUpdate, active, onCountUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const squatCountRef = useRef(0); // 카운트를 useRef로 관리하여 재렌더링 방지
  const squatStateRef = useRef("up");

  // 초록색 반짝임 효과 사용
  const { triggerGreenFlash, drawGreenFlash } = useGreenFlashEffect();

  // 사전 동작 조건 만족 시 호출되는 함수
  function onPreMovement() {
    // 초록색 반짝임 애니메이션 시작
    triggerGreenFlash();
    // 필요한 다른 동작 추가 가능
  }

  // 카운트 증가 시 호출되는 함수
  function onCountIncrease() {
    // 초록색 반짝임 애니메이션 시작
    triggerGreenFlash();
    // 스쿼트 카운트 증가
    squatCountRef.current += 1;
    // 부모 컴포넌트에 카운트 업데이트 알림
    if (onCountUpdate) {
      onCountUpdate(squatCountRef.current);
    }
    // 필요한 다른 동작 추가 가능
  }

  useEffect(() => {
    if (!poseSingleton) {
      poseSingleton = new Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      poseSingleton.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseSingleton.onResults(onResults);
    }

    function onResults(results) {
      if (!canvasRef.current) return;

      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (results.poseLandmarks) {
        // 랜드마크와 연결선을 그리는 부분 추가
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "white",
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "blue",
          lineWidth: 2,
        });

        // 왼쪽과 오른쪽 다리의 각도 계산
        const leftSquatAngle = angleCalc(
          results.poseLandmarks,
          "left",
          1,
          3,
          4
        );
        const rightSquatAngle = angleCalc(
          results.poseLandmarks,
          "right",
          1,
          3,
          4
        );

        // 사전 동작 조건 만족 (상태가 'up'에서 'down'으로 변경)
        if (
          (leftSquatAngle < 90 && squatStateRef.current === "up") ||
          (rightSquatAngle < 90 && squatStateRef.current === "up")
        ) {
          squatStateRef.current = "down";
          onPreMovement();
        }

        // 카운트 증가 조건 만족 (상태가 'down'에서 'up'으로 변경)
        if (
          (leftSquatAngle > 140 && squatStateRef.current === "down") ||
          (rightSquatAngle > 140 && squatStateRef.current === "down")
        ) {
          squatStateRef.current = "up";
          onCountIncrease();
        }

        // 초록색 반짝임 효과 그리기
        drawGreenFlash(
          canvasCtx,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // 부모 컴포넌트로 업데이트된 캔버스 전달
        if (onCanvasUpdate) {
          onCanvasUpdate(canvasRef.current);
        }
      }
    }

    // Mediapipe 처리 주기 조절
    if (active) {
      let camera = cameraRef.current;
      const videoElement = videoRef.current;
      if (videoElement && !camera) {
        let lastPoseTime = 0;
        const poseInterval = 100; // 100ms마다 Pose 처리 (초당 10회)
        camera = new Camera(videoElement, {
          onFrame: async () => {
            const now = Date.now();
            if (now - lastPoseTime > poseInterval) {
              lastPoseTime = now;
              if (poseSingleton) {
                await poseSingleton.send({ image: videoElement });
              }
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
        cameraRef.current = camera;
      }
    } else {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, [active]); // 의존성 배열에서 불필요한 상태 제거

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }}></video>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ display: "none" }}
      ></canvas>

      {/* 스쿼트 카운트 출력 */}
      <div
        style={{
          position: "absolute",
          width: "250px",
          textAlign: "center",
          top: "65%",
          right: "10px",
          zIndex: 10,
          border: "2px solid black",
          borderRadius: "30px",
          background: "white",
        }}
      >
        <h1>스쿼트 횟수: {squatCountRef.current}</h1>
      </div>
    </div>
  );
}

export default MediapipeSquatTracking;
