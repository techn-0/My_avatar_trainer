import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { loadCharacter } from "../shared/loadCharacter"; // 캐릭터 로드
import { addLights } from "../shared/lights"; // 조명 추가
import { createPlane } from "./createPlane"; // 바닥 추가
import { initOrbitControls } from "../shared/initOrbitControls"; // 카메라 컨트롤
import { useNavigate } from "react-router-dom";
import MediapipeMotionTracking from "../app/cam"; // Mediapipe 컴포넌트
import Buttons from "./ui/exerciseButtons";
import LoginModal from "./login/LoginModal";

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

  // 운동 종목 및 시간 선택 상태
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);

  // Mediapipe 활성화 상태
  const [mediapipeActive, setMediapipeActive] = useState(false);

  // 운동 종목 리스트
  const exercises = [
    "스쿼트",
    "팔굽혀펴기",
    "플랭크",
    "윗몸일으키기",
    "레그레이즈",
  ];

  // 운동 시간 리스트
  const durations = ["1분", "2분"];

  // Mediapipe의 캔버스를 업데이트하는 핸들러
  const handleCanvasUpdate = (updatedCanvas) => {
    if (!mediapipeActive || !canvasRef.current || !updatedCanvas) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx || !updatedCanvas.width || !updatedCanvas.height) return;

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
    setOpenLogin(true);
  };

  // 로그인 모달 닫기 함수
  const closeLoginDialog = () => {
    setOpenLogin(false);
  };

  // 메인 페이지로 이동
  const moveToMainScene = () => {
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

  // 운동 종목 선택 핸들러
  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
  };

  // 운동 시간 선택 핸들러
  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  // 선택 완료 핸들러
  const handleSelectionComplete = () => {
    if (selectedExercise && selectedDuration) {
      setMediapipeActive(false); // 냅따 Mediapipe 비활성화

      // 서버로 선택한 종목과 시간 전송
      fetch("/api/start-exercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exercise: selectedExercise,
          duration: selectedDuration,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Server response:", data);
          // 서버 응답 처리
        })
        .catch((error) => {
          console.error("Error sending exercise data to server:", error);
        });

      // Mediapipe 활성화
      setMediapipeActive(true);
    }
  };

  // 성장 추이 보기 클릭 핸들러
  const moveToResultPage = () => {
    // 성장 추이 페이지로 이동
    navigate("/result");
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* 버튼 영역 및 운동 선택 UI */}
      <div
        style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1 }}
      >
        <Buttons
          onMainPageClick={moveToMainScene}
          onLoginPageClick={openLoginDialog}
          onResultClick={moveToResultPage}
          selectedExercise={selectedExercise}
          handleExerciseSelect={handleExerciseSelect}
          selectedDuration={selectedDuration}
          handleDurationSelect={handleDurationSelect}
          exercises={exercises}
          durations={durations}
          onSelectionComplete={handleSelectionComplete}
        />
      </div>

      {/* Three.js 씬이 마운트되는 부분 */}
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />

      {/* Mediapipe 웹캠 화면 및 관절 트래킹을 표시하는 캔버스 */}
      {mediapipeActive && (
        <>
          <MediapipeMotionTracking
            onCanvasUpdate={handleCanvasUpdate}
            active={mediapipeActive}
          />

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
              zIndex: 2,
              border: "2px solid white",
            }}
          />
        </>
      )}

      {/* 로그인 모달 */}
      <LoginModal open={openLogin} onClose={closeLoginDialog} />
    </div>
  );
}

export default ExerciseScene;
