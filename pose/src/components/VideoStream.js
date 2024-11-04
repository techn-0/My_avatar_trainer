// src/components/VideoStream.js
import React, { useRef, useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import useWebRTC from "../hooks/useWebRTC";
import "./VideoStream.css";

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

function VideoStream({ roomName }) {
  const { localStreamRef, remoteStream } = useWebRTC(roomName);
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);

  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    // MediaPipe Pose 인스턴스 생성
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // 포즈 인식 결과에 따른 캔버스 업데이트
    pose.onResults((results) => {
      if (!canvasRef.current) return;

      const canvasCtx = canvasRef.current.getContext("2d");
      if (!canvasCtx || !results.image) return;

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
      }
    });

    // 로컬 비디오에서 MediaPipe의 포즈 감지 시작
    const camera = new Camera(localVideoRef.current, {
      onFrame: async () => {
        if (pose && localVideoRef.current) {
          await pose.send({ image: localVideoRef.current });
        }
      },
      width: 640,
      height: 480,
    });
    camera.start();

    // 객체를 참조에 저장하여 나중에 정리할 때 사용
    cameraRef.current = camera;
    poseRef.current = pose;

    return () => {
      // 컴포넌트 언마운트 시 camera와 pose 정리
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    };
  }, []);

  return (
    <div className="video-stream">
      {/* Local video stream with MediaPipe overlay */}
      <video ref={localVideoRef} autoPlay muted className="local-video" />
      <canvas ref={canvasRef} className="pose-canvas" />

      {/* Remote video stream */}
      {remoteStream ? (
        <video
          autoPlay
          className="remote-video"
          ref={(video) => {
            if (video && remoteStream) {
              video.srcObject = remoteStream;
            }
          }}
        />
      ) : (
        <p>No remote video stream available</p>
      )}
    </div>
  );
}

export default VideoStream;
