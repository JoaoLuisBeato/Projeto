import React, { useState } from "react";
import axios from "axios";
import "../styles/CadastroMaterialPage.css";

function CadastroMaterialPage() {
  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    fabricante: "",
    quantidade: "",
    unidade: "",
    validade: "",
    preco: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/materiais", form);
      alert("Material cadastrado com sucesso!");
      setForm({
        nome: "",
        tipo: "",
        fabricante: "",
        quantidade: "",
        unidade: "",
        validade: "",
        preco: ""
      });
    } catch (error) {
      console.error("Erro ao cadastrar material:", error);
      alert("Erro ao cadastrar material. Verifique o console.");
    }
  };

  return (
    <div className="cadastro-container">
      <div className="form-card">
        <h2>Cadastrar Novo Material</h2>
        <form onSubmit={handleSubmit}>
          <input name="nome" type="text" placeholder="Nome" value={form.nome} onChange={handleChange} required />
          <input name="tipo" type="text" placeholder="Tipo" value={form.tipo} onChange={handleChange} required />
          <input name="fabricante" type="text" placeholder="Fabricante" value={form.fabricante} onChange={handleChange} required />
          <input name="quantidade" type="number" placeholder="Quantidade" value={form.quantidade} onChange={handleChange} required />
          <input name="unidade" type="text" placeholder="Unidade" value={form.unidade} onChange={handleChange} required />
          <input name="validade" type="date" placeholder="Validade" value={form.validade} onChange={handleChange} required />
          <input name="preco" type="number" step="0.01" placeholder="Preço (R$)" value={form.preco} onChange={handleChange} required />
          <button type="submit">Salvar Material</button>
        </form>
      </div>
    </div>
  );
}

export default CadastroMaterialPage;
