import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../login/AuthContext"; // Import your token management functions

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

  return (
    <div>
      <button onClick={onMainPageClick}>메인 페이지</button>
      <button onClick={handleLoginPageClick}>
        {isLoggedIn ? "로그 아웃" : "로그인 페이지"}
      </button>
      <button onClick={handleExerciseClick}>운동하러 가기</button>
      <button onClick={handleResultClick}>성장 추이 보기</button>
    </div>
  );
}

export default Buttons;
