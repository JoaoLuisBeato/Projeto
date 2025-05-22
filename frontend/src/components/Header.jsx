// src/components/Header.jsx
import React from "react";
import "../styles/Header.css";

function Header() {
  // Substitua por dados reais depois
  const usuario = {
    nome: "João Beato",
    email: "joao@empresa.com"
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
