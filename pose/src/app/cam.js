import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"; // Mediapipe 그리기 유틸리티

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
]; // 포즈 연결점

function MediapipeMotionTracking({ onCanvasUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const isComponentMounted = useRef(true); // 컴포넌트 마운트 여부 추적

  useEffect(() => {
    isComponentMounted.current = true; // 컴포넌트가 마운트되었음을 표시

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    poseRef.current = pose; // pose 인스턴스를 참조에 저장

    let camera = null;

    if (typeof videoRef.current !== "undefined" && videoRef.current !== null) {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (
            videoRef.current &&
            poseRef.current &&
            isComponentMounted.current
          ) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start();
    }

    function onResults(results) {
      if (!canvasRef.current || !isComponentMounted.current) return;

      const canvasCtx = canvasRef.current.getContext("2d");

      // 캠 화면 지우기
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

      // 관절 및 연결선 그리기
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: "white",
          lineWidth: 4,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "blue",
          lineWidth: 2,
        });

        // 부모 컴포넌트로 캔버스 전달
        if (onCanvasUpdate) {
          onCanvasUpdate(canvasRef.current);
        }
      }
    }

    // 컴포넌트 언마운트 시 클린업
    return () => {
      isComponentMounted.current = false; // 컴포넌트가 언마운트되었음을 표시

      if (camera) {
        camera.stop();
        camera = null;
      }
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    };
  }, [onCanvasUpdate]);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }}></video>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ display: "none" }}
      ></canvas>
    </div>
  );
}

export default MediapipeMotionTracking;
