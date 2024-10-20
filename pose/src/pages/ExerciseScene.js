import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { loadCharacter } from "../shared/loadCharacter"; // 캐릭터 로드
import { addLights } from "../shared/lights"; // 조명 추가
import { createPlane } from "./createPlane"; // 바닥 추가
import { initOrbitControls } from "../shared/initOrbitControls"; // 카메라 컨트롤
import { useNavigate } from "react-router-dom";
import MediapipeMotionTracking from "../app/cam"; // Mediapipe 컴포넌트
import Buttons from "./ui/exerciseButtons";
import LoginModal from "./LoginModal";

function ExerciseScene() {
  const mountRef = useRef(null); // Three.js 씬을 마운트할 DOM 요소
  const canvasRef = useRef(null); // Mediapipe 캔버스
  const mixerRef = useRef(null);
  const modelRef = useRef(null);
  const loadedAnimations = useRef();
  const navigate = useNavigate();
  const cameraRef = useRef(); // Three.js 카메라 참조
  const controlsRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef(null); // 렌더러 참조 저장
  const [openLogin, setOpenLogin] = useState(false);
  const [mediapipeActive, setMediapipeActive] = useState(true); // Mediapipe 활성화 상태

  // Mediapipe의 캔버스를 업데이트하는 핸들러
  const handleCanvasUpdate = (updatedCanvas) => {
    if (!mediapipeActive || !canvasRef.current || !updatedCanvas) return; // Mediapipe 비활성화 또는 canvas가 없으면 리턴

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx || !updatedCanvas.width || !updatedCanvas.height) return; // updatedCanvas가 유효하지 않으면 리턴

    // 캔버스가 존재할 경우에만 업데이트 수행
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(
      updatedCanvas,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  useEffect(() => {
    let renderer;

    // Three.js 씬, 카메라, 렌더러 생성
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 1000;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2, 4);
    cameraRef.current = camera;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Three.js 렌더러를 DOM에 마운트
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // 씬에 조명 및 바닥 추가
    addLights(scene);
    const plane = createPlane();
    scene.add(plane);

    // 캐릭터 로드
    loadCharacter(scene, (mixer, model, animations) => {
      mixerRef.current = mixer;
      modelRef.current = model;
      loadedAnimations.current = animations;
    });

    // 카메라 컨트롤 추가
    const controls = initOrbitControls(camera, renderer);
    controlsRef.current = controls;

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);

      if (mixerRef.current) {
        mixerRef.current.update(0.015);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      // 페이지 전환 시 리소스 해제
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 로그인 모달 열기 함수
  const openLoginDialog = () => {
    setMediapipeActive(false); // Mediapipe 비활성화
    setOpenLogin(true);
  };

  // 로그인 모달 닫기 함수
  const closeLoginDialog = () => {
    setOpenLogin(false);
    setMediapipeActive(true); // Mediapipe 재활성화
  };

  // Three.js 씬을 전환할 때 리소스를 해제하고 페이지 이동
  const moveToMainScene = () => {
    setMediapipeActive(false); // Mediapipe 비활성화
    // Three.js 리소스 해제
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    if (controlsRef.current) {
      controlsRef.current.dispose();
    }
    if (sceneRef.current) {
      sceneRef.current.clear();
    }

    // 페이지 이동
    navigate("/");
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div
        style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1 }}
      >
        <Buttons
          onMainPageClick={moveToMainScene}
          onLoginPageClick={openLoginDialog} // 수정된 부분
        />
      </div>
      {/* Three.js 씬이 마운트되는 부분 */}
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
      {/* Mediapipe 웹캠 화면 및 관절 트래킹을 표시하는 캔버스 */}
      {mediapipeActive && (
        <>
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "320px",
              height: "240px",
              zIndex: 2, // 캔버스를 Three.js 씬 위에 표시
              border: "2px solid white",
            }}
          />

          {/* MediapipeMotionTracking 컴포넌트 - Mediapipe 트래킹 */}
          <MediapipeMotionTracking onCanvasUpdate={handleCanvasUpdate} />
        </>
      )}
      {/* 로그인 모달 */}
      <LoginModal open={openLogin} onClose={closeLoginDialog} />{" "}
      {/* 수정된 부분 */}
    </div>
  );
}

export default ExerciseScene;
