import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/ManutencoesPage.css';

const ManutencoesPage = () => {
  const { equipamentoId } = useParams();
  const [manutencoes, setManutencoes] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [selectedEquipamento, setSelectedEquipamento] = useState(null);

  useEffect(() => {
    fetchEquipamentos();
    fetchManutencoes();
  }, [equipamentoId]);

  const fetchEquipamentos = async () => {
    try {
      const response = await fetch('http://localhost:5000/equipamentos');
      if (response.ok) {
        const data = await response.json();
        setEquipamentos(data);
        
        if (equipamentoId) {
          const equip = data.find(e => e.id == equipamentoId);
          setSelectedEquipamento(equip);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
    }
  };

  const fetchManutencoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/manutencoes');
      if (response.ok) {
        const data = await response.json();
        setManutencoes(data);
      } else {
        console.error('Erro ao buscar manutenções');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirManutencao = async (id) => {
    const custo = prompt('Digite o custo da manutenção (R$):');
    const observacoes = prompt('Observações finais:');
    
    if (custo === null) return; // Usuário cancelou

    try {
      const response = await fetch(`http://localhost:5000/manutencoes/${id}/concluir`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          custo: parseFloat(custo) || 0,
          observacoes: observacoes || ''
        }),
      });

      if (response.ok) {
        alert('Manutenção concluída com sucesso!');
        fetchManutencoes();
      } else {
        alert('Erro ao concluir manutenção');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao concluir manutenção');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta manutenção?')) {
      try {
        const response = await fetch(`http://localhost:5000/manutencoes/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert('Manutenção excluída com sucesso!');
          fetchManutencoes();
        } else {
          alert('Erro ao excluir manutenção');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao excluir manutenção');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendada':
        return 'status-agendada';
      case 'em_andamento':
        return 'status-andamento';
      case 'concluida':
        return 'status-concluida';
      case 'cancelada':
        return 'status-cancelada';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'preventiva':
        return 'Preventiva';
      case 'corretiva':
        return 'Corretiva';
      case 'calibracao':
        return 'Calibração';
      default:
        return tipo;
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'baixa':
        return 'prioridade-baixa';
      case 'media':
        return 'prioridade-media';
      case 'alta':
        return 'prioridade-alta';
      case 'critica':
        return 'prioridade-critica';
      default:
        return '';
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

  const filteredManutencoes = manutencoes.filter(manutencao => {
    const matchesSearch = 
      manutencao.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manutencao.nome_equipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manutencao.codigo_equipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manutencao.responsavel?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || manutencao.status === statusFilter;
    const matchesTipo = !tipoFilter || manutencao.tipo === tipoFilter;
    const matchesEquipamento = !equipamentoId || manutencao.equipamento_id == equipamentoId;
    
    return matchesSearch && matchesStatus && matchesTipo && matchesEquipamento;
  });

  return (
    <div className="manutencoes-page">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="manutencoes-container">
          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>
                  {equipamentoId && selectedEquipamento 
                    ? `Manutenções - ${selectedEquipamento.nome}`
                    : 'Gestão de Manutenções'
                  }
                </h1>
                <p>
                  {equipamentoId && selectedEquipamento 
                    ? 'Gerencie as manutenções deste equipamento'
                    : 'Gerencie todas as manutenções do laboratório'
                  }
                </p>
                {equipamentoId && selectedEquipamento && (
                  <p className="equipamento-info">
                    Código: {selectedEquipamento.codigo} | 
                    Categoria: {selectedEquipamento.categoria} | 
                    Status: {selectedEquipamento.status}
                  </p>
                )}
              </div>
            </div>
            <div className="header-actions">
              <Link to="/manutencoes/novo" className="btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Nova Manutenção
              </Link>
              {equipamentoId && (
                <Link to="/equipamentos" className="btn-secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Voltar aos Equipamentos
                </Link>
              )}
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
              placeholder="Buscar por descrição, equipamento, responsável..."
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
            <option value="agendada">Agendada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os Tipos</option>
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
            <option value="calibracao">Calibração</option>
          </select>
        </div>
      </div>

      <div className="manutencoes-list">
        {filteredManutencoes.length === 0 ? (
          <div className="no-results">
            <p>Nenhuma manutenção encontrada.</p>
          </div>
        ) : (
          filteredManutencoes.map(manutencao => (
            <div key={manutencao.id} className="manutencao-card">
              <div className="card-header">
                <div className="header-info">
                  <h3>{manutencao.nome_equipamento}</h3>
                  <span className="codigo-equipamento">{manutencao.codigo_equipamento}</span>
                </div>
                <div className="status-badges">
                  <span className={`status-badge ${getStatusColor(manutencao.status)}`}>
                    {getStatusText(manutencao.status)}
                  </span>
                  <span className={`prioridade-badge ${getPrioridadeColor(manutencao.prioridade)}`}>
                    {manutencao.prioridade}
                  </span>
                </div>
              </div>

              <div className="card-content">
                <div className="manutencao-info">
                  <div className="info-row">
                    <span className="label">Tipo:</span>
                    <span className="value">{getTipoText(manutencao.tipo)}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Descrição:</span>
                    <span className="value description">{manutencao.descricao}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Data Agendada:</span>
                    <span className="value">{formatDate(manutencao.data_agendada)}</span>
                  </div>
                  
                  {manutencao.data_realizada && (
                    <div className="info-row">
                      <span className="label">Data Realizada:</span>
                      <span className="value">{formatDate(manutencao.data_realizada)}</span>
                    </div>
                  )}
                  
                  <div className="info-row">
                    <span className="label">Responsável:</span>
                    <span className="value">{manutencao.responsavel || '-'}</span>
                  </div>
                  
                  {manutencao.fornecedor && (
                    <div className="info-row">
                      <span className="label">Fornecedor:</span>
                      <span className="value">{manutencao.fornecedor}</span>
                    </div>
                  )}
                  
                  {manutencao.custo && (
                    <div className="info-row">
                      <span className="label">Custo:</span>
                      <span className="value cost">{formatCurrency(manutencao.custo)}</span>
                    </div>
                  )}
                  
                  {manutencao.observacoes && (
                    <div className="info-row">
                      <span className="label">Observações:</span>
                      <span className="value">{manutencao.observacoes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <Link 
                  to={`/manutencoes/editar/${manutencao.id}`} 
                  className="btn-secondary"
                >
                  Editar
                </Link>
                
                {manutencao.status === 'agendada' && (
                  <button 
                    onClick={() => handleConcluirManutencao(manutencao.id)}
                    className="btn-success"
                  >
                    Concluir
                  </button>
                )}
                
                {manutencao.status === 'agendada' && (
                  <button 
                    onClick={() => handleDelete(manutencao.id)}
                    className="btn-danger"
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

          <div className="stats-footer">
            <p>Total de manutenções: {filteredManutencoes.length}</p>
            {filteredManutencoes.length > 0 && (
              <div className="stats-details">
                <span>Agendadas: {filteredManutencoes.filter(m => m.status === 'agendada').length}</span>
                <span>Em Andamento: {filteredManutencoes.filter(m => m.status === 'em_andamento').length}</span>
                <span>Concluídas: {filteredManutencoes.filter(m => m.status === 'concluida').length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManutencoesPage;

