// plankCam.js

import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { angleCalc } from "./angleCalc"; // 관절 각도 계산 함수
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

function MediapipePlankTracking({
  onCanvasUpdate,
  active,
  onCountUpdate,
  animationRepeatCount,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const plankTimeRef = useRef(0); // 플랭크 유지 시간 (초)
  const isPlankPoseRef = useRef(false);
  const plankStartTimeRef = useRef(null);

  // greenFlashEffect 훅 사용
  const { triggerGreenFlash, triggerGoodBox, drawEffects } =
    useGreenFlashEffect();

  function onPlankStart() {
    triggerGreenFlash();
    triggerGoodBox(); // "Good!" 박스 표시
    plankStartTimeRef.current = Date.now();
  }

  function onPlankEnd() {
    triggerGreenFlash();
    const plankDuration = (Date.now() - plankStartTimeRef.current) / 1000; // 초 단위로 변환
    plankTimeRef.current += plankDuration;
    plankStartTimeRef.current = null;

    if (onCountUpdate) {
      onCountUpdate(Math.floor(plankTimeRef.current));
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
        minDetectionConfidence: 0.7, // 정확도 향상을 위해 값 증가
        minTrackingConfidence: 0.7, // 정확도 향상을 위해 값 증가
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
        const requiredLandmarkIndices = [
          11, 12, 13, 14, 23, 24, 25, 26, 27, 28,
        ];
        const allLandmarksPresent = requiredLandmarkIndices.every(
          (index) => landmarks[index]
        );

        if (!allLandmarksPresent) {
          console.warn("Some landmarks are missing");
          return;
        }

        // 각도 계산
        const leftHipAngle = angleCalc(landmarks, 11, 23, 25); // 왼쪽 엉덩이 각도
        const rightHipAngle = angleCalc(landmarks, 12, 24, 26); // 오른쪽 엉덩이 각도
        const leftShoulderAngle = angleCalc(landmarks, 13, 11, 23); // 왼쪽 어깨 각도
        const rightShoulderAngle = angleCalc(landmarks, 14, 12, 24); // 오른쪽 어깨 각도

        // 평균 각도 계산
        const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;
        const avgShoulderAngle = (leftShoulderAngle + rightShoulderAngle) / 2;

        // 플랭크 자세 판단 기준 설정
        const hipAngleThreshold = 165; // 엉덩이 각도
        const shoulderAngleThreshold = 80; // 어깨 각도

        // 플랭크 자세인지 확인
        const isPlankPose =
          avgHipAngle > hipAngleThreshold &&
          avgShoulderAngle < shoulderAngleThreshold;

        // 플랭크 상태 변화 감지
        if (isPlankPose && !isPlankPoseRef.current) {
          isPlankPoseRef.current = true;
          onPlankStart();
        } else if (!isPlankPose && isPlankPoseRef.current) {
          isPlankPoseRef.current = false;
          onPlankEnd();
        }

        // 플랭크 유지 중 시간 업데이트
        if (isPlankPoseRef.current && plankStartTimeRef.current) {
          const currentTime = Date.now();
          const plankDuration =
            (currentTime - plankStartTimeRef.current) / 1000;
          if (onCountUpdate) {
            onCountUpdate(Math.floor(plankTimeRef.current + plankDuration));
          }
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
      {/* 플랭크 시간 출력 */}
      <div className="vs_container">
        <div className="vs_element">
          {/* 아바타 운동 횟수 */}
          <h1>{animationRepeatCount}</h1>
          <h1>&nbsp; VS &nbsp;</h1>
          {/* 플레이어 플랭크 시간 (초 단위) */}
          <h1>{Math.floor(plankTimeRef.current)}</h1>
        </div>
      </div>
    </div>
  );
}

export default MediapipePlankTracking;
