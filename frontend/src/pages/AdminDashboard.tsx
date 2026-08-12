import { useState, useEffect, useMemo } from 'react';
import { Users, Package, ShoppingBag, LogOut, ShieldAlert, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AnimatedCounter from '../components/AnimatedCounter';
import Skeleton from '../components/Skeleton';

type SortField = 'nome' | 'total_produtos' | 'valor_total_estoque' | 'total_vendas' | 'valor_total_vendido';
type SortDir = 'asc' | 'desc';

export default function AdminDashboard() {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>({ usuarios: [], global: null });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('valor_total_vendido');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    fetchAdminData();
    document.body.classList.add('dark-admin');
    return () => document.body.classList.remove('dark-admin');
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getSortClass = (field: SortField) => {
    if (sortField !== field) return 'sortable';
    return sortDir === 'asc' ? 'sortable sorted-asc' : 'sortable sorted-desc';
  };

  const sortedUsuarios = useMemo(() => {
    if (!dashboardData.usuarios) return [];
    return [...dashboardData.usuarios].sort((a: any, b: any) => {
      const aVal = sortField === 'nome' ? a[sortField] : Number(a[sortField]);
      const bVal = sortField === 'nome' ? b[sortField] : Number(b[sortField]);
      if (sortField === 'nome') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [dashboardData.usuarios, sortField, sortDir]);

  const globalTotalUsers = dashboardData.usuarios?.length || 0;
  const globalTotalProdutos = Number(dashboardData.global?.produtos?.total || 0);
  const globalValorVendido = Number(dashboardData.global?.vendas?.valor || 0);
  const globalEstoqueValor = Number(dashboardData.global?.produtos?.valor || 0);
  const globalCategorias = Number(dashboardData.global?.categorias?.total || 0);

  // Top seller badge
  const topSeller = sortedUsuarios.length > 0 
    ? sortedUsuarios.reduce((top: any, u: any) => Number(u.valor_total_vendido) > Number(top.valor_total_vendido) ? u : top, sortedUsuarios[0])
    : null;

  return (
    <div className="admin-container page-transition">

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo-box">
            <ShieldAlert size={24} color="white" />
          </div>
          <h1 className="admin-title neon-text-warm">Kamikase ERP & PDV</h1>
        </div>
        
        <div className="admin-header-right">
          <div className="admin-user-info">
            <div className="admin-user-details">
              <div className="admin-user-name">{userName}</div>
              <div className="admin-user-role">Super Administrador</div>
            </div>
            <button onClick={handleLogout} className="btn-icon-admin" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="admin-main">
        
        <h2>Visão Global da Plataforma</h2>
        <p>Métricas consolidadas de todos os lojistas ativos no sistema.</p>

        {loading ? (
          <div className="stat-grid-admin">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="stat" />
            ))}
          </div>
        ) : (
          <div className="stat-grid-admin">
            <div className="stat-card-admin users animate-fade-in animate-stagger-1">
              <div>
                <div className="stat-card-admin-label">Lojistas Cadastrados</div>
                <div className="stat-card-admin-value"><AnimatedCounter value={globalTotalUsers} /></div>
              </div>
              <div className="stat-icon-admin" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}><Users size={24} /></div>
            </div>
            
            <div className="stat-card-admin products animate-fade-in animate-stagger-2">
              <div>
                <div className="stat-card-admin-label">Total de Produtos</div>
                <div className="stat-card-admin-value"><AnimatedCounter value={globalTotalProdutos} /></div>
              </div>
              <div className="stat-icon-admin" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}><Package size={24} /></div>
            </div>

            <div className="stat-card-admin categories animate-fade-in animate-stagger-3">
              <div>
                <div className="stat-card-admin-label">Total de Categorias</div>
                <div className="stat-card-admin-value"><AnimatedCounter value={globalCategorias} /></div>
              </div>
              <div className="stat-icon-admin" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' }}><Package size={24} /></div>
            </div>
            
            <div className="stat-card-admin stock animate-fade-in animate-stagger-4">
              <div>
                <div className="stat-card-admin-label">Patrimônio em Estoque</div>
                <div className="stat-card-admin-value text-accent">
                  <AnimatedCounter value={globalEstoqueValor} prefix="R$ " decimals={2} />
                </div>
              </div>
              <div className="stat-icon-admin" style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#2dd4bf' }}><Package size={24} /></div>
            </div>
            
            <div className="stat-card-admin revenue animate-fade-in animate-stagger-5">
              <div>
                <div className="stat-card-admin-label">Faturamento Global</div>
                <div className="stat-card-admin-value" style={{ color: '#fcd34d' }}>
                  <AnimatedCounter value={globalValorVendido} prefix="R$ " decimals={2} />
                </div>
              </div>
              <div className="stat-icon-admin" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}><ShoppingBag size={24} /></div>
            </div>
          </div>
        )}

        <div className="content-panel-admin animate-fade-in">
          <div className="panel-admin-controls">
            <h3>Desempenho por Usuário (Lojistas)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px' }}>
              <ArrowUpDown size={14} />
              <span>Clique nos cabeçalhos para ordenar</span>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '16px' }}>
                <Skeleton variant="row" count={5} />
              </div>
            ) : (
              <table className="table-admin">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th className={getSortClass('nome')} onClick={() => handleSort('nome')}>Lojista</th>
                    <th>E-mail</th>
                    <th className={getSortClass('total_produtos')} onClick={() => handleSort('total_produtos')}>Produtos</th>
                    <th className={getSortClass('valor_total_estoque')} onClick={() => handleSort('valor_total_estoque')}>Valor em Estoque</th>
                    <th className={getSortClass('total_vendas')} onClick={() => handleSort('total_vendas')}>Qtd. Vendas</th>
                    <th className={getSortClass('valor_total_vendido')} onClick={() => handleSort('valor_total_vendido')}>Faturamento Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsuarios.length > 0 ? sortedUsuarios.map((d: any) => (
                    <tr key={d.usuario_id}>
                      <td style={{ color: 'var(--text-dim)' }}>#{d.usuario_id}</td>
                      <td>
                        <div className="table-admin-user-cell">
                          <div className="table-admin-avatar">
                            {d.nome.charAt(0)}
                          </div>
                          {d.nome}
                          {topSeller && d.usuario_id === topSeller.usuario_id && Number(d.valor_total_vendido) > 0 && (
                            <span className="badge-performance top" title="Maior faturamento">
                              🔥 Top
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{d.email}</td>
                      <td>{d.total_produtos} unid.</td>
                      <td className="highlight-text-green">R$ {Number(d.valor_total_estoque).toFixed(2)}</td>
                      <td>{d.total_vendas} oper.</td>
                      <td className="highlight-text">R$ {Number(d.valor_total_vendido).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        Nenhum dado de lojista processado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
