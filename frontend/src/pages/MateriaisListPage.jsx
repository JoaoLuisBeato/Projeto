// src/pages/MateriaisListPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MateriaisListPage.css";

function MateriaisListPage() {
  const [materiais, setMateriais] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/materiaisList")
      .then(response => setMateriais(response.data))
      .catch(err => {
        console.error(err);
        setErro("Erro ao carregar os materiais.");
      });
  }, []);

  return (
    <div className="listagem-container">
      <h2>Lista de Materiais Cadastrados</h2>
      {erro && <p className="erro">{erro}</p>}

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Fabricante</th>
            <th>Quantidade</th>
            <th>Estoque Atual</th>
            <th>Estoque Mínimo</th>
            <th>Validade</th>
            <th>Preço (R$)</th>
          </tr>
        </thead>
        <tbody>
          {materiais.map(mat => (
            <tr key={mat.id} style={{ backgroundColor: mat.estoque_atual <= mat.estoque_minimo ? '#ffe5e5' : 'transparent' }}>
                <td>{mat.nome}</td>
                <td>{mat.tipo}</td>
                <td>{mat.fabricante}</td>
                <td>{mat.quantidade} {mat.unidade}</td>
                <td>{mat.estoque_atual}</td>
                <td>{mat.estoque_minimo}</td>
                <td>{new Date(mat.validade).toLocaleDateString("pt-BR")}</td>
                <td>{Number(mat.preco).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MateriaisListPage;
