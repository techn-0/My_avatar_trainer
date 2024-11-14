// pushupCamera.js

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

function MediapipePushupTracking({
  onCanvasUpdate,
  onCountUpdate,
  roomName,
  duration,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [pushupCount, setPushupCount] = useState(0);
  const [animateCount, setAnimateCount] = useState(false); // 나의 카운트 애니메이션
  const [remoteAnimateCount, setRemoteAnimateCount] = useState(false); // 상대 카운트 애니메이션
  const [remotePushupCount, setRemotePushupCount] = useState(0);
  const pushupStateRef = useRef("down"); // 초기 상태를 "down"으로 설정

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

    setPushupCount((prevCount) => {
      const newCount = prevCount + 1;

      // 애니메이션 트리거
      setAnimateCount(true);
      setTimeout(() => setAnimateCount(false), 300); // 애니메이션 지속 시간 후 제거

      // 효과음 재생
      const audio = new Audio("/sound/good.wav"); // 효과음 파일 경로
      audio.play();

      // 서버에 푸시업 횟수 업데이트 전송
      socket.emit("pushupCountUpdate", {
        roomName,
        count: newCount,
      });

      if (onCountUpdate) {
        onCountUpdate(newCount);
      }

      return newCount;
    });
  }

  // 컴포넌트 마운트 시 운동 타이머 시작
  useEffect(() => {
    // 운동 타이머 시작
    socket.emit("startExerciseTimer", {
      roomName,
      duration: 30, // 예를 들어 30초 동안 운동 타이머
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
      if (!poseSingleton) {
        poseSingleton = new Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        poseSingleton.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
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
        // drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        //   color: "white",
        //   lineWidth: 4,
        // });
        // drawLandmarks(canvasCtx, results.poseLandmarks, {
        //   color: "blue",
        //   lineWidth: 2,
        // });

        const landmarks = results.poseLandmarks;

        // 필수 랜드마크 확인
        const requiredLandmarkIndices = [11, 12, 13, 14, 15, 16, 23, 24];
        const allLandmarksPresent = requiredLandmarkIndices.every(
          (index) => landmarks[index]
        );

        if (!allLandmarksPresent) {
          console.warn("Some landmarks are missing");
          return;
        }

        // 어깨와 엉덩이의 Y 좌표 계산
        const leftHipY = landmarks[23].y;
        const rightHipY = landmarks[24].y;
        const leftShoulderY = landmarks[11].y;
        const rightShoulderY = landmarks[12].y;

        // 평균 Y 좌표 계산
        const avgHipY = (leftHipY + rightHipY) / 2;
        const avgShoulderY = (leftShoulderY + rightShoulderY) / 2;

        // 어깨와 엉덩이의 Y 좌표 차이 계산
        const bodyInclination = Math.abs(avgShoulderY - avgHipY);

        // 임계값 설정 (필요에 따라 조정 가능)
        const horizontalThreshold = 0.2;

        // 몸이 수평인지 판단
        const isBodyHorizontal = bodyInclination < horizontalThreshold;

        if (!isBodyHorizontal) {
          // 서 있는 상태이면 푸시업 인식하지 않음
          pushupStateRef.current = "down"; // 상태 초기화
          if (onCanvasUpdate) {
            onCanvasUpdate(canvasRef.current);
          }
          return;
        }

        // 왼쪽 팔꿈치 각도 (left_shoulder, left_elbow, left_wrist)
        let leftElbowAngle = null;
        if (landmarks[11] && landmarks[13] && landmarks[15]) {
          leftElbowAngle = angleCalc(landmarks, 11, 13, 15);
        }

        // 오른쪽 팔꿈치 각도 (right_shoulder, right_elbow, right_wrist)
        let rightElbowAngle = null;
        if (landmarks[12] && landmarks[14] && landmarks[16]) {
          rightElbowAngle = angleCalc(landmarks, 12, 14, 16);
        }

        // 사용할 팔 선택 (인식된 팔)
        let elbowAngle = null;
        if (leftElbowAngle !== null && rightElbowAngle !== null) {
          elbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
        } else if (leftElbowAngle !== null) {
          elbowAngle = leftElbowAngle;
        } else if (rightElbowAngle !== null) {
          elbowAngle = rightElbowAngle;
        } else {
          console.warn("No elbow landmarks detected");
          return;
        }

        // 각도 값이 유효한지 확인
        if (elbowAngle === null) {
          console.warn("Angle calculation returned null");
          return;
        }

        // 푸시업 다운 조건
        const isPushupDown =
          elbowAngle < 110 && pushupStateRef.current === "up";

        // 푸시업 업 조건
        const isPushupUp =
          elbowAngle > 140 && pushupStateRef.current === "down";

        // 상태 전환 및 카운트 업데이트
        if (isPushupDown) {
          pushupStateRef.current = "down";
          onPreMovement(); // 내려갈 때
        }

        if (isPushupUp) {
          pushupStateRef.current = "up";
          onCountIncrease(); // 올라올 때 카운트 증가
        }

        // 효과 그리기
        drawEffects(
          canvasCtx,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // 부모 컴포넌트로 업데이트된 캔버스 전달
        if (onCanvasUpdate) {
          onCanvasUpdate(canvasRef.current);
        }
      }
    },
    [onCanvasUpdate, drawEffects]
  );

  useEffect(() => {
    // 서버로부터 상대방의 푸시업 횟수 업데이트 수신
    socket.on("remotePushupCountUpdate", ({ username, count }) => {
      setRemotePushupCount(count);
      setRemoteAnimateCount(true);
      setTimeout(() => setRemoteAnimateCount(false), 300); // 애니메이션 지속 시간 후 제거
    });

    return () => {
      socket.off("remotePushupCountUpdate");
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
          {/* 푸시업 카운트 표시 */}
          <div className="vs_container">
            <div className="vs_element">
              {/* 로컬 사용자의 푸시업 횟수 */}
              <h1 className={`${animateCount ? "work-count" : ""}`}>
                {pushupCount}
              </h1>
              <h1>VS</h1>
              {/* 상대방의 푸시업 횟수 */}
              <h1 className={`${remoteAnimateCount ? "work-count" : ""}`}>
                {remotePushupCount}
              </h1>
            </div>
          </div>
        </>
      )}

      {/* 운동 결과 모달 */}
      {showResultModal && (
        <ExerciseResultModal
          onClose={() => setShowResultModal(false)}
          userScore={pushupCount}
          opponentScore={remotePushupCount}
        />
      )}
    </div>
  );
}

export default MediapipePushupTracking;
