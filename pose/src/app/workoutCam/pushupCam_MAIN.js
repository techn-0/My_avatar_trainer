import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { NormalizedLandmarkList } from "@mediapipe/pose";
import { angleCalc } from "./angleCalc";

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

// MediapipeSquatTracking 컴포넌트
function MediapipeSquatTracking({ onCanvasUpdate, active, onCountUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [pushupCount, setPushupCount] = useState(0);
  const pushupStateRef = useRef("up");

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

        // 왼쪽과 오른쪽 다리의 각도 계산
        const leftPushupArmAngle = angleCalc(results.poseLandmarks, "left", 1, 2, 6);
        const rightPushupArmAngle = angleCalc(results.poseLandmarks, "right", 1, 2, 6);
        const leftPushupWaistAngle = angleCalc(results.poseLandmarks, "left", 1, 3, 4);
        const rightPushupWaistAngle = angleCalc(results.poseLandmarks, "right", 1, 3, 4);

        // 스쿼트 상태 전환 및 카운트 업데이트
        if (
          (leftPushupArmAngle < 130 && leftPushupWaistAngle > 150 && pushupStateRef.current === "up") ||
          (rightPushupArmAngle < 130 && rightPushupWaistAngle > 150 && pushupStateRef.current === "up")
        ) {
          pushupStateRef.current = "down";
          // console.log(leftPushupArmAngle);
          // console.log(rightPushupArmAngle);
        }

        if (
          (leftPushupArmAngle > 150 && leftPushupWaistAngle > 150 && pushupStateRef.current === "down") ||
          (rightPushupArmAngle > 150 && rightPushupWaistAngle > 150 && pushupStateRef.current === "down")
        ) {
          pushupStateRef.current = "up";
          setPushupCount((prevCount) => {
            const newCount = prevCount + 1;
            if (onCountUpdate) {
              onCountUpdate(newCount); // 부모 컴포넌트로 카운트 업데이트 전달
            }
            return newCount;
          });
        }

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
  }, [active, onCanvasUpdate, onCountUpdate]);

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
        <h1>스쿼트 횟수: {pushupCount}</h1>
      </div>
    </div>
  );
}

export default MediapipeSquatTracking;
