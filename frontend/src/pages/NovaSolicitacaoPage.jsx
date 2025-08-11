import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/NovaSolicitacaoPage.css";

function NovaSolicitacaoPage() {
  const [form, setForm] = useState({
    emailFornecedor: "",
    mensagem: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular envio da solicitação (por enquanto só frontend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setForm({
        emailFornecedor: "",
        mensagem: ""
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="solicitacao-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="solicitacao-container">
          {/* Header da Página */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>Nova Solicitação</h1>
                <p>Envie uma solicitação para o fornecedor</p>
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
                <span>Solicitação enviada com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="solicitacao-form">
              {/* Email do Fornecedor */}
              <div className="form-group">
                <label htmlFor="emailFornecedor">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email do Fornecedor *
                </label>
                <input
                  id="emailFornecedor"
                  name="emailFornecedor"
                  type="email"
                  placeholder="exemplo@fornecedor.com"
                  value={form.emailFornecedor}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Mensagem */}
              <div className="form-group">
                <label htmlFor="mensagem">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Mensagem *
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  placeholder="Digite sua mensagem para o fornecedor..."
                  value={form.mensagem}
                  onChange={handleChange}
                  rows="6"
                  required
                />
              </div>

              {/* Botão de Envio */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className={`btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                      </svg>
                      <span>Enviar Mensagem</span>
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

export default NovaSolicitacaoPage;
