import { useState, useEffect } from 'react';
import { ShoppingBag, LogOut, CheckCircle, Tag, Package, UserCheck, Layers } from 'lucide-react';
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

interface CartItem extends Produto {
  quantidade: number;
}

export default function PDV() {
  const { token, userName, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  useEffect(() => {
    fetchCategorias();
    fetchProdutos();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/categorias`, { headers: getHeaders() });
      if (res.ok) {
        setCategorias(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProdutos = async () => {
    try {
      const res = await fetch(`${API_URL}/produtos`, { headers: getHeaders() });
      if (res.ok) {
        setProdutos(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (produto: Produto) => {
    if (produto.estoque <= 0) {
      showNotification('Produto sem estoque!');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === produto.id);
      if (existing) {
        if (existing.quantidade >= produto.estoque) {
          showNotification('Estoque máximo atingido.');
          return prev;
        }
        return prev.map(item => 
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const itens = cart.map(item => ({
      produtos_id: item.id,
      quantidade: item.quantidade,
      preco_unitario: item.preco
    }));

    try {
      const res = await fetch(`${API_URL}/vendas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ valor_total: cartTotal, itens })
      });

      if (res.ok) {
        showNotification('Venda realizada com sucesso!');
        setCart([]);
        fetchProdutos(); // refresh stock
      } else {
        showNotification('Erro ao processar venda.');
      }
    } catch (err) {
      console.error(err);
      showNotification('Erro de conexão.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredProdutos = activeCategory 
    ? produtos.filter(p => p.categorias_id === activeCategory)
    : produtos;

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
          <div className="auth-logo" style={{ width: '40px', height: '40px', marginBottom: 0 }}>
            <ShoppingBag size={20} />
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Kamikase PDV</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => navigate('/system')}>
            <Layers size={16} /> Gestão / Sistema
          </button>
          
          {isAdmin && (
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => navigate('/adm')}>
              <UserCheck size={16} /> Admin Dashboard
            </button>
          )}

          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>

          <div className="user-info" style={{ padding: 0 }}>
            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
              {userName?.charAt(0)}
            </div>
            <span style={{ fontWeight: 600 }}>{userName}</span>
          </div>
          
          <button onClick={handleLogout} className="btn-icon-only danger" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="alert-toast success" style={{ position: 'fixed', top: '24px', right: '50%', transform: 'translateX(50%)', zIndex: 1100 }}>
          <CheckCircle size={18} />
          <span className="alert-message">{notification}</span>
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Products Catalog */}
        <div style={{ flexGrow: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Categories Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${activeCategory === null ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: 'auto', padding: '8px 16px', borderRadius: '20px', fontSize: '14px' }}
              onClick={() => setActiveCategory(null)}
            >
              Todos
            </button>
            {categorias.map(cat => (
              <button 
                key={cat.id}
                className={`btn ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: 'auto', padding: '8px 16px', borderRadius: '20px', fontSize: '14px' }}
                onClick={() => setActiveCategory(cat.id)}
              >
                <Tag size={14} /> {cat.nome}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {filteredProdutos.map(prod => (
              <div 
                key={prod.id} 
                className="stat-card" 
                style={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  padding: '20px', 
                  cursor: prod.estoque > 0 ? 'pointer' : 'not-allowed',
                  opacity: prod.estoque > 0 ? 1 : 0.5
                }}
                onClick={() => prod.estoque > 0 && addToCart(prod)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                  <div className="stat-icon-box purple" style={{ width: '40px', height: '40px' }}>
                    <Package size={20} />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estoque: {prod.estoque}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{prod.nome}</h3>
                <span className="price-text" style={{ fontSize: '18px' }}>R$ {Number(prod.preco).toFixed(2)}</span>
              </div>
            ))}
            
            {filteredProdutos.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                Nenhum produto encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart Sidebar */}
        <div style={{
          width: '380px',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Carrinho atual</h2>
          
          <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '0', marginTop: '40px' }}>
                <ShoppingBag size={48} className="empty-state-icon" />
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 500 }}>{item.nome}</h4>
                    <span className="price-text" style={{ fontSize: '14px' }}>{item.quantidade}x R$ {Number(item.preco).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600 }}>R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '24px',
            marginTop: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
              <span>Total</span>
              <span className="price-text">R$ {cartTotal.toFixed(2)}</span>
            </div>
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '18px' }}
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              Finalizar Venda
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
