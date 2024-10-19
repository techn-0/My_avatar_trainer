import React from "react";

function Buttons({ onMainPageClick, onLoginPageClick, onResultClick }) {
  return (
    <div>
      <button onClick={onMainPageClick}>메인 페이지</button>
      <button onClick={onLoginPageClick}>로그인 페이지</button>
      <button onClick={onResultClick}>성장 추이 보기</button>
    </div>
  );
}

export default Buttons;
