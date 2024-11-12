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
  const pushupStateRef = useRef("down"); // 초기 상태를 "down"으로 설정
  const isBodyHorizontalRef = useRef(false);
  const okStateRef = useRef(false);

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

    // 효과음 재생
    const audio = new Audio("/sound/good.wav"); // 효과음 파일 경로
    audio.play();

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
        // drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        //   color: "white",
        //   lineWidth: 4,
        // });
        // drawLandmarks(canvasCtx, results.poseLandmarks, {
        //   color: "blue",
        //   lineWidth: 2,
        // });

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

        // 어깨와 엉덩이의 Y 좌표 계산
        const leftHipY = landmarks[23].y;
        const rightHipY = landmarks[24].y;
        // 팔꿈치, 손목, 어께 Y좌표 계산
        const leftElbowY = landmarks[13].y;
        const rightElbowY = landmarks[14].y;
        const leftWristY = landmarks[15].y;
        const rightWristY = landmarks[16].y;
        const leftShoulderY = landmarks[11].y;
        const rightShoulderY = landmarks[12].y;

        // 평균 팔꿈치, 손목 Y 좌표 계산
        const avgElbowY = (leftElbowY + rightElbowY) / 2;
        const avgWristY = (leftWristY + rightWristY) / 2;
        const avgShoulderY = (leftShoulderY + rightShoulderY) / 2;

        let timerId = null;

        if (
          !okStateRef.current &&
          avgElbowY < avgShoulderY &&
          avgWristY < avgElbowY
        ) {
          // 타이머가 이미 설정된 경우 재설정하지 않음
          if (!timerId) {
            timerId = setTimeout(() => {
              okStateRef.current = "true";
              console.log("current ok state: ", okStateRef.current);

              // 타이머 초기화
              timerId = null;
            }, 1000); // 1초 동안 유지되면 상태 변경
          }
        } else {
          // 조건이 충족되지 않으면 타이머 초기화
          if (timerId) {
            clearTimeout(timerId);
            timerId = null;
          }
        }
        // 평균 Y 좌표 계산
        const avgHipY = (leftHipY + rightHipY) / 2;

        // 어깨와 엉덩이의 Y 좌표 차이 계산
        const bodyInclination = Math.abs(avgShoulderY - avgHipY);

        // 임계값 설정 (필요에 따라 조정 가능)
        const horizontalThreshold = 0.2;

        // 몸이 수평인지 판단
        isBodyHorizontalRef.current = bodyInclination < horizontalThreshold;

        if (!isBodyHorizontalRef.current) {
          // 서 있는 상태이면 푸시업 인식하지 않음
          pushupStateRef.current = "down"; // 상태 초기화
          if (onCanvasUpdate) {
            onCanvasUpdate(canvasRef.current);
          }
          return;
        }

        // 왼쪽 팔꿈치 각도 (left_shoulder, left_elbow, left_wrist)
        let leftElbowAngle = null;
        if (landmarks[11] && landmarks[13] && landmarks[15]) {
          leftElbowAngle = angleCalc(landmarks, 11, 13, 15);
        }

        // 오른쪽 팔꿈치 각도 (right_shoulder, right_elbow, right_wrist)
        let rightElbowAngle = null;
        if (landmarks[12] && landmarks[14] && landmarks[16]) {
          rightElbowAngle = angleCalc(landmarks, 12, 14, 16);
        }

        // 사용할 팔 선택 (인식된 팔)
        let elbowAngle = null;
        if (leftElbowAngle !== null) {
          elbowAngle = leftElbowAngle;
        } else if (rightElbowAngle !== null) {
          elbowAngle = rightElbowAngle;
        } else {
          console.warn("No elbow landmarks detected");
          return;
        }

        // 각도 값이 유효한지 확인
        if (elbowAngle === null) {
          console.warn("Angle calculation returned null");
          return;
        }

        // 푸시업 다운 조건
        const isPushupDown =
          elbowAngle < 110 && pushupStateRef.current === "up";

        // 푸시업 업 조건
        const isPushupUp =
          elbowAngle > 140 && pushupStateRef.current === "down";

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
          border: "5px solid white",
        }}
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
