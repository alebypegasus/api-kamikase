import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const { login, token, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      if (isAdmin) navigate('/adm');
      else navigate('/pdv');
    }
  }, [token, isAdmin, navigate]);

  const [authState, setAuthState] = useState<'login' | 'register'>('login');
  const [authNome, setAuthNome] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authSenha, setAuthSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [alerts, setAlerts] = useState<{id: number, type: string, message: string}[]>([]);

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!authSenha || authState === 'login') return '';
    let score = 0;
    if (authSenha.length >= 6) score++;
    if (authSenha.length >= 10) score++;
    if (/[A-Z]/.test(authSenha)) score++;
    if (/[0-9]/.test(authSenha)) score++;
    if (/[^A-Za-z0-9]/.test(authSenha)) score++;
    if (score <= 1) return 'weak';
    if (score <= 2) return 'fair';
    if (score <= 3) return 'good';
    return 'strong';
  }, [authSenha, authState]);

  const strengthLabels: Record<string, string> = {
    weak: 'Fraca',
    fair: 'Razoável',
    good: 'Boa',
    strong: 'Forte',
  };

  const addAlert = (type: string, message: string) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 4000);
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authSenha) {
      addAlert('warning', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/usuarios/login', {
        email: authEmail,
        senha: authSenha
      });

      const data = res.data;
      const is_admin = data.is_admin || false;

      login(data.token, data.nome, data.email || authEmail, is_admin);

      if (is_admin) {
        navigate('/adm');
      } else {
        navigate('/pdv');
      }
    } catch (err: any) {
      console.error(err);
      triggerShake();
      if (err.response && err.response.data) {
        if (err.response.data.erros) {
          addAlert('danger', 'Erro de validação: Verifique o formato do email e a senha.');
        } else {
          addAlert('danger', err.response.data.mensagem || 'Credenciais inválidas.');
        }
      } else {
        addAlert('danger', 'Erro de comunicação com a API backend.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authNome || !authEmail || !authSenha) {
      addAlert('warning', 'Todos os campos são obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/usuarios/cadastrar', {
        nome: authNome,
        email: authEmail,
        senha: authSenha
      });

      addAlert('success', 'Cadastro realizado com sucesso! Faça login.');
      setAuthState('login');
      setAuthNome('');
      
    } catch (err: any) {
      console.error(err);
      triggerShake();
      if (err.response && err.response.data) {
        if (err.response.data.erros) {
            const mensagens = err.response.data.erros.map((e: any) => e.message).join(', ');
            addAlert('danger', mensagens);
        } else {
            addAlert('danger', err.response.data.mensagem || 'Erro ao realizar cadastro.');
        }
      } else {
        addAlert('danger', 'Erro de conexão com o servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchAuthState = () => {
    setAuthState(authState === 'login' ? 'register' : 'login');
    setAuthSenha('');
  };

  return (
    <div className="auth-container">
      {/* Floating particles */}
      <div className="auth-particles">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="auth-particle"
            style={{
              width: `${8 + Math.random() * 16}px`,
              height: `${8 + Math.random() * 16}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '--duration': `${5 + Math.random() * 8}s`,
              '--delay': `${Math.random() * 3}s`,
              background: i % 2 === 0 
                ? 'rgba(139, 92, 246, 0.15)' 
                : 'rgba(6, 182, 212, 0.12)',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Toast alerts */}
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

      <div className={`auth-card animate-fade-in ${shakeError ? 'shake-error' : ''}`}>
        <div className="auth-header">
          <div className="auth-logo animate-float">
            <ShoppingBag size={32} />
          </div>
          <h1 className="auth-title">Kamikase ERP & PDV</h1>
          <p className="auth-subtitle">
            {authState === 'login' ? 'Entre na sua conta para acessar o sistema' : 'Crie sua conta para começar'}
          </p>
        </div>

        <form onSubmit={authState === 'login' ? handleLogin : handleRegister}>
          {authState === 'register' && (
            <div className="form-group animate-fade-in">
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
            {authState === 'register' && authSenha && (
              <div style={{ marginTop: '8px' }}>
                <div className="password-strength">
                  <div className={`password-strength-bar ${passwordStrength}`} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  Força: {strengthLabels[passwordStrength] || ''}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="btn-spinner" />
                Processando...
              </>
            ) : (
              authState === 'login' ? 'Entrar no Sistema' : 'Criar Conta'
            )}
          </button>

          <div className="auth-switch-text">
            {authState === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button 
              type="button" 
              className="auth-switch-btn"
              onClick={switchAuthState}
            >
              {authState === 'login' ? 'Cadastre-se' : 'Faça login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
