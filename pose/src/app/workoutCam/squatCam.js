import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { NormalizedLandmarkList } from "@mediapipe/pose";

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

// 스쿼트 각도 계산 함수 (왼쪽/오른쪽 다리 모두 고려)
const angleCalc = (data, side) => {
  const index1 = side === "left" ? 11 : 12; // 목
  const index2 = side === "left" ? 23 : 24; // 허리
  const index3 = side === "left" ? 25 : 26; // 무릎

  const neck = [data[index1].x, data[index1].y, data[index1].z];
  const waist = [data[index2].x, data[index2].y, data[index2].z];
  const knee = [data[index3].x, data[index3].y, data[index3].z];

  const dotProduct =
    (neck[0] - waist[0]) * (knee[0] - waist[0]) +
    (neck[1] - waist[1]) * (knee[1] - waist[1]) +
    (neck[2] - waist[2]) * (knee[2] - neck[2]);

  const waistNeckLength = Math.sqrt(
    Math.pow(neck[0] - waist[0], 2) +
      Math.pow(neck[1] - waist[1], 2) +
      Math.pow(neck[2] - waist[2], 2)
  );

  const waistKneeLength = Math.sqrt(
    Math.pow(knee[0] - waist[0], 2) +
      Math.pow(knee[1] - waist[1], 2) +
      Math.pow(knee[2] - waist[2], 2)
  );

  const cos = dotProduct / (waistNeckLength * waistKneeLength);
  return Math.acos(cos) * (180 / Math.PI); // 각도 계산
};

// MediapipeSquatTracking 컴포넌트
function MediapipeSquatTracking({ onCanvasUpdate, active }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [squatCount, setSquatCount] = useState(0);
  const squatStateRef = useRef("up");

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
        const leftSquatAngle = angleCalc(results.poseLandmarks, "left");
        const rightSquatAngle = angleCalc(results.poseLandmarks, "right");
        const averageSquatAngle = (leftSquatAngle + rightSquatAngle) / 2;

        // // 스쿼트 상태 전환 및 카운트 업데이트
        // if (averageSquatAngle < 70 && squatStateRef.current === "up") {
        //   squatStateRef.current = "down";
        // }
        // 스쿼트 상태 전환 및 카운트 업데이트
        if (
          (leftSquatAngle < 90 && squatStateRef.current === "up") ||
          (rightSquatAngle < 90 && squatStateRef.current === "up")
        ) {
          squatStateRef.current = "down";
        }

        if (
          (leftSquatAngle > 140 && squatStateRef.current === "down") ||
          (rightSquatAngle > 140 && squatStateRef.current === "down")
        ) {
          squatStateRef.current = "up";
          setSquatCount((prevCount) => prevCount + 1);
        }

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

      <div
        style={{ position: "absolute", top: "10px", left: "10px", zIndex: 10 }}
      >
        <h1>스쿼트 횟수: {squatCount}</h1>
      </div>
    </div>
  );
}

export default MediapipeSquatTracking;
