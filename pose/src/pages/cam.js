import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

function MediapipeMotionTracking({ onCanvasUpdate }) {
  const videoRef = useRef(null);
  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null); // 두 번째 캔버스

  useEffect(() => {
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

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    function onResults(results) {
      const canvasCtx1 = canvas1Ref.current.getContext("2d");
      const canvasCtx2 = canvas2Ref.current.getContext("2d");

      canvasCtx1.clearRect(
        0,
        0,
        canvas1Ref.current.width,
        canvas1Ref.current.height
      );
      canvasCtx2.clearRect(
        0,
        0,
        canvas2Ref.current.width,
        canvas2Ref.current.height
      );

      canvasCtx1.drawImage(
        results.image,
        0,
        0,
        canvas1Ref.current.width,
        canvas1Ref.current.height
      );
      canvasCtx2.drawImage(
        results.image,
        0,
        0,
        canvas2Ref.current.width,
        canvas2Ref.current.height
      );

      // 포즈 랜드마크 그리기
      if (results.poseLandmarks) {
        for (let landmark of results.poseLandmarks) {
          canvasCtx1.beginPath();
          canvasCtx1.arc(
            landmark.x * canvas1Ref.current.width,
            landmark.y * canvas1Ref.current.height,
            5,
            0,
            2 * Math.PI
          );
          canvasCtx1.fillStyle = "red";
          canvasCtx1.fill();

          canvasCtx2.beginPath();
          canvasCtx2.arc(
            landmark.x * canvas2Ref.current.width,
            landmark.y * canvas2Ref.current.height,
            5,
            0,
            2 * Math.PI
          );
          canvasCtx2.fillStyle = "blue";
          canvasCtx2.fill();
        }
      }

      // 두 캔버스를 업데이트할 때 부모 컴포넌트에 전달
      if (onCanvasUpdate) {
        onCanvasUpdate(canvas1Ref.current, canvas2Ref.current);
      }
    }
  }, [onCanvasUpdate]);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }}></video>
      <canvas
        ref={canvas1Ref}
        width="640"
        height="480"
        style={{ display: "none" }}
      ></canvas>
      <canvas
        ref={canvas2Ref}
        width="640"
        height="480"
        style={{ display: "none" }}
      ></canvas>
    </div>
  );
}

export default MediapipeMotionTracking;
