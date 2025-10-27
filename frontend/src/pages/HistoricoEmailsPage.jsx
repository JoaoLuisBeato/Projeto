import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/NovaSolicitacaoPage.css";

function HistoricoEmailsPage() {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    // Carregar histórico do localStorage
    const historico = JSON.parse(localStorage.getItem('emails_enviados') || '[]');
    setEmails(historico.reverse()); // Mostrar os mais recentes primeiro
  }, []);

  const limparHistorico = () => {
    localStorage.removeItem('emails_enviados');
    setEmails([]);
  };

  const formatarData = (timestamp) => {
    const data = new Date(timestamp);
    return data.toLocaleString('pt-BR');
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>Histórico de Solicitações</h1>
                <p>Visualize todas as solicitações enviadas</p>
              </div>
            </div>
          </div>

          {/* Card do Histórico */}
          <div className="form-card">
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, color: '#374151' }}>Solicitações Enviadas ({emails.length})</h3>
              {emails.length > 0 && (
                <button 
                  onClick={limparHistorico}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Limpar Histórico
                </button>
              )}
            </div>

            <div style={{ padding: '24px' }}>
              {emails.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <p>Nenhuma solicitação enviada ainda.</p>
                  <p>Use a página "Nova Solicitação" para enviar sua primeira solicitação.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {emails.map((email, index) => (
                    <div key={index} style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: '#374151', fontSize: '16px' }}>
                            {email.assunto}
                          </h4>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                            Para: <strong>{email.destinatario}</strong>
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {email.status}
                          </span>
                          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                            {formatarData(email.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div style={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px',
                        marginTop: '8px'
                      }}>
                        <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
                          {email.mensagem}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoricoEmailsPage;
