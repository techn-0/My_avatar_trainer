// MediapipeBurpeeTracking.js

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

function MediapipeBurpeeTracking({
  onCanvasUpdate,
  active,
  onCountUpdate,
  animationRepeatCount,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const burpeeCountRef = useRef(0);
  const burpeeStateRef = useRef("down"); // 초기 상태를 "down"으로 설정

  // greenFlashEffect 훅 사용
  const { triggerGreenFlash, triggerGoodBox, drawEffects } =
    useGreenFlashEffect();

  function onPreMovement() {
    triggerGreenFlash();
  }

  function onCountIncrease() {
    triggerGreenFlash();
    triggerGoodBox(); // "Good!" 박스 표시
    burpeeCountRef.current += 1;
    if (onCountUpdate) {
      onCountUpdate(burpeeCountRef.current);
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
        const leftElbowAngle = angleCalc(landmarks, 13, 11, 23); // 왼쪽 팔꿈치 각도
        const rightElbowAngle = angleCalc(landmarks, 14, 12, 24); // 오른쪽 팔꿈치 각도
        const leftHipAngle = angleCalc(landmarks, 11, 23, 25); // 왼쪽 엉덩이 각도
        const rightHipAngle = angleCalc(landmarks, 12, 24, 26); // 오른쪽 엉덩이 각도
        const leftKneeAngle = angleCalc(landmarks, 23, 25, 27); // 왼쪽 무릎 각도
        const rightKneeAngle = angleCalc(landmarks, 24, 26, 28); // 오른쪽 무릎 각도

        // 평균 각도 계산
        const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;
        const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
        const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

        // 상태 판단 기준 설정
        const hipAngleThreshold = 140; // 서 있을 때 엉덩이 각도
        const kneeAngleThreshold = 150; // 서 있을 때 무릎 각도
        const elbowAngleThreshold = 150; // 팔을 올렸을 때 팔꿈치 각도
        const hipAnglePlankThreshold = 140; // 플랭크 자세에서 엉덩이 각도
        const kneeAnglePlankThreshold = 140; // 플랭크 자세에서 무릎 각도

        // 서 있는지 확인
        const isStanding =
          avgHipAngle > hipAngleThreshold && avgKneeAngle > kneeAngleThreshold;

        // 팔이 위로 올라갔는지 확인 (손목이 어깨보다 위에 있는지 확인)
        const leftWristAboveShoulder =
          landmarks[15].y < landmarks[11].y ? 1 : 0;
        const rightWristAboveShoulder =
          landmarks[16].y < landmarks[12].y ? 1 : 0;
        const armsRaised =
          leftWristAboveShoulder + rightWristAboveShoulder >= 1; // 한쪽 팔이라도 올라가 있으면 true

        // 플랭크 자세인지 확인
        const isPlank =
          avgHipAngle > hipAnglePlankThreshold &&
          avgKneeAngle > kneeAnglePlankThreshold;

        console.log(
          `State: ${burpeeStateRef.current}, isStanding: ${isStanding}, armsRaised: ${armsRaised}, isPlank: ${isPlank}`
        );

        // 버피 상태 전환
        if (burpeeStateRef.current === "down" && isStanding && armsRaised) {
          burpeeStateRef.current = "up";
          onCountIncrease();
        }

        if (burpeeStateRef.current === "up" && isPlank) {
          burpeeStateRef.current = "down";
          onPreMovement();
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
      {/* 버피 카운트 출력 */}
      <div className="vs_container">
        <div className="vs_element">
          {/* 아바타 운동 횟수 */}
          <h1>{animationRepeatCount}</h1>
          <h1>&nbsp; VS &nbsp;</h1>
          {/* 플레이어 운동 횟수 */}
          <h1>{burpeeCountRef.current}</h1>
        </div>
      </div>
    </div>
  );
}

export default MediapipeBurpeeTracking;
