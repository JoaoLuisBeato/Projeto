import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Header.css";

function Header() {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  
  const usuario = location.state?.usuario || {
    nome: "Usuário",
    email: "usuario@exemplo.com"
  };

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/home":
        return "Dashboard";
      case "/materiais":
        return "Cadastrar Material";
      case "/materiaisList":
        return "Lista de Materiais";
      case "/baixa-material":
        return "Baixa de Material";
      default:
        return "Sistema de Gestão";
    }
  };

  return (
    <header className="header">
      {/* Seção Esquerda - Título e Breadcrumb */}
      <div className="header-left">
        <div className="page-info">
          <h1 className="page-title">{getPageTitle()}</h1>
          <div className="breadcrumb">
            <span>Sistema</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
            <span>{getPageTitle()}</span>
          </div>
        </div>
      </div>

      {/* Seção Direita - Perfil do Usuário */}
      <div className="header-right">
        {/* Perfil do Usuário */}
        <div className="profile-container">
          <button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
            title="Perfil do usuário"
          >
            <div className="user-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="user-info">
              <span className="user-name">{usuario.nome}</span>
              <span className="user-role">Administrador</span>
            </div>
            <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>

          {/* Dropdown do Perfil */}
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="profile-details">
                  <h3>{usuario.nome}</h3>
                  <p>{usuario.email}</p>
                </div>
              </div>
              <div className="profile-menu">
                <button className="profile-menu-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Meu Perfil</span>
                </button>
                <button className="profile-menu-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>Configurações</span>
                </button>
                <button className="profile-menu-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para fechar dropdown */}
      {showProfile && (
        <div 
          className="dropdown-overlay" 
          onClick={() => setShowProfile(false)}
        />
      )}
    </header>
  );
}

export default Header;
