import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/Header.css";

function Header() {
  const location = useLocation();
  const usuario = location.state?.usuario || {
    nome: "Usuário",
    email: "sem dados"
  };

  return (
    <header className="header">
      <div>
        <h3>Olá, {usuario.nome}</h3>
        <p>{usuario.email}</p>
      </div>
    </header>
  );
}

export default Header;
