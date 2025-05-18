import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, senha } = location.state || {};

  if (!email || !senha) {
    return (
      <div className="dashboard-page">
        <p>Você não está autorizado. Redirecionando para login...</p>
        {setTimeout(() => navigate("/"), 2000)}
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Bem-vindo!</h2>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Senha:</strong> {senha}</p>
      </div>
    </div>
  );
}

export default Dashboard;
