import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../login/AuthContext"; // Import your token management functions
import { jwtDecode } from "jwt-decode";
import "./mainButtons.css";

function Buttons({
  onMainPageClick,
  onLoginPageClick,
  onExerciseClick,
  onResultClick,
  onLogout, // 로그아웃 콜백 추가
}) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [ownerId, setOwnerId] = useState(null);
  const glitchSoundRef = useRef(null); // 버튼 효과음 레퍼런스

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
      try {
        const decodedToken = jwtDecode(token);
        setOwnerId(decodedToken.id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogoutClick = () => {
    removeToken(); // Remove the token
    setIsLoggedIn(false); // Update state to reflect that the user is logged out
    onLogout(); // 로그아웃 콜백 호출하여 userId를 null로 설정
    alert("로그아웃 되었습니다!");
  };

  const handleLoginPageClick = () => {
    if (isLoggedIn) {
      handleLogoutClick(); // If logged in, handle logout
    } else {
      onLoginPageClick(); // If not logged in, navigate to login page
    }
  };

  const handleExerciseClick = () => {
    if (getToken()) {
      navigate("/exercise");
    } else {
      alert("로그인 먼저 해주세요.");
    }
  };

  const handleResultClick = () => {
    if (getToken()) {
      navigate(`/user/${ownerId}`);
    } else {
      alert("로그인 먼저 해주세요.");
    }
  };

  const handleRankingClick = () => {
    navigate("/ranking");
  };

  const handleMouseEnter = () => {
    if (glitchSoundRef.current) {
      glitchSoundRef.current.currentTime = 0;
      glitchSoundRef.current.play().catch((error) => {
        // play() failed due to lack of user interaction. We can ignore this error.
        console.log(
          "Sound play prevented due to user interaction requirement."
        );
      });
    }
  };

  const handleMultiplayerClick = () => {
    if (getToken()) {
      navigate("/lobby"); // 멀티플레이 로비로 이동
    } else {
      alert("로그인 먼저 해주세요.");
    }
  };

  return (
    <div>
      {/* <p
        className="main_btn"
        onClick={onMainPageClick}
        onMouseEnter={handleMouseEnter}
      >
        메인페이지
      </p> */}
      <p
        className="main_btn"
        onClick={handleExerciseClick}
        onMouseEnter={handleMouseEnter}
      >
        싱글플레이
      </p>
      <p
        className="main_btn"
        onClick={handleMultiplayerClick}
        onMouseEnter={handleMouseEnter}
      >
        멀티플레이
      </p>
      <p
        className="main_btn"
        onClick={handleResultClick}
        onMouseEnter={handleMouseEnter}
      >
        마이페이지
      </p>
      <p
        className="main_btn"
        onClick={handleLoginPageClick}
        onMouseEnter={handleMouseEnter}
      >
        {isLoggedIn ? "로그아웃" : "로그인"}
      </p>
      <audio ref={glitchSoundRef} src="/sound/Glitch.wav" />
    </div>
  );
}

export default Buttons;
