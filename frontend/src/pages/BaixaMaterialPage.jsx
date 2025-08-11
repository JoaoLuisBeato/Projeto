// src/pages/BaixaMaterialPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/BaixaMaterialPage.css";

function BaixaMaterialPage() {
  const [codigoMaterial, setCodigoMaterial] = useState("");
  const [materialEncontrado, setMaterialEncontrado] = useState(null);
  const [quantidade, setQuantidade] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para buscar material por código
  const buscarMaterial = async (codigo) => {
    if (!codigo.trim()) return;

    setLoading(true);
    setErro("");
    setMaterialEncontrado(null);

    try {
      const response = await axios.get(`http://localhost:5000/materiais/codigo/${codigo}`);
      setMaterialEncontrado(response.data);
      setMensagem("Material encontrado!");
    } catch (err) {
      setErro("Material não encontrado. Verifique o código e tente novamente.");
      setMaterialEncontrado(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para dar baixa no material
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!materialEncontrado || !quantidade) {
      setErro("Por favor, selecione um material e informe a quantidade.");
      return;
    }

    try {
      const response = await axios.patch(`http://localhost:5000/materiais/${materialEncontrado.id}/baixa`, {
        quantidade: parseFloat(quantidade)
      });

      setMensagem(`Baixa realizada com sucesso! Novo estoque: ${response.data.estoque_atual} unidades`);
      setQuantidade("");
      setMaterialEncontrado(null);
      setCodigoMaterial("");
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao registrar baixa.");
    }
  };

  // Função para formatar preço
  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="baixa-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="baixa-container">
          {/* Header da Página */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-2.4-.4-3.5-1.1-2.2-1.4-4.5-2.9-7.5-2.9s-5.3 1.5-7.5 2.9C2.4 11.6 1 12 0 12"/>
                  <path d="M21 12c-1 0-2.4.4-3.5 1.1-2.2 1.4-4.5 2.9-7.5 2.9s-5.3-1.5-7.5-2.9C2.4 12.4 1 12 0 12"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>Dar Baixa de Material</h1>
                <p>Digite o código do material para dar baixa no estoque</p>
              </div>
            </div>
          </div>

          {/* Área de Busca */}
          <div className="scan-section">
            <div className="scan-container">
              <div className="scan-header">
                <h2>Busca de Material</h2>
                <p>Digite o código do material para localizar</p>
              </div>

              <div className="scan-input-group">
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h6l2 2h8l2-2h2v16H3V3z"/>
                    <path d="M9 7h6"/>
                    <path d="M9 11h6"/>
                    <path d="M9 15h6"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Digite o código do material (ex: AC001, REAG001)..."
                    value={codigoMaterial}
                    onChange={(e) => setCodigoMaterial(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarMaterial(codigoMaterial)}
                    className="scan-input"
                    disabled={loading}
                  />
                </div>
                <button 
                  onClick={() => buscarMaterial(codigoMaterial)}
                  disabled={loading || !codigoMaterial.trim()}
                  className="btn-search"
                >
                  {loading ? (
                    <svg className="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  )}
                  Buscar
                </button>
              </div>
            </div>
          </div>

          {/* Material Encontrado */}
          {materialEncontrado && (
            <div className="material-found">
              <div className="material-card">
                <div className="material-header">
                  <div className="material-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 7L10 17l-5-5"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                  </div>
                  <div className="material-info">
                    <h3>{materialEncontrado.nome}</h3>
                    <p className="material-fabricante">{materialEncontrado.fabricante}</p>
                    <p className="material-tipo">{materialEncontrado.tipo}</p>
                    {materialEncontrado.codigo_material && (
                      <p className="material-code">Código: {materialEncontrado.codigo_material}</p>
                    )}
                  </div>
                  <div className="material-status">
                    <span className={`status-badge ${materialEncontrado.estoque_atual <= materialEncontrado.estoque_minimo ? 'low' : 'ok'}`}>
                      {materialEncontrado.estoque_atual <= materialEncontrado.estoque_minimo ? 'Estoque Baixo' : 'Estoque OK'}
                    </span>
                  </div>
                </div>

                <div className="material-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Estoque Atual:</span>
                      <span className="detail-value">{materialEncontrado.estoque_atual} unidades</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Estoque Mínimo:</span>
                      <span className="detail-value">{materialEncontrado.estoque_minimo} unidades</span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Preço:</span>
                      <span className="detail-value">{formatPrice(materialEncontrado.preco)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Validade:</span>
                      <span className="detail-value">{formatDate(materialEncontrado.validade)}</span>
                    </div>
                  </div>
                </div>

                {/* Formulário de Baixa */}
                <form onSubmit={handleSubmit} className="baixa-form">
                  <div className="form-group">
                    <label htmlFor="quantidade">Quantidade de Unidades para Baixa:</label>
                    <div className="input-group">
                      <input
                        type="number"
                        id="quantidade"
                        placeholder="Digite a quantidade de unidades"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                        min="1"
                        max={materialEncontrado.estoque_atual}
                        step="1"
                        required
                        className="quantidade-input"
                      />
                      <span className="input-suffix">unidades</span>
                    </div>
                    <small className="input-help">
                      Máximo disponível: {materialEncontrado.estoque_atual} unidades
                    </small>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      onClick={() => {
                        setMaterialEncontrado(null);
                        setCodigoMaterial("");
                        setQuantidade("");
                      }}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={!quantidade || parseInt(quantidade) > materialEncontrado.estoque_atual || parseInt(quantidade) < 1}
                      className="btn-primary"
                    >
                      Confirmar Baixa
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Mensagens */}
          {mensagem && (
            <div className="message-container success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              <p>{mensagem}</p>
            </div>
          )}

          {erro && (
            <div className="message-container error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p>{erro}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BaixaMaterialPage;
