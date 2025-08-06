import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/HomePage.css";

function HomePage() {
  const [materiaisVencidos, setMateriaisVencidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valorEstoque, setValorEstoque] = useState({
    valor_total: 0,
    total_materiais: 0,
    preco_medio: 0
  });
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
  
        const [statsRes, vencidosRes, valorEstoqueRes] = await Promise.all([
          axios.get("http://localhost:5000/materiais/stats"),
          axios.get("http://localhost:5000/materiais/vencidos"),
          axios.get("http://localhost:5000/materiais/valor-estoque")
        ]);
  
        setStats(statsRes.data);
        setMateriaisVencidos(vencidosRes.data);
        setValorEstoque(valorEstoqueRes.data);
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
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

          {/* Seção de Materiais Vencidos e Valor do Estoque */}
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
                  <div className="materiais-list-compact">
                    {materiaisVencidos.map((material) => (
                      <div key={material.id} className="material-item-compact">
                        <div className="material-name">
                          <h4>{material.nome}</h4>
                          <span className="material-type">{material.tipo}</span>
                        </div>
                        <div className="material-meta">
                          <span className="vencimento">
                            Vencido há {Math.abs(getDaysUntilExpiry(material.validade))} dias
                          </span>
                          <span className="quantidade">
                            {material.quantidade} {material.unidade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cartão do Valor Total do Estoque */}
            <div className="section-card valor-estoque-section">
              <div className="section-header">
                <div className="section-title">
                  <div className="title-icon valor">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  </div>
                  <div>
                    <h3>Valor do Estoque</h3>
                    <p>Valor total em reais do estoque atual</p>
                  </div>
                </div>
              </div>

              <div className="section-content">
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Carregando...</p>
                  </div>
                ) : (
                  <div className="valor-estoque-content">
                    <div className="valor-principal">
                      <h2 className="valor-total">{formatCurrency(valorEstoque.valor_total)}</h2>
                      <p className="valor-label">Valor Total do Estoque</p>
                    </div>
                    
                    <div className="valor-detalhes">
                      <div className="detalhe-item">
                        <div className="detalhe-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7L10 17l-5-5"/>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                          </svg>
                        </div>
                        <div className="detalhe-info">
                          <span className="detalhe-valor">{valorEstoque.total_materiais}</span>
                          <span className="detalhe-label">Materiais em Estoque</span>
                        </div>
                      </div>
                      
                      <div className="detalhe-item">
                        <div className="detalhe-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                          </svg>
                        </div>
                        <div className="detalhe-info">
                          <span className="detalhe-valor">{formatCurrency(valorEstoque.preco_medio)}</span>
                          <span className="detalhe-label">Preço Médio</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
