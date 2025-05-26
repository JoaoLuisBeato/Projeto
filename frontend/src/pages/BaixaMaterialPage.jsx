// src/pages/BaixaMaterialPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/BaixaMaterialPage.css";

function BaixaMaterialPage() {
  const [materiais, setMateriais] = useState([]);
  const [materialSelecionado, setMaterialSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/materiaisList")
      .then(res => setMateriais(res.data))
      .catch(err => setErro("Erro ao carregar materiais."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!materialSelecionado || !quantidade) return;

    try {
      const response = await axios.patch(`http://localhost:5000/materiais/${materialSelecionado}/baixa`, {
        quantidade: parseFloat(quantidade)
      });

      setMensagem(response.data.message);
      setQuantidade("");
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao registrar baixa.");
    }
  };

  return (
    <div className="baixa-container">
      <h2>Dar Baixa de Material</h2>
      <form onSubmit={handleSubmit} className="baixa-form">
        <select value={materialSelecionado} onChange={(e) => setMaterialSelecionado(e.target.value)} required>
          <option value="">Selecione um material</option>
          {materiais.map(mat => (
            <option key={mat.id} value={mat.id}>{mat.nome} ({mat.estoque_atual} {mat.unidade})</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantidade a dar baixa"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          required
        />

        <button type="submit">Confirmar Baixa</button>

        {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
        {erro && <p className="mensagem-erro">{erro}</p>}
      </form>
    </div>
  );
}

export default BaixaMaterialPage;
