import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/EquipamentosListPage.css';

const EquipamentosListPage = () => {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');

  useEffect(() => {
    fetchEquipamentos();
  }, []);

  const fetchEquipamentos = async () => {
    try {
      const response = await fetch('http://localhost:5000/equipamentos');
      if (response.ok) {
        const data = await response.json();
        setEquipamentos(data);
      } else {
        console.error('Erro ao buscar equipamentos');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        const response = await fetch(`http://localhost:5000/equipamentos/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('Equipamento excluído com sucesso!');
          fetchEquipamentos();
        } else {
          alert('Erro ao excluir equipamento');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao excluir equipamento');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo':
        return 'status-ativo';
      case 'inativo':
        return 'status-inativo';
      case 'manutencao':
        return 'status-manutencao';
      case 'defeito':
        return 'status-defeito';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'manutencao':
        return 'Em Manutenção';
      case 'defeito':
        return 'Defeito';
      default:
        return status;
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredEquipamentos = equipamentos.filter(equipamento => {
    const matchesSearch = 
      equipamento.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipamento.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipamento.fabricante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipamento.modelo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || equipamento.status === statusFilter;
    const matchesCategoria = !categoriaFilter || equipamento.categoria === categoriaFilter;
    
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  const categorias = [...new Set(equipamentos.map(e => e.categoria).filter(Boolean))];

  return (
    <div className="equipamentos-list-page">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="equipamentos-container">
          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>Gestão de Equipamentos</h1>
                <p>Gerencie todos os equipamentos do laboratório</p>
              </div>
            </div>
            <div className="header-actions">
              <Link to="/equipamentos/novo" className="btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Novo Equipamento
              </Link>
            </div>
          </div>

      <div className="filters-section">
        <div className="search-box">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, código, fabricante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="manutencao">Em Manutenção</option>
            <option value="defeito">Defeito</option>
          </select>

          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="equipamentos-grid">
        {filteredEquipamentos.length === 0 ? (
          <div className="no-results">
            <p>Nenhum equipamento encontrado.</p>
          </div>
        ) : (
          filteredEquipamentos.map(equipamento => (
            <div key={equipamento.id} className="equipamento-card">
              <div className="card-header">
                <h3>{equipamento.nome}</h3>
                <span className={`status-badge ${getStatusColor(equipamento.status)}`}>
                  {getStatusText(equipamento.status)}
                </span>
              </div>

              <div className="card-content">
                <div className="info-row">
                  <span className="label">Código:</span>
                  <span className="value">{equipamento.codigo || '-'}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Modelo:</span>
                  <span className="value">{equipamento.modelo || '-'}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Fabricante:</span>
                  <span className="value">{equipamento.fabricante || '-'}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Categoria:</span>
                  <span className="value">{equipamento.categoria || '-'}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Localização:</span>
                  <span className="value">{equipamento.localizacao || '-'}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Valor:</span>
                  <span className="value">{formatCurrency(equipamento.valor_aquisicao)}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Aquisição:</span>
                  <span className="value">{formatDate(equipamento.data_aquisicao)}</span>
                </div>

                {equipamento.manutencoes_pendentes > 0 && (
                  <div className="warning-info">
                    <span className="warning-icon">⚠️</span>
                    {equipamento.manutencoes_pendentes} manutenção(ões) pendente(s)
                  </div>
                )}
              </div>

              <div className="card-actions">
                <Link 
                  to={`/equipamentos/${equipamento.id}`} 
                  className="btn-secondary"
                >
                  Editar
                </Link>
                <Link 
                  to={`/manutencoes/equipamento/${equipamento.id}`} 
                  className="btn-secondary"
                >
                  Manutenções
                </Link>
                <button 
                  onClick={() => handleDelete(equipamento.id)}
                  className="btn-danger"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

          <div className="stats-footer">
            <p>Total de equipamentos: {filteredEquipamentos.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipamentosListPage;

