// MediapipePushupTracking.js

import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { angleCalc } from "./angleCalc";
import { useGreenFlashEffect } from "./greenFlashEffect";
import "./exBL.css"; // 필요한 경우 CSS 파일 임포트

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

let poseSingleton = null; // Pose 인스턴스를 싱글톤으로 선언

function MediapipePushupTracking({
  onCanvasUpdate,
  active,
  onCountUpdate,
  animationRepeatCount,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const pushupCountRef = useRef(0);
  const pushupStateRef = useRef("up");

  // greenFlashEffect 훅 사용
  const { triggerGreenFlash, triggerGoodBox, drawEffects } =
    useGreenFlashEffect();

  function onPreMovement() {
    triggerGreenFlash();
  }

  function onCountIncrease() {
    triggerGreenFlash();
    triggerGoodBox(); // "Good!" 박스 표시
    pushupCountRef.current += 1;
    if (onCountUpdate) {
      onCountUpdate(pushupCountRef.current);
    }
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

    async function onResults(results) {
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
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "white",
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "blue",
          lineWidth: 2,
        });

        const landmarks = results.poseLandmarks;

        // 필수 랜드마크 확인
        const requiredLandmarkIndices = [11, 12, 13, 14, 15, 16, 23, 24];
        const allLandmarksPresent = requiredLandmarkIndices.every(
          (index) => landmarks[index]
        );

        if (!allLandmarksPresent) {
          console.warn("Some landmarks are missing");
          return;
        }

        // 왼쪽 팔꿈치 각도 (left_shoulder, left_elbow, left_wrist)
        const leftElbowAngle = angleCalc(landmarks, 11, 13, 15);

        // 오른쪽 팔꿈치 각도 (right_shoulder, right_elbow, right_wrist)
        const rightElbowAngle = angleCalc(landmarks, 12, 14, 16);

        // 왼쪽 어깨 각도 (left_elbow, left_shoulder, left_hip)
        const leftShoulderAngle = angleCalc(landmarks, 13, 11, 23);

        // 오른쪽 어깨 각도 (right_elbow, right_shoulder, right_hip)
        const rightShoulderAngle = angleCalc(landmarks, 14, 12, 24);

        // 각도 값이 유효한지 확인
        if (
          leftElbowAngle === null ||
          rightElbowAngle === null ||
          leftShoulderAngle === null ||
          rightShoulderAngle === null
        ) {
          console.warn("Angle calculation returned null");
          return;
        }

        // 푸시업 다운 조건
        const isPushupDown =
          (leftElbowAngle < 120 || rightElbowAngle < 120) &&
          // leftShoulderAngle > 20 &&
          // rightShoulderAngle > 20 &&
          pushupStateRef.current === "up";

        // 푸시업 업 조건
        const isPushupUp =
          (leftElbowAngle > 160 || rightElbowAngle > 160) &&
          // leftShoulderAngle < 10 &&
          // rightShoulderAngle < 10 &&
          pushupStateRef.current === "down";

        // 상태 전환 및 카운트 업데이트
        if (isPushupDown) {
          pushupStateRef.current = "down";
          onPreMovement(); // 내려갈 때
        }

        if (isPushupUp) {
          pushupStateRef.current = "up";
          onCountIncrease(); // 올라올 때 카운트 증가
        }

        // 효과 그리기
        drawEffects(
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

    if (active) {
      let camera = cameraRef.current;
      const videoElement = videoRef.current;
      if (videoElement && !camera) {
        camera = new Camera(videoElement, {
          onFrame: async () => {
            if (poseSingleton) {
              await poseSingleton.send({ image: videoElement });
            }
          },
          width: 0,
          height: 0,
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
  }, [active]);

  return (
    <div>
      <video
        ref={videoRef}
        width="800"
        height="auto"
        style={{ display: "block", position: "absolute", top: 100, right: 10 }}
      ></video>
      <canvas
        ref={canvasRef}
        width="800"
        height="640"
        style={{ display: "block", position: "absolute", top: 100, right: 10 }}
      ></canvas>
      {/* 푸시업 카운트 출력 */}
      <div className="vs_container">
        <div className="vs_element">
          {/* 아바타 운동 횟수 */}
          <h1>{animationRepeatCount}</h1>
          <h1>&nbsp; VS &nbsp;</h1>
          {/* 플레이어 운동 횟수 */}
          <h1>{pushupCountRef.current}</h1>
        </div>
      </div>
    </div>
  );
}

export default MediapipePushupTracking;
