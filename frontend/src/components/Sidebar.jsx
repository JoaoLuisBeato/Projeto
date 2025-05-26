// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>LabManager</h2>
      <nav>
        <ul>
          <li><Link to="/home">🏠 Início</Link></li>
          <li><Link to="/materiais">➕ Cadastrar Material</Link></li>
          <li><Link to="/materiaisList">📋 Lista de Materiais</Link></li>
          <li><Link to="/baixa-material">📉 Dar Baixa</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
