import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>({ usuarios: [], global: null });

  useEffect(() => {
    fetchAdminData();
    document.body.classList.add('dark-admin');
    return () => document.body.classList.remove('dark-admin');
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const globalTotalUsers = dashboardData.usuarios?.length || 0;
  const globalTotalProdutos = Number(dashboardData.global?.produtos?.total || 0);
  const globalValorVendido = Number(dashboardData.global?.vendas?.valor || 0);
  const globalEstoqueValor = Number(dashboardData.global?.produtos?.valor || 0);
  const globalCategorias = Number(dashboardData.global?.categorias?.total || 0);

  return (
    <div className="admin-container">
      <style>{`
        .dark-admin {
          background: #0b0f19;
          color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }
        .admin-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1), transparent 40%),
                      radial-gradient(circle at 0% 100%, rgba(20, 184, 166, 0.05), transparent 40%);
        }
        .admin-header {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          padding: 16px 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .admin-logo-box {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        .admin-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(to right, #fcd34d, #f87171);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .btn-outline {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .btn-icon-admin {
          background: transparent;
          border: 1px solid transparent;
          color: #94a3b8;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-icon-admin:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }
        .stat-grid-admin {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        .stat-card-admin {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .stat-card-admin::after {
          content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
        }
        .stat-card-admin.users::after { background: #3b82f6; }
        .stat-card-admin.products::after { background: #8b5cf6; }
        .stat-card-admin.categories::after { background: #ec4899; }
        .stat-card-admin.stock::after { background: #14b8a6; }
        .stat-card-admin.revenue::after { background: #f59e0b; }
        
        .stat-icon-admin {
          width: 50px; height: 50px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .content-panel-admin {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
        }
        .table-admin {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        .table-admin th {
          text-align: left;
          padding: 16px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .table-admin td {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          font-size: 14px;
        }
        .table-admin tr:hover td {
          background: rgba(255,255,255,0.02);
        }
        .highlight-text {
          color: #fcd34d;
          font-weight: 600;
        }
        .highlight-text-green {
          color: #2dd4bf;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
          }
          .admin-container > div {
            padding: 16px !important;
          }
          .stat-grid-admin {
            grid-template-columns: 1fr;
          }
          .table-admin {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }
          .content-panel-admin {
            padding: 16px;
          }
        }
      `}</style>

      {/* Header */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="admin-logo-box">
            <ShieldAlert size={24} color="white" />
          </div>
          <h1 className="admin-title">Kamikase ERP & PDV</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#f8fafc' }}>{userName}</div>
              <div style={{ fontSize: '12px', color: '#f87171' }}>Super Administrador</div>
            </div>
            <button onClick={handleLogout} className="btn-icon-admin" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
        
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>Visão Global da Plataforma</h2>
        <p style={{ color: '#94a3b8', margin: '0 0 32px 0' }}>Métricas consolidadas de todos os lojistas ativos no sistema.</p>

        <div className="stat-grid-admin">
          <div className="stat-card-admin users">
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Lojistas Cadastrados</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{globalTotalUsers}</div>
            </div>
            <div className="stat-icon-admin" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}><Users size={24} /></div>
          </div>
          
          <div className="stat-card-admin products">
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Total de Produtos</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{globalTotalProdutos}</div>
            </div>
            <div className="stat-icon-admin" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}><Package size={24} /></div>
          </div>

          <div className="stat-card-admin categories">
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Total de Categorias</div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{globalCategorias}</div>
            </div>
            <div className="stat-icon-admin" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' }}><Package size={24} /></div>
          </div>
          
          <div className="stat-card-admin stock">
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Patrimônio em Estoque</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#2dd4bf' }}>R$ {globalEstoqueValor.toFixed(2)}</div>
            </div>
            <div className="stat-icon-admin" style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#2dd4bf' }}><Package size={24} /></div>
          </div>
          
          <div className="stat-card-admin revenue">
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Faturamento Global</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#fcd34d' }}>R$ {globalValorVendido.toFixed(2)}</div>
            </div>
            <div className="stat-icon-admin" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}><ShoppingBag size={24} /></div>
          </div>
        </div>

        <div className="content-panel-admin">
          <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', fontWeight: 600 }}>Desempenho por Usuário (Lojistas)</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table-admin">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lojista</th>
                  <th>E-mail</th>
                  <th>Produtos</th>
                  <th>Valor em Estoque</th>
                  <th>Qtd. Vendas</th>
                  <th>Faturamento Total</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.usuarios?.length > 0 ? dashboardData.usuarios.map((d: any) => (
                  <tr key={d.usuario_id}>
                    <td style={{ color: '#64748b' }}>#{d.usuario_id}</td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                          {d.nome.charAt(0)}
                        </div>
                        {d.nome}
                      </div>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{d.email}</td>
                    <td>{d.total_produtos} unid.</td>
                    <td className="highlight-text-green">R$ {Number(d.valor_total_estoque).toFixed(2)}</td>
                    <td>{d.total_vendas} oper.</td>
                    <td className="highlight-text">R$ {Number(d.valor_total_vendido).toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      Nenhum dado de lojista processado.
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
