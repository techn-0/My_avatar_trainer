import React, { useState } from "react";
import "./Login.css"; // CSS는 기존 스타일을 유지합니다.

const LoginToggle = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  // 로그인 아이디, 비밀번호 상태
  const [loginData, setLoginData] = useState({ id: "", password: "" });
  // 회원가입 상태
  const [signUpData, setSignUpData] = useState({
    id: "",
    password: "",
    email: "",
  });

  // 서버로 전송 (토큰 없음)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    // 로그인 데이터 콘솔 출력
    console.log("Login data:", loginData);

    // 서버로 로그인 데이터 전송
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      console.log("Login response:", data);

      // 서버 응답의 메시지를 alert로 출력
      if (data.message) {
        alert(data.message);
      }
      // if (data.token) {
      //   saveToken(data.token); // JWT 토큰 저장
      //   window.token = data.token;
      //   window.location.href = "/"; // 리다이렉트
      // }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    // 전송되는 데이터 테스트
    console.log("signUp data:", signUpData);

    // 서버로 회원가입 데이터 전송
    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });
      const data = await response.json();
      console.log("SignUp response:", data);

      // 서버 응답의 메시지를 alert로 출력
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

  return (
    <React.Fragment>
      {/* 오버레이 추가 */}
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
                </form>
              </div>
              <div className="flip-card__back">
                <div className="title">Sign up</div>
                <form className="flip-card__form" onSubmit={handleSignUpSubmit}>
                  <input
                    className="flip-card__input"
                    name="id"
                    placeholder="Id"
                    type="text"
                    value={signUpData.id} // 상태 값 추가
                    onChange={handleSignUpChange}
                  />
                  <input
                    className="flip-card__input"
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={signUpData.email} // 상태 값 추가
                    onChange={handleSignUpChange}
                  />
                  <input
                    className="flip-card__input"
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={signUpData.password} // 상태 값 추가
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
