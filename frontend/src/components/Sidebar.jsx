// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: "/home",
      name: "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    {
      path: "/materiais",
      name: "Cadastrar Material",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      )
    },
    {
      path: "/materiaisList",
      name: "Lista de Materiais",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      )
    },
    {
      path: "/baixa-material",
      name: "Baixa de Material",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      )
    },
    {
      path: "/nova-solicitacao",
      name: "Nova Solicitação",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Remove dados de sessão/localStorage se houver
    localStorage.removeItem("token");
    sessionStorage.clear();

    // Redireciona para login
    navigate("/");
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header da Sidebar */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="logo-text">
              <h2>LabManager</h2>
              <p>Gestão de Materiais</p>
            </div>
          )}
        </div>
        
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isCollapsed ? (
              <polyline points="9,18 15,12 9,6"/>
            ) : (
              <polyline points="15,18 9,12 15,6"/>
            )}
          </svg>
        </button>
      </div>

      {/* Navegação */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-title">
            {!isCollapsed && <span>Menu Principal</span>}
          </div>
          
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="nav-icon">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="nav-text">{item.name}</span>
                  )}
                  {isActive(item.path) && (
                    <div className="active-indicator"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer da Sidebar */}
      <div className="sidebar-footer">
        <div className="user-info">
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="user-text">
                <p className="user-name">Usuário</p>
                <p className="user-role">Administrador</p>
              </div>
            </div>
          )}
          
          <button 
            className="logout-btn" 
            title="Sair"
            onClick={handleLogout}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
