import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as React from "react";
// mui
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
//pages
import Login from "./pages/login/Login";
import MainHeader from "./app/MainHeader";
import ThreeScene from "./pages/scene/MainScene";
import ExerciseScene from "./pages/scene/ExerciseScene";
import MyPage from "./pages/MyPage/MyPage";
import Ranking from "./pages/ranking/ranking";
import { getToken } from "./pages/login/AuthContext";
import Social from "./app/socauth";
import Lobby from "./pages/multiplay/Lobby"; // 새로 추가된 로비 컴포넌트
import Room from "./pages/multiplay/Room"; // Room 컴포넌트 임포트
import Chat from "./pages/multiplay/Chat" ; // 사용자간 채팅 페이지
import ChatRoom from "./pages/multiplay/ChatRoom" ; // 사용자간 채팅 페이지


function App() {
  const ownerId = sessionStorage.getItem("userId");
  return (
    <React.Fragment>
      <CssBaseline />
      <MainHeader />
      <Routes>
        {/* 각각의 경로에 맞는 컴포넌트 렌더링 */}
        <Route path="/" element={<ThreeScene />} />{" "}
        {/* ThreeScene을 루트 경로에 렌더링 */}
        <Route path="/login" element={<Login />} />
        <Route path="/exercise" element={<ExerciseScene />} />
        <Route path="/user/:ownerId" element={<MyPage />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/socauth/additional-data" element={<Social />} />
        <Route path="/lobby" element={<Lobby />} /> {/* 멀티플레이 로비 페이지 */}
        <Route path="/room/:roomName" element={<Room />} />
        <Route path="/chat" element={<Chat />} /> 
        <Route path="/chatroom/:roomName" element={<ChatRoom />} /> 
        
      </Routes>
    </React.Fragment>
  );
}

export default App;
