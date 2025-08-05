import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/CadastroMaterialPage.css";

function CadastroMaterialPage() {
  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    fabricante: "",
    quantidade: "",
    unidade: "",
    validade: "",
    preco: "",
    estoque_atual: "",
    estoque_minimo: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const unidades = [
    "ml", "L", "g", "kg", "mg", "un", "pct", "m", "cm", "mm"
  ];

  const tipos = [
    "Reagente", "Padrão", "Solvente", "Ácido", "Base", "Indicador", "Enzima", "Anticorpo", "Meio de Cultura", "Outro"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/materiais", form);
      setSuccess(true);
      setForm({
        nome: "",
        tipo: "",
        fabricante: "",
        quantidade: "",
        unidade: "",
        validade: "",
        preco: "",
        estoque_atual: "",
        estoque_minimo: ""
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao cadastrar material:", error);
      alert("Erro ao cadastrar material. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleCurrencyChange = (e) => {
    const value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
    setForm({ ...form, preco: value });
  };

  return (
    <div className="cadastro-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="cadastro-container">
          {/* Header da Página */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>Cadastrar Material</h1>
                <p>Adicione um novo material ao sistema de gestão</p>
              </div>
            </div>
          </div>

          {/* Card do Formulário */}
          <div className="form-card">
            {success && (
              <div className="success-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                <span>Material cadastrado com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="material-form">
              {/* Informações Básicas */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Informações Básicas</h3>
                  <p>Dados principais do material</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="nome">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7L10 17l-5-5"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                      Nome do Material *
                    </label>
                    <input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="Ex: Ácido Clorídrico"
                      value={form.nome}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tipo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h18v18H3z"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                      </svg>
                      Tipo *
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={form.tipo}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      {tipos.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fabricante">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7L10 17l-5-5"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                      Fabricante *
                    </label>
                    <input
                      id="fabricante"
                      name="fabricante"
                      type="text"
                      placeholder="Ex: Merck, Sigma-Aldrich"
                      value={form.fabricante}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informações de Quantidade e Preço */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Quantidade e Preço</h3>
                  <p>Especificações de quantidade e valor</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="quantidade">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h18v18H3z"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                      </svg>
                      Quantidade *
                    </label>
                    <input
                      id="quantidade"
                      name="quantidade"
                      type="number"
                      placeholder="0"
                      value={form.quantidade}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="unidade">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h18v18H3z"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                      </svg>
                      Unidade *
                    </label>
                    <select
                      id="unidade"
                      name="unidade"
                      value={form.unidade}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione a unidade</option>
                      {unidades.map((unidade) => (
                        <option key={unidade} value={unidade}>{unidade}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="preco">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                      </svg>
                      Preço Unitário *
                    </label>
                    <input
                      id="preco"
                      name="preco"
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(form.preco)}
                      onChange={handleCurrencyChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informações de Estoque */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Controle de Estoque</h3>
                  <p>Configurações de estoque e validade</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="estoque_atual">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h18v18H3z"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                      </svg>
                      Estoque Atual *
                    </label>
                    <input
                      id="estoque_atual"
                      name="estoque_atual"
                      type="number"
                      placeholder="0"
                      value={form.estoque_atual}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="estoque_minimo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 002.18 3h16a2 2 0 002.18-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Estoque Mínimo *
                    </label>
                    <input
                      id="estoque_minimo"
                      name="estoque_minimo"
                      type="number"
                      placeholder="0"
                      value={form.estoque_minimo}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="validade">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Data de Validade *
                    </label>
                    <input
                      id="validade"
                      name="validade"
                      type="date"
                      value={form.validade}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="form-actions">
                <button type="button" className="btn-secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Cancelar
                </button>
                
                <button 
                  type="submit" 
                  className={`btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7L10 17l-5-5"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                      <span>Cadastrar Material</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadastroMaterialPage;
