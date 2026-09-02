import React, { useState, useEffect } from 'react';
import { ShoppingBag, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, X, Shield, KeyRound, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlowButton from '../components/GlowButton';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login, token, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      if (isAdmin) navigate('/adm');
      else navigate('/pdv');
    }
  }, [token, isAdmin, navigate]);

  const [authEmail, setAuthEmail] = useState('');
  const [authSenha, setAuthSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; type: string; message: string }[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
      addAlert('warning', 'Por favor, informe seu e-mail e sua senha.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/usuarios/login', {
        email: authEmail.trim(),
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
          addAlert('danger', 'Erro de validação: Verifique os dados inseridos.');
        } else {
          addAlert('danger', err.response.data.mensagem || 'Credenciais inválidas. Verifique e-mail e senha.');
        }
      } else {
        addAlert('danger', 'Erro de comunicação com o servidor de autenticação.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const preencherAcessoRapido = (email: string) => {
    setAuthEmail(email);
    setAuthSenha('123');
  };

  return (
    <div className="auth-container">
      {/* Theme Toggle Top Right */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* Floating Ambient Particles */}
      <div className="auth-particles">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="auth-particle"
            style={{
              width: `${6 + (i % 4) * 3}px`,
              height: `${6 + (i % 4) * 3}px`,
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              '--duration': `${8 + (i % 5) * 2}s`,
              '--delay': `${(i * 0.4)}s`,
              borderRadius: '50%',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Ambient Glows */}
      <div className="auth-glow-orb-1" />
      <div className="auth-glow-orb-2" />

      {/* Toast alerts */}
      <div className="alert-container">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-toast ${alert.type} animate-slide-up`}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="alert-message">{alert.message}</span>
            <button className="alert-close" onClick={() => setAlerts(p => p.filter(a => a.id !== alert.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className={`auth-card animate-slide-up ${shakeError ? 'shake-error' : ''}`}>
        <div className="auth-header">
          <div className="auth-logo">
            <ShoppingBag size={32} />
          </div>
          <h1 className="auth-title">
            Kamikase ERP & PDV
          </h1>
          <p className="auth-subtitle">
            <Shield size={14} /> Sistema Corporativo de Gestão de Vendas
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">E-mail Corporativo</label>
            <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="seu.email@empresa.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha de Acesso</label>
            <div className={`input-wrapper ${focusedField === 'senha' ? 'focused' : ''}`}>
              <Lock className="input-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="Sua senha de acesso"
                value={authSenha}
                onChange={(e) => setAuthSenha(e.target.value)}
                onFocus={() => setFocusedField('senha')}
                onBlur={() => setFocusedField(null)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <GlowButton 
            type="submit" 
            className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {isLoading ? (
              <>
                <div className="btn-spinner" />
                Validando Acesso...
              </>
            ) : (
              <>
                <KeyRound size={16} /> Entrar na Plataforma
              </>
            )}
          </GlowButton>
        </form>

        {/* Informação sobre cadastro exclusivo de admin */}
        <div className="auth-admin-only-notice">
          <Building2 size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Acesso Restrito:</strong> O cadastro e credenciamento de novos operadores, lojas e filiais é realizado exclusivamente pela Administração do Sistema.
          </span>
        </div>

        {/* Acesso rápido para desenvolvimento / demonstração */}
        <div className="auth-quick-access">
          <span className="auth-quick-title">Atalhos de Acesso Rápido (Senha: 123):</span>
          <div className="auth-quick-chips">
            <button 
              type="button" 
              className="auth-chip admin"
              onClick={() => preencherAcessoRapido('admin@admin.com')}
              title="Acessar como Administrador Geral"
            >
              👑 Admin
            </button>
            <button 
              type="button" 
              className="auth-chip lojista"
              onClick={() => preencherAcessoRapido('ale.ramos.oliveira@hotmail.com')}
              title="Acessar como Lojista de Informática"
            >
              💻 Informática
            </button>
            <button 
              type="button" 
              className="auth-chip lojista"
              onClick={() => preencherAcessoRapido('ale.ramos.oliveira@gmail.com')}
              title="Acessar como Lojista de Roupas & Calçados"
            >
              👟 Moda & Tênis
            </button>
          </div>
        </div>

        {/* Footer branding */}
        <div className="auth-footer-notice">
          <Shield size={12} /> Criptografia de Ponta a Ponta • Kamikase ERP v1.0
        </div>
      </div>
    </div>
  );
}
