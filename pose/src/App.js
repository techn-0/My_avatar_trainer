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

function App() {
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
        <Route path="/progress" element={<MyPage />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </React.Fragment>
  );
}

export default App;
