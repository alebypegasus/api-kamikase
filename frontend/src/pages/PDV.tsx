import { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingBag, LogOut, CheckCircle, X, ChevronRight, Store, LayoutDashboard, Plus, Printer, Receipt, Sparkles, Server, Monitor, Zap, Layers, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SearchInput from '../components/SearchInput';
import QuantitySelector from '../components/QuantitySelector';
import GlowButton from '../components/GlowButton';
import ThemeToggle from '../components/ThemeToggle';
import { SkeletonGrid } from '../components/Skeleton';

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

interface ReceiptData {
  vendaId: number;
  itens: CartItem[];
  subtotal: number;
  descontoAmount: number;
  descontoPercent: number;
  extraFeeAmount: number;
  total: number;
  formaPagamento: string;
  parcelas: number;
  data: string;
  operador: string;
  cliente?: string;
  telefone?: string;
}

export default function PDV() {
  const { userName, logout } = useAuth();
  const { playBeep, playSuccessSound } = useTheme();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeParentCategory, setActiveParentCategory] = useState<number | null>(null);
  const [activeChildCategory, setActiveChildCategory] = useState<number | null>(null);

  const [notification, setNotification] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  // Checkout states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [desconto, setDesconto] = useState<number>(0);
  const [formaPagamento, setFormaPagamento] = useState<string>('Dinheiro');
  const [parcelas, setParcelas] = useState<number>(1);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Client identification states
  const [clientMode, setClientMode] = useState<'none' | 'quick' | 'register'>('none');
  const [clienteNome, setClienteNome] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientNome, setNewClientNome] = useState('');
  const [newClientCpf, setNewClientCpf] = useState('');
  const [newClientTelefone, setNewClientTelefone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [savingClient, setSavingClient] = useState(false);

  // Clock
  const [clock, setClock] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCategorias(), fetchProdutos(), fetchClientes()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Clock update
  useEffect(() => {
    const updateClock = () => {
      setClock(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'F12' && cart.length > 0) {
        e.preventDefault();
        setIsCheckoutModalOpen(true);
      }
      if (e.key === 'Escape') {
        if (isCheckoutModalOpen) setIsCheckoutModalOpen(false);
        if (receiptData) setReceiptData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, isCheckoutModalOpen, receiptData]);

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

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientesList(res.data);
    } catch (err) { console.error('Erro ao buscar clientes:', err); }
  };

  const handleSaveNewClient = async () => {
    if (!newClientNome.trim()) {
      showNotification('Digite ao menos o nome completo do cliente.');
      return;
    }
    setSavingClient(true);
    try {
      const res = await api.post('/clientes', {
        nome: newClientNome.trim(),
        cpf_cnpj: newClientCpf.trim() || null,
        telefone: newClientTelefone.trim() || null,
        email: newClientEmail.trim() || null
      });
      const novo = res.data.cliente;
      setClientesList(prev => [...prev, novo]);
      setSelectedClienteId(novo.id);
      setClienteNome(novo.nome);
      setShowNewClientForm(false);
      setNewClientNome('');
      setNewClientCpf('');
      setNewClientTelefone('');
      setNewClientEmail('');
      showNotification('Cliente cadastrado com sucesso!');
    } catch (err: any) {
      const msg = err.response?.data?.erro || 'Erro ao cadastrar cliente.';
      showNotification(msg);
    } finally {
      setSavingClient(false);
    }
  };

  const addToCart = useCallback((produto: Produto) => {
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

    // Show "added" badge & play feedback beep
    setAddedProductId(produto.id);
    playBeep();
    setTimeout(() => setAddedProductId(null), 800);
  }, [playBeep]);

  const updateCartQuantity = useCallback((id: number, newQty: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantidade: newQty } : item
    ));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const cartTotal = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantidade, 0);
  
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

    // Determine client info based on mode
    let finalClienteNome: string | null = null;
    let finalClienteId: number | null = null;

    if (clientMode === 'quick') {
      finalClienteNome = clienteNome.trim() || null;
    } else if (clientMode === 'register') {
      finalClienteId = selectedClienteId || null;
      if (selectedClienteId) {
        const found = clientesList.find(c => c.id === selectedClienteId);
        finalClienteNome = found ? found.nome : (clienteNome.trim() || null);
      } else if (clienteNome.trim()) {
        finalClienteNome = clienteNome.trim();
      }
    }

    try {
      const res = await api.post('/vendas', { 
        valor_total: finalTotal, 
        itens,
        desconto: descontoAmount,
        forma_pagamento: formaPagamento,
        parcelas: formaPagamento === 'Cartão de Crédito' ? parcelas : 1,
        cliente_id: finalClienteId,
        cliente_nome: finalClienteNome
      });

      const vendaId = res.data.id || Date.now();
      const selectedClientObj = finalClienteId ? clientesList.find(c => c.id === finalClienteId) : null;

      // Set receipt data for the receipt modal
      setReceiptData({
        vendaId,
        itens: [...cart],
        subtotal: cartTotal,
        descontoAmount,
        descontoPercent,
        extraFeeAmount,
        total: finalTotal,
        formaPagamento,
        parcelas: formaPagamento === 'Cartão de Crédito' ? parcelas : 1,
        data: new Date().toLocaleString('pt-BR'),
        operador: userName || 'Caixa',
        cliente: finalClienteNome || 'Consumidor Final',
        telefone: selectedClientObj?.telefone || undefined
      });

      setCart([]);
      setIsCheckoutModalOpen(false);

      // Reset client selection states
      setClientMode('none');
      setClienteNome('');
      setSelectedClienteId(null);
      setShowNewClientForm(false);

      // Trigger confetti celebration & success sound
      setShowCelebration(true);
      playSuccessSound();
      launchConfetti();
      setTimeout(() => setShowCelebration(false), 2500);
      setDesconto(0);
      setFormaPagamento('Dinheiro');
      setParcelas(1);
      fetchProdutos();
    } catch (err: any) {
      console.error(err);
      const erroMsg = err.response?.data?.erro || err.response?.data?.mensagem || 'Erro ao processar venda.';
      showNotification(erroMsg);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const launchConfetti = () => {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#fcd34d'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = `${40 + Math.random() * 20}%`;
      el.style.top = `${40 + Math.random() * 20}%`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
      el.style.animationDelay = `${Math.random() * 0.3}s`;
      const dx = (Math.random() - 0.5) * 300;
      const dy = -(80 + Math.random() * 150);
      el.style.setProperty('--dx', `${dx}px`);
      el.style.setProperty('--dy', `${dy}px`);
      el.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
      ], { duration: 1200, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  };

  // Hierarchy Logic
  const parentCategories = categorias.filter(c => !c.parent_id);
  const childCategories = activeParentCategory 
    ? categorias.filter(c => c.parent_id === activeParentCategory)
    : [];

  const filteredProdutos = produtos.filter(p => {
    // Search filter
    if (searchTerm && !p.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Category filter
    if (activeChildCategory) return p.categorias_id === activeChildCategory;
    if (activeParentCategory) {
      const childrenIds = categorias.filter(c => c.parent_id === activeParentCategory).map(c => c.id);
      return p.categorias_id === activeParentCategory || childrenIds.includes(p.categorias_id);
    }
    return true;
  });

  const getStockBadgeClass = (estoque: number) => {
    if (estoque <= 0) return 'out-of-stock';
    if (estoque <= 5) return 'low-stock';
    return 'in-stock';
  };

  const getStockLabel = (estoque: number) => {
    if (estoque <= 0) return 'Esgotado';
    if (estoque <= 5) return `${estoque} un ⚠`;
    return `${estoque} un`;
  };

  return (
    <div className="pdv-premium-container page-transition">
      {/* Top Navbar */}
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
              Frente de Caixa
            </div>
          </div>
        </div>

        {/* Central Switch: PDV vs Gestão */}
        <div className="topbar-nav-pills">
          <button className="topbar-pill active" title="Frente de Caixa (PDV)">
            <Store size={15} />
            <span>Frente de Caixa (PDV)</span>
          </button>
          <button className="topbar-pill" onClick={() => navigate('/system')} title="Ir para Gestão de Produtos & Estoque">
            <LayoutDashboard size={15} />
            <span>Gestão de Estoque</span>
          </button>
        </div>

        {/* Right Section: Status, Theme & User */}
        <div className="topbar-actions-group">
          <div className="topbar-status-badge">
            <span className="status-indicator-dot" />
            <span className="status-clock">{clock}</span>
          </div>

          <div className="topbar-divider" />

          <ThemeToggle />

          <div className="topbar-divider" />

          <div className="topbar-user-capsule">
            <div className="topbar-user-avatar">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="topbar-user-meta">
              <span className="topbar-user-name">{userName}</span>
              <span className="topbar-user-role">Operador</span>
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

      {notification && (
        <div className="pdv-notification">
          <CheckCircle size={18} />
          {notification}
        </div>
      )}

      {/* Main Content Area */}
      <div className="pdv-main-layout">
        
        {/* Left Side: Catalog */}
        <div className="pdv-catalog">
          
          {/* Search Bar */}
          <div className="pdv-search-area">
            <SearchInput 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar produtos... (F2)"
              className="animate-fade-in"
            />
          </div>

          {/* Categories Hierarchical Filter */}
          <div className="pdv-categories">
            <div className="pdv-cat-row">
              <button 
                className={`pdv-cat-btn ${activeParentCategory === null ? 'active' : ''}`}
                onClick={() => { setActiveParentCategory(null); setActiveChildCategory(null); }}
              >
                <Layers size={16} /> Todos os Setores
              </button>
              {parentCategories.map((cat, i) => (
                <button 
                  key={cat.id}
                  className={`pdv-cat-btn animate-fade-in animate-stagger-${Math.min(i + 1, 8)}`}
                  style={activeParentCategory === cat.id ? { background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)' } : {}}
                  onClick={() => { setActiveParentCategory(cat.id); setActiveChildCategory(null); }}
                >
                  <Server size={16} /> {cat.nome}
                </button>
              ))}
            </div>

            {/* Subcategories */}
            {activeParentCategory && childCategories.length > 0 && (
              <div className="pdv-subcat-row animate-fade-in">
                <button 
                  className={`pdv-cat-btn small ${activeChildCategory === null ? 'active-child' : ''}`}
                  onClick={() => setActiveChildCategory(null)}
                >
                  Ver tudo
                </button>
                {childCategories.map(cat => (
                  <button 
                    key={cat.id}
                    className={`pdv-cat-btn small ${activeChildCategory === cat.id ? 'active-child' : ''}`}
                    onClick={() => setActiveChildCategory(cat.id)}
                  >
                    {cat.nome}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className="pdv-grid">
              {filteredProdutos.map((prod, i) => (
                <div 
                  key={prod.id} 
                  className={`pdv-product-card card-3d ${prod.estoque <= 0 ? 'disabled' : ''} animate-fade-in animate-stagger-${Math.min(i + 1, 8)}`}
                  onClick={() => prod.estoque > 0 && addToCart(prod)}
                >
                  {addedProductId === prod.id && (
                    <div className="pdv-added-badge">✓ Adicionado</div>
                  )}
                  
                  <div className="pdv-product-top">
                    <div className="pdv-product-icon">
                      <Monitor size={24} color="#a78bfa" />
                    </div>
                    <div className={`pdv-stock-badge ${getStockBadgeClass(prod.estoque)}`}>
                      {getStockLabel(prod.estoque)}
                    </div>
                  </div>
                  
                  <h3 className="pdv-product-name">{prod.nome}</h3>
                  
                  <div className="pdv-product-bottom">
                    <span className="pdv-product-price">
                      <span className="pdv-product-price-prefix">R$</span>
                      {Number(prod.preco).toFixed(2)}
                    </span>
                    <div className="pdv-add-btn">
                      <Plus size={14} color="#e2e8f0" />
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProdutos.length === 0 && !loading && (
                <div className="pdv-empty-state">
                  <Zap size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                  <p>{searchTerm ? `Nenhum item encontrado para "${searchTerm}".` : 'Nenhum item encontrado nesta categoria.'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Cart Glass Panel */}
        <div className={`glass-panel pdv-cart-sidebar ${mobileCartOpen ? 'mobile-open' : ''}`}>
          
          <div className="pdv-cart-header">
            <h2>
              <ShoppingBag size={20} className="neon-text" /> 
              Resumo do Pedido
              {cartItemCount > 0 && (
                <span style={{ 
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  marginLeft: '8px' 
                }}>
                  {cartItemCount}
                </span>
              )}
            </h2>
            <button 
              type="button" 
              className="pdv-cart-mobile-close"
              onClick={() => setMobileCartOpen(false)}
              title="Fechar Carrinho"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="pdv-cart-body">
            {cart.length === 0 ? (
              <div className="pdv-cart-empty">
                <ShoppingBag size={64} style={{ color: '#64748b' }} />
                <p>Aguardando itens...</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="pdv-cart-item">
                  <div className="pdv-cart-item-info">
                    <h4 className="pdv-cart-item-name">{item.nome}</h4>
                    <span className="pdv-cart-item-qty">R$ {Number(item.preco).toFixed(2)} / un</span>
                  </div>
                  <div className="pdv-cart-item-right">
                    <span className="pdv-cart-item-total">R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                    <QuantitySelector
                      value={item.quantidade}
                      max={item.estoque}
                      onChange={(newQty) => updateCartQuantity(item.id, newQty)}
                      onRemove={() => removeFromCart(item.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pdv-cart-footer">
            <div className="pdv-cart-subtotal">
              <span>Subtotal ({cartItemCount} itens)</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="pdv-cart-total">
              <span>Total</span>
              <span className="neon-text">R$ {cartTotal.toFixed(2)}</span>
            </div>
            
            <GlowButton 
              className="pdv-btn-gradient" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              disabled={cart.length === 0}
              onClick={() => {
                setMobileCartOpen(false);
                setIsCheckoutModalOpen(true);
              }}
            >
              <Sparkles size={18} /> Processar Pagamento <ChevronRight size={20} />
              <span className="kbd-hint" style={{ marginLeft: '4px' }}>F12</span>
            </GlowButton>
          </div>
        </div>

      </div>

      {/* Mobile Floating Cart Bar (Visível apenas em dispositivos móveis/tablets quando há itens) */}
      {cart.length > 0 && !mobileCartOpen && !isCheckoutModalOpen && (
        <div className="pdv-mobile-cart-bar animate-slide-up">
          <button 
            type="button" 
            className="pdv-mobile-cart-btn"
            onClick={() => setMobileCartOpen(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} />
              <span>{cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 900 }}>R$ {cartTotal.toFixed(2)}</span>
              <span style={{ fontSize: '13px', opacity: 0.9 }}>Ver Pedido →</span>
            </div>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="glass-modal" onClick={() => setIsCheckoutModalOpen(false)}>
          <div className="modal-content-glass" style={{ width: '100%', maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            
            <div className="modal-header" style={{ marginBottom: '32px' }}>
              <h2 className="modal-title">Checkout</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="modal-close" style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ background: 'var(--bg-deep)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Subtotal da Compra</label>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e2e8f0' }}>R$ {cartTotal.toFixed(2)}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Desconto Aplicado (%) - Máx 20%</label>
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
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Método de Pagamento</label>
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
                <div className="animate-fade-in">
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Parcelamento</label>
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

              {/* Identificação do Cliente (Opcional) */}
              <div className="checkout-client-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <User size={15} color="var(--primary)" /> Identificação do Cliente
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Opcional</span>
                </div>

                {/* Modo de Identificação */}
                <div className="client-mode-pills">
                  <button 
                    type="button"
                    className={`client-pill ${clientMode === 'none' ? 'active' : ''}`}
                    onClick={() => { setClientMode('none'); setClienteNome(''); setSelectedClienteId(null); }}
                  >
                    Sem Identificação
                  </button>
                  <button 
                    type="button"
                    className={`client-pill ${clientMode === 'quick' ? 'active' : ''}`}
                    onClick={() => { setClientMode('quick'); setSelectedClienteId(null); }}
                  >
                    Apenas Nome
                  </button>
                  <button 
                    type="button"
                    className={`client-pill ${clientMode === 'register' ? 'active' : ''}`}
                    onClick={() => { setClientMode('register'); }}
                  >
                    Cadastrar / Buscar
                  </button>
                </div>

                {/* Opção 1: Apenas Nome Completo */}
                {clientMode === 'quick' && (
                  <div className="animate-fade-in" style={{ marginTop: '12px' }}>
                    <input 
                      type="text"
                      className="custom-input"
                      placeholder="Nome completo do cliente..."
                      value={clienteNome}
                      onChange={e => setClienteNome(e.target.value)}
                      autoFocus
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                      Identificação avulsa para o comprovante e pós-venda.
                    </span>
                  </div>
                )}

                {/* Opção 2: Selecionar Cliente Existente ou Cadastrar Novo */}
                {clientMode === 'register' && (
                  <div className="animate-fade-in" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="custom-input"
                        value={selectedClienteId || ''}
                        onChange={e => {
                          const id = e.target.value ? Number(e.target.value) : null;
                          setSelectedClienteId(id);
                          if (id) {
                            const c = clientesList.find(item => item.id === id);
                            if (c) setClienteNome(c.nome);
                          } else {
                            setClienteNome('');
                          }
                        }}
                        style={{ flex: 1 }}
                      >
                        <option value="">-- Selecionar Cliente Cadastrado --</option>
                        {clientesList.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.nome} {c.telefone ? `(${c.telefone})` : ''}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setShowNewClientForm(!showNewClientForm)}
                      >
                        <Plus size={14} /> {showNewClientForm ? 'Fechar' : 'Novo'}
                      </button>
                    </div>

                    {showNewClientForm && (
                      <div className="new-client-box animate-scale-up">
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                          Cadastrar Novo Cliente
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input 
                            type="text"
                            className="custom-input"
                            placeholder="Nome Completo *"
                            value={newClientNome}
                            onChange={e => setNewClientNome(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text"
                              className="custom-input"
                              placeholder="Telefone / WhatsApp"
                              value={newClientTelefone}
                              onChange={e => setNewClientTelefone(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <input 
                              type="text"
                              className="custom-input"
                              placeholder="CPF (opcional)"
                              value={newClientCpf}
                              onChange={e => setNewClientCpf(e.target.value)}
                              style={{ flex: 1 }}
                            />
                          </div>
                          <input 
                            type="email"
                            className="custom-input"
                            placeholder="E-mail (opcional)"
                            value={newClientEmail}
                            onChange={e => setNewClientEmail(e.target.value)}
                          />
                          <button 
                            type="button"
                            className="btn-primary"
                            style={{ padding: '8px 12px', fontSize: '12px', width: '100%', borderRadius: '6px' }}
                            disabled={savingClient || !newClientNome.trim()}
                            onClick={handleSaveNewClient}
                          >
                            {savingClient ? 'Salvando...' : 'Salvar e Vincular à Venda'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '4px', paddingTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
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
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Valor a Cobrar</label>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#2dd4bf' }}>R$ {finalTotal.toFixed(2)}</div>
              </div>

              <GlowButton className="pdv-btn-gradient" style={{ width: '100%', marginTop: '8px' }} onClick={handleCheckout}>
                <CheckCircle size={18} /> Confirmar Transação
              </GlowButton>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt / Cupom Modal */}
      {receiptData && (
        <div className="glass-modal" onClick={() => setReceiptData(null)}>
          <div className="modal-content-glass" style={{ width: '100%', maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={22} color="#2dd4bf" />
                <h2 className="modal-title">Comprovante de Venda</h2>
              </div>
              <button onClick={() => setReceiptData(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="receipt-paper" id="printable-receipt" style={{
              background: '#ffffff',
              color: '#000000',
              padding: '24px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: '1.4',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #666', paddingBottom: '12px', marginBottom: '12px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>KAMIKASE ERP & PDV</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>CUPOM NÃO FISCAL</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#555' }}>Venda #{receiptData.vendaId} • {receiptData.data}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#555' }}>Operador: {receiptData.operador}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#111', fontWeight: 'bold' }}>Cliente: {receiptData.cliente || 'Consumidor Final'}</p>
                {receiptData.telefone && <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#555' }}>Tel: {receiptData.telefone}</p>}
              </div>

              <div style={{ borderBottom: '1px dashed #666', paddingBottom: '8px', marginBottom: '8px' }}>
                <table style={{ width: '100%', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                      <th style={{ padding: '4px 0' }}>Item</th>
                      <th style={{ textAlign: 'center' }}>Qtd</th>
                      <th style={{ textAlign: 'right' }}>Unit</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptData.itens.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '3px 0', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
                        <td style={{ textAlign: 'right' }}>R$ {Number(item.preco).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>R$ {(item.quantidade * item.preco).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>R$ {receiptData.subtotal.toFixed(2)}</span>
                </div>
                {receiptData.descontoAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Desconto ({receiptData.descontoPercent}%):</span>
                    <span>- R$ {receiptData.descontoAmount.toFixed(2)}</span>
                  </div>
                )}
                {receiptData.extraFeeAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>Juros Parcelamento:</span>
                    <span>+ R$ {receiptData.extraFeeAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', borderTop: '1px solid #000', paddingTop: '6px', marginTop: '4px' }}>
                  <span>TOTAL:</span>
                  <span>R$ {receiptData.total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginTop: '4px' }}>
                  <span>Pagamento:</span>
                  <span>{receiptData.formaPagamento} {receiptData.parcelas > 1 ? `(${receiptData.parcelas}x)` : ''}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', borderTop: '1px dashed #666', paddingTop: '10px', marginTop: '12px', fontSize: '10px', color: '#777' }}>
                Obrigado pela preferência! Volte sempre!
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handlePrintReceipt}
                className="btn-gradient" 
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                <Printer size={18} /> Imprimir Cupom
              </button>
              <button 
                onClick={() => setReceiptData(null)}
                className="btn-icon" 
                style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }}
              >
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Celebration */}
      {showCelebration && (
        <div className="success-celebration">
          <div className="success-icon">
            <CheckCircle size={40} color="white" />
          </div>
          <div className="success-text">Venda Realizada! 🎉</div>
        </div>
      )}
    </div>
  );
}
