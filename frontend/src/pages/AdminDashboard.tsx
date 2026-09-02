import { useState, useEffect, useMemo } from 'react';
import { 
  Users, Package, ShoppingBag, LogOut, Download, Building, 
  Edit2, CheckCircle, X, Plus, TrendingUp, Key, Search, RefreshCw,
  Eye, FileText, CreditCard, Sparkles, ArrowRight, Activity, Clock,
  UserCheck, UserPlus, DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AnimatedCounter from '../components/AnimatedCounter';
import GlowButton from '../components/GlowButton';
import ToggleSwitch from '../components/ToggleSwitch';
import ThemeToggle from '../components/ThemeToggle';
import { UnitRevenueBarChart, PaymentMethodDonutChart, TopSellersRanking, InventoryHealthCard } from '../components/AdminCharts';

type AdminTab = 'overview' | 'sellers' | 'units' | 'sales' | 'inventory';
type SortField = 'nome' | 'total_produtos' | 'valor_total_estoque' | 'total_vendas' | 'valor_total_vendido';
type SortDir = 'asc' | 'desc';

export default function AdminDashboard() {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Core Data
  const [dashboardData, setDashboardData] = useState<any>({ 
    usuarios: [], 
    global: null, 
    unidadesMetricas: [], 
    pagamentosMetricas: [] 
  });
  const [unidades, setUnidades] = useState<any[]>([]);
  const [todasVendas, setTodasVendas] = useState<any[]>([]);
  const [todosProdutos, setTodosProdutos] = useState<any[]>([]);

  // Filtering & Sorting
  const [sortField, setSortField] = useState<SortField>('valor_total_vendido');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [searchLojista, setSearchLojista] = useState('');
  const [filtroUnidadeLojista, setFiltroUnidadeLojista] = useState<string>('todos');
  const [filtroStatusLojista, setFiltroStatusLojista] = useState<string>('todos');

  // Branch filtering
  const [searchFilial, setSearchFilial] = useState('');

  // Sales filtering
  const [searchVendas, setSearchVendas] = useState('');
  const [filtroPagamentoVendas, setFiltroPagamentoVendas] = useState('todos');

  // Products filtering
  const [searchProdutos, setSearchProdutos] = useState('');
  const [filtroEstoqueProdutos, setFiltroEstoqueProdutos] = useState('todos');

  // Units editing / creation
  const [novaUnidade, setNovaUnidade] = useState('');
  const [editingUnidade, setEditingUnidade] = useState<number | null>(null);
  const [editUnidadeNome, setEditUnidadeNome] = useState('');

  // Modals state
  const [modalNovoLojistaOpen, setModalNovoLojistaOpen] = useState(false);
  const [novoLojistaData, setNovoLojistaData] = useState({ nome: '', email: '', senha: '', unidade_id: '' });

  const [modalEditarLojistaOpen, setModalEditarLojistaOpen] = useState(false);
  const [editLojistaData, setEditLojistaData] = useState<{ id: number; nome: string; email: string; unidade_id: string; ativo: boolean } | null>(null);

  const [modalResetSenhaOpen, setModalResetSenhaOpen] = useState(false);
  const [resetSenhaData, setResetSenhaData] = useState<{ id: number; nome: string; novaSenha: string } | null>(null);

  const [modalInspecionarLojistaOpen, setModalInspecionarLojistaOpen] = useState(false);
  const [detalhesLojista, setDetalhesLojista] = useState<any | null>(null);
  const [loadingDetalhesLojista, setLoadingDetalhesLojista] = useState(false);

  const [modalDetalhesVendaOpen, setModalDetalhesVendaOpen] = useState(false);
  const [detalhesVenda, setDetalhesVenda] = useState<any | null>(null);
  const [loadingDetalhesVenda, setLoadingDetalhesVenda] = useState(false);

  // Branch Modals
  const [modalDetalhesFilialOpen, setModalDetalhesFilialOpen] = useState(false);
  const [detalhesFilial, setDetalhesFilial] = useState<any | null>(null);

  const [modalVincularLojistaOpen, setModalVincularLojistaOpen] = useState(false);
  const [targetFilialParaVinculo, setTargetFilialParaVinculo] = useState<{ id: number; nome: string } | null>(null);
  const [selectedLojistaIdParaVinculo, setSelectedLojistaIdParaVinculo] = useState<string>('');

  useEffect(() => {
    fetchTodosDados();
  }, []);

  const fetchTodosDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAdminDashboard(),
        fetchUnidades(),
        fetchTodasVendas(),
        fetchTodosProdutos()
      ]);
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodosDados();
    setRefreshing(false);
  };

  const fetchAdminDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnidades = async () => {
    try {
      const res = await api.get('/unidades');
      setUnidades(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodasVendas = async () => {
    try {
      const res = await api.get('/admin/vendas');
      setTodasVendas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodosProdutos = async () => {
    try {
      const res = await api.get('/admin/produtos');
      setTodosProdutos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Unit Actions
  const criarUnidade = async () => {
    if (!novaUnidade.trim()) return;
    try {
      await api.post('/unidades', { nome: novaUnidade });
      setNovaUnidade('');
      fetchUnidades();
      fetchAdminDashboard();
    } catch (err) {
      alert('Erro ao criar unidade');
    }
  };

  const salvarEdicaoUnidade = async (id: number) => {
    if (!editUnidadeNome.trim()) return;
    try {
      await api.put(`/unidades/${id}`, { nome: editUnidadeNome });
      setEditingUnidade(null);
      fetchUnidades();
      fetchAdminDashboard();
    } catch (err) {
      alert('Erro ao atualizar unidade');
    }
  };

  const abrirInspecaoFilial = (filialId: number) => {
    const filial = unidades.find(u => u.id === filialId);
    if (!filial) return;
    const metrica = (dashboardData.unidadesMetricas || []).find((m: any) => m.id === filialId);
    const lojistasDaFilial = (dashboardData.usuarios || []).filter((u: any) => u.unidade_id === filialId);
    const produtosDaFilial = todosProdutos.filter((p: any) => {
      const lojista = (dashboardData.usuarios || []).find((u: any) => u.usuario_id === p.usuarios_id);
      return lojista && lojista.unidade_id === filialId;
    });
    const vendasDaFilial = todasVendas.filter((v: any) => {
      const lojista = (dashboardData.usuarios || []).find((u: any) => u.usuario_id === v.usuarios_id);
      return lojista && lojista.unidade_id === filialId;
    });

    setDetalhesFilial({
      ...filial,
      metrica,
      lojistas: lojistasDaFilial,
      produtos: produtosDaFilial,
      vendas: vendasDaFilial
    });
    setModalDetalhesFilialOpen(true);
  };

  const abrirModalVincular = (filial: { id: number; nome: string }) => {
    setTargetFilialParaVinculo(filial);
    setSelectedLojistaIdParaVinculo('');
    setModalVincularLojistaOpen(true);
  };

  const handleVincularLojista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFilialParaVinculo || !selectedLojistaIdParaVinculo) return;
    try {
      await api.put('/usuarios/atualizar', {
        id: Number(selectedLojistaIdParaVinculo),
        unidade_id: targetFilialParaVinculo.id
      });
      alert(`Lojista vinculado à filial "${targetFilialParaVinculo.nome}" com sucesso!`);
      setModalVincularLojistaOpen(false);
      setSelectedLojistaIdParaVinculo('');
      fetchTodosDados();
    } catch (err: any) {
      alert(err.response?.data?.erro || err.response?.data?.mensagem || 'Erro ao vincular lojista.');
    }
  };

  // Seller Actions
  const handleCriarLojista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoLojistaData.nome || !novoLojistaData.email || !novoLojistaData.senha) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    try {
      await api.post('/admin/usuarios', {
        nome: novoLojistaData.nome,
        email: novoLojistaData.email,
        senha: novoLojistaData.senha,
        unidade_id: novoLojistaData.unidade_id ? Number(novoLojistaData.unidade_id) : null
      });
      setModalNovoLojistaOpen(false);
      setNovoLojistaData({ nome: '', email: '', senha: '', unidade_id: '' });
      fetchAdminDashboard();
    } catch (err: any) {
      alert(err.response?.data?.erro || 'Erro ao cadastrar lojista.');
    }
  };

  const handleSalvarEdicaoLojista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLojistaData) return;
    try {
      await api.put('/usuarios/atualizar', {
        id: editLojistaData.id,
        nome: editLojistaData.nome,
        email: editLojistaData.email,
        unidade_id: editLojistaData.unidade_id ? Number(editLojistaData.unidade_id) : null,
        ativo: editLojistaData.ativo
      });
      setModalEditarLojistaOpen(false);
      setEditLojistaData(null);
      fetchAdminDashboard();
    } catch (err: any) {
      alert(err.response?.data?.erro || err.response?.data?.mensagem || 'Erro ao atualizar lojista.');
    }
  };

  const handleResetSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetSenhaData || !resetSenhaData.novaSenha) return;
    try {
      await api.put(`/admin/usuarios/${resetSenhaData.id}/senha`, {
        novaSenha: resetSenhaData.novaSenha
      });
      alert('Senha redefinida com sucesso!');
      setModalResetSenhaOpen(false);
      setResetSenhaData(null);
    } catch (err: any) {
      alert(err.response?.data?.erro || 'Erro ao redefinir senha.');
    }
  };

  const toggleUserStatus = async (userId: number, currentAtivo: boolean) => {
    try {
      await api.put('/usuarios/atualizar', { id: userId, ativo: !currentAtivo });
      fetchAdminDashboard();
    } catch (err) {
      alert('Erro ao alterar status');
    }
  };

  const abrirInspecaoLojista = async (userId: number) => {
    setLoadingDetalhesLojista(true);
    setModalInspecionarLojistaOpen(true);
    try {
      const res = await api.get(`/admin/usuarios/${userId}/detalhes`);
      setDetalhesLojista(res.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar detalhes do lojista.');
      setModalInspecionarLojistaOpen(false);
    } finally {
      setLoadingDetalhesLojista(false);
    }
  };

  const abrirDetalhesVenda = async (vendaId: number) => {
    setLoadingDetalhesVenda(true);
    setModalDetalhesVendaOpen(true);
    try {
      const res = await api.get(`/admin/vendas/${vendaId}`);
      setDetalhesVenda(res.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar detalhes da venda.');
      setModalDetalhesVendaOpen(false);
    } finally {
      setLoadingDetalhesVenda(false);
    }
  };

  // CSV Exports
  const exportarLojistasCSV = () => {
    if (!dashboardData.usuarios || dashboardData.usuarios.length === 0) return;
    const headers = ['ID', 'Lojista', 'E-mail', 'Status', 'Unidade', 'Qtd Produtos', 'Patrimônio em Estoque (R$)', 'Qtd Vendas', 'Faturamento Total (R$)'];
    const rows = dashboardData.usuarios.map((u: any) => [
      u.usuario_id,
      `"${(u.nome || '').replace(/"/g, '""')}"`,
      u.email,
      u.ativo ? 'Ativo' : 'Inativo',
      `"${u.unidade_nome || 'Sem Unidade'}"`,
      u.total_produtos,
      Number(u.valor_total_estoque).toFixed(2),
      u.total_vendas,
      Number(u.valor_total_vendido).toFixed(2)
    ]);
    downloadCSV(headers, rows, `kamikase_lojistas_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportarUnidadesCSV = () => {
    if (unidades.length === 0) return;
    const headers = ['ID Filial', 'Nome da Filial', 'Qtd Lojistas', 'Qtd Produtos', 'Total de Vendas', 'Faturamento Total (R$)'];
    const rows = unidades.map(u => {
      const metrica = (dashboardData.unidadesMetricas || []).find((m: any) => m.id === u.id);
      return [
        u.id,
        `"${(u.nome || '').replace(/"/g, '""')}"`,
        metrica?.total_lojistas || 0,
        metrica?.total_produtos || 0,
        metrica?.total_vendas || 0,
        Number(metrica?.faturamento_total || 0).toFixed(2)
      ];
    });
    downloadCSV(headers, rows, `kamikase_filiais_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportarVendasCSV = () => {
    if (todasVendas.length === 0) return;
    const headers = ['ID Venda', 'Data/Hora', 'Lojista', 'E-mail', 'Unidade', 'Forma Pagamento', 'Parcelas', 'Qtd Itens', 'Desconto (R$)', 'Valor Total (R$)'];
    const rows = todasVendas.map((v: any) => [
      v.id,
      new Date(v.created_at).toLocaleString('pt-BR'),
      `"${(v.lojista_nome || '').replace(/"/g, '""')}"`,
      v.lojista_email,
      `"${v.unidade_nome || 'Sem Unidade'}"`,
      v.forma_pagamento,
      v.parcelas || 1,
      v.total_itens,
      Number(v.desconto || 0).toFixed(2),
      Number(v.valor_total).toFixed(2)
    ]);
    downloadCSV(headers, rows, `kamikase_vendas_globais_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportarProdutosCSV = () => {
    if (todosProdutos.length === 0) return;
    const headers = ['ID Produto', 'Nome', 'Categoria', 'Lojista', 'Unidade', 'Estoque', 'Preço Unitário (R$)'];
    const rows = todosProdutos.map((p: any) => [
      p.id,
      `"${(p.nome || '').replace(/"/g, '""')}"`,
      `"${(p.categoria_nome || 'Sem Categoria').replace(/"/g, '""')}"`,
      `"${(p.lojista_nome || '').replace(/"/g, '""')}"`,
      `"${p.unidade_nome || 'Sem Unidade'}"`,
      p.estoque,
      Number(p.preco).toFixed(2)
    ]);
    downloadCSV(headers, rows, `kamikase_inventario_global_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  // Filtered sellers
  const filteredUsuarios = useMemo(() => {
    let list = dashboardData.usuarios ? [...dashboardData.usuarios] : [];
    if (searchLojista.trim()) {
      const q = searchLojista.toLowerCase();
      list = list.filter((u: any) => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (filtroUnidadeLojista !== 'todos') {
      list = list.filter((u: any) => String(u.unidade_id) === filtroUnidadeLojista);
    }
    if (filtroStatusLojista !== 'todos') {
      const isAtivo = filtroStatusLojista === 'ativos';
      list = list.filter((u: any) => !!u.ativo === isAtivo);
    }
    return list.sort((a: any, b: any) => {
      const aVal = sortField === 'nome' ? a[sortField] : Number(a[sortField]);
      const bVal = sortField === 'nome' ? b[sortField] : Number(b[sortField]);
      if (sortField === 'nome') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [dashboardData.usuarios, searchLojista, filtroUnidadeLojista, filtroStatusLojista, sortField, sortDir]);

  // Filtered branches
  const filteredUnidades = useMemo(() => {
    if (!searchFilial.trim()) return unidades;
    const q = searchFilial.toLowerCase();
    return unidades.filter(u => u.nome.toLowerCase().includes(q));
  }, [unidades, searchFilial]);

  // Filtered sales
  const filteredVendas = useMemo(() => {
    let list = [...todasVendas];
    if (searchVendas.trim()) {
      const q = searchVendas.toLowerCase();
      list = list.filter(v => 
        (v.lojista_nome && v.lojista_nome.toLowerCase().includes(q)) ||
        (v.lojista_email && v.lojista_email.toLowerCase().includes(q)) ||
        String(v.id).includes(q)
      );
    }
    if (filtroPagamentoVendas !== 'todos') {
      list = list.filter(v => v.forma_pagamento === filtroPagamentoVendas);
    }
    return list;
  }, [todasVendas, searchVendas, filtroPagamentoVendas]);

  // Filtered products
  const filteredProdutos = useMemo(() => {
    let list = [...todosProdutos];
    if (searchProdutos.trim()) {
      const q = searchProdutos.toLowerCase();
      list = list.filter(p => 
        p.nome.toLowerCase().includes(q) || 
        (p.lojista_nome && p.lojista_nome.toLowerCase().includes(q)) ||
        (p.categoria_nome && p.categoria_nome.toLowerCase().includes(q))
      );
    }
    if (filtroEstoqueProdutos === 'critico') {
      list = list.filter(p => p.estoque > 0 && p.estoque <= 5);
    } else if (filtroEstoqueProdutos === 'esgotado') {
      list = list.filter(p => p.estoque <= 0);
    }
    return list;
  }, [todosProdutos, searchProdutos, filtroEstoqueProdutos]);

  // Global KPIs
  const globalTotalUsers = dashboardData.usuarios?.length || 0;
  const globalAtivos = Number(dashboardData.global?.usuarios?.ativos || globalTotalUsers);
  const globalInativos = Number(dashboardData.global?.usuarios?.inativos || 0);
  const globalTotalProdutos = Number(dashboardData.global?.produtos?.total || 0);
  const globalEstoqueCritico = Number(dashboardData.global?.produtos?.estoque_critico || 0);
  const globalValorVendido = Number(dashboardData.global?.vendas?.valor || 0);
  const globalTotalVendas = Number(dashboardData.global?.vendas?.total || 0);
  const globalTicketMedio = Number(dashboardData.global?.vendas?.ticket_medio || 0);
  const globalEstoqueValor = Number(dashboardData.global?.produtos?.valor || 0);
  const globalTotalUnidades = Number(dashboardData.global?.unidades?.total || unidades.length || 0);

  // Branch statistics
  const topFilial = useMemo(() => {
    const metrics = dashboardData.unidadesMetricas || [];
    if (metrics.length === 0) return null;
    return [...metrics].sort((a: any, b: any) => Number(b.faturamento_total || 0) - Number(a.faturamento_total || 0))[0];
  }, [dashboardData.unidadesMetricas]);

  const mediaFaturamentoPorFilial = useMemo(() => {
    if (globalTotalUnidades === 0) return 0;
    return globalValorVendido / globalTotalUnidades;
  }, [globalValorVendido, globalTotalUnidades]);

  const topSeller = dashboardData.usuarios?.length > 0 
    ? [...dashboardData.usuarios].sort((a, b) => Number(b.valor_total_vendido) - Number(a.valor_total_vendido))[0]
    : null;

  // Recent 5 sales for quick overview table
  const recentVendas = useMemo(() => {
    return todasVendas.slice(0, 5);
  }, [todasVendas]);

  return (
    <div className="admin-container page-transition">
      {/* Top Navbar */}
      <header className="app-topbar admin-topbar">
        <div className="topbar-brand-group">
          <div className="topbar-logo-icon admin">
            <Building size={22} />
          </div>
          <div>
            <div className="topbar-brand-title">
              Kamikase <span>ADMIN</span>
            </div>
            <div className="topbar-brand-subtitle admin-badge">
              Diretoria Executiva & Auditoria
            </div>
          </div>
        </div>

        {/* Action Group */}
        <div className="topbar-actions-group">
          <button 
            onClick={handleRefresh} 
            className="topbar-action-btn hover-lift" 
            title="Atualizar dados do servidor"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>

          <div className="topbar-divider" />

          <ThemeToggle />

          <div className="topbar-divider" />

          <div className="topbar-user-capsule">
            <div className="topbar-user-avatar admin">
              👑
            </div>
            <div className="topbar-user-meta">
              <span className="topbar-user-name">{userName}</span>
              <span className="topbar-user-role admin">Super Admin</span>
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

      {/* Admin Navigation Tabs Container */}
      <div className="admin-tabs-container">
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <TrendingUp size={16} /> <span>Visão Executiva</span>
          </button>
          <button className={`admin-tab ${activeTab === 'sellers' ? 'active' : ''}`} onClick={() => setActiveTab('sellers')}>
            <Users size={16} /> <span>Lojistas ({globalTotalUsers})</span>
          </button>
          <button className={`admin-tab ${activeTab === 'units' ? 'active' : ''}`} onClick={() => setActiveTab('units')}>
            <Building size={16} /> <span>Filiais ({globalTotalUnidades})</span>
          </button>
          <button className={`admin-tab ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
            <CreditCard size={16} /> <span>Auditoria de Vendas ({todasVendas.length})</span>
          </button>
          <button className={`admin-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <Package size={16} /> <span>Inventário Global ({todosProdutos.length})</span>
          </button>
        </div>
      </div>

      <div className="admin-main">
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <div className="btn-spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }} />
            Carregando inteligência de negócios do sistema...
          </div>
        ) : (
          <>
            {/* ===================== TAB 1: VISÃO EXECUTIVA ===================== */}
            {activeTab === 'overview' && (
              <div className="view-transition">
                {/* Executive Header Banner */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '24px',
                  padding: '20px 24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Activity size={20} style={{ color: 'var(--accent-light)' }} />
                      <h2 style={{ margin: 0, fontSize: '20px' }}>Painel de Inteligência Executiva</h2>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                      Consolidação financeira em tempo real de todas as filiais e operadores ativos.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
                      <Clock size={14} /> Atualizado às {lastSyncTime || '--:--'}
                    </span>
                    <GlowButton onClick={() => setModalNovoLojistaOpen(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                      <Plus size={15} /> Novo Lojista
                    </GlowButton>
                    <button onClick={exportarVendasCSV} className="btn-icon-admin hover-lift" style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', gap: '6px', display: 'flex' }}>
                      <Download size={15} /> Exportar Relatório
                    </button>
                  </div>
                </div>

                {/* 4 Hero KPI Cards */}
                <div className="stat-grid-admin">
                  {/* Card 1: Faturamento Global */}
                  <div className="stat-card-admin revenue hover-lift">
                    <div>
                      <div className="stat-card-admin-label">Faturamento Consolidado</div>
                      <div className="stat-card-admin-value" style={{ color: '#fcd34d' }}>
                        <AnimatedCounter value={globalValorVendido} prefix="R$ " decimals={2} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        Movimentado em {globalTotalVendas} transações
                      </span>
                    </div>
                    <div className="stat-icon-admin" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>
                      <ShoppingBag size={26} />
                    </div>
                  </div>

                  {/* Card 2: Ticket Médio */}
                  <div className="stat-card-admin users hover-lift">
                    <div>
                      <div className="stat-card-admin-label">Ticket Médio por Venda</div>
                      <div className="stat-card-admin-value" style={{ color: '#60a5fa' }}>
                        <AnimatedCounter value={globalTicketMedio} prefix="R$ " decimals={2} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--accent-light)' }}>
                        Média geral por operação
                      </span>
                    </div>
                    <div className="stat-icon-admin" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
                      <TrendingUp size={26} />
                    </div>
                  </div>

                  {/* Card 3: Patrimônio em Estoque */}
                  <div className="stat-card-admin stock hover-lift">
                    <div>
                      <div className="stat-card-admin-label">Patrimônio em Estoque</div>
                      <div className="stat-card-admin-value text-accent">
                        <AnimatedCounter value={globalEstoqueValor} prefix="R$ " decimals={2} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        {globalTotalProdutos} itens cadastrados na rede
                      </span>
                    </div>
                    <div className="stat-icon-admin" style={{ background: 'rgba(20, 184, 166, 0.12)', color: '#2dd4bf' }}>
                      <Package size={26} />
                    </div>
                  </div>

                  {/* Card 4: Rede & Filiais */}
                  <div className="stat-card-admin categories hover-lift">
                    <div>
                      <div className="stat-card-admin-label">Rede de Lojistas & Filiais</div>
                      <div className="stat-card-admin-value" style={{ color: '#f472b6' }}>
                        {globalTotalUsers} Lojistas
                      </div>
                      <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>
                        {globalAtivos} ativos {globalInativos > 0 ? `• ${globalInativos} inativos ` : ''}em {globalTotalUnidades} filiais
                      </span>
                    </div>
                    <div className="stat-icon-admin" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6' }}>
                      <Users size={26} />
                    </div>
                  </div>
                </div>

                {/* 2x2 Grid of Executive Analytics Charts */}
                <div className="admin-chart-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
                  <UnitRevenueBarChart data={dashboardData.unidadesMetricas || []} />
                  <PaymentMethodDonutChart data={dashboardData.pagamentosMetricas || []} />
                  <TopSellersRanking sellers={dashboardData.usuarios || []} />
                  <InventoryHealthCard total={globalTotalProdutos} critico={globalEstoqueCritico} estoqueValor={globalEstoqueValor} />
                </div>

                {/* Live Recent Transactions Panel */}
                <div className="content-panel-admin" style={{ marginTop: '20px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                      <h3 style={{ margin: 0, fontSize: '16px' }}>Últimas Transações Registradas na Plataforma</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('sales')}
                      className="btn-icon-admin hover-lift"
                      style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', color: 'var(--primary-hover)' }}
                    >
                      Ver todas as {todasVendas.length} vendas <ArrowRight size={14} />
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-admin" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Data / Hora</th>
                          <th>Lojista</th>
                          <th>Filial</th>
                          <th>Pagamento</th>
                          <th>Itens</th>
                          <th>Valor Total</th>
                          <th style={{ textAlign: 'center' }}>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentVendas.length > 0 ? recentVendas.map((v: any) => (
                          <tr key={v.id}>
                            <td style={{ color: 'var(--text-dim)', fontWeight: 600 }}>#{v.id}</td>
                            <td style={{ fontSize: '12px' }}>{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                            <td>
                              <strong>{v.lojista_nome}</strong>
                            </td>
                            <td>
                              <span style={{ color: v.unidade_nome ? '#a78bfa' : 'var(--text-dim)', fontSize: '12px' }}>
                                {v.unidade_nome || '—'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-surface)' }}>
                                {v.forma_pagamento}
                              </span>
                            </td>
                            <td>{v.total_itens} un.</td>
                            <td className="highlight-text" style={{ fontSize: '13px' }}>
                              R$ {Number(v.valor_total).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                onClick={() => abrirDetalhesVenda(v.id)}
                                className="btn-icon-admin hover-lift"
                                title="Ver cupom"
                                style={{ color: 'var(--primary-hover)', padding: '4px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <FileText size={14} /> Cupom
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>Nenhuma venda registrada até o momento.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 2: GESTÃO DE LOJISTAS ===================== */}
            {activeTab === 'sellers' && (
              <div className="view-transition">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2>Gestão Centralizada de Lojistas</h2>
                    <p style={{ margin: 0 }}>Gerencie acessos, redefina senhas, altere filiais e audite cada operador.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <GlowButton onClick={() => setModalNovoLojistaOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={16} /> Cadastrar Lojista
                    </GlowButton>
                    <button onClick={exportarLojistasCSV} className="btn-icon-admin hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px' }}>
                      <Download size={15} /> Exportar CSV
                    </button>
                  </div>
                </div>

                {/* Filter bar */}
                <div className="admin-filter-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
                    <Search size={16} style={{ color: 'var(--text-dim)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchLojista}
                      onChange={e => setSearchLojista(e.target.value)}
                      style={{ height: '38px', padding: '8px 12px' }}
                    />
                  </div>

                  <select 
                    className="form-input" 
                    value={filtroUnidadeLojista} 
                    onChange={e => setFiltroUnidadeLojista(e.target.value)}
                    style={{ height: '38px', padding: '8px 12px', minWidth: '160px' }}
                  >
                    <option value="todos">Todas as Filiais</option>
                    {unidades.map(u => <option key={u.id} value={String(u.id)}>{u.nome}</option>)}
                  </select>

                  <select 
                    className="form-input" 
                    value={filtroStatusLojista} 
                    onChange={e => setFiltroStatusLojista(e.target.value)}
                    style={{ height: '38px', padding: '8px 12px', minWidth: '140px' }}
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="ativos">Apenas Ativos</option>
                    <option value="inativos">Apenas Inativos</option>
                  </select>
                </div>

                {/* Table */}
                <div className="content-panel-admin" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-admin" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>Lojista {getSortIcon('nome')}</th>
                          <th>Filial / Unidade</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                          <th onClick={() => handleSort('total_produtos')} style={{ cursor: 'pointer' }}>Produtos {getSortIcon('total_produtos')}</th>
                          <th onClick={() => handleSort('valor_total_estoque')} style={{ cursor: 'pointer' }}>Estoque (R$) {getSortIcon('valor_total_estoque')}</th>
                          <th onClick={() => handleSort('total_vendas')} style={{ cursor: 'pointer' }}>Vendas {getSortIcon('total_vendas')}</th>
                          <th onClick={() => handleSort('valor_total_vendido')} style={{ cursor: 'pointer' }}>Faturamento {getSortIcon('valor_total_vendido')}</th>
                          <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsuarios.length > 0 ? filteredUsuarios.map((u: any) => (
                          <tr key={u.usuario_id}>
                            <td style={{ color: 'var(--text-dim)' }}>#{u.usuario_id}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="table-admin-avatar">{u.nome.charAt(0)}</div>
                                <div>
                                  <div style={{ fontWeight: 600 }}>{u.nome}</div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{u.email}</div>
                                </div>
                                {topSeller && u.usuario_id === topSeller.usuario_id && Number(u.valor_total_vendido) > 0 && (
                                  <span className="badge-performance top" title="Maior faturamento" style={{ fontSize: '11px' }}>🔥 Top</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span style={{ color: u.unidade_nome ? '#a78bfa' : 'var(--text-dim)', fontSize: '13px' }}>
                                {u.unidade_nome ? `📍 ${u.unidade_nome}` : '—'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className={`badge-status ${u.ativo ? 'active' : 'inactive'}`}>
                                  <span className="status-dot" />{u.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                                <ToggleSwitch checked={!!u.ativo} onChange={() => toggleUserStatus(u.usuario_id, !!u.ativo)} />
                              </div>
                            </td>
                            <td>{u.total_produtos}</td>
                            <td className="highlight-text-green">R$ {Number(u.valor_total_estoque).toFixed(2)}</td>
                            <td>{u.total_vendas}</td>
                            <td className="highlight-text">R$ {Number(u.valor_total_vendido).toFixed(2)}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button 
                                  onClick={() => abrirInspecaoLojista(u.usuario_id)}
                                  className="btn-icon-admin hover-lift" 
                                  title="Auditar / Ver Detalhes do Lojista"
                                  style={{ color: '#06b6d4', padding: '6px' }}
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditLojistaData({
                                      id: u.usuario_id,
                                      nome: u.nome,
                                      email: u.email,
                                      unidade_id: u.unidade_id ? String(u.unidade_id) : '',
                                      ativo: !!u.ativo
                                    });
                                    setModalEditarLojistaOpen(true);
                                  }}
                                  className="btn-icon-admin hover-lift" 
                                  title="Editar Lojista"
                                  style={{ color: '#8b5cf6', padding: '6px' }}
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setResetSenhaData({ id: u.usuario_id, nome: u.nome, novaSenha: '' });
                                    setModalResetSenhaOpen(true);
                                  }}
                                  className="btn-icon-admin hover-lift" 
                                  title="Redefinir Senha do Lojista"
                                  style={{ color: '#f59e0b', padding: '6px' }}
                                >
                                  <Key size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Nenhum lojista encontrado com os filtros selecionados.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 3: GESTÃO DE FILIAIS (TOTALMENTE EXPANDIDA) ===================== */}
            {activeTab === 'units' && (
              <div className="view-transition">
                {/* Branch KPIs */}
                <div className="stat-grid-admin" style={{ marginBottom: '24px' }}>
                  <div className="stat-card-admin users hover-lift">
                    <div>
                      <div className="stat-card-admin-label">Total de Filiais Ativas</div>
                      <div className="stat-card-admin-value" style={{ color: '#60a5fa' }}>
                        <AnimatedCounter value={globalTotalUnidades} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Polos comerciais operando</span>
                    </div>
                    <div className="stat-icon-admin" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
                      <Building size={26} />
                    </div>
                  </div>

                  <div className="stat-card-admin revenue hover-lift">
                    <div>
                      <div className="stat-card-admin-label">Filial Líder em Vendas</div>
                      <div className="stat-card-admin-value" style={{ color: '#fcd34d', fontSize: '20px' }}>
                        {topFilial ? topFilial.unidade_nome : '—'}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--accent-light)' }}>
                        R$ {Number(topFilial?.faturamento_total || 0).toFixed(2)} faturados
                      </span>
                    </div>
                    <div className="stat-icon-admin" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>
                      <Sparkles size={26} />
                    </div>
                  </div>

                  <div className="stat-card-admin stock hover-lift">
                    <div>
                      <div className="stat-card-admin-label">Média Faturada por Filial</div>
                      <div className="stat-card-admin-value text-accent">
                        <AnimatedCounter value={mediaFaturamentoPorFilial} prefix="R$ " decimals={2} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Receita média por unidade</span>
                    </div>
                    <div className="stat-icon-admin" style={{ background: 'rgba(20, 184, 166, 0.12)', color: '#2dd4bf' }}>
                      <DollarSign size={26} />
                    </div>
                  </div>

                  <div className="stat-card-admin categories hover-lift">
                    <div>
                      <div className="stat-card-admin-label">Lojistas Alocados</div>
                      <div className="stat-card-admin-value" style={{ color: '#f472b6' }}>
                        <AnimatedCounter value={globalAtivos} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#34d399' }}>
                        {globalTotalUnidades > 0 ? (globalAtivos / globalTotalUnidades).toFixed(1) : 0} média por filial
                      </span>
                    </div>
                    <div className="stat-icon-admin" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6' }}>
                      <UserCheck size={26} />
                    </div>
                  </div>
                </div>

                {/* Toolbar & Create Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '24px',
                  padding: '18px 24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
                    <Search size={16} style={{ color: 'var(--text-dim)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Filtrar filial por nome..."
                      value={searchFilial}
                      onChange={e => setSearchFilial(e.target.value)}
                      style={{ height: '38px', padding: '8px 12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Nome da nova filial..."
                        value={novaUnidade} 
                        onChange={e => setNovaUnidade(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && criarUnidade()}
                        style={{ height: '38px', padding: '8px 12px', minWidth: '200px' }}
                      />
                      <GlowButton className="btn btn-primary" onClick={criarUnidade} style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} /> Criar Filial
                      </GlowButton>
                    </div>

                    <button onClick={exportarUnidadesCSV} className="btn-icon-admin hover-lift" style={{ height: '38px', padding: '0 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={15} /> Exportar CSV
                    </button>
                  </div>
                </div>

                {/* Grid of Enterprise Branch Cards */}
                <div className="branch-grid">
                  {filteredUnidades.length > 0 ? filteredUnidades.map((u) => {
                    const metrica = (dashboardData.unidadesMetricas || []).find((m: any) => m.id === u.id);
                    const lojistasDaUnidade = (dashboardData.usuarios || []).filter((usr: any) => usr.unidade_id === u.id);
                    const rev = Number(metrica?.faturamento_total || 0);
                    const percentGlobal = globalValorVendido > 0 ? ((rev / globalValorVendido) * 100).toFixed(1) : '0';

                    return (
                      <div key={u.id} className="branch-card hover-lift animate-slide-up">
                        {/* Branch Card Header */}
                        <div className="branch-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: 'var(--radius-md)',
                              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.1))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--secondary)'
                            }}>
                              <Building size={24} />
                            </div>
                            <div>
                              {editingUnidade === u.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input 
                                    type="text" 
                                    className="form-input" 
                                    value={editUnidadeNome}
                                    onChange={e => setEditUnidadeNome(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && salvarEdicaoUnidade(u.id)}
                                    style={{ padding: '4px 8px', height: 'auto', width: '150px' }}
                                    autoFocus
                                  />
                                  <button onClick={() => salvarEdicaoUnidade(u.id)} className="btn-icon-admin" style={{ color: '#10b981' }}><CheckCircle size={16} /></button>
                                  <button onClick={() => setEditingUnidade(null)} className="btn-icon-admin" style={{ color: '#ef4444' }}><X size={16} /></button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{u.nome}</h3>
                                  <button onClick={() => { setEditingUnidade(u.id); setEditUnidadeNome(u.nome); }} className="btn-icon-admin" style={{ padding: '2px', border: 'none' }} title="Editar Nome">
                                    <Edit2 size={13} style={{ color: 'var(--text-dim)' }} />
                                  </button>
                                </div>
                              )}
                              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Filial #{u.id} • Polo Ativo</span>
                            </div>
                          </div>

                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            ● Operando
                          </span>
                        </div>

                        {/* Revenue Bar in Card */}
                        <div style={{ margin: '10px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Faturamento da Filial</span>
                            <strong style={{ color: 'var(--accent-light)' }}>R$ {rev.toFixed(2)} ({percentGlobal}%)</strong>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div 
                              style={{
                                width: `${Math.min(100, Math.max(5, Number(percentGlobal)))}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                                borderRadius: '4px'
                              }} 
                            />
                          </div>
                        </div>

                        {/* 4 Stats Grid in Card */}
                        <div className="branch-card-stats">
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Lojistas Vinculados</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-bright)' }}>
                              {metrica?.total_lojistas || lojistasDaUnidade.length || 0}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Produtos Ativos</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-bright)' }}>
                              {metrica?.total_produtos || 0}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Vendas Registradas</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-bright)' }}>
                              {metrica?.total_vendas || 0}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Ticket Médio</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>
                              R$ {metrica?.total_vendas > 0 ? (rev / metrica.total_vendas).toFixed(0) : '0'}
                            </div>
                          </div>
                        </div>

                        {/* Sellers list in card */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Operadores nesta filial ({lojistasDaUnidade.length}):
                          </div>
                          <div className="branch-seller-avatar-list">
                            {lojistasDaUnidade.length > 0 ? lojistasDaUnidade.slice(0, 4).map((usr: any) => (
                              <span 
                                key={usr.usuario_id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--text-main)'
                                }}
                              >
                                👤 {usr.nome}
                              </span>
                            )) : (
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Nenhum lojista alocado</span>
                            )}
                            {lojistasDaUnidade.length > 4 && (
                              <span style={{ fontSize: '11px', color: 'var(--primary-hover)', fontWeight: 700 }}>
                                +{lojistasDaUnidade.length - 4} mais
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons on card */}
                        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                          <button 
                            onClick={() => abrirInspecaoFilial(u.id)}
                            className="btn-icon-admin hover-lift"
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}
                          >
                            <Eye size={15} /> Inspecionar Filial
                          </button>
                          <button 
                            onClick={() => abrirModalVincular(u)}
                            className="btn-icon-admin hover-lift"
                            style={{ padding: '8px 12px', borderRadius: '8px', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}
                            title="Alocar Lojista a esta Filial"
                          >
                            <UserPlus size={15} /> Alocar
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
                      <Building size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                      <p>Nenhuma filial encontrada com o termo pesquisado.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================== TAB 4: AUDITORIA GLOBAL DE VENDAS ===================== */}
            {activeTab === 'sales' && (
              <div className="view-transition">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2>Auditoria Global de Vendas</h2>
                    <p style={{ margin: 0 }}>Histórico de todas as transações realizadas no sistema com cupons e itens detalhados.</p>
                  </div>
                  <button onClick={exportarVendasCSV} className="btn-icon-admin hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px' }}>
                    <Download size={15} /> Exportar Vendas CSV
                  </button>
                </div>

                <div className="admin-filter-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
                    <Search size={16} style={{ color: 'var(--text-dim)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Buscar por lojista, email ou ID da venda..."
                      value={searchVendas}
                      onChange={e => setSearchVendas(e.target.value)}
                      style={{ height: '38px', padding: '8px 12px' }}
                    />
                  </div>

                  <select 
                    className="form-input" 
                    value={filtroPagamentoVendas} 
                    onChange={e => setFiltroPagamentoVendas(e.target.value)}
                    style={{ height: '38px', padding: '8px 12px', minWidth: '160px' }}
                  >
                    <option value="todos">Todos os Pagamentos</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                  </select>
                </div>

                <div className="content-panel-admin" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-admin" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>ID Venda</th>
                          <th>Data / Hora</th>
                          <th>Lojista / Operador</th>
                          <th>Filial</th>
                          <th>Pagamento</th>
                          <th>Itens</th>
                          <th>Desconto</th>
                          <th>Valor Total</th>
                          <th style={{ textAlign: 'center' }}>Cupom</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVendas.length > 0 ? filteredVendas.map((v: any) => (
                          <tr key={v.id}>
                            <td style={{ color: 'var(--text-dim)', fontWeight: 600 }}>#{v.id}</td>
                            <td style={{ fontSize: '13px' }}>{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                            <td>
                              <strong>{v.lojista_nome}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{v.lojista_email}</div>
                            </td>
                            <td>
                              <span style={{ color: v.unidade_nome ? '#a78bfa' : 'var(--text-dim)', fontSize: '12px' }}>
                                {v.unidade_nome || '—'}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: '12px', padding: '3px 8px', borderRadius: '6px', 
                                background: 'var(--bg-surface)', color: 'var(--text-main)' 
                              }}>
                                {v.forma_pagamento} {v.parcelas > 1 ? `(${v.parcelas}x)` : ''}
                              </span>
                            </td>
                            <td>{v.total_itens} un.</td>
                            <td style={{ color: Number(v.desconto) > 0 ? '#34d399' : 'var(--text-dim)' }}>
                              R$ {Number(v.desconto || 0).toFixed(2)}
                            </td>
                            <td className="highlight-text" style={{ fontSize: '14px' }}>
                              R$ {Number(v.valor_total).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                onClick={() => abrirDetalhesVenda(v.id)}
                                className="btn-icon-admin hover-lift"
                                title="Ver comprovante / itens da venda"
                                style={{ color: 'var(--primary-hover)', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <FileText size={16} /> Cupom
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Nenhuma venda encontrada.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 5: AUDITORIA GLOBAL DE PRODUTOS ===================== */}
            {activeTab === 'inventory' && (
              <div className="view-transition">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2>Auditoria Global de Inventário</h2>
                    <p style={{ margin: 0 }}>Todos os produtos cadastrados por todos os lojistas com monitoramento de estoque crítico.</p>
                  </div>
                  <button onClick={exportarProdutosCSV} className="btn-icon-admin hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px' }}>
                    <Download size={15} /> Exportar Inventário CSV
                  </button>
                </div>

                <div className="admin-filter-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
                    <Search size={16} style={{ color: 'var(--text-dim)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Buscar por produto, categoria ou lojista..."
                      value={searchProdutos}
                      onChange={e => setSearchProdutos(e.target.value)}
                      style={{ height: '38px', padding: '8px 12px' }}
                    />
                  </div>

                  <select 
                    className="form-input" 
                    value={filtroEstoqueProdutos} 
                    onChange={e => setFiltroEstoqueProdutos(e.target.value)}
                    style={{ height: '38px', padding: '8px 12px', minWidth: '180px' }}
                  >
                    <option value="todos">Todos os Estoques</option>
                    <option value="critico">⚠ Estoque Crítico (≤ 5 un)</option>
                    <option value="esgotado">🚫 Esgotados (0 un)</option>
                  </select>
                </div>

                <div className="content-panel-admin" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-admin" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Produto</th>
                          <th>Categoria</th>
                          <th>Lojista Dono</th>
                          <th>Filial</th>
                          <th>Preço Unitário</th>
                          <th style={{ textAlign: 'center' }}>Estoque</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProdutos.length > 0 ? filteredProdutos.map((p: any) => (
                          <tr key={p.id}>
                            <td style={{ color: 'var(--text-dim)' }}>#{p.id}</td>
                            <td>
                              <strong>{p.nome}</strong>
                              {p.descricao && <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{p.descricao}</div>}
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--secondary)' }}>
                                {p.categoria_nome || 'Sem Categoria'}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{p.lojista_nome}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{p.lojista_email}</div>
                            </td>
                            <td>
                              <span style={{ color: p.unidade_nome ? '#a78bfa' : 'var(--text-dim)', fontSize: '12px' }}>
                                {p.unidade_nome || '—'}
                              </span>
                            </td>
                            <td className="highlight-text-green" style={{ fontSize: '14px' }}>
                              R$ {Number(p.preco).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {p.estoque <= 0 ? (
                                <span className="badge-stock-danger">🚫 Esgotado</span>
                              ) : p.estoque <= 5 ? (
                                <span className="badge-stock-warning">⚠ {p.estoque} un. (Crítico)</span>
                              ) : (
                                <span className="badge-stock-ok">✓ {p.estoque} un.</span>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Nenhum produto encontrado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===================== MODAL: NOVO LOJISTA ===================== */}
      {modalNovoLojistaOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalNovoLojistaOpen(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={22} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Cadastrar Novo Lojista</h3>
              </div>
              <button onClick={() => setModalNovoLojistaOpen(false)} className="btn-icon-admin"><X size={20} /></button>
            </div>

            <form onSubmit={handleCriarLojista} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Nome Completo</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nome do lojista..."
                  value={novoLojistaData.nome}
                  onChange={e => setNovoLojistaData({...novoLojistaData, nome: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="form-label">E-mail de Acesso</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="email@empresa.com"
                  value={novoLojistaData.email}
                  onChange={e => setNovoLojistaData({...novoLojistaData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="form-label">Senha Inicial</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Senha de acesso (mínimo 6 caracteres)..."
                  value={novoLojistaData.senha}
                  onChange={e => setNovoLojistaData({...novoLojistaData, senha: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="form-label">Filial / Unidade de Atuação</label>
                <select 
                  className="form-input"
                  value={novoLojistaData.unidade_id}
                  onChange={e => setNovoLojistaData({...novoLojistaData, unidade_id: e.target.value})}
                >
                  <option value="">Sem Unidade Definida</option>
                  {unidades.map(u => <option key={u.id} value={String(u.id)}>{u.nome}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalNovoLojistaOpen(false)} className="btn-icon-admin" style={{ padding: '10px 16px', borderRadius: '8px' }}>
                  Cancelar
                </button>
                <GlowButton type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                  <Sparkles size={16} /> Cadastrar Lojista
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDITAR LOJISTA ===================== */}
      {modalEditarLojistaOpen && editLojistaData && (
        <div className="admin-modal-overlay" onClick={() => setModalEditarLojistaOpen(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit2 size={22} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Editar Lojista #{editLojistaData.id}</h3>
              </div>
              <button onClick={() => setModalEditarLojistaOpen(false)} className="btn-icon-admin"><X size={20} /></button>
            </div>

            <form onSubmit={handleSalvarEdicaoLojista} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Nome Completo</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editLojistaData.nome}
                  onChange={e => setEditLojistaData({...editLojistaData, nome: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="form-label">E-mail</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={editLojistaData.email}
                  onChange={e => setEditLojistaData({...editLojistaData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="form-label">Filial / Unidade</label>
                <select 
                  className="form-input"
                  value={editLojistaData.unidade_id}
                  onChange={e => setEditLojistaData({...editLojistaData, unidade_id: e.target.value})}
                >
                  <option value="">Sem Unidade Definida</option>
                  {unidades.map(u => <option key={u.id} value={String(u.id)}>{u.nome}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Status da Conta</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Bloqueia ou libera o acesso ao PDV</div>
                </div>
                <ToggleSwitch checked={editLojistaData.ativo} onChange={v => setEditLojistaData({...editLojistaData, ativo: v})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalEditarLojistaOpen(false)} className="btn-icon-admin" style={{ padding: '10px 16px', borderRadius: '8px' }}>
                  Cancelar
                </button>
                <GlowButton type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                  Salvar Alterações
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: RESET DE SENHA ===================== */}
      {modalResetSenhaOpen && resetSenhaData && (
        <div className="admin-modal-overlay" onClick={() => setModalResetSenhaOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={22} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Redefinir Senha</h3>
              </div>
              <button onClick={() => setModalResetSenhaOpen(false)} className="btn-icon-admin"><X size={20} /></button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Defina a nova senha de acesso para o lojista <strong>{resetSenhaData.nome}</strong>.
            </p>

            <form onSubmit={handleResetSenha} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Nova Senha</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Nova senha (mínimo 6 caracteres)..."
                  value={resetSenhaData.novaSenha}
                  onChange={e => setResetSenhaData({...resetSenhaData, novaSenha: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setModalResetSenhaOpen(false)} className="btn-icon-admin" style={{ padding: '8px 14px', borderRadius: '8px' }}>
                  Cancelar
                </button>
                <GlowButton type="submit" className="btn btn-primary" style={{ padding: '8px 18px' }}>
                  Atualizar Senha
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: INSPECIONAR LOJISTA ===================== */}
      {modalInspecionarLojistaOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalInspecionarLojistaOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Eye size={22} style={{ color: '#06b6d4' }} />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Auditoria do Lojista</h3>
              </div>
              <button onClick={() => setModalInspecionarLojistaOpen(false)} className="btn-icon-admin"><X size={20} /></button>
            </div>

            {loadingDetalhesLojista || !detalhesLojista ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="btn-spinner" style={{ margin: '0 auto 12px' }} />
                Carregando inventário e vendas do lojista...
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{detalhesLojista.nome}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{detalhesLojista.email}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: '#a78bfa' }}>📍 {detalhesLojista.unidade_nome || 'Sem Filial'}</div>
                    <span className={`badge-status ${detalhesLojista.ativo ? 'active' : 'inactive'}`} style={{ marginTop: '4px' }}>
                      {detalhesLojista.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                  📦 Catálogo de Produtos ({detalhesLojista.produtos?.length || 0} itens)
                </h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '20px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table className="table-admin" style={{ margin: 0, fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalhesLojista.produtos?.length > 0 ? detalhesLojista.produtos.map((p: any) => (
                        <tr key={p.id}>
                          <td>{p.nome}</td>
                          <td>{p.categoria_nome || '—'}</td>
                          <td className="highlight-text-green">R$ {Number(p.preco).toFixed(2)}</td>
                          <td>{p.estoque} un.</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '16px' }}>Nenhum produto cadastrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                  💳 Últimas Vendas ({detalhesLojista.vendas?.length || 0} operações)
                </h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table className="table-admin" style={{ margin: 0, fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>ID Venda</th>
                        <th>Data</th>
                        <th>Pagamento</th>
                        <th>Itens</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalhesLojista.vendas?.length > 0 ? detalhesLojista.vendas.map((v: any) => (
                        <tr key={v.id}>
                          <td>#{v.id}</td>
                          <td>{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                          <td>{v.forma_pagamento}</td>
                          <td>{v.total_itens}</td>
                          <td className="highlight-text">R$ {Number(v.valor_total).toFixed(2)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>Nenhuma venda registrada.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL: INSPECIONAR FILIAL ===================== */}
      {modalDetalhesFilialOpen && detalhesFilial && (
        <div className="admin-modal-overlay" onClick={() => setModalDetalhesFilialOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building size={24} style={{ color: 'var(--secondary)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Auditoria da Filial: {detalhesFilial.nome}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ID #{detalhesFilial.id} • Relatório Operacional Completo</span>
                </div>
              </div>
              <button onClick={() => setModalDetalhesFilialOpen(false)} className="btn-icon-admin"><X size={20} /></button>
            </div>

            {/* Quick KPI Bar inside modal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Faturamento da Filial</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-light)' }}>
                  R$ {Number(detalhesFilial.metrica?.faturamento_total || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Lojistas Alocados</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-bright)' }}>
                  {detalhesFilial.lojistas?.length || 0}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Produtos da Filial</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-bright)' }}>
                  {detalhesFilial.produtos?.length || 0}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Vendas da Filial</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#60a5fa' }}>
                  {detalhesFilial.vendas?.length || 0}
                </div>
              </div>
            </div>

            {/* Lojistas da Filial */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              👥 Lojistas Pertencentes a esta Filial ({detalhesFilial.lojistas?.length || 0})
            </h4>
            <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: '20px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table className="table-admin" style={{ margin: 0, fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Status</th>
                    <th>Produtos</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhesFilial.lojistas?.length > 0 ? detalhesFilial.lojistas.map((usr: any) => (
                    <tr key={usr.usuario_id}>
                      <td style={{ fontWeight: 600 }}>{usr.nome}</td>
                      <td style={{ color: 'var(--text-dim)' }}>{usr.email}</td>
                      <td>
                        <span className={`badge-status ${usr.ativo ? 'active' : 'inactive'}`}>
                          {usr.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>{usr.total_produtos}</td>
                      <td className="highlight-text">R$ {Number(usr.valor_total_vendido).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-dim)' }}>Nenhum lojista alocado a esta filial.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Produtos da Filial */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              📦 Produtos Disponíveis nesta Filial ({detalhesFilial.produtos?.length || 0})
            </h4>
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table className="table-admin" style={{ margin: 0, fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Lojista Dono</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhesFilial.produtos?.length > 0 ? detalhesFilial.produtos.map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.nome}</td>
                      <td>{p.categoria_nome || '—'}</td>
                      <td>{p.lojista_nome}</td>
                      <td className="highlight-text-green">R$ {Number(p.preco).toFixed(2)}</td>
                      <td>{p.estoque} un.</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-dim)' }}>Nenhum produto cadastrado para esta filial.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: VINCULAR LOJISTA A UMA FILIAL ===================== */}
      {modalVincularLojistaOpen && targetFilialParaVinculo && (
        <div className="admin-modal-overlay" onClick={() => setModalVincularLojistaOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={22} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Alocar Lojista à Filial</h3>
              </div>
              <button onClick={() => setModalVincularLojistaOpen(false)} className="btn-icon-admin"><X size={20} /></button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Selecione um lojista para transferir ou alocar para a filial <strong>"{targetFilialParaVinculo.nome}"</strong>:
            </p>

            <form onSubmit={handleVincularLojista} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Selecionar Lojista</label>
                <select 
                  className="form-input"
                  value={selectedLojistaIdParaVinculo}
                  onChange={e => setSelectedLojistaIdParaVinculo(e.target.value)}
                  required
                >
                  <option value="">Selecione um lojista...</option>
                  {(dashboardData.usuarios || []).map((usr: any) => (
                    <option key={usr.usuario_id} value={String(usr.usuario_id)}>
                      {usr.nome} ({usr.email}) {usr.unidade_nome ? `[Filial atual: ${usr.unidade_nome}]` : '[Sem filial]'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setModalVincularLojistaOpen(false)} className="btn-icon-admin" style={{ padding: '8px 14px', borderRadius: '8px' }}>
                  Cancelar
                </button>
                <GlowButton type="submit" className="btn btn-primary" style={{ padding: '8px 18px' }}>
                  Confirmar Alocação
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DETALHES DA VENDA / CUPOM ===================== */}
      {modalDetalhesVendaOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalDetalhesVendaOpen(false)}>
          <div className="admin-modal-box" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={22} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Auditoria da Venda #{detalhesVenda?.id}</h3>
              </div>
              <button onClick={() => setModalDetalhesVendaOpen(false)} className="btn-icon-admin"><X size={20} /></button>
            </div>

            {loadingDetalhesVenda || !detalhesVenda ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="btn-spinner" style={{ margin: '0 auto 12px' }} />
                Carregando itens do cupom...
              </div>
            ) : (
              <div className="receipt-paper" style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #666', paddingBottom: '10px', marginBottom: '10px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>KAMIKASE ERP & PDV</h4>
                  <p style={{ margin: 0, fontSize: '10px', color: '#555' }}>COMPROVANTE DE AUDITORIA CENTRAL</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#555' }}>
                    Venda #{detalhesVenda.id} • {new Date(detalhesVenda.created_at).toLocaleString('pt-BR')}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#555' }}>
                    Operador: {detalhesVenda.lojista_nome} ({detalhesVenda.unidade_nome || 'Sem Filial'})
                  </p>
                </div>

                <div style={{ borderBottom: '1px dashed #666', paddingBottom: '8px', marginBottom: '8px' }}>
                  <table style={{ width: '100%', textAlign: 'left', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #ccc' }}>
                        <th>Item</th>
                        <th style={{ textAlign: 'center' }}>Qtd</th>
                        <th style={{ textAlign: 'right' }}>Unit</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalhesVenda.itens?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ padding: '3px 0' }}>{item.produto_nome}</td>
                          <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
                          <td style={{ textAlign: 'right' }}>R$ {Number(item.preco_unitario).toFixed(2)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {Number(detalhesVenda.desconto) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                      <span>Desconto Aplicado:</span>
                      <span>- R$ {Number(detalhesVenda.desconto).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '4px' }}>
                    <span>TOTAL:</span>
                    <span>R$ {Number(detalhesVenda.valor_total).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginTop: '4px' }}>
                    <span>Forma de Pagamento:</span>
                    <span>{detalhesVenda.forma_pagamento} {detalhesVenda.parcelas > 1 ? `(${detalhesVenda.parcelas}x)` : ''}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
