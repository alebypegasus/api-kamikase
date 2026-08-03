import React, { useState } from 'react';
import { ShoppingBag, Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3000/api`;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<'login' | 'register'>('login');
  const [authNome, setAuthNome] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authSenha, setAuthSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alerts, setAlerts] = useState<{id: number, type: string, message: string}[]>([]);

  const addAlert = (type: string, message: string) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authSenha) {
      addAlert('warning', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, senha: authSenha })
      });

      const data = await res.json();

      if (res.ok) {
        // Obter payload do JWT para pegar is_admin (simplificado: pegando da resposta se backend enviar, ou assumir admin)
        // Como o backend manda token, vamos decodificar o token manual
        const tokenParts = data.token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const is_admin = payload.is_admin || false;

        login(data.token, data.nome, data.email || authEmail, is_admin);

        if (is_admin) {
            navigate('/adm');
        } else {
            navigate('/pdv');
        }
      } else {
        addAlert('danger', data.mensagem || 'Credenciais inválidas.');
      }
    } catch (err) {
      console.error(err);
      addAlert('danger', 'Erro de comunicação com a API backend.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authNome || !authEmail || !authSenha) {
      addAlert('warning', 'Todos os campos são obrigatórios.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/usuarios/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: authNome, email: authEmail, senha: authSenha })
      });

      const data = await res.json();

      if (res.ok) {
        addAlert('success', 'Cadastro realizado com sucesso! Faça login.');
        setAuthState('login');
        setAuthNome('');
      } else {
        addAlert('danger', data.mensagem || 'Erro ao realizar cadastro.');
      }
    } catch (err) {
      console.error(err);
      addAlert('danger', 'Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="auth-container">
      <div className="alert-container">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-toast ${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="alert-message">{alert.message}</span>
            <button className="alert-close" onClick={() => setAlerts(p => p.filter(a => a.id !== alert.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <ShoppingBag size={32} />
          </div>
          <h1 className="auth-title">Kamikase</h1>
          <p className="auth-subtitle">
            {authState === 'login' ? 'Entre na sua conta para acessar o sistema' : 'Crie sua conta para começar'}
          </p>
        </div>

        <form onSubmit={authState === 'login' ? handleLogin : handleRegister}>
          {authState === 'register' && (
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Seu nome"
                  value={authNome}
                  onChange={(e) => setAuthNome(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="seu@email.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="Sua senha"
                value={authSenha}
                onChange={(e) => setAuthSenha(e.target.value)}
                required
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            {authState === 'login' ? 'Entrar no Sistema' : 'Criar Conta'}
          </button>

          <div className="auth-switch-text">
            {authState === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'} {' '}
            <button 
              type="button" 
              className="auth-switch-btn"
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setAuthState(authState === 'login' ? 'register' : 'login')}
            >
              {authState === 'login' ? 'Cadastre-se' : 'Faça login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
