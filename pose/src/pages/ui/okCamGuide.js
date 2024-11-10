import React, { useState } from "react";
import "./okCamGuide.css";

const OkGuide = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="okGuideBox">
      <button className="closeButton" onClick={handleClose}>
        &times;
      </button>
      <div>
        <h2>카메라의 위치를 조정하세요!</h2>
        <p>우측 화면에 신체가 모두 표시되도록 자세를 고쳐주세요.</p>
        <br />
        <div className="imageContainer">
          <img src="/okP.png" alt="OK Guide" className="okGuideImage" />
        </div>
        <br />
        <p>두 손으로 원을 만들면 운동이 시작됩니다.</p>
      </div>
    </div>
  );
};

export default OkGuide;
