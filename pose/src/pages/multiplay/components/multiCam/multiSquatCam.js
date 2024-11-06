// MultiSquatCam.js

import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import VideoStream from "../VideoStream";
import MediapipeSquatTracking from "./squatCamera";
import socket from "../../services/Socket";

const MultiSquatCam = ({ roomName }) => {
  const [localReady, setLocalReady] = useState(false);
  const [bothReady, setBothReady] = useState(false);

  // 운동 시간과 종목 상태
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(0);

  // OK 포즈 감지를 위한 참조 및 상태
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null); // Pose 인스턴스를 저장할 참조 추가
  const okStateRef = useRef(false);

  // 서버로부터 운동 정보 받아오기
  useEffect(() => {
    socket.on("exerciseInfo", ({ exercise, duration }) => {
      console.log("Received exerciseInfo:", exercise, duration);
      setSelectedExercise(exercise);
      setSelectedDuration(duration);
    });

    return () => {
      socket.off("exerciseInfo");
    };
  }, []);

  // 서버로부터 게임 시작 이벤트 수신
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("startGame", () => {
      setBothReady(true);
    });

    return () => {
      socket.off("startGame");
    };
  }, []);

  // OK 포즈 감지 함수
  const detectOkPose = (landmarks) => {
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

  // OK 포즈 감지 및 처리
  useEffect(() => {
    let timerId = null;

    if (!localReady && !bothReady) {
      // Pose 인스턴스 생성
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
        const landmarks = results.poseLandmarks;

        if (landmarks) {
          if (!okStateRef.current && detectOkPose(landmarks)) {
            if (!timerId) {
              timerId = setTimeout(() => {
                okStateRef.current = true;
                timerId = null;

                // OK 포즈 감지됨
                handleOkPoseDetected();
              }, 1000); // 1초 유지 시 상태 변경
            }
          } else if (timerId) {
            clearTimeout(timerId);
            timerId = null;
          }
        }
      });

      poseRef.current = pose; // Pose 인스턴스 저장

      // 카메라 시작
      const videoElement = videoRef.current;

      if (videoElement) {
        const camera = new Camera(videoElement, {
          onFrame: async () => {
            if (poseRef.current) {
              await poseRef.current.send({ image: videoElement });
            }
          },
          width: 1280,
          height: 720,
        });
        camera.start();
        cameraRef.current = camera;
      }
    }

    return () => {
      // 정리 작업
      if (timerId) {
        clearTimeout(timerId);
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [localReady, bothReady]);

  // OK 포즈 감지 후 처리
  const handleOkPoseDetected = () => {
    setLocalReady(true);
    socket.emit("playerReady", { roomName });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {bothReady && localReady ? (
        <>
          {/* MediaPipe Squat Tracking */}
          <MediapipeSquatTracking
            onCanvasUpdate={() => {}}
            active={true}
            onCountUpdate={() => {}}
            roomName={roomName}
          />

          {/* WebRTC Video Streams */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "2000px",
              height: "1850px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <VideoStream roomName={roomName} showLocalVideo={false} />
          </div>
        </>
      ) : (
        // OK 포즈 감지 화면
        <div>
          <p>OK 포즈를 취해주세요...</p>
          <div
            style={{ position: "relative", width: "800px", height: "640px" }}
          >
            <video
              ref={videoRef}
              width="800"
              height="640"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                objectFit: "cover",
              }}
              autoPlay
              muted
            ></video>
            <canvas
              ref={canvasRef}
              width="800"
              height="640"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
              }}
            ></canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSquatCam;
