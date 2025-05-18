// src/ProfilePage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, password } = location.state || {};

  if (!email || !password) {
    return (
      <div>
        <h2>Usuário não autenticado!</h2>
        <button onClick={() => navigate('/')}>Voltar para Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Bem-vindo!</h2>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Senha:</strong> {password}</p>
      <button onClick={() => navigate('/')}>Sair</button>
    </div>
  );
};

export default ProfilePage;
