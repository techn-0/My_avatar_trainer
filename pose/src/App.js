import "./App.css";
import { Route, Routes } from "react-router-dom";
import * as React from "react";
// mui
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
//pages
import Login from "./pages/Login";
import MainHeader from "./app/MainHeader";
import ThreeScene from "./pages/screen";
import PoseTracker3DBox from "./pages/camOnBox";

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <MainHeader />
      <Routes>
        {/* 경로를 절대 경로로 수정 */}
        <Route path="/login" element={<Login />} />
      </Routes>
      {/* three.js 연습 씬 */}
      <Box sx={{ bgcolor: "#white", height: "100vh" }}>
        <ThreeScene />
      </Box>
      {/* <Box sx={{ bgcolor: "#white", height: "100vh" }}>
        <PoseTracker3DBox />
      </Box> */}
    </React.Fragment>
  );
}

export default App;
