import "./App.css";
import { Route, Routes } from "react-router-dom";
import * as React from "react";
// mui
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
//pages
import Login from "./pages/login";
import MainHeader from "./app/MainHeader";
import ThreeScene from "./pages/screen";

function App() {
  return (
    <React.Fragment>
      <CssBaseline />

      <MainHeader />
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
      <Box sx={{ bgcolor: "#white", height: "100vh" }}>
        <h1>Three.js 씬</h1>
        <ThreeScene />
      </Box>
    </React.Fragment>
  );
}

export default App;
