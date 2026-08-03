import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Package, UserCheck, LogOut, Plus, Edit, Trash2, LayoutGrid, X, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3000/api`;

interface Produto {
  id: number;
  nome: string;
  preco: number;
  descricao?: string;
  categorias_id: number;
  estoque: number;
}

interface Categoria {
  id: number;
  nome: string;
  parent_id?: number;
}

export default function SystemDashboard() {
  const { token, userName, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<'dashboard' | 'produtos' | 'categorias'>('dashboard');
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalCategorias, setTotalCategorias] = useState(0);
  const [vendas, setVendas] = useState<any[]>([]);
  
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [categoriaNome, setCategoriaNome] = useState('');
  const [categoriaParentId, setCategoriaParentId] = useState<string>('');

  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoDescricao, setProdutoDescricao] = useState('');
  const [produtoPreco, setProdutoPreco] = useState('');
  const [produtoEstoque, setProdutoEstoque] = useState('0');
  const [produtoCategoriaId, setProdutoCategoriaId] = useState('');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchCategorias();
    fetchProdutos();
    fetchStats();
    fetchVendas();
    // Inject dark theme globally for this screen
    document.body.classList.add('dark-dashboard');
    return () => document.body.classList.remove('dark-dashboard');
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias`, { headers: getHeaders() });
      if (res.ok) setCategorias(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchProdutos = async () => {
    try {
      const res = await fetch(`${API_URL}/produtos`, { headers: getHeaders() });
      if (res.ok) setProdutos(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
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
    } catch (err) { console.error(err); }
  };

  const fetchVendas = async () => {
    try {
      const res = await fetch(`${API_URL}/vendas`, { headers: getHeaders() });
      if (res.ok) setVendas(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // CATEGORIA HANDLERS
  const openAddCategoria = () => {
    setSelectedCategoria(null);
    setCategoriaNome('');
    setCategoriaParentId('');
    setCategoriaModalOpen(true);
  };

  const openEditCategoria = (cat: Categoria) => {
    setSelectedCategoria(cat);
    setCategoriaNome(cat.nome);
    setCategoriaParentId(cat.parent_id?.toString() || '');
    setCategoriaModalOpen(true);
  };

  const handleSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaNome.trim()) return showNotification('Nome obrigatório');

    try {
      const method = selectedCategoria ? 'PUT' : 'POST';
      const url = selectedCategoria 
        ? `${API_URL}/categorias/${selectedCategoria.id}` 
        : `${API_URL}/categorias`;

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ 
          nome: categoriaNome,
          parent_id: categoriaParentId ? Number(categoriaParentId) : null
        })
      });

      if (res.ok) {
        showNotification(selectedCategoria ? 'Categoria atualizada' : 'Categoria criada');
        fetchCategorias();
        fetchStats();
        setCategoriaModalOpen(false);
      } else {
        const data = await res.json();
        showNotification(data.erro || 'Erro ao salvar categoria');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erro de conexão');
    }
  };

  const deleteCategoria = async (id: number) => {
    if (!confirm('Excluir categoria? Produtos podem ficar órfãos.')) return;
    try {
      const res = await fetch(`${API_URL}/categorias/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        showNotification('Categoria excluída.');
        fetchCategorias();
        fetchStats();
      }
    } catch (err) { console.error(err); }
  };

  // PRODUTO HANDLERS
  const openAddProduto = () => {
    setSelectedProduto(null);
    setProdutoNome('');
    setProdutoDescricao('');
    setProdutoPreco('');
    setProdutoEstoque('0');
    setProdutoCategoriaId(categorias[0]?.id?.toString() || '');
    setProdutoModalOpen(true);
  };

  const openEditProduto = (prod: Produto) => {
    setSelectedProduto(prod);
    setProdutoNome(prod.nome);
    setProdutoDescricao(prod.descricao || '');
    setProdutoPreco(prod.preco.toString());
    setProdutoEstoque(prod.estoque.toString());
    setProdutoCategoriaId(prod.categorias_id.toString());
    setProdutoModalOpen(true);
  };

  const handleSaveProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoNome || !produtoPreco || !produtoCategoriaId) {
      return showNotification('Todos os campos são obrigatórios');
    }

    const payload = {
      nome: produtoNome,
      descricao: produtoDescricao,
      preco: Number(produtoPreco),
      categorias_id: Number(produtoCategoriaId),
      estoque: Number(produtoEstoque || 0)
    };

    try {
      const method = selectedProduto ? 'PUT' : 'POST';
      const url = selectedProduto 
        ? `${API_URL}/produtos/${selectedProduto.id}` 
        : `${API_URL}/produtos`;

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification(selectedProduto ? 'Produto atualizado' : 'Produto criado');
        fetchProdutos();
        fetchStats();
        setProdutoModalOpen(false);
      } else {
        const data = await res.json();
        showNotification(data.erro || 'Erro ao salvar produto');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erro de conexão');
    }
  };

  const deleteProduto = async (id: number) => {
    if (!confirm('Excluir produto?')) return;
    try {
      const res = await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        showNotification('Produto excluído.');
        fetchProdutos();
        fetchStats();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="sys-container">
      <style>{`
        .dark-dashboard {
          background: #0f111a;
          color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }
        .sys-container {
          display: flex;
          height: 100vh;
          background: radial-gradient(circle at 100% 0%, rgba(20, 184, 166, 0.05), transparent 30%),
                      radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.08), transparent 30%);
        }
        .glass-sidebar {
          width: 280px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 24px;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 48px;
          padding: 0 8px;
        }
        .brand-icon {
          background: linear-gradient(135deg, #14b8a6, #8b5cf6);
          padding: 8px;
          border-radius: 10px;
          color: white;
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
        }
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #e2e8f0;
        }
        .nav-item.active {
          background: rgba(20, 184, 166, 0.1);
          color: #2dd4bf;
          border-color: rgba(20, 184, 166, 0.2);
        }
        .main-content {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
        }
        .page-header {
          margin-bottom: 32px;
        }
        .neon-text {
          background: linear-gradient(to right, #2dd4bf, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          background: rgba(30, 41, 59, 0.6);
        }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .content-panel {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          overflow: hidden;
        }
        .panel-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .custom-table {
          width: 100%;
          border-collapse: collapse;
        }
        .custom-table th, .custom-table td {
          padding: 16px 24px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }
        .custom-table th {
          color: #94a3b8;
          font-weight: 500;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .custom-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .btn-gradient {
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.2s;
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
        }
        .btn-gradient:hover {
          opacity: 0.9;
        }
        .btn-icon {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .btn-icon.danger:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
        }
        .glass-modal {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content-glass {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          width: 500px;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .input-glass {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          width: 100%;
          margin-top: 6px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .input-glass:focus {
          outline: none;
          border-color: #2dd4bf;
        }
        .badge-cat {
          background: rgba(139, 92, 246, 0.1);
          color: #c4b5fd;
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>

      {notification && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 1100, background: 'rgba(20, 184, 166, 0.9)', backdropFilter: 'blur(8px)', color: 'white', padding: '12px 24px', borderRadius: '30px', boxShadow: '0 4px 20px rgba(20, 184, 166, 0.4)', fontWeight: 500 }}>
          {notification}
        </div>
      )}

      {/* Sidebar */}
      <aside className="glass-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Cpu size={24} /></div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }} className="neon-text">Kamikase ERP & PDV</span>
        </div>

        <nav className="nav-menu">
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutGrid size={18} /> <span>Painel Geral</span>
          </div>
          <div className={`nav-item ${view === 'produtos' ? 'active' : ''}`} onClick={() => setView('produtos')}>
            <Package size={18} /> <span>Produtos</span>
          </div>
          <div className={`nav-item ${view === 'categorias' ? 'active' : ''}`} onClick={() => setView('categorias')}>
            <Tag size={18} /> <span>Categorias</span>
          </div>
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn-gradient" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/pdv')}>
            <ShoppingBag size={18} /> Ir para PDV
          </button>
          
          {isAdmin && (
            <button className="btn-gradient" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }} onClick={() => navigate('/adm')}>
              <UserCheck size={18} /> Admin Center
            </button>
          )}

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {userName?.charAt(0)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{isAdmin ? 'Administrador' : 'Lojista'}</div>
            </div>
            <button onClick={handleLogout} className="btn-icon danger" style={{ border: 'none', background: 'transparent' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>
            {view === 'dashboard' && 'Visão Geral do Negócio'}
            {view === 'produtos' && 'Catálogo de Produtos'}
            {view === 'categorias' && 'Gestão de Categorias'}
          </h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Gerencie seu inventário e acompanhe resultados.</p>
        </div>

        {view === 'dashboard' && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Total de Produtos</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{totalProdutos}</div>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <Package size={28} />
                </div>
              </div>
              <div className="stat-card">
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Categorias Ativas</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{totalCategorias}</div>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <Tag size={28} />
                </div>
              </div>
              <div className="stat-card">
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Vendas Registradas</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#2dd4bf' }}>{vendas.length}</div>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#2dd4bf', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                  <ShoppingBag size={28} />
                </div>
              </div>
            </div>

            <div className="content-panel">
              <div className="panel-header">
                <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>Últimas Transações</h2>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Valor Total</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.length > 0 ? vendas.slice(0, 10).map(v => (
                    <tr key={v.id}>
                      <td style={{ color: '#94a3b8' }}>#{v.id}</td>
                      <td style={{ fontWeight: 600, color: '#2dd4bf' }}>R$ {Number(v.valor_total).toFixed(2)}</td>
                      <td>{new Date(v.created_at).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Nenhuma venda registrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'produtos' && (
          <div className="content-panel">
            <div className="panel-header">
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>Produtos Cadastrados</h2>
              <button className="btn-gradient" onClick={openAddProduto}>
                <Plus size={16} /> Novo Produto
              </button>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length > 0 ? produtos.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.nome}</td>
                    <td style={{ color: '#2dd4bf', fontWeight: 600 }}>R$ {Number(p.preco).toFixed(2)}</td>
                    <td>
                      <span style={{ background: p.estoque > 0 ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: p.estoque > 0 ? '#2dd4bf' : '#f87171', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                        {p.estoque} un
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" onClick={() => openEditProduto(p)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon danger" onClick={() => deleteProduto(p.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Nenhum produto cadastrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {view === 'categorias' && (
          <div className="content-panel">
            <div className="panel-header">
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>Estrutura de Categorias</h2>
              <button className="btn-gradient" onClick={openAddCategoria}>
                <Plus size={16} /> Nova Categoria
              </button>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome (Hierarquia)</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categorias.length > 0 ? categorias.map(c => {
                  const parent = categorias.find(p => p.id === c.parent_id);
                  return (
                  <tr key={c.id}>
                    <td style={{ color: '#94a3b8' }}>#{c.id}</td>
                    <td>
                      <span className="badge-cat">
                        {parent ? `${parent.nome} > ${c.nome}` : c.nome}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" onClick={() => openEditCategoria(c)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon danger" onClick={() => deleteCategoria(c.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Nenhuma categoria cadastrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* Categoria Modal */}
      {categoriaModalOpen && (
        <div className="glass-modal">
          <div className="modal-content-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={() => setCategoriaModalOpen(false)} className="btn-icon" style={{ border: 'none' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategoria}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8' }}>Nome da Categoria</label>
                <input 
                  type="text" className="input-glass" 
                  placeholder="Ex: Hardware"
                  value={categoriaNome} onChange={(e) => setCategoriaNome(e.target.value)} required
                />
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8' }}>Categoria Pai (Opcional)</label>
                <select className="input-glass" style={{ appearance: 'none' }} value={categoriaParentId} onChange={(e) => setCategoriaParentId(e.target.value)}>
                  <option value="">Nenhuma (Categoria Principal)</option>
                  {categorias.filter(c => c.id !== selectedCategoria?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-gradient" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                {selectedCategoria ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Produto Modal */}
      {produtoModalOpen && (
        <div className="glass-modal">
          <div className="modal-content-glass" style={{ width: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{selectedProduto ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setProdutoModalOpen(false)} className="btn-icon" style={{ border: 'none' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduto}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8' }}>Nome do Produto</label>
                <input type="text" className="input-glass" placeholder="Ex: RTX 4090" value={produtoNome} onChange={(e) => setProdutoNome(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8' }}>Descrição</label>
                <input type="text" className="input-glass" placeholder="Breve descrição" value={produtoDescricao} onChange={(e) => setProdutoDescricao(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8' }}>Preço (R$)</label>
                  <input type="number" step="0.01" className="input-glass" value={produtoPreco} onChange={(e) => setProdutoPreco(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8' }}>Estoque</label>
                  <input type="number" className="input-glass" value={produtoEstoque} onChange={(e) => setProdutoEstoque(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8' }}>Categoria</label>
                <select className="input-glass" style={{ appearance: 'none' }} value={produtoCategoriaId} onChange={(e) => setProdutoCategoriaId(e.target.value)} required>
                  <option value="" disabled>Selecione...</option>
                  {categorias.map(c => {
                    const parent = categorias.find(p => p.id === c.parent_id);
                    return <option key={c.id} value={c.id}>{parent ? `${parent.nome} > ${c.nome}` : c.nome}</option>
                  })}
                </select>
              </div>

              <button type="submit" className="btn-gradient" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                {selectedProduto ? 'Salvar Alterações' : 'Criar Produto'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
