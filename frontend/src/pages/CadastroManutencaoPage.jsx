import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/CadastroManutencaoPage.css';

const CadastroManutencaoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [manutencao, setManutencao] = useState({
    equipamento_id: '',
    tipo: 'preventiva',
    descricao: '',
    data_agendada: '',
    prioridade: 'media',
    responsavel: '',
    fornecedor: '',
    custo: '',
    observacoes: ''
  });

  const [equipamentos, setEquipamentos] = useState([]);

  const tiposManutencao = [
    { value: 'preventiva', label: 'Preventiva' },
    { value: 'corretiva', label: 'Corretiva' },
    { value: 'calibracao', label: 'Calibração' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'revisao', label: 'Revisão' }
  ];

  const prioridades = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'media', label: 'Média' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  // Carregar dados da manutenção se estiver editando
  useEffect(() => {
    if (isEditing) {
      fetchManutencao();
    }
    fetchEquipamentos();
  }, [id]);

  const fetchEquipamentos = async () => {
    try {
      const response = await fetch('http://localhost:5000/equipamentos');
      if (response.ok) {
        const data = await response.json();
        setEquipamentos(data);
      } else {
        alert('Erro ao carregar equipamentos');
      }
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      alert('Erro ao carregar equipamentos');
    }
  };

  const fetchManutencao = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`http://localhost:5000/manutencoes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setManutencao({
          ...data,
          data_agendada: data.data_agendada ? data.data_agendada.split('T')[0] : ''
        });
      } else {
        alert('Erro ao carregar manutenção');
        navigate('/manutencoes');
      }
    } catch (error) {
      console.error('Erro ao buscar manutenção:', error);
      alert('Erro ao carregar manutenção');
      navigate('/manutencoes');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setManutencao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!manutencao.equipamento_id) {
      alert('Selecione um equipamento');
      return;
    }

    if (!manutencao.descricao.trim()) {
      alert('A descrição é obrigatória');
      return;
    }

    if (!manutencao.data_agendada) {
      alert('A data agendada é obrigatória');
      return;
    }

    try {
      setLoading(true);
      const url = id ? `http://localhost:5000/manutencoes/${id}` : 'http://localhost:5000/manutencoes';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...manutencao,
          custo: manutencao.custo ? parseFloat(manutencao.custo) : 0
        }),
      });

      if (response.ok) {
        const message = id ? 'Manutenção atualizada com sucesso!' : 'Manutenção cadastrada com sucesso!';
        alert(message);
        navigate('/manutencoes');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Erro ao salvar manutenção'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao salvar manutenção');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="cadastro-manutencao-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Carregando dados da manutenção...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-manutencao-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="cadastro-manutencao-container">
          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>{isEditing ? 'Editar Manutenção' : 'Nova Manutenção'}</h1>
                <p>{isEditing ? 'Atualize os dados da manutenção' : 'Cadastre uma nova manutenção no sistema'}</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                onClick={() => navigate('/manutencoes')}
                className="btn-secondary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="manutencao-form">
            <div className="form-sections">
              {/* Informações Básicas */}
              <div className="form-section">
                <h3>Informações Básicas</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="equipamento_id">Equipamento *</label>
                    <select
                      id="equipamento_id"
                      name="equipamento_id"
                      value={manutencao.equipamento_id}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Selecione um equipamento</option>
                      {equipamentos.map(equipamento => (
                        <option key={equipamento.id} value={equipamento.id}>
                          {equipamento.nome} - {equipamento.codigo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tipo">Tipo de Manutenção *</label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={manutencao.tipo}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {tiposManutencao.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="descricao">Descrição *</label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={manutencao.descricao}
                    onChange={handleChange}
                    placeholder="Descreva os serviços a serem realizados..."
                    className="form-textarea"
                    rows="4"
                    required
                  />
                </div>
              </div>

              {/* Agendamento */}
              <div className="form-section">
                <h3>Agendamento</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="data_agendada">Data Agendada *</label>
                    <input
                      type="date"
                      id="data_agendada"
                      name="data_agendada"
                      value={manutencao.data_agendada}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prioridade">Prioridade *</label>
                    <select
                      id="prioridade"
                      name="prioridade"
                      value={manutencao.prioridade}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {prioridades.map(prioridade => (
                        <option key={prioridade.value} value={prioridade.value}>
                          {prioridade.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Responsáveis */}
              <div className="form-section">
                <h3>Responsáveis</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="responsavel">Responsável</label>
                    <input
                      type="text"
                      id="responsavel"
                      name="responsavel"
                      value={manutencao.responsavel}
                      onChange={handleChange}
                      placeholder="Nome do responsável pela manutenção"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fornecedor">Fornecedor</label>
                    <input
                      type="text"
                      id="fornecedor"
                      name="fornecedor"
                      value={manutencao.fornecedor}
                      onChange={handleChange}
                      placeholder="Nome da empresa fornecedora"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Custos e Observações */}
              <div className="form-section">
                <h3>Custos e Observações</h3>
                
                <div className="form-group">
                  <label htmlFor="custo">Custo (R$)</label>
                  <input
                    type="number"
                    id="custo"
                    name="custo"
                    value={manutencao.custo}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="observacoes">Observações</label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    value={manutencao.observacoes}
                    onChange={handleChange}
                    placeholder="Observações adicionais sobre a manutenção..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/manutencoes')}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroManutencaoPage;
