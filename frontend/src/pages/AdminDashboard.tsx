import { useState, useEffect } from 'react';
import { UserCheck, Users, Package, ShoppingBag, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3000/api`;

export default function AdminDashboard() {
  const { token, userName, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const globalTotalUsers = dashboardData.length;
  const globalTotalProdutos = dashboardData.reduce((acc, curr) => acc + Number(curr.total_produtos), 0);
  const globalValorVendido = dashboardData.reduce((acc, curr) => acc + Number(curr.valor_total_vendido), 0);
  const globalEstoqueValor = dashboardData.reduce((acc, curr) => acc + Number(curr.valor_total_estoque), 0);

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <header style={{
        background: 'var(--bg-card)',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="auth-logo" style={{ width: '40px', height: '40px', marginBottom: 0, background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            <UserCheck size={20} />
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Admin Center</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => navigate('/system')}>
            <ArrowLeft size={16} /> Voltar para o Sistema
          </button>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>

          <div className="user-info" style={{ padding: 0 }}>
            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '14px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              A
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{userName}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Super Admin</span>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn-icon-only danger" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
        
        <h1 className="page-title" style={{ marginBottom: '32px' }}>Visão Global do Sistema</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Usuários Cadastrados</span>
              <span className="stat-value">{globalTotalUsers}</span>
            </div>
            <div className="stat-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Users size={24} />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Produtos na Plataforma</span>
              <span className="stat-value">{globalTotalProdutos}</span>
            </div>
            <div className="stat-icon-box purple"><Package size={24} /></div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Valor em Estoque</span>
              <span className="stat-value">R$ {globalEstoqueValor.toFixed(2)}</span>
            </div>
            <div className="stat-icon-box cyan"><Package size={24} /></div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Faturado Global</span>
              <span className="stat-value" style={{ color: 'var(--accent)' }}>R$ {globalValorVendido.toFixed(2)}</span>
            </div>
            <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="content-card">
          <h2 className="card-title" style={{ marginBottom: '24px' }}>Desempenho por Usuário (Lojistas)</h2>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lojista</th>
                  <th>E-mail</th>
                  <th>Qtd. Produtos</th>
                  <th>Valor em Estoque</th>
                  <th>Total de Vendas</th>
                  <th>Faturamento Total</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.length > 0 ? dashboardData.map(d => (
                  <tr key={d.usuario_id}>
                    <td>#{d.usuario_id}</td>
                    <td style={{ fontWeight: 600 }}>{d.nome}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{d.email}</td>
                    <td>{d.total_produtos} produtos</td>
                    <td className="price-text">R$ {Number(d.valor_total_estoque).toFixed(2)}</td>
                    <td>{d.total_vendas} vendas</td>
                    <td className="price-text" style={{ color: 'var(--accent)' }}>R$ {Number(d.valor_total_vendido).toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                      <p style={{ color: 'var(--text-muted)' }}>Nenhum dado encontrado ou nenhum lojista cadastrado.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
