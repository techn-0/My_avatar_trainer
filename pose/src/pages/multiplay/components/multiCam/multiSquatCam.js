// MultiSquatCam.js

import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import VideoStream from "../VideoStream";
import MediapipeSquatTracking from "./squatCamera";
import socket from "../../services/Socket";
import OkGuide from "../../../ui/okCamGuide";
import CountDown from "../../../ui/countDown";

const MultiSquatCam = ({ roomName, selectedExercise, selectedDuration }) => {
  const [localReady, setLocalReady] = useState(false);
  const [bothReady, setBothReady] = useState(false);
  const countdownMusicRef = useRef(null);
  const [countdownFinished, setCountdownFinished] = useState(false);

  // OK 포즈 감지를 위한 참조 및 상태
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const okStateRef = useRef(false);

  // 서버로부터 두 플레이어 모두 준비 완료 이벤트 수신
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("bothPlayersReady", () => {
      setBothReady(true);
    });

    return () => {
      socket.off("bothPlayersReady");
    };
  }, []);

  useEffect(() => {
    if (bothReady && countdownMusicRef.current) {
      countdownMusicRef.current.currentTime = 0;
      countdownMusicRef.current.play();
    }
  }, [bothReady]);

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
      const landmarks = results.poseLandmarks;

      if (landmarks) {
        if (!okStateRef.current && detectOkPose(landmarks)) {
          if (!timerId) {
            timerId = setTimeout(() => {
              okStateRef.current = true;
              timerId = null;

              // 로컬 플레이어 준비 완료 상태 설정
              setLocalReady(true);

              // 서버에 플레이어 준비 완료 알림
              socket.emit("playerReady", { roomName });

              // 카메라 및 포즈 감지 중지
              if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
              }
            }, 1000); // 1초 유지 시 상태 변경
          }
        } else if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
      }
    });

    if (!localReady && !bothReady) {
      // OkCam을 위한 카메라 시작
      let camera = cameraRef.current;
      const videoElement = videoRef.current;
      if (videoElement && !camera) {
        camera = new Camera(videoElement, {
          onFrame: async () => {
            if (pose) {
              await pose.send({ image: videoElement });
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
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [localReady, bothReady, roomName]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {bothReady ? (
        <>
          {!countdownFinished ? (
            <>
              <CountDown onCountdownEnd={() => setCountdownFinished(true)} />
              <audio ref={countdownMusicRef} src="/sound/3secCount.mp3" />
            </>
          ) : (
            <>
              {/* MediaPipe Squat Tracking */}
              <MediapipeSquatTracking
                onCanvasUpdate={() => {}}
                onCountUpdate={() => {}}
                roomName={roomName}
                duration={selectedDuration}
              />
              {/* WebRTC Video Streams */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "2000px",
                  height: "900px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <VideoStream roomName={roomName} showLocalVideo={false} />
              </div>
            </>
          )}
        </>
      ) : (
        // OK 포즈 감지 화면
        <div>
          <p style={{ color: "white" }}>OK 포즈를 취해주세요...</p>
          <div
            style={{ display: "flex", gap: "100px", justifyContent: "center" }}
          >
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
                  width: "800px",
                  height: "640px",
                  objectFit: "cover",
                }}
              ></video>
              <canvas
                ref={canvasRef}
                width="800"
                height="640"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "800px",
                  height: "640px",
                }}
              ></canvas>
              <img
                src="/ok.png"
                alt="Guideline"
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  width: "500px",
                  height: "640px",
                  opacity: 0.5,
                  pointerEvents: "none",
                }}
              />
            </div>

            <div>
              <OkGuide />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSquatCam;
