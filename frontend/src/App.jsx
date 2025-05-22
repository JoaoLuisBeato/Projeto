import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import MateriaisPage from "./pages/CadastroMaterialPage";
import MateriaisListPage from "./pages/MateriaisListPage";
import HomePage from "./pages/HomePage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/materiais" element={<MateriaisPage />} />
        <Route path="/materiaisList" element={<MateriaisListPage />} />
      </Routes>
    </Router>
  );
}

export default App;
