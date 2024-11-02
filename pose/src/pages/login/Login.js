import React, { act, useState } from "react";
import "./Login.css";
import { saveToken } from "./AuthContext"; // 쿠키에 저장하는 saveToken 사용
const LoginToggle = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginData, setLoginData] = useState({ id: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    id: "",
    password: "",
    email: "",
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Login data:", loginData);
    sessionStorage.setItem("userId", loginData.id); // 사용방법 : let userId = sessionStorage.getItem('userId');

    try {
      const response = await fetch("http://localhost:3002/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (data.message) {
        alert(data.message);
      }
      if (data.accessToken) {
        window.location.href = "/";// 리다이렉트
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    console.log("SignUp data:", signUpData);

    try {
      const response = await fetch("http://localhost:3002/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });
      const data = await response.json();
      console.log("SignUp response:", data);

      if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error("SignUp error:", error);
    }
  };

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({ ...signUpData, [name]: value });
  };

  // 소셜 로그인 버튼 클릭 핸들러
  const handleSocialLogin = (provider) => {
    const baseURL = "http://localhost:3002/socauth"; // 소셜 로그인 엔드포인트의 베이스 URL
    window.location.href = `${baseURL}/${provider}`;
  }; // 소셜로그인 jwt

  return (
    <React.Fragment>
      <div className="wrapper">
        <div className="card-switch">
          <label className="switch">
            <input
              type="checkbox"
              className="toggle"
              checked={isSignUp}
              readOnly
            />
            <span className="slider" onClick={handleToggle}></span>
            <span className="card-side" onClick={handleToggle}></span>
            <div className="flip-card__inner">
              <div className="flip-card__front">
                <button
                  className="close-btn"
                  onClick={onClose}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>

                <div className="title">Log in</div>
                <form className="flip-card__form" onSubmit={handleLoginSubmit}>
                  <input
                    className="flip-card__input"
                    name="id"
                    placeholder="Id"
                    type="text"
                    value={loginData.id}
                    onChange={handleLoginChange}
                  />
                  <input
                    className="flip-card__input"
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />
                  <button className="flip-card__btn" type="submit">
                    Log in
                  </button>
                  <div className="socialLoginMessage">
                    <p>혹은 다음으로 로그인</p>
                  </div>
                </form>
                <div className="social-login">
                  <button
                    className="google"
                    onClick={() => handleSocialLogin("google")}
                  ></button>
                  <button
                    className="kakao"
                    onClick={() => handleSocialLogin("kakao")}
                  ></button>
                  <button
                    className="naver"
                    onClick={() => handleSocialLogin("naver")}
                  ></button>
                </div>
              </div>
              <div className="flip-card__back">
                <button
                  className="close-btn"
                  onClick={onClose}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>

                <div className="title">Sign up</div>
                <form className="flip-card__form" onSubmit={handleSignUpSubmit}>
                  <input
                    className="flip-card__input"
                    name="id"
                    placeholder="Id"
                    type="text"
                    value={signUpData.id}
                    onChange={handleSignUpChange}
                  />
                  <input
                    className="flip-card__input"
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                  />
                  <input
                    className="flip-card__input"
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                  />
                  <button className="flip-card__btn" type="submit">
                    Sign up
                  </button>
                </form>
              </div>
            </div>
          </label>
        </div>
      </div>
    </React.Fragment>
  );
};

export default LoginToggle;
