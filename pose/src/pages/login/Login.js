import React, { useState } from "react";
import "./Login.css";

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

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      console.log("Login response:", data);

      if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    console.log("SignUp data:", signUpData);

    try {
      const response = await fetch("/signup", {
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
                {/* 로그인 박스 우측 상단에 X 버튼 추가 */}
                <button
                  className="close-btn"
                  onClick={onClose} // 팝업 닫기
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
                </form>
              </div>
              <div className="flip-card__back">
                {/* 회원가입 박스에도 동일하게 X 버튼 추가 */}
                <button
                  className="close-btn"
                  onClick={onClose} // 팝업 닫기
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