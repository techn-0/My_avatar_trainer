import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

import { loadCharacter } from "../../shared/loadCharacter"; // 캐릭터 로드
import { addLights } from "../../shared/lights"; // 조명 추가
import { createPlane } from "../../app/createPlane"; // 바닥 추가
import MediapipeSquatTracking from "../../app/workoutCam/squatCam";
import MediapipePushupTracking from "../../app/workoutCam/pushupCam";
import MediapipeLegraiseTracking from "../../app/workoutCam/legraiseCam";
import MediapipeLungeTracking from "../../app/workoutCam/lungeCam";
import Buttons from "../ui/exerciseButtons";
import LoginModal from "../login/LoginModal";
import { setBackgroundColor } from "../../shared/background";
import ExerciseTimer from "../../app/exerciseTimer"; // ExerciseTimer 컴포넌트 임포트
import { getToken } from "../../pages/login/AuthContext";
import ExerciseResultModal from "../ui/exerciseResult"; // 결과 모달 임포트

import "./ExerciseScene.css";

// 오디오 파일 불러오기
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
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [mediapipeActive, setMediapipeActive] = useState(false);
  const [countdownImages, setCountdownImages] = useState([
    "count3.png",
    "count2.png",
    "count1.png",
    "countStart.png",
  ]);
  const [currentCountdownIndex, setCurrentCountdownIndex] = useState(null);
  const [exerciseCount, setExerciseCount] = useState(0);
  const exerciseCountRef = useRef(0);
  const [showTimer, setShowTimer] = useState(false);
  const timerStartTimeRef = useRef(null); // 타이머 시작 시간 저장
  const countdownMusicRef = useRef(null); // 카운트다운 중 재생될 노래 참조
  const [animationRepeatCount, setAnimationRepeatCount] = useState(0);
  const animationRepeatCountRef = useRef(0); // 최신 값을 유지하기 위한 ref
  const normalRepetitionDuration = 1.88; // 스쿼트 1회에 1.88초 소요
  const animationActionRef = useRef(null);
  const handleLoopRef = useRef(null);

  // 운동 타이머 시작 함수
  const startExerciseTimer = (durationInSeconds) => {
    setShowTimer(true); // 타이머 표시
    timerStartTimeRef.current = Date.now(); // 현재 시간을 시작 시간으로 설정
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

  // 기타 필요한 설정 및 useEffect 관리 ...

  return (
    <div
      className="font"
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      {/* UI and Timer Components */}
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
      {/* Timer, Mediapipe Render Components */}
    </div>
  );
}

export default ExerciseScene;
ㅋ;
