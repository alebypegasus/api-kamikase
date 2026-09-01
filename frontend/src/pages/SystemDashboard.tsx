import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Package, LogOut, Plus, Edit, Trash2, LayoutGrid, X, Cpu, DollarSign, Eye, Download, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AnimatedCounter from '../components/AnimatedCounter';
import SearchInput from '../components/SearchInput';
import { useConfirm } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import Skeleton, { SkeletonTable } from '../components/Skeleton';

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

interface VendaDetalheItem {
  id: number;
  produtos_id: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
}

interface VendaDetalhe {
  id: number;
  usuarios_id: number;
  valor_total: number;
  desconto?: number;
  forma_pagamento?: string;
  parcelas?: number;
  created_at: string;
  itens?: VendaDetalheItem[];
}

export default function SystemDashboard() {
  const { userName, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { addToast } = useToast();

  const [view, setView] = useState<'dashboard' | 'produtos' | 'categorias'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalCategorias, setTotalCategorias] = useState(0);
  const [vendas, setVendas] = useState<any[]>([]);
  
  const [searchProdutos, setSearchProdutos] = useState('');
  const [vendasPage, setVendasPage] = useState(1);
  const vendasPerPage = 10;

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

  // Venda details modal
  const [vendaDetalheModalOpen, setVendaDetalheModalOpen] = useState(false);
  const [vendaDetalhe, setVendaDetalhe] = useState<VendaDetalhe | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchCategorias(), fetchProdutos(), fetchStats(), fetchVendas()]);
      setLoading(false);
    };
    fetchAll();
    document.body.classList.add('dark-dashboard');
    return () => document.body.classList.remove('dark-dashboard');
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProdutos = async () => {
    try {
      const res = await api.get('/produtos');
      setProdutos(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const resP = await api.get('/produtos/total');
      setTotalProdutos(resP.data.total);
      
      const resC = await api.get('/produtos/categorias/total');
      setTotalCategorias(resC.data.total);
    } catch (err) { console.error(err); }
  };

  const fetchVendas = async () => {
    try {
      const res = await api.get('/vendas');
      setVendas(res.data);
    } catch (err) { console.error(err); }
  };

  const abrirDetalhesVenda = async (vendaId: number) => {
    setLoadingDetalhe(true);
    setVendaDetalheModalOpen(true);
    try {
      const res = await api.get(`/vendas/${vendaId}`);
      setVendaDetalhe(res.data);
    } catch (err) {
      console.error(err);
      addToast('danger', 'Erro ao carregar detalhes da venda.');
      setVendaDetalheModalOpen(false);
    } finally {
      setLoadingDetalhe(false);
    }
  };

  const exportarVendasCSV = () => {
    if (vendas.length === 0) {
      addToast('warning', 'Não há vendas para exportar.');
      return;
    }

    const headers = ['ID', 'Valor Total (R$)', 'Forma de Pagamento', 'Desconto (R$)', 'Data / Hora'];
    const rows = vendas.map(v => [
      v.id,
      Number(v.valor_total).toFixed(2),
      v.forma_pagamento || 'Não especificado',
      Number(v.desconto || 0).toFixed(2),
      new Date(v.created_at).toLocaleString('pt-BR')
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kamikase_vendas_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Relatório de vendas exportado em CSV!');
  };

  const exportarProdutosCSV = () => {
    if (produtos.length === 0) {
      addToast('warning', 'Não há produtos para exportar.');
      return;
    }

    const headers = ['ID', 'Nome', 'Preço (R$)', 'Estoque', 'Categoria ID', 'Descrição'];
    const rows = produtos.map(p => [
      p.id,
      `"${p.nome.replace(/"/g, '""')}"`,
      Number(p.preco).toFixed(2),
      p.estoque,
      p.categorias_id,
      `"${(p.descricao || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kamikase_produtos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Catálogo de produtos exportado em CSV!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Computed
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (Number(p.preco) * p.estoque), 0);

  const filteredProdutos = searchProdutos
    ? produtos.filter(p => p.nome.toLowerCase().includes(searchProdutos.toLowerCase()))
    : produtos;

  const totalVendasPages = Math.ceil(vendas.length / vendasPerPage);
  const paginatedVendas = vendas.slice((vendasPage - 1) * vendasPerPage, vendasPage * vendasPerPage);

  const getStockBadge = (estoque: number) => {
    if (estoque <= 0) return { className: 'low', label: `${estoque} un` };
    if (estoque <= 5) return { className: 'medium', label: `${estoque} un` };
    return { className: 'high', label: `${estoque} un` };
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
    if (!categoriaNome.trim()) {
      addToast('warning', 'Nome da categoria é obrigatório.');
      return;
    }

    try {
      const url = selectedCategoria 
        ? `/categorias/${selectedCategoria.id}` 
        : `/categorias`;

      const data = { 
        nome: categoriaNome,
        parent_id: categoriaParentId ? Number(categoriaParentId) : null
      };

      if (selectedCategoria) {
          await api.put(url, data);
      } else {
          await api.post(url, data);
      }

      addToast('success', selectedCategoria ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.');
      fetchCategorias();
      fetchStats();
      setCategoriaModalOpen(false);
    } catch (err: any) {
      console.error(err);
      addToast('danger', err.response?.data?.erro || err.response?.data?.mensagem || 'Erro ao salvar categoria.');
    }
  };

  const deleteCategoria = async (id: number) => {
    const confirmed = await confirm({
      title: 'Excluir Categoria',
      message: 'Tem certeza que deseja excluir esta categoria? Produtos vinculados podem ficar sem categoria.',
      confirmText: 'Excluir',
      type: 'danger',
    });
    if (!confirmed) return;
    
    try {
      await api.delete(`/categorias/${id}`);
      addToast('success', 'Categoria excluída com sucesso.');
      fetchCategorias();
      fetchStats();
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
      addToast('warning', 'Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    const payload = {
      nome: produtoNome,
      descricao: produtoDescricao,
      preco: Number(produtoPreco),
      categorias_id: Number(produtoCategoriaId),
      estoque: Number(produtoEstoque || 0)
    };

    try {
      const url = selectedProduto 
        ? `/produtos/${selectedProduto.id}` 
        : `/produtos`;

      if (selectedProduto) {
          await api.put(url, payload);
      } else {
          await api.post(url, payload);
      }

      addToast('success', selectedProduto ? 'Produto atualizado com sucesso.' : 'Produto criado com sucesso.');
      fetchProdutos();
      fetchStats();
      setProdutoModalOpen(false);
    } catch (err: any) {
      console.error(err);
      addToast('danger', err.response?.data?.erro || err.response?.data?.mensagem || 'Erro ao salvar produto.');
    }
  };

  const deleteProduto = async (id: number) => {
    const confirmed = await confirm({
      title: 'Excluir Produto',
      message: 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/produtos/${id}`);
      addToast('success', 'Produto excluído com sucesso.');
      fetchProdutos();
      fetchStats();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="sys-container page-transition">

      {/* Sidebar */}
      <aside className="glass-sidebar">
        <div className="sidebar-brand" style={{ position: 'relative' }}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}><Cpu size={24} /></div>
          <span className="sidebar-brand-text neon-text">Kamikase ERP & PDV</span>
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

        <div className="sidebar-bottom">
          <button className="btn-gradient" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/pdv')}>
            <ShoppingBag size={18} /> Ir para PDV
          </button>

          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {userName?.charAt(0)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">{isAdmin ? 'Administrador' : 'Lojista'}</div>
            </div>
            <button onClick={handleLogout} className="btn-icon danger" style={{ border: 'none', background: 'transparent' }} title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sys-main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {view === 'dashboard' && <><TrendingUp size={22} style={{ color: 'var(--primary)' }} /> Visão Geral do Negócio</>}
              {view === 'produtos' && <><Package size={22} style={{ color: 'var(--primary)' }} /> Catálogo de Produtos</>}
              {view === 'categorias' && <><Tag size={22} style={{ color: 'var(--primary)' }} /> Gestão de Categorias</>}
            </h1>
            <p>Gerencie seu inventário e acompanhe resultados comerciais.</p>
          </div>
          <ThemeToggle />
        </div>

        {view === 'dashboard' && (
          <div className="view-transition">
            {loading ? (
              <div className="stat-grid">
                <Skeleton variant="stat" />
                <Skeleton variant="stat" />
                <Skeleton variant="stat" />
                <Skeleton variant="stat" />
              </div>
            ) : (
              <div className="stat-grid">
                <div className="stat-card hover-lift animate-slide-up" style={{ animationDelay: '0s' }}>
                  <div>
                    <div className="stat-card-label">Total de Produtos</div>
                    <div className="stat-card-value"><AnimatedCounter value={totalProdutos} /></div>
                  </div>
                  <div className="stat-icon purple"><Package size={28} /></div>
                </div>
                <div className="stat-card hover-lift animate-slide-up" style={{ animationDelay: '0.08s' }}>
                  <div>
                    <div className="stat-card-label">Categorias Ativas</div>
                    <div className="stat-card-value"><AnimatedCounter value={totalCategorias} /></div>
                  </div>
                  <div className="stat-icon cyan"><Tag size={28} /></div>
                </div>
                <div className="stat-card hover-lift animate-slide-up" style={{ animationDelay: '0.16s' }}>
                  <div>
                    <div className="stat-card-label">Vendas Registradas</div>
                    <div className="stat-card-value" style={{ color: 'var(--accent-light)' }}>
                      <AnimatedCounter value={vendas.length} />
                    </div>
                  </div>
                  <div className="stat-icon teal"><ShoppingBag size={28} /></div>
                </div>
                <div className="stat-card hover-lift animate-slide-up" style={{ animationDelay: '0.24s' }}>
                  <div>
                    <div className="stat-card-label">Valor em Estoque</div>
                    <div className="stat-card-value" style={{ color: 'var(--accent-light)', fontSize: '22px' }}>
                      <AnimatedCounter value={valorTotalEstoque} prefix="R$ " decimals={2} />
                    </div>
                  </div>
                  <div className="stat-icon amber"><DollarSign size={28} /></div>
                </div>
              </div>
            )}

            <div className="content-panel animate-fade-in">
              <div className="panel-header">
                <h2>Últimas Transações</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={exportarVendasCSV} 
                    className="btn-icon" 
                    title="Exportar Vendas para CSV"
                    style={{ padding: '8px 14px', gap: '6px', fontSize: '13px', display: 'flex', alignItems: 'center' }}
                  >
                    <Download size={15} /> Exportar CSV
                  </button>
                  {totalVendasPages > 1 && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="btn-icon" disabled={vendasPage <= 1} onClick={() => setVendasPage(p => p - 1)}>←</button>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{vendasPage}/{totalVendasPages}</span>
                      <button className="btn-icon" disabled={vendasPage >= totalVendasPages} onClick={() => setVendasPage(p => p + 1)}>→</button>
                    </div>
                  )}
                </div>
              </div>
              {loading ? (
                <div style={{ padding: '24px' }}><SkeletonTable rows={5} cols={4} /></div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Valor Total</th>
                      <th>Pagamento</th>
                      <th>Data</th>
                      <th style={{ textAlign: 'right' }}>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVendas.length > 0 ? paginatedVendas.map(v => (
                      <tr key={v.id}>
                        <td style={{ color: 'var(--text-muted)' }}>#{v.id}</td>
                        <td className="price-text">R$ {Number(v.valor_total).toFixed(2)}</td>
                        <td>
                          <span style={{ 
                            fontSize: '12px', 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            background: 'rgba(255,255,255,0.06)',
                            color: '#e2e8f0'
                          }}>
                            {v.forma_pagamento || 'Dinheiro'}
                          </span>
                        </td>
                        <td>{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn-icon" 
                            onClick={() => abrirDetalhesVenda(v.id)}
                            title="Ver Itens da Venda"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Nenhuma venda registrada.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {view === 'produtos' && (
          <div className="view-transition">
            <div className="content-panel">
              <div className="panel-header">
                <div className="panel-header-actions">
                  <h2>Produtos Cadastrados</h2>
                  <SearchInput 
                    value={searchProdutos} 
                    onChange={setSearchProdutos}
                    placeholder="Filtrar produtos..."
                    className="animate-fade-in"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={exportarProdutosCSV} 
                    className="btn-icon" 
                    title="Exportar Produtos para CSV"
                    style={{ padding: '8px 14px', gap: '6px', fontSize: '13px', display: 'flex', alignItems: 'center' }}
                  >
                    <FileSpreadsheet size={15} /> Exportar CSV
                  </button>
                  <button className="btn-gradient" onClick={openAddProduto}>
                    <Plus size={16} /> Novo Produto
                  </button>
                </div>
              </div>
              {loading ? (
                <div style={{ padding: '24px' }}><SkeletonTable rows={5} cols={4} /></div>
              ) : (
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
                    {filteredProdutos.length > 0 ? filteredProdutos.map(p => {
                      const stockBadge = getStockBadge(p.estoque);
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 500 }}>{p.nome}</td>
                          <td className="price-text">R$ {Number(p.preco).toFixed(2)}</td>
                          <td>
                            <span className={`badge-stock ${stockBadge.className}`}>
                              {stockBadge.label}
                            </span>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn-icon" onClick={() => openEditProduto(p)}>
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon danger" onClick={() => deleteProduto(p.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        {searchProdutos ? `Nenhum produto encontrado para "${searchProdutos}".` : 'Nenhum produto cadastrado.'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {view === 'categorias' && (
          <div className="view-transition">
            <div className="content-panel">
              <div className="panel-header">
                <h2>Estrutura de Categorias</h2>
                <button className="btn-gradient" onClick={openAddCategoria}>
                  <Plus size={16} /> Nova Categoria
                </button>
              </div>
              {loading ? (
                <div style={{ padding: '24px' }}><SkeletonTable rows={5} cols={3} /></div>
              ) : (
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
                        <td style={{ color: 'var(--text-muted)' }}>#{c.id}</td>
                        <td>
                          <span className="badge-cat">
                            {parent ? `${parent.nome} > ${c.nome}` : c.nome}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
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
                      <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Nenhuma categoria cadastrada.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Detalhes da Venda Modal */}
      {vendaDetalheModalOpen && (
        <div className="glass-modal" onClick={() => setVendaDetalheModalOpen(false)}>
          <div className="modal-content-glass" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {loadingDetalhe ? 'Carregando...' : `Venda #${vendaDetalhe?.id}`}
              </h3>
              <button onClick={() => setVendaDetalheModalOpen(false)} className="modal-close"><X size={20} /></button>
            </div>

            {loadingDetalhe ? (
              <div style={{ padding: '20px' }}>
                <Skeleton variant="row" count={4} />
              </div>
            ) : vendaDetalhe ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Data</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{new Date(vendaDetalhe.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Forma de Pagamento</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{vendaDetalhe.forma_pagamento || 'Dinheiro'} {vendaDetalhe.parcelas && vendaDetalhe.parcelas > 1 ? `(${vendaDetalhe.parcelas}x)` : ''}</span>
                  </div>
                  {Number(vendaDetalhe.desconto || 0) > 0 && (
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Desconto Aplicado</span>
                      <span style={{ fontSize: '14px', color: '#2dd4bf', fontWeight: 600 }}>- R$ {Number(vendaDetalhe.desconto).toFixed(2)}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Valor Total</span>
                    <span style={{ fontSize: '18px', color: '#2dd4bf', fontWeight: 700 }}>R$ {Number(vendaDetalhe.valor_total).toFixed(2)}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '10px' }}>Itens Vendidos</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                  <table className="custom-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th style={{ textAlign: 'center' }}>Qtd</th>
                        <th style={{ textAlign: 'right' }}>Unitário</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendaDetalhe.itens && vendaDetalhe.itens.length > 0 ? (
                        vendaDetalhe.itens.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.produto_nome || `Produto #${item.produtos_id}`}</td>
                            <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
                            <td style={{ textAlign: 'right' }}>R$ {Number(item.preco_unitario).toFixed(2)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Nenhum item registrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={() => setVendaDetalheModalOpen(false)}
                  className="btn-gradient"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
                >
                  Fechar
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Categoria Modal */}
      {categoriaModalOpen && (
        <div className="glass-modal" onClick={() => setCategoriaModalOpen(false)}>
          <div className="modal-content-glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={() => setCategoriaModalOpen(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategoria}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Nome da Categoria</label>
                <input 
                  type="text" className="input-glass" 
                  placeholder="Ex: Hardware"
                  value={categoriaNome} onChange={(e) => setCategoriaNome(e.target.value)} required
                />
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Categoria Pai (Opcional)</label>
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
        <div className="glass-modal" onClick={() => setProdutoModalOpen(false)}>
          <div className="modal-content-glass" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedProduto ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setProdutoModalOpen(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduto}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Nome do Produto</label>
                <input type="text" className="input-glass" placeholder="Ex: RTX 4090" value={produtoNome} onChange={(e) => setProdutoNome(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Descrição</label>
                <input type="text" className="input-glass" placeholder="Breve descrição" value={produtoDescricao} onChange={(e) => setProdutoDescricao(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Preço (R$)</label>
                  <input type="number" step="0.01" className="input-glass" value={produtoPreco} onChange={(e) => setProdutoPreco(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Estoque</label>
                  <input type="number" className="input-glass" value={produtoEstoque} onChange={(e) => setProdutoEstoque(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Categoria</label>
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
