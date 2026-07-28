import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShoppingBag, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Tag, 
  Layers, 
  X, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Interfaces matching backend
interface Categoria {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  categorias_id: number;
  usuarios_id: number;
  estoque?: number;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface AlertToast {
  id: number;
  type: 'success' | 'danger' | 'warning';
  message: string;
}

export default function App() {
  // Authentication & Session
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const isAdmin = userEmail === 'admin@kamikase.com';
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem('userId');
    return stored ? Number(stored) : null;
  });

  // Views state
  const [view, setView] = useState<'dashboard' | 'produtos' | 'categorias' | 'perfil' | 'usuarios'>('dashboard');
  const [authState, setAuthState] = useState<'login' | 'register'>('login');

  // Input states for Auth
  const [authNome, setAuthNome] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authSenha, setAuthSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password modal simulation state
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [simulatedPassword, setSimulatedPassword] = useState<string | null>(null);

  // Data states
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [usuariosList, setUsuariosList] = useState<Usuario[]>([]);
  
  // Stats
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalCategorias, setTotalCategorias] = useState(0);

  // Alerts
  const [alerts, setAlerts] = useState<AlertToast[]>([]);

  // Modals state for CRUD
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null); // For edit
  const [categoriaNome, setCategoriaNome] = useState('');

  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null); // For edit
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoPreco, setProdutoPreco] = useState('');
  const [produtoEstoque, setProdutoEstoque] = useState('0');
  const [produtoCategoriaId, setProdutoCategoriaId] = useState('');

  // Profile Edit states
  const [profileNome, setProfileNome] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSenha, setProfileSenha] = useState('');

  // Add Alert Helper
  const addAlert = (type: 'success' | 'danger' | 'warning', message: string) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 4000);
  };

  // Setup request headers helper
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load data when authenticated
  useEffect(() => {
    if (token) {
      fetchCategorias();
      fetchProdutos();
      fetchStats();
      if (isAdmin) fetchUsuarios();
    }
  }, [token, userEmail]);

  // Fetch Usuarios (Admin only)
  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsuariosList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load stats
  const fetchStats = async () => {
    try {
      // Get counts
      const resP = await fetch(`${API_URL}/produtos/total`, { headers: getHeaders() });
      if (resP.ok) {
        const dataP = await resP.json();
        setTotalProdutos(dataP.total);
      }
      
      const resC = await fetch(`${API_URL}/produtos/categorias/total`, { headers: getHeaders() });
      if (resC.ok) {
        const dataC = await resC.json();
        setTotalCategorias(dataC.total);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Categorias
  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      } else {
        addAlert('danger', 'Erro ao carregar categorias.');
      }
    } catch (err) {
      console.error(err);
      addAlert('danger', 'Erro de conexão com o servidor.');
    }
  };

  // Fetch Produtos
  const fetchProdutos = async () => {
    try {
      const endpoint = isAdmin ? `${API_URL}/produtos/todos` : `${API_URL}/produtos`;
      const res = await fetch(endpoint, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProdutos(data);
      } else {
        addAlert('danger', 'Erro ao carregar produtos.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Login handler
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.nome);
        localStorage.setItem('userEmail', data.email || authEmail);
        localStorage.setItem('userId', '1'); // Fallback ID

        setToken(data.token);
        setUserName(data.nome);
        setUserEmail(data.email || authEmail);
        setUserId(1);

        addAlert('success', `Bem-vindo de volta, ${data.nome}!`);
        setView('dashboard');
        
        // Reset forms
        setAuthEmail('');
        setAuthSenha('');
      } else {
        addAlert('danger', data.mensagem || 'Credenciais inválidas.');
      }
    } catch (err) {
      console.error(err);
      addAlert('danger', 'Erro de comunicação com a API backend.');
    }
  };

  // Register handler
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
        // Save the raw password in local storage *just* for the simulation forgot password modal
        localStorage.setItem(`pwd_simulation_${authEmail}`, authSenha);
        
        addAlert('success', 'Cadastro realizado com sucesso! Faça login.');
        setAuthState('login');
        
        // Reset inputs
        setAuthNome('');
      } else {
        addAlert('danger', data.mensagem || 'Erro ao realizar cadastro.');
      }
    } catch (err) {
      console.error(err);
      addAlert('danger', 'Erro de conexão com o servidor.');
    }
  };

  // Forgot password simulator
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      addAlert('warning', 'Por favor, digite seu email.');
      return;
    }

    // Try to retrieve password stored in simulation fallback
    const savedPassword = localStorage.getItem(`pwd_simulation_${forgotEmail}`);
    if (savedPassword) {
      setSimulatedPassword(savedPassword);
    } else {
      // Default sample password if user did not register it in this session
      setSimulatedPassword('kamikase123_exemplo');
    }
    addAlert('success', 'Senha recuperada para demonstração!');
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setToken(null);
    setUserName(null);
    setUserEmail(null);
    setUserId(null);
    addAlert('success', 'Sessão encerrada.');
  };

  // Category Save (Create or Update)
  const handleSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaNome.trim()) {
      addAlert('warning', 'O nome da categoria é obrigatório.');
      return;
    }

    try {
      if (selectedCategoria) {
        // Update (PUT /api/categorias/:id)
        const res = await fetch(`${API_URL}/categorias/${selectedCategoria.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ nome: categoriaNome })
        });
        
        const data = await res.json();
        if (res.ok) {
          addAlert('success', 'Categoria atualizada com sucesso!');
          fetchCategorias();
          setCategoriaModalOpen(false);
          fetchStats();
        } else {
          addAlert('danger', data.erro || 'Erro ao atualizar categoria.');
        }
      } else {
        // Create (POST /api/categorias)
        const res = await fetch(`${API_URL}/categorias`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ nome: categoriaNome })
        });

        const data = await res.json();
        if (res.ok) {
          addAlert('success', 'Categoria criada com sucesso!');
          fetchCategorias();
          setCategoriaModalOpen(false);
          fetchStats();
        } else {
          addAlert('danger', data.erro || 'Erro ao criar categoria.');
        }
      }
    } catch (err) {
      console.error(err);
      addAlert('danger', 'Erro no processamento da categoria.');
    }
  };

  // Delete Category
  const handleDeleteCategoria = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta categoria? Os produtos vinculados podem ficar órfãos.')) return;

    try {
      const res = await fetch(`${API_URL}/categorias/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        addAlert('success', 'Categoria excluída com sucesso.');
        fetchCategorias();
        fetchStats();
      } else {
        addAlert('danger', data.erro || 'Erro ao excluir categoria.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Product Save (Create or Update)
  const handleSaveProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoNome || !produtoPreco || !produtoCategoriaId) {
      addAlert('warning', 'Todos os campos são obrigatórios.');
      return;
    }

    const payload = {
      nome: produtoNome,
      preco: Number(produtoPreco),
      categorias_id: Number(produtoCategoriaId),
      estoque: Number(produtoEstoque || 0)
    };

    try {
      if (selectedProduto) {
        // Update (PUT /api/produtos/:id)
        const res = await fetch(`${API_URL}/produtos/${selectedProduto.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          addAlert('success', 'Produto atualizado com sucesso!');
          fetchProdutos();
          setProdutoModalOpen(false);
          fetchStats();
        } else {
          addAlert('danger', data.erro || 'Erro ao atualizar produto.');
        }
      } else {
        // Create (POST /api/produtos)
        const res = await fetch(`${API_URL}/produtos`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          addAlert('success', 'Produto criado com sucesso!');
          fetchProdutos();
          setProdutoModalOpen(false);
          fetchStats();
        } else {
          addAlert('danger', data.erro || 'Erro ao criar produto.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Product
  const handleDeleteProduto = async (id: number) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
      const res = await fetch(`${API_URL}/produtos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        addAlert('success', 'Produto excluído com sucesso.');
        fetchProdutos();
        fetchStats();
      } else {
        addAlert('danger', data.erro || 'Erro ao excluir produto.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User profile updates
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileNome && !profileEmail && !profileSenha) {
      addAlert('warning', 'Modifique pelo menos um campo para atualizar.');
      return;
    }

    const payload: any = { id: userId };
    if (profileNome) payload.nome = profileNome;
    if (profileEmail) payload.email = profileEmail;
    if (profileSenha) payload.senha = profileSenha;

    try {
      const res = await fetch(`${API_URL}/usuarios/atualizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        addAlert('success', 'Perfil atualizado com sucesso!');
        if (profileNome) {
          setUserName(profileNome);
          localStorage.setItem('userName', profileNome);
        }
        setProfileSenha('');
      } else {
        addAlert('danger', data.mensagem || 'Erro ao atualizar perfil.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User account delete
  const handleDeleteProfile = async () => {
    if (!confirm('ATENÇÃO: Isso excluirá permanentemente sua conta de usuário. Deseja prosseguir?')) return;

    try {
      const res = await fetch(`${API_URL}/usuarios/deletar`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });

      if (res.ok) {
        addAlert('success', 'Conta excluída permanentemente.');
        handleLogout();
      } else {
        addAlert('danger', 'Erro ao deletar conta.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Categoria Modal
  const openAddCategoria = () => {
    setSelectedCategoria(null);
    setCategoriaNome('');
    setCategoriaModalOpen(true);
  };

  const openEditCategoria = (cat: Categoria) => {
    setSelectedCategoria(cat);
    setCategoriaNome(cat.nome);
    setCategoriaModalOpen(true);
  };

  // Open Produto Modal
  const openAddProduto = () => {
    setSelectedProduto(null);
    setProdutoNome('');
    setProdutoPreco('');
    setProdutoEstoque('0');
    setProdutoCategoriaId(categorias[0]?.id?.toString() || '');
    setProdutoModalOpen(true);
  };

  const openEditProduto = (prod: Produto) => {
    setSelectedProduto(prod);
    setProdutoNome(prod.nome);
    setProdutoPreco(prod.preco.toString());
    setProdutoEstoque(prod.estoque !== undefined ? prod.estoque.toString() : '0');
    setProdutoCategoriaId(prod.categorias_id.toString());
    setProdutoModalOpen(true);
  };

  // Navigate & Prepare view data
  const handleNavigate = (destView: 'dashboard' | 'produtos' | 'categorias' | 'perfil' | 'usuarios') => {
    setView(destView);
    if (destView === 'perfil') {
      setProfileNome(userName || '');
      setProfileEmail('');
    }
  };

  // Render Authentication Views
  if (!token) {
    return (
      <div className="auth-container">
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

        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <div className="auth-logo">
              <ShoppingBag size={32} />
            </div>
            <h1 className="auth-title">Kamikase</h1>
            <p className="auth-subtitle">
              {authState === 'login' ? 'Entre na sua conta para gerenciar produtos' : 'Crie sua conta para começar'}
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
                  style={{
                    position: 'absolute',
                    right: '14px',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {authState === 'login' && (
              <button 
                type="button" 
                className="forgot-password-link"
                onClick={() => {
                  setForgotEmail(authEmail);
                  setSimulatedPassword(null);
                  setForgotModal(true);
                }}
              >
                Esqueceu a senha?
              </button>
            )}

            <button type="submit" className="btn btn-primary">
              {authState === 'login' ? 'Entrar no Sistema' : 'Criar Conta'}
            </button>

            <div className="auth-switch-text">
              {authState === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'} {' '}
              <button 
                type="button" 
                className="auth-switch-btn"
                onClick={() => setAuthState(authState === 'login' ? 'register' : 'login')}
              >
                {authState === 'login' ? 'Cadastre-se' : 'Faça login'}
              </button>
            </div>
          </form>
        </div>

        {/* Forgot password simulation modal */}
        {forgotModal && (
          <div className="modal-overlay">
            <div className="modal-content animate-scale-up">
              <div className="modal-header">
                <h3 className="modal-title">Recuperação de Senha (Exemplo)</h3>
                <button className="modal-close" onClick={() => setForgotModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleForgotPassword}>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Digite o email cadastrado para simular e mostrar a senha salva.
                </p>
                <div className="form-group">
                  <label className="form-label">E-mail Cadastrado</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="seu@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginBottom: '16px' }}>
                  Verificar Senha Salva
                </button>
                {simulatedPassword && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    marginTop: '16px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>SIMULAÇÃO DE MODAL DE EXEMPLO</p>
                    <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginTop: '6px' }}>
                      Sua senha é: <span style={{ color: 'var(--accent)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>{simulatedPassword}</span>
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dashboard Application
  return (
    <div className="dashboard-container">
      {/* Toast Alert overlay */}
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

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <ShoppingBag size={24} style={{ color: 'var(--primary)' }} />
          <span>Kamikase Hub</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-link ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigate('dashboard')}
          >
            <Layers size={18} />
            Painel Geral
          </button>
          <button 
            className={`nav-link ${view === 'produtos' ? 'active' : ''}`}
            onClick={() => handleNavigate('produtos')}
          >
            <ShoppingBag size={18} />
            Produtos
          </button>
          <button 
            className={`nav-link ${view === 'categorias' ? 'active' : ''}`}
            onClick={() => handleNavigate('categorias')}
          >
            <Tag size={18} />
            Categorias
          </button>
          {isAdmin && (
            <button 
              className={`nav-link ${view === 'usuarios' ? 'active' : ''}`}
              onClick={() => handleNavigate('usuarios')}
            >
              <User size={18} />
              Usuários (Admin)
            </button>
          )}
          <button 
            className={`nav-link ${view === 'perfil' ? 'active' : ''}`}
            onClick={() => handleNavigate('perfil')}
          >
            <UserCheck size={18} />
            Minha Conta
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{userName}</span>
              <span className="user-role">{isAdmin ? 'Super Admin' : 'Usuário Comum'}</span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '10px' }}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* VIEW: DASHBOARD PANEL */}
        {view === 'dashboard' && (
          <div className="animate-fade-in">
            <div className="dashboard-header">
              <div>
                <h1 className="page-title">Bem-vindo, {userName}!</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Aqui está o resumo do seu inventário de produtos e categorias.</p>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Produtos Cadastrados</span>
                  <span className="stat-value">{totalProdutos}</span>
                </div>
                <div className="stat-icon-box purple">
                  <ShoppingBag size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Categorias Utilizadas</span>
                  <span className="stat-value">{totalCategorias}</span>
                </div>
                <div className="stat-icon-box cyan">
                  <Tag size={24} />
                </div>
              </div>
            </div>

            {/* Overview / Recent activity */}
            <div className="content-card">
              <div className="card-header-actions">
                <h3 className="card-title">Produtos Recentes</h3>
                <button className="btn btn-primary" onClick={() => handleNavigate('produtos')} style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }}>
                  Ver Todos os Produtos
                </button>
              </div>

              {produtos.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={48} className="empty-state-icon" />
                  <p>Nenhum produto cadastrado no momento.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Categoria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.slice(0, 5).map(prod => {
                        const cat = categorias.find(c => c.id === prod.categorias_id);
                        return (
                          <tr key={prod.id}>
                            <td style={{ fontWeight: '500' }}>{prod.nome}</td>
                            <td className="price-text">R$ {Number(prod.preco).toFixed(2)}</td>
                            <td>
                              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                                {prod.estoque ?? 0} un.
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-category">
                                {cat ? cat.nome : 'Sem Categoria'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: CATEGORIAS CRUD */}
        {view === 'categorias' && (
          <div className="animate-fade-in">
            <div className="dashboard-header">
              <div>
                <h1 className="page-title">Categorias</h1>
                <p style={{ color: 'var(--text-muted)' }}>Crie e gerencie categorias de produtos.</p>
              </div>
              <button className="btn btn-primary" onClick={openAddCategoria} style={{ width: 'auto' }}>
                <Plus size={18} />
                Nova Categoria
              </button>
            </div>

            <div className="content-card">
              {categorias.length === 0 ? (
                <div className="empty-state">
                  <Tag size={48} className="empty-state-icon" />
                  <p>Nenhuma categoria cadastrada. Crie a primeira para vincular seus produtos.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome da Categoria</th>
                        <th style={{ width: '120px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map(cat => (
                        <tr key={cat.id}>
                          <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{cat.id}</td>
                          <td style={{ fontWeight: '600' }}>{cat.nome}</td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn-icon-only" title="Editar" onClick={() => openEditCategoria(cat)}>
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon-only danger" title="Deletar" onClick={() => handleDeleteCategoria(cat.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: PRODUTOS CRUD */}
        {view === 'produtos' && (
          <div className="animate-fade-in">
            <div className="dashboard-header">
              <div>
                <h1 className="page-title">Produtos</h1>
                <p style={{ color: 'var(--text-muted)' }}>Gerencie seu catálogo completo de produtos.</p>
              </div>
              <button className="btn btn-primary" onClick={openAddProduto} style={{ width: 'auto' }} disabled={categorias.length === 0}>
                <Plus size={18} />
                Novo Produto
              </button>
            </div>

            <div className="content-card">
              {categorias.length === 0 && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <AlertCircle style={{ color: 'var(--warning)' }} />
                  <span>Você precisa criar pelo menos uma <strong>categoria</strong> antes de poder cadastrar produtos.</span>
                </div>
              )}

              {produtos.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={48} className="empty-state-icon" />
                  <p>Nenhum produto cadastrado.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Categoria</th>
                        {isAdmin && <th>Dono (ID)</th>}
                        <th style={{ width: '120px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.map(prod => {
                        const cat = categorias.find(c => c.id === prod.categorias_id);
                        return (
                          <tr key={prod.id}>
                            <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{prod.id}</td>
                            <td style={{ fontWeight: '600' }}>{prod.nome}</td>
                            <td className="price-text">R$ {Number(prod.preco).toFixed(2)}</td>
                            <td>
                              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                                {prod.estoque ?? 0} un.
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-category">
                                {cat ? cat.nome : 'Sem Categoria'}
                              </span>
                            </td>
                            {isAdmin && <td style={{ color: 'var(--text-muted)' }}>User #{prod.usuarios_id}</td>}
                            <td>
                              <div className="actions-cell">
                                <button className="btn-icon-only" title="Editar" onClick={() => openEditProduto(prod)}>
                                  <Edit size={16} />
                                </button>
                                <button className="btn-icon-only danger" title="Deletar" onClick={() => handleDeleteProduto(prod.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: USUARIOS LIST (ADMIN ONLY) */}
        {view === 'usuarios' && isAdmin && (
          <div className="animate-fade-in">
            <div className="dashboard-header">
              <div>
                <h1 className="page-title">Usuários Cadastrados</h1>
                <p style={{ color: 'var(--text-muted)' }}>Visão global de todos os usuários do sistema.</p>
              </div>
            </div>

            <div className="content-card">
              {usuariosList.length === 0 ? (
                <div className="empty-state">
                  <User size={48} className="empty-state-icon" />
                  <p>Nenhum usuário encontrado.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosList.map(u => (
                        <tr key={u.id}>
                          <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{u.id}</td>
                          <td style={{ fontWeight: '600' }}>{u.nome}</td>
                          <td>{u.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: USER PROFILE / MANAGEMENT */}
        {view === 'perfil' && (
          <div className="animate-fade-in">
            <div className="dashboard-header">
              <div>
                <h1 className="page-title">Minha Conta</h1>
                <p style={{ color: 'var(--text-muted)' }}>Gerencie suas credenciais de login e dados de perfil.</p>
              </div>
            </div>

            <div className="content-card">
              <h3 className="card-title" style={{ marginBottom: '24px' }}>Editar Perfil</h3>
              
              <form onSubmit={handleUpdateProfile} className="profile-grid">
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Nome completo"
                      value={profileNome}
                      onChange={(e) => setProfileNome(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alterar E-mail</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="Novo endereço de e-mail"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alterar Senha</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Digite a nova senha se desejar alterar"
                      value={profileSenha}
                      onChange={(e) => setProfileSenha(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: 'auto', alignSelf: 'flex-start' }}>
                  Salvar Alterações
                </button>
              </form>

              <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
                <h3 className="card-title" style={{ color: 'var(--danger)', marginBottom: '12px' }}>Excluir Conta</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '20px' }}>
                  A exclusão de conta é irreversível. Todos os seus produtos e registros serão deletados do sistema.
                </p>
                <button onClick={handleDeleteProfile} className="btn btn-danger" style={{ width: 'auto' }}>
                  <Trash2 size={16} />
                  Deletar Minha Conta
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CATEGORIA ADD/EDIT */}
      {categoriaModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button className="modal-close" onClick={() => setCategoriaModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCategoria}>
              <div className="form-group">
                <label className="form-label">Nome da Categoria</label>
                <div className="input-wrapper">
                  <Tag className="input-icon" size={18} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: Eletrônicos, Vestuário"
                    value={categoriaNome}
                    onChange={(e) => setCategoriaNome(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCategoriaModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedCategoria ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRODUTO ADD/EDIT */}
      {produtoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{selectedProduto ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button className="modal-close" onClick={() => setProdutoModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProduto}>
              <div className="form-group">
                <label className="form-label">Nome do Produto</label>
                <div className="input-wrapper">
                  <ShoppingBag className="input-icon" size={18} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: Smartphone X"
                    value={produtoNome}
                    onChange={(e) => setProdutoNome(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preço (R$)</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '14px', fontWeight: 'bold' }}>R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="form-input" 
                    placeholder="0.00"
                    value={produtoPreco}
                    onChange={(e) => setProdutoPreco(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estoque (Unidades)</label>
                <div className="input-wrapper">
                  <Layers className="input-icon" size={18} />
                  <input 
                    type="number" 
                    min="0"
                    className="form-input" 
                    placeholder="0"
                    value={produtoEstoque}
                    onChange={(e) => setProdutoEstoque(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select 
                  className="form-select"
                  value={produtoCategoriaId}
                  onChange={(e) => setProdutoCategoriaId(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setProdutoModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedProduto ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
