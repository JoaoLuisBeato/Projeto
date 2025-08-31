import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/CadastroEquipamentoPage.css';

const CadastroEquipamentoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [equipamento, setEquipamento] = useState({
    codigo: '',
    nome: '',
    modelo: '',
    fabricante: '',
    numero_serie: '',
    categoria: '',
    localizacao: '',
    status: 'ativo',
    data_aquisicao: '',
    valor_aquisicao: '',
    garantia_ate: '',
    especificacoes_tecnicas: '',
    observacoes: ''
  });

  const categorias = [
    'HPLC',
    'Espectrômetro',
    'Balança',
    'Microscópio',
    'pHmetro',
    'Centrífuga',
    'Autoclave',
    'Estufa',
    'Refrigerador',
    'Freezer',
    'Agitador',
    'Bomba',
    'Filtro',
    'Outros'
  ];

  const statusOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
    { value: 'manutencao', label: 'Em Manutenção' },
    { value: 'defeito', label: 'Defeito' }
  ];

  useEffect(() => {
    if (id) {
      fetchEquipamento();
    }
  }, [id]);

  const fetchEquipamento = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/equipamentos/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEquipamento({
          ...data,
          data_aquisicao: data.data_aquisicao ? data.data_aquisicao.split('T')[0] : '',
          garantia_ate: data.garantia_ate ? data.garantia_ate.split('T')[0] : ''
        });
      } else {
        alert('Erro ao carregar equipamento');
        navigate('/equipamentos');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao carregar equipamento');
      navigate('/equipamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEquipamento(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!equipamento.nome.trim()) {
      alert('O nome do equipamento é obrigatório');
      return;
    }

    if (!equipamento.codigo.trim()) {
      alert('O código do equipamento é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const url = id ? `http://localhost:5000/equipamentos/${id}` : 'http://localhost:5000/equipamentos';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipamento),
      });

      if (response.ok) {
        const message = id ? 'Equipamento atualizado com sucesso!' : 'Equipamento cadastrado com sucesso!';
        alert(message);
        navigate('/equipamentos');
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Erro ao salvar equipamento'}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao salvar equipamento');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading && id) {
    return <div className="loading">Carregando equipamento...</div>;
  }

  return (
    <div className="cadastro-equipamento-page">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="equipamento-container">
          <div className="page-header">
            <h1>{id ? 'Editar Equipamento' : 'Novo Equipamento'}</h1>
            <button 
              onClick={() => navigate('/equipamentos')} 
              className="btn-secondary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar
            </button>
          </div>

      <form onSubmit={handleSubmit} className="equipamento-form">
        <div className="form-sections">
          {/* Seção 1: Informações Básicas */}
          <div className="form-section">
            <h2>Informações Básicas</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="codigo">Código do Equipamento *</label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  value={equipamento.codigo}
                  onChange={handleInputChange}
                  placeholder="Ex: HPLC-001"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nome">Nome do Equipamento *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={equipamento.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Cromatógrafo Líquido"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modelo">Modelo</label>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={equipamento.modelo}
                  onChange={handleInputChange}
                  placeholder="Ex: LC-20AT"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fabricante">Fabricante</label>
                <input
                  type="text"
                  id="fabricante"
                  name="fabricante"
                  value={equipamento.fabricante}
                  onChange={handleInputChange}
                  placeholder="Ex: Shimadzu"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numero_serie">Número de Série</label>
                <input
                  type="text"
                  id="numero_serie"
                  name="numero_serie"
                  value={equipamento.numero_serie}
                  onChange={handleInputChange}
                  placeholder="Ex: SN123456789"
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={equipamento.categoria}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="localizacao">Localização</label>
                <input
                  type="text"
                  id="localizacao"
                  name="localizacao"
                  value={equipamento.localizacao}
                  onChange={handleInputChange}
                  placeholder="Ex: Laboratório A - Sala 101"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={equipamento.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Informações Financeiras */}
          <div className="form-section">
            <h2>Informações Financeiras</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="data_aquisicao">Data de Aquisição</label>
                <input
                  type="date"
                  id="data_aquisicao"
                  name="data_aquisicao"
                  value={equipamento.data_aquisicao}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="valor_aquisicao">Valor de Aquisição (R$)</label>
                <input
                  type="number"
                  id="valor_aquisicao"
                  name="valor_aquisicao"
                  value={equipamento.valor_aquisicao}
                  onChange={handleInputChange}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="garantia_ate">Garantia Até</label>
                <input
                  type="date"
                  id="garantia_ate"
                  name="garantia_ate"
                  value={equipamento.garantia_ate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Informações Técnicas */}
          <div className="form-section">
            <h2>Informações Técnicas</h2>
            
            <div className="form-group full-width">
              <label htmlFor="especificacoes_tecnicas">Especificações Técnicas</label>
              <textarea
                id="especificacoes_tecnicas"
                name="especificacoes_tecnicas"
                value={equipamento.especificacoes_tecnicas}
                onChange={handleInputChange}
                placeholder="Descreva as especificações técnicas do equipamento..."
                rows="4"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={equipamento.observacoes}
                onChange={handleInputChange}
                placeholder="Observações adicionais sobre o equipamento..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/equipamentos')}
            className="btn-cancel"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading}
          >
            {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Cadastrar')}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroEquipamentoPage;

