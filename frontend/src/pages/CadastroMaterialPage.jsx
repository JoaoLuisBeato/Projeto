import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/CadastroMaterialPage.css";

function CadastroMaterialPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    codigo_material: "",
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

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const unidades = [
    "ml", "L", "g", "kg", "mg", "un", "pct", "m", "cm", "mm"
  ];

  const tipos = [
    "Reagente", "Padrão", "Solvente", "Ácido", "Base", "Indicador", "Enzima", "Anticorpo", "Meio de Cultura", "Outro"
  ];

  // Carregar dados do material se estiver editando
  useEffect(() => {
    if (isEditing) {
      const fetchMaterial = async () => {
        try {
          setLoadingData(true);
          const response = await axios.get(`http://localhost:5000/materiais/${id}`);
          const material = response.data;
          
          // Formatar a data para o formato aceito pelo input date
          const dataFormatada = material.validade ? new Date(material.validade).toISOString().split('T')[0] : '';
          
          setForm({
            codigo_material: material.codigo_material || "",
            nome: material.nome || "",
            tipo: material.tipo || "",
            fabricante: material.fabricante || "",
            quantidade: material.quantidade || "",
            unidade: material.unidade || "",
            validade: dataFormatada,
            preco: material.preco || "",
            estoque_atual: material.estoque_atual || "",
            estoque_minimo: material.estoque_minimo || ""
          });

          // Se o material tem arquivo PDF, mostrar o nome
          if (material.arquivo_pdf) {
            setPdfFileName("FISPQ já cadastrado");
          }
        } catch (error) {
          console.error("Erro ao carregar material:", error);
          alert("Erro ao carregar dados do material. Verifique o console.");
        } finally {
          setLoadingData(false);
        }
      };

      fetchMaterial();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setPdfFileName(file.name);
      } else {
        alert('Por favor, selecione apenas arquivos PDF.');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Adicionar todos os campos do formulário
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      // Adicionar arquivo PDF se existir
      if (pdfFile) {
        formData.append('arquivo_pdf', pdfFile);
      }

      if (isEditing) {
        await axios.put(`http://localhost:5000/materiais/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/materiaisList');
        }, 2000);
      } else {
        await axios.post("http://localhost:5000/materiais", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess(true);
        setForm({
          codigo_material: "",
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
        setPdfFile(null);
        setPdfFileName("");
        
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} material:`, error);
      alert(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} material. Verifique o console.`);
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
                <h1>{isEditing ? 'Editar Material' : 'Cadastrar Material'}</h1>
                <p>{isEditing ? 'Edite as informações do material' : 'Adicione um novo material ao sistema de gestão'}</p>
              </div>
            </div>
          </div>

          {/* Card do Formulário */}
          <div className="form-card">
            {loadingData && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando dados do material...</p>
              </div>
            )}
            
            {success && (
              <div className="success-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                <span>Material {isEditing ? 'atualizado' : 'cadastrado'} com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="material-form" style={{ opacity: loadingData ? 0.5 : 1, pointerEvents: loadingData ? 'none' : 'auto' }}>
              {/* Informações Básicas */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Informações Básicas</h3>
                  <p>Dados principais do material</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="codigo_material">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                        <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                        <path d="M7 3v18"/>
                        <path d="M17 3v18"/>
                      </svg>
                      Código do Material
                    </label>
                    <input
                      id="codigo_material"
                      name="codigo_material"
                      type="text"
                      placeholder="Ex: AC001, REAG001"
                      value={form.codigo_material}
                      onChange={handleChange}
                    />
                  </div>

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

              {/* Documentação FISPQ */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Documentação</h3>
                  <p>Arquivo FISPQ (opcional)</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="arquivo_pdf">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      Arquivo FISPQ (PDF)
                    </label>
                    <div className="file-upload-container">
                      <input
                        id="arquivo_pdf"
                        name="arquivo_pdf"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <div className="file-upload-display">
                        {pdfFileName ? (
                          <div className="file-selected">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            <span>{pdfFileName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPdfFile(null);
                                setPdfFileName("");
                                document.getElementById('arquivo_pdf').value = '';
                              }}
                              className="remove-file"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="file-upload-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7,10 12,15 17,10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            <span>Clique para selecionar arquivo PDF ou arraste aqui</span>
                            <small>Apenas arquivos PDF são aceitos</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="form-actions">
                
                <button 
                  type="submit" 
                  className={`btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading || loadingData}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>{isEditing ? 'Atualizando...' : 'Cadastrando...'}</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7L10 17l-5-5"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                      <span>{isEditing ? 'Atualizar Material' : 'Cadastrar Material'}</span>
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
