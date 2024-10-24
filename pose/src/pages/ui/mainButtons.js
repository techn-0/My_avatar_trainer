import React, { useState, useEffect, useRef  } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../login/AuthContext"; // Import your token management functions
import "./mainButtons.css";

function Buttons({
  onMainPageClick,
  onLoginPageClick,
  onExerciseClick,
  onResultClick,
}) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  const glitchSoundRef = useRef(null); // 버튼 효과음 레퍼런스

  useEffect(() => {
    // Check if token exists on initial load
    const token = getToken();
    setIsLoggedIn(!!token); // Set login state based on whether the token exists
  }, []);

  const handleLogoutClick = () => {
    removeToken(); // Remove the token
    setIsLoggedIn(false); // Update state to reflect that the user is logged out
    alert("You have been logged out.");
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
    navigate("/progress");
  };

  const handleMouseEnter = () => {
    if (glitchSoundRef.current) {
      glitchSoundRef.current.currentTime = 0;
      glitchSoundRef.current.play().catch((error) => {
        // play() failed due to lack of user interaction. We can ignore this error.
        console.log("Sound play prevented due to user interaction requirement.");
      });
    }
  };

  return (
    <div className="button-container">
      <div className="radio-wrapper">
        <input className="input" type="radio" name="btn" id="mainPage" onMouseEnter={handleMouseEnter} />
        <div className="btn" onClick={onMainPageClick} >
          <span aria-hidden="true"></span>메인 페이지
          <span className="btn__glitch" aria-hidden="true">
            _메인 페이지_
          </span>
        </div>
      </div>

      <div className="radio-wrapper">
        <input className="input" type="radio" name="btn" id="loginPage" onClick={handleLoginPageClick} onMouseEnter={handleMouseEnter} />
        <div className="btn" onClick={handleLoginPageClick} >
          {isLoggedIn ? "로그 아웃" : "로그인"}
          <span className="btn__glitch" aria-hidden="true">
            {isLoggedIn ? "_로그 아웃_" : "로그인"}
          </span>
        </div>
      </div>

      <div className="radio-wrapper">
        <input className="input" type="radio" name="btn" id="exercise" onClick={handleExerciseClick} onMouseEnter={handleMouseEnter} />
        <div className="btn" onClick={handleExerciseClick} >
          운동하기
          <span className="btn__glitch" aria-hidden="true">
            _운동하기_
          </span>
        </div>
      </div>

      <div className="radio-wrapper">
        <input className="input" type="radio" name="btn" id="progress" onClick={handleResultClick} onMouseEnter={handleMouseEnter} />
        <div className="btn" onClick={handleResultClick} >
          스테이터스
          <span className="btn__glitch" aria-hidden="true">
            _스테이터스_
          </span>
        </div>
      </div>
      {/* Hidden audio element for glitch sound */}
      <audio ref={glitchSoundRef} src="/sound/Glitch.wav" />
    </div>
  );
}

export default Buttons;
