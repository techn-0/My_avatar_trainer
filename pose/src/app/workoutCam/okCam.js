import React, { useEffect, useRef } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";
import "@mediapipe/pose/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
// import { useGreenFlashEffect } from "./greenFlashEffect"; // 필요한 경우 사용

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

const OkCam = ({ active, onCanvasUpdate, onOkPoseDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const okStateRef = useRef(false);

  // 포즈 감지 세팅
  const detectPose = (landmarks) => {
    const leftElbowY = landmarks[13].y;
    const rightElbowY = landmarks[14].y;
    const leftWristY = landmarks[15].y;
    const rightWristY = landmarks[16].y;
    const leftShoulderY = landmarks[11].y;
    const rightShoulderY = landmarks[12].y;

    const avgElbowY = (leftElbowY + rightElbowY) / 2;
    const avgWristY = (leftWristY + rightWristY) / 2;
    const avgShoulderY = (leftShoulderY + rightShoulderY) / 2;

    if (avgElbowY < avgShoulderY && avgWristY < avgElbowY) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    let timerId = null;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvasCtx = canvasRef.current.getContext("2d");
      const landmarks = results.poseLandmarks;

      if (landmarks) {
        // 캔버스 초기화
        canvasCtx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // 노드와 간선 그리기
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "white",
          lineWidth: 4,
        });
        drawLandmarks(
          canvasCtx,
          results.poseLandmarks.filter((_, index) => index > 10),
          {
            color: "blue",
            lineWidth: 2,
          }
        );

        // ok 포즈 감지 상태 확인 및 타이머 설정
        if (!okStateRef.current && detectPose(landmarks)) {
          if (!timerId) {
            timerId = setTimeout(() => {
              okStateRef.current = true;
              console.log("current ok state:", okStateRef.current);
              timerId = null;

              // 부모 컴포넌트에 ok 포즈 감지 알림
              if (onOkPoseDetected) {
                onOkPoseDetected();
              }
            }, 1000); // 1초 유지 시 상태 변경
          }
        } else if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }

        // 부모 컴포넌트로 업데이트된 캔버스 전달
        if (onCanvasUpdate) {
          onCanvasUpdate(canvasRef.current);
        }
      }
    });

    if (active) {
      let camera = cameraRef.current;
      const videoElement = videoRef.current;
      if (videoElement && !camera) {
        camera = new Camera(videoElement, {
          onFrame: async () => {
            if (pose) {
              await pose.send({ image: videoElement });
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
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [active, onOkPoseDetected, onCanvasUpdate]);

  return (
    <div>
      <video
        ref={videoRef}
        width="800"
        height="640"
        style={{
          display: "block",
          position: "absolute",
          top: 100,
          right: "100px",
          borderRadius: "30px",
          // border: "5px solid white",
        }}
      ></video>
      <canvas
        ref={canvasRef}
        width="800"
        height="640"
        style={{
          display: "block",
          position: "absolute",
          top: 100,
          right: "100px",
          // opacity: "0%",
          //   borderRadius: "30px",
          //   border: "5px solid white",
        }}
      ></canvas>
    </div>
  );
};

export default OkCam;
