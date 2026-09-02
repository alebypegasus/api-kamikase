import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Tag, Package, LogOut, Plus, Edit, Trash2, X, Store, 
  DollarSign, Eye, Download, FileSpreadsheet, TrendingUp, 
  Star, PhoneCall, HeartHandshake, UserCheck, MessageCircle, 
  Clock, AlertTriangle 
} from 'lucide-react';
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
  cliente_identificado?: string;
  cliente_telefone?: string;
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

  const [view, setView] = useState<'dashboard' | 'produtos' | 'categorias' | 'pos-venda'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalCategorias, setTotalCategorias] = useState(0);
  const [vendas, setVendas] = useState<any[]>([]);
  
  const [searchProdutos, setSearchProdutos] = useState('');
  const [vendasPage, setVendasPage] = useState(1);
  const vendasPerPage = 10;

  // Pós-Venda states
  const [posVendas, setPosVendas] = useState<any[]>([]);
  const [posVendaStats, setPosVendaStats] = useState<any>({ total: 0, pendentes: 0, contatados: 0, satisfeitos: 0, trocas_garantias: 0, concluidos: 0 });
  const [posVendaStatusFilter, setPosVendaStatusFilter] = useState('todos');
  const [posVendaSearch, setPosVendaSearch] = useState('');
  const [editPosVendaModalOpen, setEditPosVendaModalOpen] = useState(false);
  const [selectedPosVenda, setSelectedPosVenda] = useState<any | null>(null);
  const [editPosVendaStatus, setEditPosVendaStatus] = useState('Pendente');
  const [editPosVendaObs, setEditPosVendaObs] = useState('');
  const [editPosVendaSatisfacao, setEditPosVendaSatisfacao] = useState<number | null>(5);
  const [savingPosVenda, setSavingPosVenda] = useState(false);

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
      await Promise.all([fetchCategorias(), fetchProdutos(), fetchStats(), fetchVendas(), fetchPosVendas(), fetchPosVendaStats()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (view === 'pos-venda') {
      fetchPosVendas();
    }
  }, [posVendaStatusFilter, posVendaSearch, view]);

  const fetchPosVendas = async () => {
    try {
      const params: any = {};
      if (posVendaStatusFilter !== 'todos') params.status = posVendaStatusFilter;
      if (posVendaSearch.trim()) params.q = posVendaSearch.trim();
      const res = await api.get('/pos-venda', { params });
      setPosVendas(res.data);
    } catch (err) {
      console.error('Erro ao buscar pós-vendas:', err);
    }
  };

  const fetchPosVendaStats = async () => {
    try {
      const res = await api.get('/pos-venda/stats');
      setPosVendaStats(res.data);
    } catch (err) {
      console.error('Erro ao buscar stats de pós-venda:', err);
    }
  };

  const openEditPosVenda = (item: any) => {
    setSelectedPosVenda(item);
    setEditPosVendaStatus(item.status || 'Pendente');
    setEditPosVendaObs(item.observacoes || '');
    setEditPosVendaSatisfacao(item.satisfacao || 5);
    setEditPosVendaModalOpen(true);
  };

  const handleUpdatePosVenda = async () => {
    if (!selectedPosVenda) return;
    setSavingPosVenda(true);
    try {
      await api.put(`/pos-venda/${selectedPosVenda.id}`, {
        status: editPosVendaStatus,
        observacoes: editPosVendaObs,
        satisfacao: editPosVendaSatisfacao
      });
      addToast('success', 'Registro de pós-venda atualizado com sucesso!');
      setEditPosVendaModalOpen(false);
      fetchPosVendas();
      fetchPosVendaStats();
    } catch (err) {
      console.error(err);
      addToast('danger', 'Erro ao atualizar pós-venda.');
    } finally {
      setSavingPosVenda(false);
    }
  };

  const handleQuickStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/pos-venda/${id}`, { status: newStatus });
      addToast('success', `Status alterado para ${newStatus}!`);
      fetchPosVendas();
      fetchPosVendaStats();
    } catch (err) {
      console.error(err);
      addToast('danger', 'Erro ao alterar status.');
    }
  };

  const getWhatsAppLink = (telefone: string, clienteNome: string, vendaId: number) => {
    if (!telefone) return null;
    const cleanPhone = telefone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Olá ${clienteNome}! Aqui é da ${userName}. Agradecemos sua compra #${vendaId}! Tudo correu bem com seus produtos? Estamos à disposição para qualquer suporte ou garantia!`
    );
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

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
    <div className="sys-container page-transition" style={{ flexDirection: 'column', height: 'auto', minHeight: '100vh' }}>
      {/* Top Navbar Header */}
      <header className="app-topbar">
        <div className="topbar-brand-group">
          <div className="topbar-logo-icon">
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="topbar-brand-title">
              Kamikase <span>ERP & PDV</span>
            </div>
            <div className="topbar-brand-subtitle">
              Gestão de Estoque & Vendas
            </div>
          </div>
        </div>

        {/* Central Nav Pills */}
        <div className="topbar-nav-pills">
          <button 
            className="topbar-pill" 
            onClick={() => navigate('/pdv')} 
            title="Ir para Frente de Caixa (PDV)"
          >
            <Store size={15} />
            <span>Frente de Caixa (PDV)</span>
          </button>
          <button 
            className={`topbar-pill ${view === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setView('dashboard')}
          >
            <TrendingUp size={15} />
            <span>Painel Geral</span>
          </button>
          <button 
            className={`topbar-pill ${view === 'produtos' ? 'active' : ''}`} 
            onClick={() => setView('produtos')}
          >
            <Package size={15} />
            <span>Produtos ({totalProdutos})</span>
          </button>
          <button 
            className={`topbar-pill ${view === 'categorias' ? 'active' : ''}`} 
            onClick={() => setView('categorias')}
          >
            <Tag size={15} />
            <span>Categorias ({totalCategorias})</span>
          </button>
          <button 
            className={`topbar-pill ${view === 'pos-venda' ? 'active' : ''}`} 
            onClick={() => setView('pos-venda')}
          >
            <HeartHandshake size={15} />
            <span>Pós-Venda ({posVendaStats.total || 0})</span>
          </button>
        </div>

        {/* Right Section */}
        <div className="topbar-actions-group">
          <ThemeToggle />

          <div className="topbar-divider" />

          <div className="topbar-user-capsule">
            <div className="topbar-user-avatar">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="topbar-user-meta">
              <span className="topbar-user-name">{userName}</span>
              <span className="topbar-user-role">{isAdmin ? 'Administrador' : 'Lojista'}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="topbar-logout-btn" 
              title="Encerrar Sessão"
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="sys-main-content" style={{ maxWidth: '1440px', width: '100%', margin: '0 auto' }}>

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
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
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
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>
                              {v.cliente_identificado || 'Consumidor Final'}
                            </div>
                            {v.cliente_telefone && (
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                {v.cliente_telefone}
                              </span>
                            )}
                          </td>
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
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Nenhuma venda registrada.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                <div className="table-responsive">
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
                </div>
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
                <div className="table-responsive">
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
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'pos-venda' && (
          <div className="view-transition">
            {/* Header da aba */}
            <div className="page-header" style={{ marginBottom: '24px' }}>
              <div>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HeartHandshake size={24} style={{ color: 'var(--primary)' }} />
                  Acompanhamento de Pós-Venda & Fidelização
                </h1>
                <p>Relacionamento pós-compra, satisfação do cliente, follow-up e controle de trocas e garantias.</p>
              </div>
            </div>

            {/* Metric Cards de Pós-Venda */}
            <div className="posvenda-stat-grid">
              <div className="stat-card hover-lift animate-slide-up">
                <div>
                  <div className="stat-card-label">Total Atendimentos</div>
                  <div className="stat-card-value"><AnimatedCounter value={posVendaStats.total || 0} /></div>
                </div>
                <div className="stat-icon purple"><UserCheck size={26} /></div>
              </div>

              <div className="stat-card hover-lift animate-slide-up" style={{ borderLeft: '3px solid var(--warning)' }}>
                <div>
                  <div className="stat-card-label">Follow-up Pendente</div>
                  <div className="stat-card-value" style={{ color: 'var(--warning)' }}>
                    <AnimatedCounter value={posVendaStats.pendentes || 0} />
                  </div>
                </div>
                <div className="stat-icon amber"><Clock size={26} /></div>
              </div>

              <div className="stat-card hover-lift animate-slide-up">
                <div>
                  <div className="stat-card-label">Clientes Contatados</div>
                  <div className="stat-card-value" style={{ color: 'var(--info)' }}>
                    <AnimatedCounter value={posVendaStats.contatados || 0} />
                  </div>
                </div>
                <div className="stat-icon cyan"><PhoneCall size={26} /></div>
              </div>

              <div className="stat-card hover-lift animate-slide-up" style={{ borderLeft: '3px solid var(--accent)' }}>
                <div>
                  <div className="stat-card-label">Clientes Satisfeitos</div>
                  <div className="stat-card-value" style={{ color: 'var(--accent)' }}>
                    <AnimatedCounter value={posVendaStats.satisfeitos || 0} />
                  </div>
                </div>
                <div className="stat-icon teal"><Star size={26} /></div>
              </div>

              <div className="stat-card hover-lift animate-slide-up">
                <div>
                  <div className="stat-card-label">Trocas & Garantia</div>
                  <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
                    <AnimatedCounter value={posVendaStats.trocas_garantias || 0} />
                  </div>
                </div>
                <div className="stat-icon pink"><AlertTriangle size={26} /></div>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="posvenda-filter-bar">
              <div className="posvenda-filter-pills">
                <button 
                  className={`posvenda-status-pill ${posVendaStatusFilter === 'todos' ? 'active' : ''}`}
                  onClick={() => setPosVendaStatusFilter('todos')}
                >
                  Todos ({posVendaStats.total || 0})
                </button>
                <button 
                  className={`posvenda-status-pill ${posVendaStatusFilter === 'Pendente' ? 'active' : ''}`}
                  onClick={() => setPosVendaStatusFilter('Pendente')}
                >
                  ⏳ Pendentes ({posVendaStats.pendentes || 0})
                </button>
                <button 
                  className={`posvenda-status-pill ${posVendaStatusFilter === 'Contatado' ? 'active' : ''}`}
                  onClick={() => setPosVendaStatusFilter('Contatado')}
                >
                  📞 Contatados ({posVendaStats.contatados || 0})
                </button>
                <button 
                  className={`posvenda-status-pill ${posVendaStatusFilter === 'Satisfeito' ? 'active' : ''}`}
                  onClick={() => setPosVendaStatusFilter('Satisfeito')}
                >
                  ⭐ Satisfeitos ({posVendaStats.satisfeitos || 0})
                </button>
                <button 
                  className={`posvenda-status-pill ${posVendaStatusFilter === 'Troca/Garantia' ? 'active' : ''}`}
                  onClick={() => setPosVendaStatusFilter('Troca/Garantia')}
                >
                  🔄 Troca/Garantia ({posVendaStats.trocas_garantias || 0})
                </button>
                <button 
                  className={`posvenda-status-pill ${posVendaStatusFilter === 'Concluido' ? 'active' : ''}`}
                  onClick={() => setPosVendaStatusFilter('Concluido')}
                >
                  ✅ Concluídos ({posVendaStats.concluidos || 0})
                </button>
              </div>

              <div style={{ minWidth: '280px' }}>
                <SearchInput 
                  value={posVendaSearch} 
                  onChange={setPosVendaSearch} 
                  placeholder="Buscar cliente, telefone ou nota..."
                />
              </div>
            </div>

            {/* Tabela de Acompanhamentos */}
            <div className="content-panel">
              <div className="panel-header">
                <h2>Registros de Pós-Venda ({posVendas.length})</h2>
              </div>

              {loading ? (
                <div style={{ padding: '24px' }}><SkeletonTable rows={5} cols={6} /></div>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Cliente & Contato</th>
                        <th>Venda / Data</th>
                        <th>Itens Comprados</th>
                        <th>Status Pós-Venda</th>
                        <th>Satisfação</th>
                        <th>Anotações de Atendimento</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posVendas.length > 0 ? posVendas.map(pv => {
                        const waLink = getWhatsAppLink(pv.cliente_telefone, pv.cliente_nome, pv.vendas_id);
                        return (
                          <tr key={pv.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {pv.cliente_nome}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                                  {pv.cliente_telefone || 'Sem telefone'}
                                </span>
                                {waLink && (
                                  <a 
                                    href={waLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn-whatsapp" 
                                    title="Iniciar conversa no WhatsApp"
                                  >
                                    <MessageCircle size={13} /> WhatsApp
                                  </a>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                                R$ {Number(pv.venda_valor).toFixed(2)}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                Venda #{pv.vendas_id} • {new Date(pv.venda_data).toLocaleDateString('pt-BR')}
                              </span>
                            </td>
                            <td>
                              <div style={{ maxWidth: '240px', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                {pv.itens_resumo || `${pv.total_itens || 1} itens`}
                              </div>
                            </td>
                            <td>
                              <select 
                                className="custom-input"
                                value={pv.status}
                                onChange={e => handleQuickStatusChange(pv.id, e.target.value)}
                                style={{ 
                                  padding: '6px 10px', 
                                  fontSize: '12px', 
                                  fontWeight: 700,
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid var(--border-light)',
                                  background: 'var(--bg-surface)'
                                }}
                              >
                                <option value="Pendente">⏳ Pendente</option>
                                <option value="Contatado">📞 Contatado</option>
                                <option value="Satisfeito">⭐ Satisfeito</option>
                                <option value="Troca/Garantia">🔄 Troca/Garantia</option>
                                <option value="Concluido">✅ Concluído</option>
                              </select>
                            </td>
                            <td>
                              {pv.satisfacao ? (
                                <div style={{ color: '#f59e0b', fontSize: '14px', letterSpacing: '1px' }}>
                                  {'★'.repeat(pv.satisfacao)}{'☆'.repeat(5 - pv.satisfacao)}
                                </div>
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Não avaliado</span>
                              )}
                            </td>
                            <td>
                              <div style={{ maxWidth: '260px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: pv.observacoes ? 'normal' : 'italic' }}>
                                {pv.observacoes || 'Sem anotações de atendimento.'}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                                <button 
                                  className="btn-icon" 
                                  onClick={() => openEditPosVenda(pv)}
                                  title="Editar Nota / Satisfação"
                                >
                                  <Edit size={15} />
                                </button>
                                <button 
                                  className="btn-icon" 
                                  onClick={() => abrirDetalhesVenda(pv.vendas_id)}
                                  title="Ver Detalhes da Venda"
                                >
                                  <Eye size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                            Nenhum registro de pós-venda encontrado para este filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Cliente</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-bright)' }}>
                      {vendaDetalhe.cliente_identificado || 'Consumidor Final'}
                    </span>
                    {vendaDetalhe.cliente_telefone && (
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>
                        Tel: {vendaDetalhe.cliente_telefone}
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Data</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{new Date(vendaDetalhe.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Forma de Pagamento</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{vendaDetalhe.forma_pagamento || 'Dinheiro'} {vendaDetalhe.parcelas && vendaDetalhe.parcelas > 1 ? `(${vendaDetalhe.parcelas}x)` : ''}</span>
                  </div>
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

      {/* Editar Registro de Pós-Venda Modal */}
      {editPosVendaModalOpen && selectedPosVenda && (
        <div className="glass-modal" onClick={() => setEditPosVendaModalOpen(false)}>
          <div className="modal-content-glass" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Atendimento Pós-Venda</h3>
              <button onClick={() => setEditPosVendaModalOpen(false)} className="modal-close"><X size={20} /></button>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-bright)' }}>
                {selectedPosVenda.cliente_nome}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Venda #{selectedPosVenda.vendas_id} • R$ {Number(selectedPosVenda.venda_valor).toFixed(2)}
                {selectedPosVenda.cliente_telefone ? ` • Tel: ${selectedPosVenda.cliente_telefone}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Status do Pós-Venda
                </label>
                <select 
                  className="custom-input"
                  value={editPosVendaStatus}
                  onChange={e => setEditPosVendaStatus(e.target.value)}
                >
                  <option value="Pendente">⏳ Pendente (Aguardando contato de rotina)</option>
                  <option value="Contatado">📞 Contatado (Cliente respondeu/em andamento)</option>
                  <option value="Satisfeito">⭐ Satisfeito (Feedback positivo recebido)</option>
                  <option value="Troca/Garantia">🔄 Troca/Garantia (Solicitação aberta)</option>
                  <option value="Concluido">✅ Concluído (Caso encerrado com sucesso)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Nível de Satisfação do Cliente (1 a 5 Estrelas)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setEditPosVendaSatisfacao(star)}
                      style={{ 
                        fontSize: '24px', 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: (editPosVendaSatisfacao || 0) >= star ? '#f59e0b' : 'var(--border-lighter)'
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginLeft: '6px' }}>
                    {editPosVendaSatisfacao ? `${editPosVendaSatisfacao} de 5 estrelas` : 'Não avaliado'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Anotações de Atendimento & Histórico
                </label>
                <textarea 
                  className="custom-input"
                  rows={4}
                  placeholder="Ex: Cliente elogiou o produto, tudo funcionando perfeito. Perguntou sobre garantia..."
                  value={editPosVendaObs}
                  onChange={e => setEditPosVendaObs(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setEditPosVendaModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1 }}
                  disabled={savingPosVenda}
                  onClick={handleUpdatePosVenda}
                >
                  {savingPosVenda ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
