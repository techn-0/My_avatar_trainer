// squatCam.js

import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { angleCalc } from "./angleCalc";
import { useGreenFlashEffect } from "./greenFlashEffect";
import "./exBL.css";

let poseSingleton = null;

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

function MediapipeSquatTracking({
  onCanvasUpdate,
  active,
  onCountUpdate,
  animationRepeatCount,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const squatCountRef = useRef(0);
  const squatStateRef = useRef("up");
  const [animateCount, setAnimateCount] = useState(false); // 사용자 카운트 애니메이션화
  const [animateRepeatCount, setAnimateRepeatCount] = useState(false); // 아바타 카운트 애니메이션
  const { triggerGreenFlash, triggerGoodBox, drawEffects } =
    useGreenFlashEffect();

  function onPreMovement() {
    triggerGreenFlash();
  }

  // 카운트 증가 시 애니메이션
  useEffect(() => {
    if (animationRepeatCount > 0) {
      setAnimateRepeatCount(true);
      setTimeout(() => setAnimateRepeatCount(false), 300); // 애니메이션 지속 시간 후 초기화
    }
  }, [animationRepeatCount]);


  function onCountIncrease() {
    triggerGreenFlash();
    triggerGoodBox(); // "Good!" 박스 표시
    squatCountRef.current += 1;

    // 애니메이션 트리거
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 300); // 애니메이션 지속 시간 후 제거
    // 효과음 재생
    const audio = new Audio("/sound/good.wav"); // 효과음 파일 경로
    audio.play();

    if (onCountUpdate) {
      onCountUpdate(squatCountRef.current);
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
        const landmarks = results.poseLandmarks;

        // 필수 랜드마크 인덱스 업데이트
        const requiredLandmarkIndices = [
          11,
          12, // 어깨
          23,
          24, // 골반
          25,
          26, // 무릎
          27,
          28, // 발목
          29,
          30, // 뒤꿈치
          31,
          32, // 발끝
        ];

        const allLandmarksPresent = requiredLandmarkIndices.every(
          (index) => landmarks[index]
        );

        if (!allLandmarksPresent) {
          console.warn("Some required landmarks are missing");
          return;
        }

        // 각도 계산
        const leftKneeAngle = angleCalc(landmarks, 23, 25, 27);
        const rightKneeAngle = angleCalc(landmarks, 24, 26, 28);
        const leftHipAngle = angleCalc(landmarks, 11, 23, 25);
        const rightHipAngle = angleCalc(landmarks, 12, 24, 26);
        const leftTorsoAngle = angleCalc(landmarks, 0, 11, 23);
        const rightTorsoAngle = angleCalc(landmarks, 0, 12, 24);

        // 각도 값이 유효한지 확인
        if (
          leftKneeAngle === null ||
          rightKneeAngle === null ||
          leftHipAngle === null ||
          rightHipAngle === null ||
          leftTorsoAngle === null ||
          rightTorsoAngle === null
        ) {
          console.warn("Angle calculation returned null");
          return;
        }

        // 스쿼트 다운 조건
        const isSquatDown =
          leftKneeAngle < 70 &&
          rightKneeAngle < 70 &&
          leftHipAngle < 70 &&
          rightHipAngle < 70 &&
          leftTorsoAngle > 30 &&
          rightTorsoAngle > 30;

        // 스쿼트 업 조건
        const isSquatUp = leftKneeAngle > 140 || rightKneeAngle > 140;

        // 상태 전환 및 카운트 업데이트
        if (isSquatDown && squatStateRef.current === "up") {
          squatStateRef.current = "down";
          onPreMovement();
        }

        if (isSquatUp && squatStateRef.current === "down") {
          // 카운트 증가 전에 모든 랜드마크가 존재하는지 다시 확인
          const allLandmarksPresentForCount = requiredLandmarkIndices.every(
            (index) => landmarks[index]
          );

          if (!allLandmarksPresentForCount) {
            console.warn(
              "Cannot count due to missing landmarks during movement"
            );
            return;
          }

          squatStateRef.current = "up";
          onCountIncrease();
        }

        // 효과 그리기
        drawEffects(
          canvasCtx,
          canvasRef.current.width,
          canvasRef.current.height
        );

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
        width="500"
        height="500"
        style={{ display: "block", position: "absolute", top: 100, right: 10 }}
      ></video>
      <canvas
        ref={canvasRef}
        width="800"
        height="640"
        style={{
          display: "block",
          position: "absolute",
          top: 100,
          right: 10,
          borderRadius: "30px",
        }}
      ></canvas>
      {/* 스쿼트 카운트 출력 */}
      <div className="vs_container">
        <div className="vs_element">
          {/* 아바타 운동 횟수 */}
          <h1 className={`gas ${animateRepeatCount ? "squat-count" : ""}`}>{animationRepeatCount}</h1>
          <h1>&nbsp; VS &nbsp;</h1>
          {/* 플레이어 운동 횟수 */}
          <h1 className={`gas ${animateCount ? "squat-count" : ""}`}>{squatCountRef.current}</h1>
        </div>
      </div>
    </div>
  );
}

export default MediapipeSquatTracking;
