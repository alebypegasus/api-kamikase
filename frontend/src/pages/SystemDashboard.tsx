import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Package, UserCheck, Layers, LogOut, Plus, Edit, Trash2, LayoutGrid, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3000/api`;

interface Produto {
  id: number;
  nome: string;
  preco: number;
  categorias_id: number;
  estoque: number;
}

interface Categoria {
  id: number;
  nome: string;
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

  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [produtoNome, setProdutoNome] = useState('');
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
    setCategoriaModalOpen(true);
  };

  const openEditCategoria = (cat: Categoria) => {
    setSelectedCategoria(cat);
    setCategoriaNome(cat.nome);
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
        body: JSON.stringify({ nome: categoriaNome })
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
    setProdutoPreco('');
    setProdutoEstoque('0');
    setProdutoCategoriaId(categorias[0]?.id?.toString() || '');
    setProdutoModalOpen(true);
  };

  const openEditProduto = (prod: Produto) => {
    setSelectedProduto(prod);
    setProdutoNome(prod.nome);
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
    <div className="dashboard-container">
      {notification && (
        <div className="alert-toast success" style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1100 }}>
          <span className="alert-message">{notification}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Layers size={24} style={{ color: 'var(--primary)' }} />
          <span>Gestão</span>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutGrid size={18} /> Painel Geral
          </button>
          <button className={`nav-link ${view === 'produtos' ? 'active' : ''}`} onClick={() => setView('produtos')}>
            <Package size={18} /> Produtos
          </button>
          <button className={`nav-link ${view === 'categorias' ? 'active' : ''}`} onClick={() => setView('categorias')}>
            <Tag size={18} /> Categorias
          </button>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
          <button className="btn btn-primary" style={{ marginBottom: '16px' }} onClick={() => navigate('/pdv')}>
            <ShoppingBag size={16} /> Ir para Caixa (PDV)
          </button>
          {isAdmin && (
            <button className="btn btn-secondary" style={{ marginBottom: '16px' }} onClick={() => navigate('/adm')}>
              <UserCheck size={16} /> Admin Dashboard
            </button>
          )}
          <div className="user-info">
            <div className="user-avatar">{userName?.charAt(0)}</div>
            <div className="user-details">
              <span className="user-name">{userName}</span>
              <span className="user-role">{isAdmin ? 'Admin' : 'Usuário'}</span>
            </div>
            <button onClick={handleLogout} className="btn-icon-only danger" style={{ marginLeft: 'auto' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="page-title">
            {view === 'dashboard' && 'Visão Geral'}
            {view === 'produtos' && 'Meus Produtos'}
            {view === 'categorias' && 'Minhas Categorias'}
          </h1>
        </div>

        {view === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Total de Produtos</span>
                  <span className="stat-value">{totalProdutos}</span>
                </div>
                <div className="stat-icon-box purple"><Package size={24} /></div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Categorias Ativas</span>
                  <span className="stat-value">{totalCategorias}</span>
                </div>
                <div className="stat-icon-box cyan"><Tag size={24} /></div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Total de Vendas</span>
                  <span className="stat-value">{vendas.length}</span>
                </div>
                <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <ShoppingBag size={24} />
                </div>
              </div>
            </div>

            <div className="content-card">
              <h2 className="card-title" style={{ marginBottom: '24px' }}>Últimas Vendas</h2>
              <div className="table-wrapper">
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
                        <td>#{v.id}</td>
                        <td className="price-text">R$ {Number(v.valor_total).toFixed(2)}</td>
                        <td>{new Date(v.created_at).toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} style={{ textAlign: 'center' }}>Nenhuma venda registrada.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {view === 'produtos' && (
          <div className="content-card">
            <div className="card-header-actions">
              <h2 className="card-title">Catálogo</h2>
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openAddProduto}>
                <Plus size={16} /> Novo Produto
              </button>
            </div>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.length > 0 ? produtos.map(p => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td className="price-text">R$ {Number(p.preco).toFixed(2)}</td>
                      <td>{p.estoque}</td>
                      <td className="actions-cell">
                        <button className="btn-icon-only" onClick={() => openEditProduto(p)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon-only danger" onClick={() => deleteProduto(p.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'categorias' && (
          <div className="content-card">
            <div className="card-header-actions">
              <h2 className="card-title">Categorias</h2>
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openAddCategoria}>
                <Plus size={16} /> Nova Categoria
              </button>
            </div>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.length > 0 ? categorias.map(c => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td><span className="badge badge-category">{c.nome}</span></td>
                      <td className="actions-cell">
                        <button className="btn-icon-only" onClick={() => openEditCategoria(c)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon-only danger" onClick={() => deleteCategoria(c.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} style={{ textAlign: 'center' }}>Nenhuma categoria cadastrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Categoria Modal */}
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
                    placeholder="Ex: Bebidas"
                    value={categoriaNome}
                    onChange={(e) => setCategoriaNome(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                {selectedCategoria ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Produto Modal */}
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
                  <Package className="input-icon" size={18} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: Coca-Cola 2L"
                    value={produtoNome}
                    onChange={(e) => setProdutoNome(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    placeholder="0.00"
                    style={{ paddingLeft: '16px' }}
                    value={produtoPreco}
                    onChange={(e) => setProdutoPreco(e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Estoque</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="0"
                    style={{ paddingLeft: '16px' }}
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
                  <option value="" disabled>Selecione uma categoria...</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                {selectedProduto ? 'Salvar Alterações' : 'Criar Produto'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
