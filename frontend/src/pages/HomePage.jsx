// src/pages/HomePage.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/HomePage.css";

function HomePage() {
  return (
    <div className="home-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-placeholder">
          <h2>Gerenciamento de Reagentes/Padrões do Laboratório</h2>
          <p>Aqui você poderá visualizar resumos do sistema futuramente.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
