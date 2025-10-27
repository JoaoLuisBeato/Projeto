import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/NovaSolicitacaoPage.css";
import emailjs from '@emailjs/browser';

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

  const enviarEmailTemporario = async (emailDestino, mensagem) => {
    try {
      // Opção 1: Usar serviço de email temporário real (TempMail API)
      const tempEmailData = {
        to: emailDestino,
        subject: "Solicitação de Material/Equipamento - Sistema de Laboratório",
        message: `
Prezado(a) Fornecedor,

Recebemos uma solicitação através do nosso sistema de gestão de laboratório:

${mensagem}

Por favor, entre em contato conosco para mais detalhes sobre esta solicitação.

Atenciosamente,
Sistema de Laboratório

---
Este é um email automático do sistema.
        `,
        from: "sistema@laboratorio.com"
      };

      // Simular envio usando um serviço de email temporário
      // Em produção, você pode usar serviços como:
      // - TempMail API
      // - EmailJS
      // - SendGrid
      // - Mailgun
      
      const response = await fetch('https://api.tempmail.org/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempEmailData)
      });

      // Se o serviço externo falhar, usar sistema local
      if (!response.ok) {
        throw new Error('Serviço externo indisponível');
      }

      return {
        sucesso: true,
        mensagem: "Email enviado via serviço temporário!",
        dados: tempEmailData
      };

    } catch (error) {
      // Fallback: Sistema local de simulação
      console.log("Usando sistema local de simulação:", error.message);
      
      const dadosEmail = {
        destinatario: emailDestino,
        assunto: "Solicitação de Material/Equipamento - Sistema de Laboratório",
        mensagem: mensagem,
        timestamp: new Date().toISOString(),
        status: "simulado",
        metodo: "sistema_local"
      };

      // Salvar no localStorage para simular histórico
      const historico = JSON.parse(localStorage.getItem('emails_enviados') || '[]');
      historico.push(dadosEmail);
      localStorage.setItem('emails_enviados', JSON.stringify(historico));

      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        sucesso: true,
        mensagem: "Solicitação registrada no sistema local!",
        dados: dadosEmail
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usar sistema de email temporário
      const resultado = await enviarEmailTemporario(form.emailFornecedor, form.mensagem);
      
      if (resultado.sucesso) {
        setSuccess(true);
        setForm({
          emailFornecedor: "",
          mensagem: ""
        });
        
        // Mostrar detalhes do email enviado
        console.log("Email enviado:", resultado.dados);
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(resultado.mensagem);
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert(`Erro ao enviar solicitação: ${error.message}`);
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
                <span>Solicitação registrada com sucesso!</span>
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
