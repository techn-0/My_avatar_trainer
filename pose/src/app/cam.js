import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

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

function MediapipeMotionTracking({ onCanvasUpdate, active }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);

  const [squatCount, setSquatCount] = useState(0); // 스쿼트 카운트 상태
  const squatStateRef = useRef("up"); // 스쿼트 상태를 추적하기 위한 변수 (up 또는 down)

  // 스쿼트 각도 계산 함수
  const calculateAngle = (point1, point2, point3) => {
    const radians =
      Math.atan2(point3.y - point2.y, point3.x - point2.x) -
      Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = (radians * 180) / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  };

  useEffect(() => {
    // Pose 싱글톤 인스턴스 초기화
    if (!poseSingleton) {
      poseSingleton = new Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      poseSingleton.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseSingleton.onResults(onResults);
    }

    function onResults(results) {
      if (!canvasRef.current) return;

      const canvasCtx = canvasRef.current.getContext("2d");

      // 캔버스 클리어
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

      // 랜드마크와 연결선 그리기
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "white",
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "blue",
          lineWidth: 2,
        });

        // 스쿼트 감지 로직 추가
        const leftHip = results.poseLandmarks[23];
        const leftKnee = results.poseLandmarks[25];
        const leftAnkle = results.poseLandmarks[27];

        const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

        if (kneeAngle < 70 && squatStateRef.current === "up") {
          squatStateRef.current = "down";
        }
        if (kneeAngle > 160 && squatStateRef.current === "down") {
          squatStateRef.current = "up";
          setSquatCount((prevCount) => prevCount + 1);
        }

        // 부모 컴포넌트로 업데이트된 캔버스 전달
        if (onCanvasUpdate) {
          onCanvasUpdate(canvasRef.current);
        }
      }
    }

    // active 상태에 따라 카메라 시작/중지
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
      // active가 false일 때 카메라 중지
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    }

    // 컴포넌트 언마운트 시 카메라 중지
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, [active, onCanvasUpdate]);

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
        style={{ position: "absolute", top: "10px", left: "10px", zIndex: 10 }}
      >
        <h1>스쿼트 횟수: {squatCount}</h1>
      </div>
    </div>
  );
}

export default MediapipeMotionTracking;
