// MediapipeSquatTracking.js

import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { angleCalc } from "./angleCalc";
import { useGreenFlashEffect } from "./greenFlashEffect";
import "./exBL.css";

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
  active,
  onCountUpdate,
  animationRepeatCount,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const squatCountRef = useRef(0);
  const squatStateRef = useRef("up");

  const { triggerGreenFlash, triggerGoodBox, drawEffects } =
    useGreenFlashEffect();

  function onPreMovement() {
    triggerGreenFlash();
  }

  function onCountIncrease() {
    triggerGreenFlash();
    triggerGoodBox(); // Trigger the "Good!" box
    squatCountRef.current += 1;
    if (onCountUpdate) {
      onCountUpdate(squatCountRef.current);
    }
  }

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

    async function onResults(results) {
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

        // Handle null angle values
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

        // Debug logs
        // console.log("Left Knee Angle:", leftKneeAngle);
        // console.log("Right Knee Angle:", rightKneeAngle);
        // console.log("Left Hip Angle:", leftHipAngle);
        // console.log("Right Hip Angle:", rightHipAngle);
        // console.log("Left Torso Angle:", leftTorsoAngle);
        // console.log("Right Torso Angle:", rightTorsoAngle);

        // Squat down condition
        const isSquatDown =
          leftKneeAngle < 100 &&
          rightKneeAngle < 100 &&
          leftHipAngle < 100 &&
          rightHipAngle < 100 &&
          leftTorsoAngle > 30 &&
          rightTorsoAngle > 30;

        // Squat up condition
        const isSquatUp = leftKneeAngle > 140 || rightKneeAngle > 140;
        // (leftHipAngle > 140 || rightHipAngle > 140);
        // (leftTorsoAngle < 20 || rightTorsoAngle < 20);

        // console.log("isSquatDown:", isSquatDown);
        // console.log("isSquatUp:", isSquatUp);

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
  }, [active]);

  return (
    <div>
      <video
        ref={videoRef}
        width="800"
        height="auto"
        style={{ display: "block", position: "absolute", top: 10, right: 10 }}
      ></video>
      <canvas
        ref={canvasRef}
        width="800"
        height="640"
        style={{ display: "block", position: "absolute", top: 10, right: 10 }}
      ></canvas>
      {/* Squat count display */}
      <div className="vs_container">
        <div className="vs_element">
          {/* 플레이어 운동 횟수 */}
          <h1>{animationRepeatCount}</h1>
          <h1>&nbsp; VS &nbsp;</h1>
          {/* 아바타 운동 횟수 */}
          <h1>{squatCountRef.current}</h1>
        </div>
      </div>
    </div>
  );
}

export default MediapipeSquatTracking;
