import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/HomePage.css";

function HomePage() {
  const [materiaisVencidos, setMateriaisVencidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    vencidos: 0,
    proximosVencimento: 0,
    estoqueBaixo: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vencidosRes, materiaisRes] = await Promise.all([
          axios.get("http://localhost:5000/materiais/vencidos"),
          axios.get("http://localhost:5000/materiais")
        ]);
        
        setMateriaisVencidos(vencidosRes.data);
        
        // Calcular estatísticas
        const todosMateriais = materiaisRes.data;
        const hoje = new Date();
        const proximos30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const vencidos = vencidosRes.data.length;
        const proximosVencimento = todosMateriais.filter(mat => {
          const dataValidade = new Date(mat.validade);
          return dataValidade > hoje && dataValidade <= proximos30Dias;
        }).length;
        
        setStats({
          total: todosMateriais.length,
          vencidos,
          proximosVencimento,
          estoqueBaixo: todosMateriais.filter(mat => mat.quantidade <= 5).length
        });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getDaysUntilExpiry = (dateString) => {
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="home-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="dashboard-container">
          {/* Header do Dashboard */}
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">Visão geral do sistema de gestão de materiais</p>
            </div>
            <div className="dashboard-actions">
              <div className="date-display">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{new Date().toLocaleDateString("pt-BR", { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7L10 17l-5-5"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{loading ? "..." : stats.total}</h3>
                <p className="stat-label">Total de Materiais</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon vencidos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{loading ? "..." : stats.vencidos}</h3>
                <p className="stat-label">Materiais Vencidos</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon alerta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 002.18 3h16a2 2 0 002.18-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{loading ? "..." : stats.proximosVencimento}</h3>
                <p className="stat-label">Vencendo em 30 dias</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon estoque">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3z"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{loading ? "..." : stats.estoqueBaixo}</h3>
                <p className="stat-label">Estoque Baixo</p>
              </div>
            </div>
          </div>

          {/* Seção de Materiais Vencidos */}
          <div className="dashboard-sections">
            <div className="section-card vencidos-section">
              <div className="section-header">
                <div className="section-title">
                  <div className="title-icon vencidos">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Materiais Vencidos</h3>
                    <p>Itens que precisam de atenção imediata</p>
                  </div>
                </div>
                <div className="section-badge">
                  <span>{materiaisVencidos.length}</span>
                </div>
              </div>

              <div className="section-content">
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Carregando...</p>
                  </div>
                ) : materiaisVencidos.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                      <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                    </svg>
                    <h4>Nenhum material vencido</h4>
                    <p>Excelente! Todos os materiais estão dentro da validade.</p>
                  </div>
                ) : (
                  <div className="materiais-list">
                    {materiaisVencidos.slice(0, 5).map((material) => (
                      <div key={material.id} className="material-item vencido">
                        <div className="material-info">
                          <h4>{material.nome}</h4>
                          <p className="material-details">
                            <span className="detail-item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              Vencido em {formatDate(material.validade)}
                            </span>
                            <span className="detail-item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3h18v18H3z"/>
                                <path d="M3 9h18"/>
                                <path d="M9 21V9"/>
                              </svg>
                              Qtd: {material.quantidade}
                            </span>
                          </p>
                        </div>
                        <div className="material-status">
                          <span className="status-badge vencido">Vencido</span>
                        </div>
                      </div>
                    ))}
                    {materiaisVencidos.length > 5 && (
                      <div className="view-more">
                        <button className="view-more-btn">
                          Ver mais {materiaisVencidos.length - 5} materiais
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Seção de Ações Rápidas */}
            <div className="section-card quick-actions">
              <div className="section-header">
                <div className="section-title">
                  <div className="title-icon actions">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Ações Rápidas</h3>
                    <p>Acesse as funcionalidades principais</p>
                  </div>
                </div>
              </div>

              <div className="actions-grid">
                <button className="action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Cadastrar Material</span>
                </button>

                <button className="action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                  </svg>
                  <span>Listar Materiais</span>
                </button>

                <button className="action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3z"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                  <span>Baixa de Material</span>
                </button>

                <button className="action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <span>Relatórios</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
