import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/HomePage.css";

function HomePage() {
  const [materiaisVencidos, setMateriaisVencidos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/materiais/vencidos")
      .then(res => setMateriaisVencidos(res.data))
      .catch(err => console.error("Erro ao buscar vencidos:", err));
  }, []);

  return (
    <div className="home-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-placeholder">
          <h2>Gerenciamento de Reagentes/Padrões do Laboratório</h2>
          <p>Aqui você poderá visualizar resumos do sistema futuramente.</p>

          <div className="dashboard-cards">
            <div className="dashboard-lista-vencidos">
              <h3>Vencidos</h3>
              {materiaisVencidos.length === 0 ? (
                <p>Nenhum vencido</p>
              ) : (
                <ul>
                  {materiaisVencidos.slice(0, 5).map(mat => (
                    <li key={mat.id}>
                      {mat.nome} – {new Date(mat.validade).toLocaleDateString("pt-BR")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HomePage;
