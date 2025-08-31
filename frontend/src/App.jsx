import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import MateriaisPage from "./pages/CadastroMaterialPage";
import MateriaisListPage from "./pages/MateriaisListPage";
import HomePage from "./pages/HomePage";
import BaixaMaterialPage from "./pages/BaixaMaterialPage";
import NovaSolicitacaoPage from "./pages/NovaSolicitacaoPage";
import EquipamentosListPage from "./pages/EquipamentosListPage";
import CadastroEquipamentoPage from "./pages/CadastroEquipamentoPage";
import ManutencoesPage from "./pages/ManutencoesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/materiais" element={<MateriaisPage />} />
        <Route path="/materiais/editar/:id" element={<MateriaisPage />} />
        <Route path="/materiaisList" element={<MateriaisListPage />} />
        <Route path="/baixa-material" element={<BaixaMaterialPage />} />
        <Route path="/nova-solicitacao" element={<NovaSolicitacaoPage />} />
        
        {/* Rotas de Equipamentos */}
        <Route path="/equipamentos" element={<EquipamentosListPage />} />
        <Route path="/equipamentos/novo" element={<CadastroEquipamentoPage />} />
        <Route path="/equipamentos/:id" element={<CadastroEquipamentoPage />} />
        
        {/* Rotas de Manutenções */}
        <Route path="/manutencoes" element={<ManutencoesPage />} />
        <Route path="/manutencoes/equipamento/:equipamentoId" element={<ManutencoesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
