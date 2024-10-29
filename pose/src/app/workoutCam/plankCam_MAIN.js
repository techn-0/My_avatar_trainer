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
  const [plankCount, setPlankCount] = useState(0);
  const plankStateRef = useRef("up");


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

    let lastFrameTime = 0;
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
        
        // 몇 ms 마다 Count를 올릴 것인지에 대한 코드이다. 
        // const frameThreshold = 100;
        // let consecutiveFrames = 0;
        const currentTime = Date.now();

        // 왼쪽과 오른쪽 다리의 각도 계산
        const leftPlankElbowAngle = angleCalc(results.poseLandmarks, "left", 1, 2, 6);
        const rightPlankElbowAngle = angleCalc(results.poseLandmarks, "right", 1, 2, 6);
        const leftPlankWaistAngle = angleCalc(results.poseLandmarks, "right", 1, 3, 4);
        const rightPlankWaistAngle = angleCalc(results.poseLandmarks, "right", 1, 3, 4);

        // 스쿼트 상태 전환 및 카운트 업데이트
        if (
          (leftPlankElbowAngle < 110 && leftPlankWaistAngle > 150 && plankStateRef.current === "up") ||
          (rightPlankElbowAngle < 110 && rightPlankWaistAngle > 150 && plankStateRef.current === "up")
        ) {
          // 0.1초 마다 Framecount를 늘려서, Framecount/10을 하면 시간을 구할 수 있다. 
          if(currentTime - lastFrameTime >=100){
            setPlankCount((prevCount) => {
              const newCount = prevCount + 1;
              if (onCountUpdate) {
                onCountUpdate(newCount); // 부모 컴포넌트로 카운트 업데이트 전달
              }
              return newCount;
            });

            plankStateRef.current = "down";
            lastFrameTime = currentTime;
          }
        }

        if (
          ((leftPlankElbowAngle > 130 || leftPlankWaistAngle < 150) && plankStateRef.current === "down") ||
          ((rightPlankElbowAngle > 130 ||  rightPlankWaistAngle < 150) && plankStateRef.current === "down")
        ) {
          plankStateRef.current = "up";
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
        <h1>스쿼트 횟수: {plankCount}</h1>
      </div>
    </div>
  );
}

export default MediapipeSquatTracking;
