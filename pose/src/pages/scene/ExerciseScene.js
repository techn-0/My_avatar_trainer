// ExerciseScene.js

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { loadCharacter } from "../../shared/loadCharacter"; // 캐릭터 로드
import { addLights } from "../../shared/lights"; // 조명 추가
import { createPlane } from "../../app/createPlane"; // 바닥 추가
import { useNavigate } from "react-router-dom";
import MediapipeSquatTracking from "../../app/workoutCam/squatCam"; // 스쿼트 Mediapipe 컴포넌트
import MediapipePushupTracking from "../../app/workoutCam/pushupCam"; // 푸시업 Mediapipe 컴포넌트
import MediapipeLegraiseTracking from "../../app/workoutCam/legraiseCam"; // 레그레이즈 Mediapipe 컴포넌트
import Buttons from "../ui/exerciseButtons";
import LoginModal from "../login/LoginModal";
import { setBackgroundColor } from "../../shared/background";
import ExerciseTimer from "../../app/exerciseTimer"; // ExerciseTimer 컴포넌트 임포트
import { getToken } from "../../pages/login/AuthContext";
import ExerciseResultModal from "../ui/exerciseResult"; // 결과 모달 임포트
import "./ExerciseScene.css";

// 오디오 파일 불러오기 (public/sound 경로의 파일 참조)
const winSound = new Audio(`${process.env.PUBLIC_URL}/sound/wow.mp3`);
const loseSound = new Audio(
  `${process.env.PUBLIC_URL}/sound/youre_too_slow.mp3`
);
const drawSound = new Audio(`${process.env.PUBLIC_URL}/sound/hurry_up.mp3`);

function interaction(characterCount, userCount, setInteractionMessage) {
  console.log(`캐릭터 카운트: ${characterCount}, 유저 카운트: ${userCount}`);

  if (userCount > characterCount) {
    setInteractionMessage("유저가 이기고 있습니다!");
    winSound.play();
  } else if (userCount < characterCount) {
    setInteractionMessage("유저가 지고 있습니다!");
    loseSound.play();
  } else {
    setInteractionMessage("동점입니다!");
    drawSound.play();
  }
}

function ExerciseScene() {
  const mountRef = useRef(null); // Three.js 씬을 마운트할 DOM 요소
  const canvasRef = useRef(null); // Mediapipe 캔버스
  const mixerRef = useRef(null);
  const modelRef = useRef(null);
  const animationsRef = useRef({}); // 애니메이션 액션 객체들 저장
  const navigate = useNavigate();
  const cameraRef = useRef(); // Three.js 카메라 참조
  const controlsRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef(null); // 렌더러 참조 저장
  const [openLogin, setOpenLogin] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [userScore, SetUserScore] = useState(0);

  // 운동 종목 및 시간 선택 상태
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);

  // 운동 종목 리스트
  const exercises = ["squat", "pushup", "plank", "situp", "legraise"];

  // 운동 시간 리스트
  const durations = [1, 2, 0.1, 0.4]; // 듀레이션 디버깅

  // Mediapipe 활성화 상태
  const [mediapipeActive, setMediapipeActive] = useState(false);

  // 카운트다운 상태 추가
  const [countdownImages, setCountdownImages] = useState([
    "count3.png",
    "count2.png",
    "count1.png",
    "countStart.png",
  ]);
  const [currentCountdownIndex, setCurrentCountdownIndex] = useState(null);

  // 운동 카운트 상태
  const [exerciseCount, setExerciseCount] = useState(0);
  const exerciseCountRef = useRef(0); // 운동 카운트를 저장할 ref 생성

  // 운동 타이머 표시 상태
  const [showTimer, setShowTimer] = useState(false);
  const timerStartTimeRef = useRef(null); // 타이머 시작 시간 저장

  // 3초 카운트 효과음 재생을 위한 참조
  const countdownMusicRef = useRef(null); // 카운트다운 중에 재생될 노래 참조

  // 애니메이션 반복 횟수 추적을 위한 상태 및 ref 추가
  const [animationRepeatCount, setAnimationRepeatCount] = useState(0);
  const animationRepeatCountRef = useRef(0); // 최신 값을 유지하기 위한 ref

  // 애니메이션의 기본 반복 시간 (1회 반복에 걸리는 시간)
  const normalRepetitionDuration = 1.88; // 스쿼트 1회에 1.88초 소요

  // 애니메이션 액션 및 이벤트 핸들러를 저장하기 위한 ref 추가
  const animationActionRef = useRef(null);
  const handleLoopRef = useRef(null);

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

  // 운동 카운트 업데이트 핸들러
  const handleExerciseCountUpdate = (count) => {
    setExerciseCount(count);
    exerciseCountRef.current = count; // ref에 최신 카운트 값 저장
    SetUserScore(count);
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
    // 애니메이션 루프 외부에서 카메라 설정
    camera.rotation.set(0, 0, 0);
    camera.position.set(0, 1, 0);
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

    // 배경색 설정
    setBackgroundColor(scene);

    // 캐릭터 로드
    loadCharacter(scene, (mixer, model, animations) => {
      mixerRef.current = mixer;
      modelRef.current = model;
      animationsRef.current = animations;
      model.position.x = -1.4;
      model.position.y = 0;
      model.position.z = -3;
      model.rotation.y = THREE.MathUtils.degToRad(20);
    });

    // Three.js 애니메이션 루프
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      if (mixerRef.current) {
        const delta = clock.getDelta();
        mixerRef.current.update(delta);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 창 크기 변경 시 카메라 및 렌더러 업데이트
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      // 이벤트 리스너 제거
      window.removeEventListener("resize", handleResize);
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

  // 이미지 프리로드
  useEffect(() => {
    countdownImages.forEach((image) => {
      const img = new Image();
      img.src = process.env.PUBLIC_URL + `/ExerciseCountdown/${image}`;
    });
  }, [countdownImages]);

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

  // 애니메이션 변경 함수
  const playAnimation = (
    animationIndex,
    loop = THREE.LoopRepeat,
    timeScale = 1
  ) => {
    if (animationsRef.current && mixerRef.current) {
      // 모든 애니메이션 정지
      mixerRef.current.stopAllAction();

      const action = animationsRef.current[animationIndex];

      if (action) {
        action.reset();
        action.setLoop(loop, Infinity); // 무한 반복으로 설정
        action.clampWhenFinished = true; // 애니메이션 완료 시 마지막 프레임에서 정지
        action.timeScale = timeScale; // 애니메이션 속도 설정

        // 이전에 등록된 이벤트 리스너 제거
        if (handleLoopRef.current) {
          mixerRef.current.removeEventListener("loop", handleLoopRef.current);
        }

        // 액션 저장
        animationActionRef.current = action;

        // 루프 이벤트 핸들러 정의
        const handleLoop = (e) => {
          if (e.action === action) {
            setAnimationRepeatCount((prevCount) => {
              const newCount = prevCount + 1;
              animationRepeatCountRef.current = newCount; // ref 업데이트

              // bestScore에 도달하면 애니메이션 중지
              if (newCount >= bestScore) {
                // 애니메이션 정지
                action.stop();

                // 이벤트 리스너 제거
                if (handleLoopRef.current) {
                  mixerRef.current.removeEventListener(
                    "loop",
                    handleLoopRef.current
                  );
                  handleLoopRef.current = null;
                }

                // Idle 애니메이션 재생
                playAnimation(5, THREE.LoopRepeat);
              }

              return newCount;
            });
          }
        };

        // 핸들러 저장
        handleLoopRef.current = handleLoop;

        // 루프 이벤트 리스너 등록
        mixerRef.current.addEventListener("loop", handleLoopRef.current);

        action.play();
      } else {
        console.warn(`Animation ${animationIndex} is not available.`);
      }
    }
  };

  // 선택 완료 핸들러
  const token = getToken();
  const handleSelectionComplete = () => {
    if (selectedExercise && selectedDuration) {
      // 서버로 선택한 종목과 시간 전송
      fetch("http://localhost:3002/workout/start_exercise", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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
          setBestScore(data.count);
          // 애니메이션 번호 4를 한 번 재생하고 대기
          playAnimation(4, THREE.LoopOnce);
        })
        .catch((error) => {
          console.error("Error sending exercise data to server:", error);
        });
      // 카운트다운 시작
      startCountdown();
    }
  };

  // 카운트다운 시작 함수
  const startCountdown = () => {
    setCurrentCountdownIndex(0); // 카운트다운 시작
    setMediapipeActive(false); // Mediapipe 비활성화
  };

  // 카운트다운 진행
  useEffect(() => {
    let timer;
    if (
      currentCountdownIndex !== null &&
      currentCountdownIndex < countdownImages.length
    ) {
      // 3초 카운트 효과음 재생
      if (countdownMusicRef.current && currentCountdownIndex === 0) {
        countdownMusicRef.current.currentTime = 0; // 처음부터 재생
        countdownMusicRef.current.play();
      }
      // 1초마다 이미지 변경
      timer = setTimeout(() => {
        setCurrentCountdownIndex(currentCountdownIndex + 1);
      }, 1000);
    } else if (currentCountdownIndex === countdownImages.length) {
      setCurrentCountdownIndex(null); // 카운트다운 초기화
      setMediapipeActive(true); // 카운트다운 완료 후 Mediapipe 활성화

      // bestScore 횟수만큼 애니메이션 반복 재생 (무한 반복 설정)
      const durationInSeconds = parseFloat(selectedDuration) * 60; // 운동 시간 (초)
      const desiredRepetitionDuration = durationInSeconds / bestScore; // 각 반복에 필요한 시간
      const timeScale = normalRepetitionDuration / desiredRepetitionDuration; // 애니메이션 속도 조절

      // 애니메이션 반복 횟수 초기화
      setAnimationRepeatCount(0);
      animationRepeatCountRef.current = 0; // ref 초기화

      playAnimation(11, THREE.LoopRepeat, timeScale); // repetitions 제거

      // 운동 타이머 시작
      startExerciseTimer(durationInSeconds);
      console.log("best Score : ", bestScore);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [currentCountdownIndex]);

  const [interactionMessage, setInteractionMessage] = useState(null); // 메시지 상태 추가

  // interaction 함수 호출 시 메시지를 설정하고 일정 시간 후 자동으로 사라지게 하는 useEffect 추가
  useEffect(() => {
    if (interactionMessage) {
      const timer = setTimeout(() => {
        setInteractionMessage(null); // 메시지를 3초 후에 사라지게 함
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [interactionMessage]);

  // 운동 타이머 시작 함수
  const startExerciseTimer = (durationInSeconds) => {
    setShowTimer(true); // 타이머 표시
    timerStartTimeRef.current = Date.now(); // 현재 시간을 시작 시간으로 설정

    // 운동 시간이 끝나면 운동 종료
    setTimeout(() => {
      endExercise();
    }, durationInSeconds * 1000);

    // 남은 시간이 30초일 때 interaction 함수 호출
    if (durationInSeconds > 30) {
      setTimeout(() => {
        interaction(
          animationRepeatCountRef.current,
          exerciseCountRef.current,
          setInteractionMessage
        );
      }, (durationInSeconds - 30) * 1000);
    }
  };

  // 결과 모달 상태 추가
  const [showResultModal, setShowResultModal] = useState(false);
  const [prevBestScore, setPrevBestScore] = useState(bestScore); // 모달에 보여줄 이전 최고 기록

  // 운동 종료 처리 함수
  const endExercise = () => {
    setMediapipeActive(false); // Mediapipe 비활성화

    // 애니메이션 번호 3을 한 번 재생하고, 이후 번호 5를 기본으로 설정
    playAnimation(3, THREE.LoopOnce);

    // 애니메이션 번호 3이 끝난 후 번호 5를 기본으로 재생
    if (animationsRef.current[3]) {
      mixerRef.current.addEventListener("finished", () => {
        playAnimation(5, THREE.LoopRepeat);
      });
    } else {
      // 번호 3 애니메이션이 없을 경우 즉시 번호 5를 재생
      playAnimation(5, THREE.LoopRepeat);
    }

    // 운동 종료 후 타이머 숨기기
    setShowTimer(false);

    // 현재 날짜 및 시간
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
      2,
      "0"
    )}-${String(currentDate.getHours()).padStart(2, "0")}:${String(
      currentDate.getMinutes()
    ).padStart(2, "0")}`;

    // 서버로 보낼 데이터
    const requestData = {
      exercise: selectedExercise,
      duration: selectedDuration,
      count: exerciseCountRef.current, // 최신 카운트 값 사용
      date: formattedDate,
    };
    SetUserScore(requestData.count);
    console.log("userScore :", userScore);
    console.log("Request data:", requestData);

    // 운동결과
    setPrevBestScore(bestScore); // 이전 최고 기록 저장
    console.log(bestScore, userScore);
    if (bestScore > userScore) {
      playAnimation(3, THREE.LoopRepeat);
    } else {
      playAnimation(0, THREE.LoopOnce);
    }
    setShowResultModal(true); // 결과 모달 표시

    // 서버로 데이터 전송
    fetch("http://localhost:3002/workout/end_exercise", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Exercise ended, server response:", data);
      })
      .catch((error) => {
        console.error("Error ending exercise:", error);
      });
  };

  // 성장 추이 보기 클릭 핸들러
  const moveToResultPage = () => {
    // 성장 추이 페이지로 이동
    navigate("/progress");
  };

  // Mediapipe 컴포넌트를 렌더링하는 함수
  const renderMediapipeComponent = () => {
    if (!mediapipeActive) return null;

    const commonProps = {
      onCanvasUpdate: handleCanvasUpdate,
      active: mediapipeActive,
      onCountUpdate: handleExerciseCountUpdate, // 운동 카운트 업데이트 함수 전달
      canvasRef: canvasRef, // canvasRef 전달
      animationRepeatCount: animationRepeatCount, // 애니메이션 반복 횟수 전달
    };

    switch (selectedExercise) {
      case "squat":
        return <MediapipeSquatTracking {...commonProps} />;
      case "pushup":
        return <MediapipePushupTracking {...commonProps} />;
      case "legraise":
        return <MediapipeLegraiseTracking {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="font"
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
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

      {/* 운동 타이머 표시 */}
      {showTimer && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "50%",
            transform: "translateX(50%)",
            zIndex: 2,
            color: "white",
          }}
        >
          <ExerciseTimer
            durationInSeconds={parseFloat(selectedDuration) * 60}
            onTimerEnd={endExercise}
            startTimeRef={timerStartTimeRef} // 시작 시간 참조 전달
          />
        </div>
      )}

      {/* Mediapipe 웹캠 화면 및 관절 트래킹을 표시하는 컴포넌트 */}
      {renderMediapipeComponent()}

      {/* 카운트다운 이미지 표시 */}
      {currentCountdownIndex !== null &&
        currentCountdownIndex < countdownImages.length && (
          <img
            src={
              process.env.PUBLIC_URL +
              `/ExerciseCountdown/${countdownImages[currentCountdownIndex]}`
            }
            alt="Countdown"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "300px",
              height: "300px",
              zIndex: 3,
              animation: "fadeInOut 1s linear",
            }}
          />
        )}

      {/* 카운트다운 중 효과음 재생 */}
      <audio ref={countdownMusicRef} src="/sound/3secCount.mp3" />

      {/* 로그인 모달 */}
      <LoginModal open={openLogin} onClose={closeLoginDialog} />
      {/* 운동 결과 모달 표시 */}
      {showResultModal && (
        <ExerciseResultModal
          onClose={() => setShowResultModal(false)}
          bestScore={prevBestScore} // 운동 전 최고 기록
          userScore={userScore} // 방금 운동한 기록
        />
      )}

      {/* 애니메이션 반복 횟수 표시 */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          color: "black",
        }}
      >
        <h2>애니메이션 반복 횟수: {animationRepeatCount}</h2>
        {/* 유저와 아바타의 중간 결과 메시지 표시 */}
        {interactionMessage && (
          <div className="inter_message">{interactionMessage}</div>
        )}
      </div>
    </div>
  );
}

export default ExerciseScene;
