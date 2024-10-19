import React, { useEffect, useRef } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import * as THREE from "three";

const PoseTracker3DBox = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const threeCanvasRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    // Mediapipe Pose 설정
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    // Three.js 3D 박스 및 비디오 텍스처 설정
    const scene = new THREE.Scene();
    const camera3D = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvasRef.current,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // 카메라를 박스의 정면을 바라보도록 설정
    camera3D.position.set(0, 0, 5);

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const texture = new THREE.VideoTexture(videoElement);

    // 모든 면에 카메라 피드를 적용
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const materials = [
      material, // front
      material, // back
      material, // top
      material, // bottom
      material, // left
      material, // right
    ];

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    const renderScene = () => {
      requestAnimationFrame(renderScene);
      cube.rotation.y += 0.01; // 박스 회전
      renderer.render(scene, camera3D); // 고정된 카메라에서 렌더링
    };

    renderScene();

    function onResults(results) {
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
      // 추가적인 포즈 데이터 처리...
    }

    return () => {
      camera.stop();
      renderer.dispose(); // Three.js 메모리 해제
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* 비디오 요소를 표시 */}
      <video
        ref={videoRef}
        width="640"
        height="480"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 2, // Three.js 캔버스보다 위에 표시
          border: "1px solid black",
        }}
      />

      {/* Three.js 캔버스 */}
      <canvas
        ref={threeCanvasRef}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          zIndex: 1,
          width: "100vw", // 화면 너비에 맞게 조정
          height: "100vh", // 화면 높이에 맞게 조정
        }}
      />
    </div>
  );
};

export default PoseTracker3DBox;
