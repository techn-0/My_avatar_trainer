// squatCam.js

import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { angleCalc } from "../../../../app/workoutCam/angleCalc";
import { useGreenFlashEffect } from "../../../../app/workoutCam/greenFlashEffect";
import "../../../../app/workoutCam/exBL.css";
import socket from "../../services/Socket";
import ExerciseTimer from "../../../../app/exerciseTimer";
import ExerciseResultModal from "../../../ui/exerciseResult";

let poseSingleton = null;

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

function MediapipeSquatTracking({
  onCanvasUpdate,
  onCountUpdate,
  roomName,
  duration,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [squatCount, setSquatCount] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);// 나의 카운트 애니메이션화
  const [remoteAnimateCount, setRemoteAnimateCount] = useState(false); // 상대 카운트 애니메이션
  const [remoteSquatCount, setRemoteSquatCount] = useState(0);
  const squatStateRef = useRef("up");

  const [showTimer, setShowTimer] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null); // 남은 시간 관리
  const timerStartTimeRef = useRef(null);

  const [showResultModal, setShowResultModal] = useState(false);
  const [mediapipeActive, setMediapipeActive] = useState(true);

  const { triggerGreenFlash, triggerGoodBox, drawEffects } =
    useGreenFlashEffect();

  function onPreMovement() {
    triggerGreenFlash();
  }

  function onCountIncrease() {
    triggerGreenFlash();
    triggerGoodBox();
    setSquatCount((prevCount) => {
      const newCount = prevCount + 1;

      // 애니메이션 트리거
      setAnimateCount(true);
      setTimeout(() => setAnimateCount(false), 300); // 애니메이션 지속 시간 후 제거
      
      // 효과음 재생
      const audio = new Audio("/sound/good.wav"); // 효과음 파일 경로
      audio.play();

      // 서버에 스쿼트 횟수 업데이트 전송
      socket.emit("squatCountUpdate", {
        roomName,
        count: newCount,
      });

      if (onCountUpdate) {
        onCountUpdate(newCount);
      }

      return newCount;
    });
  }

  //컴포넌트 마운트 시 카운트다운 시작
  useEffect(() => {
    // 운동 타이머 시작
    socket.emit("startExerciseTimer", {
      roomName,
      duration: 30, // 예를 들어 5분(300초) 동안 운동 타이머
    });

    socket.on("exerciseTimerStarted", ({ startTime, duration }) => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const initialRemainingTime = duration - elapsedTime;

      if (initialRemainingTime > 0) {
        startExerciseTimer(Math.floor(initialRemainingTime));
      } else {
        setRemainingTime(0); // 이미 종료된 경우
      }
    });

    return () => {
      socket.off("exerciseTimerStarted");
    };
  }, [roomName]);

  useEffect(() => {
    // Mediapipe 초기화 및 카메라 제어
    if (mediapipeActive) {
      // poseSingleton 초기화
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
  }, [mediapipeActive]);

  const onResults = React.useCallback(
    (results) => {
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
        drawLandmarks(
          canvasCtx,
          results.poseLandmarks.filter((_, index) => index > 10),
          {
            color: "blue",
            lineWidth: 2,
          }
        );

        const landmarks = results.poseLandmarks;

        // Required landmark indices
        const requiredLandmarkIndices = [
          11, 12, 23, 24, 25, 26, 27, 28, 29, 30,
        ];
        const allLandmarksPresent = requiredLandmarkIndices.every(
          (index) => landmarks[index]
        );

        if (!allLandmarksPresent) {
          console.warn("Some landmarks are missing");
          return;
        }

        // 각도 계산 및 스쿼트 상태 업데이트 로직
        // Left knee angle (left_hip, left_knee, left_ankle)
        const leftKneeAngle = angleCalc(landmarks, 23, 25, 27);

        // Right knee angle (right_hip, right_knee, right_ankle)
        const rightKneeAngle = angleCalc(landmarks, 24, 26, 28);

        // Left hip angle (left_shoulder, left_hip, left_knee)
        const leftHipAngle = angleCalc(landmarks, 11, 23, 25);

        // Right hip angle (right_shoulder, right_hip, right_knee)
        const rightHipAngle = angleCalc(landmarks, 12, 24, 26);

        // Torso angle (nose, left_shoulder, left_hip)
        const leftTorsoAngle = angleCalc(landmarks, 0, 11, 23);
        const rightTorsoAngle = angleCalc(landmarks, 0, 12, 24);

        if (
          leftKneeAngle === null ||
          rightKneeAngle === null ||
          leftHipAngle === null ||
          rightHipAngle === null ||
          leftTorsoAngle === null ||
          rightTorsoAngle === null
        ) {
          console.warn("Angle calculation returned null");
          return;
        }

        // Squat down condition
        const isSquatDown =
          leftKneeAngle < 70 &&
          rightKneeAngle < 70 &&
          leftHipAngle < 70 &&
          rightHipAngle < 70 &&
          leftTorsoAngle > 30 &&
          rightTorsoAngle > 30;

        // Squat up condition
        const isSquatUp = leftKneeAngle > 140 || rightKneeAngle > 140;

        // Update squat state and count
        if (isSquatDown && squatStateRef.current === "up") {
          squatStateRef.current = "down";
          onPreMovement();
        }

        if (isSquatUp && squatStateRef.current === "down") {
          squatStateRef.current = "up";
          onCountIncrease();
        }

        // Draw effects (green flash and "Good!" box)
        drawEffects(
          canvasCtx,
          canvasRef.current.width,
          canvasRef.current.height
        );

        if (onCanvasUpdate) {
          onCanvasUpdate(canvasRef.current);
        }
      }
    },
    [onCanvasUpdate, drawEffects]
  );

  useEffect(() => {
    // 서버로부터 상대방의 스쿼트 횟수 업데이트 수신
    socket.on("remoteSquatCountUpdate", ({ username, count }) => {
      setRemoteSquatCount(count);
      setRemoteAnimateCount(true);
      setTimeout(() => setRemoteAnimateCount(false), 300); // 애니메이션 지속 시간 후 제거
    });

    return () => {
      socket.off("remoteSquatCountUpdate");
    };
  }, [roomName]);

  const startExerciseTimer = (initialTime) => {
    setShowTimer(true);
    timerStartTimeRef.current = Date.now();
    setRemainingTime(Math.floor(initialTime));
  };

  const endExercise = () => {
    setShowTimer(false);
    setShowResultModal(true);
    setMediapipeActive(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {mediapipeActive && (
        <>
          <video
            ref={videoRef}
            style={{
              display: "none", // 비디오 요소를 숨깁니다.
            }}
          ></video>
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0, // 투명도를 0으로 설정하여 보이지 않게 합니다.
              width: "800px",
              height: "640px",
            }}
          ></canvas>
        </>
      )}
       
     
      {/* 운동 타이머 */}
      {showTimer && remainingTime !== null && (
        <>
        <ExerciseTimer
          durationInSeconds={remainingTime}
          onTimerEnd={endExercise}
          startTimeRef={timerStartTimeRef}
        />
        {/* 스쿼트 카운트 표시 */}
       <div className="vs_container">
        <div className="vs_element">
          {/* 로컬 사용자의 스쿼트 횟수 */}
          <h1 className={`${animateCount ? "work-count" : ""}`}>
            {squatCount}</h1>
          <h1>VS</h1>
          {/* 상대방의 스쿼트 횟수 */}
          <h1 className={`${remoteAnimateCount ?  "work-count" : ""}`}>{remoteSquatCount}</h1>
        </div>
      </div>

        </>
      )}

      {/* 운동 결과 모달 */}
      {showResultModal && (
        <ExerciseResultModal
          onClose={() => setShowResultModal(false)}
          userScore={squatCount}
          opponentScore={remoteSquatCount}
        />
      )}
    </div>
  );
}

export default MediapipeSquatTracking;
