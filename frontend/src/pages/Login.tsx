import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle, X, Zap, Shield } from 'lucide-react';
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

  const [authState, setAuthState] = useState<'login' | 'register'>('login');
  const [authNome, setAuthNome] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authSenha, setAuthSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [alerts, setAlerts] = useState<{id: number, type: string, message: string}[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <div className="auth-container" style={{
      background: 'linear-gradient(-45deg, #0a0b10, #0f172a, #1a0a2e, #0a1628, #0a0b10)',
      backgroundSize: '400% 400%',
      animation: 'morphGradient 15s ease infinite'
    }}>
      {/* Theme Toggle Top Right */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* Enhanced floating particles with connections */}
      <div className="auth-particles">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="auth-particle"
            style={{
              width: `${4 + Math.random() * 12}px`,
              height: `${4 + Math.random() * 12}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '--duration': `${6 + Math.random() * 10}s`,
              '--delay': `${Math.random() * 4}s`,
              background: [
                'rgba(139, 92, 246, 0.2)',
                'rgba(6, 182, 212, 0.15)',
                'rgba(236, 72, 153, 0.12)',
                'rgba(20, 184, 166, 0.15)'
              ][i % 4],
              borderRadius: i % 3 === 0 ? '50%' : '2px',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Ambient glow orbs */}
      <div style={{
        position: 'fixed', top: '20%', left: '15%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '10%',
        width: '250px', height: '250px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(50px)',
        animation: 'float 10s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />

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

      <div className={`auth-card animate-slide-up gradient-border ${shakeError ? 'shake-error' : ''}`}
        style={{ overflow: 'visible' }}
      >
        {/* Decorative top accent */}
        <div style={{
          position: 'absolute', top: '-1px', left: '20%', right: '20%', height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent)',
          borderRadius: '2px'
        }} />

        <div className="auth-header">
          <div className="auth-logo" style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.35)',
            animation: 'breathe 3s ease-in-out infinite',
          }}>
            <ShoppingBag size={32} />
          </div>
          <h1 className="auth-title" style={{
            background: 'linear-gradient(135deg, #e2e8f0, #f8fafc, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Kamikase ERP & PDV
          </h1>
          <p className="auth-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            {authState === 'login' ? (
              <><Shield size={14} style={{ color: 'var(--primary)' }} /> Acesse sua conta com segurança</>
            ) : (
              <><Zap size={14} style={{ color: 'var(--accent)' }} /> Crie sua conta para começar</>
            )}
          </p>
        </div>

        <form onSubmit={authState === 'login' ? handleLogin : handleRegister}>
          {authState === 'register' && (
            <div className="form-group animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <label className="form-label">Nome Completo</label>
              <div className="input-wrapper" style={focusedField === 'nome' ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.12)' } : {}}>
                <User className="input-icon" size={18} style={focusedField === 'nome' ? { color: 'var(--primary)' } : {}} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Seu nome"
                  value={authNome}
                  onChange={(e) => setAuthNome(e.target.value)}
                  onFocus={() => setFocusedField('nome')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group" style={authState === 'register' ? { animationDelay: '0.1s' } : {}}>
            <label className="form-label">E-mail</label>
            <div className="input-wrapper" style={focusedField === 'email' ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.12)' } : {}}>
              <Mail className="input-icon" size={18} style={focusedField === 'email' ? { color: 'var(--primary)' } : {}} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="seu@email.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={authState === 'register' ? { animationDelay: '0.15s' } : {}}>
            <label className="form-label">Senha</label>
            <div className="input-wrapper" style={focusedField === 'senha' ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.12)' } : {}}>
              <Lock className="input-icon" size={18} style={focusedField === 'senha' ? { color: 'var(--primary)' } : {}} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="Sua senha"
                value={authSenha}
                onChange={(e) => setAuthSenha(e.target.value)}
                onFocus={() => setFocusedField('senha')}
                onBlur={() => setFocusedField(null)}
                required
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', transition: 'color 0.2s' }}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
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

          <GlowButton 
            type="submit" 
            className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? (
              <>
                <div className="btn-spinner" />
                Processando...
              </>
            ) : (
              <>
                {authState === 'login' ? (
                  <><Lock size={16} /> Entrar no Sistema</>
                ) : (
                  <><Zap size={16} /> Criar Conta</>
                )}
              </>
            )}
          </GlowButton>

          <div className="auth-switch-text">
            {authState === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button 
              type="button" 
              className="auth-switch-btn"
              onClick={switchAuthState}
              style={{ transition: 'all 0.2s' }}
            >
              {authState === 'login' ? 'Cadastre-se' : 'Faça login'}
            </button>
          </div>
        </form>

        {/* Footer branding */}
        <div style={{ 
          textAlign: 'center', marginTop: '24px', paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: '11px', color: 'var(--text-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
        }}>
          <Shield size={12} /> Sistema protegido com criptografia de ponta a ponta
        </div>
      </div>
    </div>
  );
}
