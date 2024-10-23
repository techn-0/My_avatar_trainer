import React, { useState, useEffect } from "react";
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
  function GlitchButtons() {
    const [selected, setSelected] = useState("value-2");

    const handleChange = (e) => {
      setSelected(e.target.id);
    };
  }

  return (
    <div className="button-container">
      <button className="pushable" onClick={onMainPageClick}>
        <span className="shadow"></span>
        <span className="edge"></span>
        <span className="front"> 메인 페이지 </span>
      </button>

      <button className="pushable" onClick={handleLoginPageClick}>
        <span className="shadow"></span>
        <span className="edge"></span>
        <span className="front"> {isLoggedIn ? "로그 아웃" : "로그인"} </span>
      </button>
      <button className="pushable" onClick={handleExerciseClick}>
        <span className="shadow"></span>
        <span className="edge"></span>
        <span className="front"> 운동하기 </span>
      </button>
      <button className="pushable" onClick={handleResultClick}>
        <span className="shadow"></span>
        <span className="edge"></span>
        <span className="front"> 스테이터스 </span>
      </button>
    </div>
  );
}

export default Buttons;
