import "./App.css";
import { Route, Routes } from "react-router-dom";
// pages
import Login from "./pages/login";
import MainHeader from "./app/MainHeader";

function App() {
  return (
    <div className="App">
      <MainHeader />
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
      <p>hi</p>
    </div>
  );
}

export default App;
