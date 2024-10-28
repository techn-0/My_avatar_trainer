// MediapipeSquatTracking.js

import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { angleCalc } from "./angleCalc";
import { useGreenFlashEffect } from "./greenFlashEffect";

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

function MediapipeSquatTracking({ onCanvasUpdate, active, onCountUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const squatCountRef = useRef(0);
  const squatStateRef = useRef("up");

  const { triggerGreenFlash, drawGreenFlash } = useGreenFlashEffect();

  function onPreMovement() {
    triggerGreenFlash();
  }

  function onCountIncrease() {
    triggerGreenFlash();
    squatCountRef.current += 1;
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
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "white",
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "blue",
          lineWidth: 2,
        });

        const landmarks = results.poseLandmarks;

        // 필요한 랜드마크 인덱스
        const requiredLandmarkIndices = [
          11, 12, 23, 24, 25, 26, 27, 28, 29, 30,
        ];
        const allLandmarksPresent = requiredLandmarkIndices.every(
          (index) => landmarks[index] /* && landmarks[index].visibility > 0.5 */
        );

        if (!allLandmarksPresent) {
          console.warn("Some landmarks are missing");
          return;
        }

        // 왼쪽 무릎 각도 계산 (left_hip, left_knee, left_ankle)
        const leftKneeAngle = angleCalc(landmarks, 23, 25, 27);

        // 오른쪽 무릎 각도 계산 (right_hip, right_knee, right_ankle)
        const rightKneeAngle = angleCalc(landmarks, 24, 26, 28);

        // 왼쪽 엉덩이 각도 계산 (left_shoulder, left_hip, left_knee)
        const leftHipAngle = angleCalc(landmarks, 11, 23, 25);

        // 오른쪽 엉덩이 각도 계산 (right_shoulder, right_hip, right_knee)
        const rightHipAngle = angleCalc(landmarks, 12, 24, 26);

        // 상체 각도 계산 (nose, left_shoulder, left_hip)
        const leftTorsoAngle = angleCalc(landmarks, 0, 11, 23);
        const rightTorsoAngle = angleCalc(landmarks, 0, 12, 24);

        // 각도 값이 null인 경우 처리
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

        // 디버깅 로그 출력
        console.log("Left Knee Angle:", leftKneeAngle);
        console.log("Right Knee Angle:", rightKneeAngle);
        console.log("Left Hip Angle:", leftHipAngle);
        console.log("Right Hip Angle:", rightHipAngle);
        console.log("Left Torso Angle:", leftTorsoAngle);
        console.log("Right Torso Angle:", rightTorsoAngle);

        // 스쿼트 다운 조건 확인
        const isSquatDown =
          leftKneeAngle < 100 &&
          rightKneeAngle < 100 &&
          leftHipAngle < 100 &&
          rightHipAngle < 100 &&
          leftTorsoAngle > 30 &&
          rightTorsoAngle > 30;

        // 스쿼트 업 조건 확인
        const isSquatUp = leftKneeAngle > 140 || rightKneeAngle > 140;
        // (leftHipAngle > 140 || rightHipAngle > 140);
        // (leftTorsoAngle < 20 || rightTorsoAngle < 20);

        console.log("isSquatDown:", isSquatDown);
        console.log("isSquatUp:", isSquatUp);

        // 스쿼트 상태 전환 및 카운트 업데이트
        if (isSquatDown && squatStateRef.current === "up") {
          squatStateRef.current = "down";
          onPreMovement();
          // onCountIncrease();
        }

        if (isSquatUp && squatStateRef.current === "down") {
          squatStateRef.current = "up";
          onCountIncrease();
        }

        drawGreenFlash(
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
  }, [active]);

  return (
    <div>
      <video
        ref={videoRef}
        width="640"
        height="480"
        style={{ display: "block", opacity: 0 }}
      ></video>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ display: "block", position: "absolute", top: 10, right: 10 }}
      ></canvas>
      {/* 스쿼트 카운트 출력 */}
      <div
        style={{
          position: "absolute",
          width: "250px",
          textAlign: "center",
          top: "65%",
          right: "10px",
          zIndex: 3,
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
