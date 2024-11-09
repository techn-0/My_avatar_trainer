import React from "react";
import "./noRoom.css";

const NoRoom = () => {
  return (
    <div className="circ" style={{ bottom: "100px" }}>
      <div className="load">방이 없습니다 . . . </div>
      <div className="hands"></div>
      <div className="body"></div>
      <div className="head">
        <div className="eye"></div>
      </div>
    </div>
  );
};

export default NoRoom;
