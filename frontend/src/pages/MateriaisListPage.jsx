// src/pages/MateriaisListPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/MateriaisListPage.css";

function MateriaisListPage() {
  const navigate = useNavigate();
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [sortBy, setSortBy] = useState("nome");
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchMateriais = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/materiaisList");
        setMateriais(response.data);
        setErro("");
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar os materiais. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchMateriais();
  }, []);

  // Função para filtrar materiais
  const filteredMateriais = materiais.filter(material => {
    const matchesSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = false;
    
    if (filterType === "todos") {
      matchesFilter = true;
    } else if (filterType === "estoque_baixo") {
      matchesFilter = material.estoque_atual <= material.estoque_minimo;
    } else if (filterType === "vencidos") {
      matchesFilter = new Date(material.validade) < new Date();
    } else if (filterType === "proximos_vencimento") {
      const dataValidade = new Date(material.validade);
      const hoje = new Date();
      const diffTime = dataValidade - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      matchesFilter = diffDays <= 30 && diffDays > 0;
    }

    return matchesSearch && matchesFilter;
  });

  // Função para ordenar materiais
  const sortedMateriais = [...filteredMateriais].sort((a, b) => {
    switch (sortBy) {
      case "nome":
        return a.nome.localeCompare(b.nome);
      case "estoque":
        return a.estoque_atual - b.estoque_atual;
      case "validade":
        return new Date(a.validade) - new Date(b.validade);
      case "preco":
        return parseFloat(a.preco) - parseFloat(b.preco);
      default:
        return 0;
    }
  });

  // Função para formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Função para formatar preço
  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price);
  };

  // Função para calcular dias até vencimento
  const getDaysUntilExpiry = (dateString) => {
    const dataValidade = new Date(dateString);
    const hoje = new Date();
    const diffTime = dataValidade - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Função para obter status do material
  const getMaterialStatus = (material) => {
    const daysUntilExpiry = getDaysUntilExpiry(material.validade);
    const isLowStock = material.estoque_atual <= material.estoque_minimo;
    
    if (daysUntilExpiry < 0) return { type: "vencido", label: "Vencido", color: "#ef4444" };
    if (daysUntilExpiry <= 7) return { type: "critico", label: "Crítico", color: "#f59e0b" };
    if (daysUntilExpiry <= 30) return { type: "proximo", label: "Próximo", color: "#f97316" };
    if (isLowStock) return { type: "estoque_baixo", label: "Estoque Baixo", color: "#eab308" };
    return { type: "ok", label: "OK", color: "#22c55e" };
  };

  // Função para editar material
  const handleEdit = (materialId) => {
    navigate(`/materiais/editar/${materialId}`);
  };

  // Função para excluir material
  const handleDelete = async (materialId) => {
    if (!window.confirm("Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setDeletingId(materialId);
      await axios.delete(`http://localhost:5000/materiais/${materialId}`);
      
      // Atualiza a lista removendo o material excluído
      setMateriais(prevMateriais => prevMateriais.filter(material => material.id !== materialId));
      
      // Mostra mensagem de sucesso
      alert("Material excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir material:", error);
      alert("Erro ao excluir material. Verifique o console.");
    } finally {
      setDeletingId(null);
    }
  };

  // Função para exportar materiais para CSV
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Fazer requisição para o endpoint de exportação
      const response = await axios.get('http://localhost:5000/materiais/exportar-csv', {
        responseType: 'blob' // Importante para arquivos binários
      });
      
      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'materiais_laboratorio.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Mostra mensagem de sucesso
      alert("Arquivo CSV exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar materiais:", error);
      alert("Erro ao exportar materiais. Verifique o console.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="materiais-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="materiais-container">
          

          {/* Filtros e Busca */}
          <div className="filters-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar materiais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="filters-group">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos os Materiais</option>
                <option value="estoque_baixo">Estoque Baixo</option>
                <option value="vencidos">Vencidos</option>
                <option value="proximos_vencimento">Próximos do Vencimento</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="nome">Ordenar por Nome</option>
                <option value="estoque">Ordenar por Estoque</option>
                <option value="validade">Ordenar por Validade</option>
                <option value="preco">Ordenar por Preço</option>
              </select>
              <button 
                className="btn-export"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span>Exportar CSV</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7L10 17l-5-5"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{materiais.length}</h3>
                <p>Total de Materiais</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon estoque-baixo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 002.18 3h16a2 2 0 002.18-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{materiais.filter(m => m.estoque_atual <= m.estoque_minimo).length}</h3>
                <p>Estoque Baixo</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon vencidos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{materiais.filter(m => new Date(m.validade) < new Date()).length}</h3>
                <p>Vencidos</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon proximos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{materiais.filter(m => {
                  const days = getDaysUntilExpiry(m.validade);
                  return days <= 30 && days > 0;
                }).length}</h3>
                <p>Próximos do Vencimento</p>
              </div>
            </div>
          </div>

          {/* Lista de Materiais */}
          <div className="materiais-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando materiais...</p>
              </div>
            ) : erro ? (
              <div className="error-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <h3>Erro ao carregar materiais</h3>
                <p>{erro}</p>
                <button className="btn-retry" onClick={() => window.location.reload()}>
                  Tentar Novamente
                </button>
              </div>
            ) : sortedMateriais.length === 0 ? (
              <div className="empty-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7L10 17l-5-5"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
                <h3>Nenhum material encontrado</h3>
                <p>Não há materiais que correspondam aos filtros aplicados.</p>
              </div>
            ) : (
              <div className="materiais-grid">
                {sortedMateriais.map((material) => {
                  const status = getMaterialStatus(material);
                  const daysUntilExpiry = getDaysUntilExpiry(material.validade);
                  
                  return (
                    <div key={material.id} className="material-card">
                      <div className="material-header">
                        <div className="material-title">
                          <h3>{material.nome}</h3>
                          <span className="material-type">{material.tipo}</span>
                        </div>
                        <div className="material-status" style={{ backgroundColor: status.color + "20", color: status.color }}>
                          <div className="status-dot" style={{ backgroundColor: status.color }}></div>
                          {status.label}
                        </div>
                      </div>
                      
                      <div className="material-details">
                        <div className="detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 7L10 17l-5-5"/>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                          </svg>
                          <span>{material.fabricante}</span>
                        </div>
                        
                        <div className="detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3h18v18H3z"/>
                            <path d="M3 9h18"/>
                            <path d="M9 21V9"/>
                          </svg>
                          <span>{material.quantidade} {material.unidade}</span>
                        </div>
                        
                        <div className="detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3h18v18H3z"/>
                            <path d="M3 9h18"/>
                            <path d="M9 21V9"/>
                          </svg>
                          <span>Estoque: {material.estoque_atual} / {material.estoque_minimo}</span>
                        </div>
                        
                        <div className="detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span>Validade: {formatDate(material.validade)}</span>
                          {daysUntilExpiry !== 0 && (
                            <span className="days-remaining">
                              ({daysUntilExpiry > 0 ? `${daysUntilExpiry} dias` : `${Math.abs(daysUntilExpiry)} dias vencido`})
                            </span>
                          )}
                        </div>
                        
                        <div className="detail-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                          </svg>
                          <span>{formatPrice(material.preco)}</span>
                        </div>
                      </div>
                      
                      <div className="material-actions">
                        <button 
                          className="btn-action edit"
                          onClick={() => handleEdit(material.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          <span>Editar</span>
                        </button>
                        <button 
                          className="btn-action delete"
                          onClick={() => handleDelete(material.id)}
                          disabled={deletingId === material.id}
                        >
                          {deletingId === material.id ? (
                            <>
                              <div className="loading-spinner"></div>
                              <span>Excluindo...</span>
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                              </svg>
                              <span>Excluir</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MateriaisListPage;
