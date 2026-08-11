import { useState, useEffect } from 'react';
import { ShoppingBag, LogOut, CheckCircle, Layers, X, ChevronRight, Cpu, Monitor, Zap, Server, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

interface CartItem extends Produto {
  quantidade: number;
}

export default function PDV() {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [activeParentCategory, setActiveParentCategory] = useState<number | null>(null);
  const [activeChildCategory, setActiveChildCategory] = useState<number | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Checkout states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [desconto, setDesconto] = useState<number>(0);
  const [formaPagamento, setFormaPagamento] = useState<string>('Dinheiro');
  const [parcelas, setParcelas] = useState<number>(1);

  useEffect(() => {
    fetchCategorias();
    fetchProdutos();
    // Inject dark mode styles specifically for PDV
    document.body.classList.add('dark-pdv');
    return () => document.body.classList.remove('dark-pdv');
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
  
  const descontoPercent = Math.min(20, Math.max(0, desconto));
  const descontoAmount = cartTotal * (descontoPercent / 100);
  const baseWithDiscount = Math.max(0, cartTotal - descontoAmount);

  let extraFeeAmount = 0;
  if (formaPagamento === 'Cartão de Crédito' && parcelas > 10) {
    const extra = parcelas - 10;
    const feePercent = extra * 5;
    extraFeeAmount = baseWithDiscount * (feePercent / 100);
  }

  const finalTotal = baseWithDiscount + extraFeeAmount;

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
      await api.post('/vendas', { 
        valor_total: finalTotal, 
        itens,
        desconto: descontoAmount,
        forma_pagamento: formaPagamento,
        parcelas: formaPagamento === 'Cartão de Crédito' ? parcelas : 1
      });

      showNotification('Venda realizada com sucesso!');
      setCart([]);
      setIsCheckoutModalOpen(false);
      setDesconto(0);
      setFormaPagamento('Dinheiro');
      setParcelas(1);
      fetchProdutos(); // refresh stock
    } catch (err) {
      console.error(err);
      showNotification('Erro ao processar venda.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Hierarchy Logic
  const parentCategories = categorias.filter(c => !c.parent_id);
  const childCategories = activeParentCategory 
    ? categorias.filter(c => c.parent_id === activeParentCategory)
    : [];

  const filteredProdutos = produtos.filter(p => {
    if (activeChildCategory) return p.categorias_id === activeChildCategory;
    if (activeParentCategory) {
      const childrenIds = categorias.filter(c => c.parent_id === activeParentCategory).map(c => c.id);
      return p.categorias_id === activeParentCategory || childrenIds.includes(p.categorias_id);
    }
    return true;
  });

  return (
    <div className="pdv-premium-container">
      {/* Global styles for this view specifically to enforce the dark/glass theme */}
      <style>{`
        .dark-pdv {
          background: #0f111a;
          color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .pdv-premium-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: radial-gradient(circle at 15% 50%, rgba(20, 184, 166, 0.05), transparent 25%),
                      radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 25%);
        }
        .glass-panel {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .pdv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 10;
        }
        .pdv-nav-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          border-radius: 8px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pdv-nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .pdv-cat-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          padding: 12px 20px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pdv-cat-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .pdv-cat-btn.active {
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
        }
        .pdv-cat-btn.active-child {
          background: rgba(139, 92, 246, 0.2);
          color: #c4b5fd;
          border-color: rgba(139, 92, 246, 0.4);
        }
        .pdv-product-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .pdv-product-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #14b8a6, #8b5cf6);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .pdv-product-card:hover {
          transform: translateY(-4px);
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .pdv-product-card:hover::before {
          opacity: 1;
        }
        .pdv-product-card.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(1);
        }
        .pdv-product-card.disabled:hover {
          transform: none;
        }
        .pdv-cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 12px;
          transition: background 0.2s;
        }
        .pdv-cart-item:hover {
          background: rgba(15, 23, 42, 0.8);
        }
        .pdv-btn-gradient {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .pdv-btn-gradient:hover {
          opacity: 0.9;
        }
        .pdv-btn-gradient:active {
          transform: scale(0.98);
        }
        .pdv-btn-gradient:disabled {
          background: #334155;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
        }
        .neon-text {
          background: linear-gradient(to right, #2dd4bf, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .custom-input {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          width: 100%;
          transition: border-color 0.2s;
        }
        .custom-input:focus {
          outline: none;
          border-color: #8b5cf6;
        }
        .pdv-main-layout {
          display: flex;
          flex-grow: 1;
          overflow: hidden;
        }
        .pdv-catalog {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          padding: 24px;
          overflow-y: auto;
        }
        .pdv-cart-sidebar {
          width: 400px;
        }
        .pdv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .pdv-header {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }
          .pdv-main-layout {
            flex-direction: column;
            overflow-y: auto;
          }
          .pdv-catalog {
            padding: 16px;
            overflow-y: visible;
          }
          .pdv-cart-sidebar {
            width: 100%;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .pdv-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 12px;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <header className="glass-panel pdv-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', 
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
          }}>
            <Cpu size={24} color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }} className="neon-text">
            Kamikase ERP & PDV
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="pdv-nav-btn" onClick={() => navigate('/system')}>
            <Layers size={16} /> <span style={{fontSize:'14px'}}>Sistema</span>
          </button>
          
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#f8fafc' }}>{userName}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Caixa Aberto</div>
            </div>
            <button onClick={handleLogout} className="pdv-nav-btn" style={{ padding: '8px', color: '#ef4444' }} title="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {notification && (
        <div style={{ 
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', 
          zIndex: 1100, background: 'rgba(20, 184, 166, 0.9)', backdropFilter: 'blur(8px)',
          color: 'white', padding: '12px 24px', borderRadius: '30px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 20px rgba(20, 184, 166, 0.4)', fontWeight: 500
        }}>
          <CheckCircle size={18} />
          {notification}
        </div>
      )}

      {/* Main Content Area */}
      <div className="pdv-main-layout">
        
        {/* Left Side: Catalog */}
        <div className="pdv-catalog">
          
          {/* Categories Hierarchical Filter */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button 
                className={`pdv-cat-btn ${activeParentCategory === null ? 'active' : ''}`}
                onClick={() => { setActiveParentCategory(null); setActiveChildCategory(null); }}
              >
                <Layers size={16} /> Todos os Setores
              </button>
              {parentCategories.map(cat => (
                <button 
                  key={cat.id}
                  className={`pdv-cat-btn ${activeParentCategory === cat.id ? 'active' : ''}`}
                  onClick={() => { setActiveParentCategory(cat.id); setActiveChildCategory(null); }}
                >
                  <Server size={16} /> {cat.nome}
                </button>
              ))}
            </div>

            {/* Subcategories (if parent selected) */}
            {activeParentCategory && childCategories.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingLeft: '16px', borderLeft: '2px solid rgba(139, 92, 246, 0.3)' }}>
                <button 
                  className={`pdv-cat-btn ${activeChildCategory === null ? 'active-child' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => setActiveChildCategory(null)}
                >
                  Ver tudo
                </button>
                {childCategories.map(cat => (
                  <button 
                    key={cat.id}
                    className={`pdv-cat-btn ${activeChildCategory === cat.id ? 'active-child' : ''}`}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    onClick={() => setActiveChildCategory(cat.id)}
                  >
                    {cat.nome}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="pdv-grid">
            {filteredProdutos.map(prod => (
              <div 
                key={prod.id} 
                className={`pdv-product-card ${prod.estoque <= 0 ? 'disabled' : ''}`}
                onClick={() => prod.estoque > 0 && addToCart(prod)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Monitor size={24} color="#a78bfa" />
                  </div>
                  <div style={{ background: prod.estoque > 0 ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: prod.estoque > 0 ? '#2dd4bf' : '#f87171', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                    {prod.estoque > 0 ? `${prod.estoque} un` : 'Esgotado'}
                  </div>
                </div>
                
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px', lineHeight: 1.3 }}>{prod.nome}</h3>
                
                <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#2dd4bf' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', marginRight: '2px' }}>R$</span>
                    {Number(prod.preco).toFixed(2)}
                  </span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} color="#e2e8f0" />
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProdutos.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Zap size={48} opacity={0.2} style={{ margin: '0 auto 16px' }} />
                <p>Nenhum item encontrado nesta categoria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart Glass Panel */}
        <div className="glass-panel pdv-cart-sidebar" style={{ display: 'flex', flexDirection: 'column', borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
          
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} className="neon-text" /> 
              Resumo do Pedido
            </h2>
          </div>
          
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                <ShoppingBag size={64} style={{ marginBottom: '16px', color: '#64748b' }} />
                <p style={{ color: '#94a3b8' }}>Aguardando itens...</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="pdv-cart-item">
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 4px 0', color: '#f1f5f9' }}>{item.nome}</h4>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.quantidade} un x R$ {Number(item.preco).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#e2e8f0' }}>R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#94a3b8' }}>
              <span>Subtotal</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '24px', fontWeight: 800, color: '#fff' }}>
              <span>Total</span>
              <span className="neon-text">R$ {cartTotal.toFixed(2)}</span>
            </div>
            
            <button 
              className="pdv-btn-gradient" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutModalOpen(true)}
            >
              Processar Pagamento <ChevronRight size={20} />
            </button>
          </div>
        </div>

      </div>

      {/* Checkout Modal Glass */}
      {isCheckoutModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '32px', borderRadius: '24px', width: '420px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'white' }}>Checkout</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ background: 'rgba(15,23,42,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Subtotal da Compra</label>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e2e8f0' }}>R$ {cartTotal.toFixed(2)}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Desconto Aplicado (%) - Máx 20%</label>
                <input 
                  type="number" min="0" max="20" step="1"
                  className="custom-input" 
                  value={desconto} 
                  onChange={e => {
                    let val = Number(e.target.value);
                    if (val > 20) val = 20;
                    if (val < 0) val = 0;
                    setDesconto(val);
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Método de Pagamento</label>
                <select 
                  className="custom-input" 
                  value={formaPagamento}
                  onChange={e => setFormaPagamento(e.target.value)}
                  style={{ appearance: 'none' }}
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="PIX">PIX (Transferência Instantânea)</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                </select>
              </div>

              {formaPagamento === 'Cartão de Crédito' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Parcelamento</label>
                  <select 
                    className="custom-input" 
                    value={parcelas} 
                    onChange={e => setParcelas(Number(e.target.value))}
                    style={{ appearance: 'none' }}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(p => {
                      let fee = 0;
                      if (p > 10) fee = (p - 10) * 5;
                      const pTotal = baseWithDiscount * (1 + (fee/100));
                      return <option key={p} value={p}>{p}x de R$ {(pTotal / p).toFixed(2)} {fee > 0 ? `(+${fee}% juros)` : ''}</option>
                    })}
                  </select>
                </div>
              )}

              <div style={{ marginTop: '12px', paddingTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                {extraFeeAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontSize: '14px', marginBottom: '8px' }}>
                    <span>Juros de Parcelamento ({(parcelas - 10) * 5}%)</span>
                    <span>+ R$ {extraFeeAmount.toFixed(2)}</span>
                  </div>
                )}
                {descontoAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2dd4bf', fontSize: '14px', marginBottom: '8px' }}>
                    <span>Desconto ({descontoPercent}%)</span>
                    <span>- R$ {descontoAmount.toFixed(2)}</span>
                  </div>
                )}
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Valor a Cobrar</label>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#2dd4bf' }}>R$ {finalTotal.toFixed(2)}</div>
              </div>

              <button className="pdv-btn-gradient" style={{ width: '100%', marginTop: '8px' }} onClick={handleCheckout}>
                Confirmar Transação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
