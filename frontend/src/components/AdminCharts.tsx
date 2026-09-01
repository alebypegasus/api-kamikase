import { useMemo, useState } from 'react';
import { Building, CreditCard, DollarSign, PackageCheck, AlertTriangle, ShieldCheck } from 'lucide-react';

interface UnitMetric {
  id: number;
  unidade_nome: string;
  total_lojistas: number;
  total_produtos: number;
  total_vendas: number;
  faturamento_total: number;
}

interface PaymentMetric {
  forma_pagamento: string;
  total_vendas: number;
  valor_total: number;
}

interface SellerMetric {
  usuario_id: number;
  nome: string;
  email: string;
  unidade_nome?: string;
  total_produtos: number;
  total_vendas: number;
  valor_total_vendido: number;
}

// 1. Regional Branch Performance (Bar Chart)
export function UnitRevenueBarChart({ data }: { data: UnitMetric[] }) {
  const maxRevenue = useMemo(() => {
    if (!data || data.length === 0) return 1;
    const max = Math.max(...data.map(d => Number(d.faturamento_total || 0)));
    return max > 0 ? max : 1;
  }, [data]);

  const totalGlobal = useMemo(() => {
    return (data || []).reduce((acc, d) => acc + Number(d.faturamento_total || 0), 0);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="admin-chart-card">
        <div className="admin-chart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} style={{ color: 'var(--primary)' }} />
            <h4>Desempenho Regional por Filial</h4>
          </div>
        </div>
        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '32px' }}>
          Nenhuma filial cadastrada ou sem movimentações.
        </div>
      </div>
    );
  }

  const colors = [
    'linear-gradient(90deg, #8b5cf6, #a78bfa)',
    'linear-gradient(90deg, #06b6d4, #22d3ee)',
    'linear-gradient(90deg, #10b981, #34d399)',
    'linear-gradient(90deg, #f59e0b, #fbbf24)',
    'linear-gradient(90deg, #ec4899, #f472b6)'
  ];

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={18} style={{ color: 'var(--primary)' }} />
          <h4>Desempenho Regional por Filial</h4>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Total: <strong style={{ color: 'var(--accent-light)' }}>R$ {totalGlobal.toFixed(2)}</strong>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
        {data.map((u, i) => {
          const rev = Number(u.faturamento_total || 0);
          const percentOfMax = Math.min(100, Math.max(8, Math.round((rev / maxRevenue) * 100)));
          const percentOfTotal = totalGlobal > 0 ? ((rev / totalGlobal) * 100).toFixed(1) : '0';
          const barColor = colors[i % colors.length];

          return (
            <div key={u.id || i} className="hover-lift" style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700 }}>📍 {u.unidade_nome || 'Sem Filial'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>
                    {u.total_lojistas || 0} lojistas • {u.total_vendas || 0} vendas
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--accent-light)', fontSize: '14px' }}>
                    R$ {rev.toFixed(2)}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '6px' }}>
                    ({percentOfTotal}%)
                  </span>
                </div>
              </div>

              <div style={{ height: '10px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percentOfMax}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: '6px',
                    transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 2. Real SVG Interactive Donut Chart for Payment Methods
export function PaymentMethodDonutChart({ data }: { data: PaymentMetric[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValue = useMemo(() => {
    return (data || []).reduce((acc, d) => acc + Number(d.valor_total || 0), 0);
  }, [data]);

  const totalTransactions = useMemo(() => {
    return (data || []).reduce((acc, d) => acc + Number(d.total_vendas || 0), 0);
  }, [data]);

  const methodColors: Record<string, string> = {
    'Dinheiro': '#10b981',
    'PIX': '#06b6d4',
    'Cartão de Crédito': '#8b5cf6',
    'Cartão de Débito': '#f59e0b',
  };

  // Calculate SVG donut segments
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = (data || []).map((item, index) => {
    const val = Number(item.valor_total || 0);
    const percent = totalValue > 0 ? val / totalValue : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    const color = methodColors[item.forma_pagamento] || '#8b5cf6';

    return {
      ...item,
      val,
      percent: (percent * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset,
      color,
      index
    };
  });

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} style={{ color: 'var(--secondary)' }} />
          <h4>Meios de Pagamento</h4>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          {totalTransactions} transações
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', padding: '10px 0' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--bg-surface)"
              strokeWidth={strokeWidth}
            />
            {segments.map((seg) => (
              <circle
                key={seg.index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredIndex === seg.index ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  opacity: hoveredIndex === null || hoveredIndex === seg.index ? 1 : 0.4
                }}
                onMouseEnter={() => setHoveredIndex(seg.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>

          {/* Donut Center Label */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {hoveredIndex !== null ? segments[hoveredIndex]?.forma_pagamento : 'Total'}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-bright)' }}>
              {hoveredIndex !== null ? `${segments[hoveredIndex]?.percent}%` : `R$ ${totalValue.toFixed(0)}`}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '160px' }}>
          {segments.map((seg) => (
            <div
              key={seg.index}
              className="hover-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: hoveredIndex === seg.index ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                borderLeft: `4px solid ${seg.color}`,
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredIndex(seg.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>{seg.forma_pagamento}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>R$ {seg.val.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: seg.color }}>
                {seg.percent}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Top Sellers Leaderboard
export function TopSellersRanking({ sellers }: { sellers: SellerMetric[] }) {
  const top5 = useMemo(() => {
    return [...(sellers || [])]
      .sort((a, b) => Number(b.valor_total_vendido || 0) - Number(a.valor_total_vendido || 0))
      .slice(0, 5);
  }, [sellers]);

  const maxVal = top5.length > 0 ? Number(top5[0].valor_total_vendido || 1) : 1;
  const medals = ['🥇', '🥈', '🥉', '4º', '5º'];

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} style={{ color: '#f59e0b' }} />
          <h4>Top Lojistas Campeões de Vendas</h4>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
        {top5.length > 0 ? top5.map((s, idx) => {
          const val = Number(s.valor_total_vendido || 0);
          const percent = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;

          return (
            <div
              key={s.usuario_id || idx}
              className="hover-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: idx === 0 ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface)',
                border: idx === 0 ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid var(--border-color)'
              }}
            >
              <div style={{ fontSize: '20px', width: '28px', textAlign: 'center', flexShrink: 0 }}>{medals[idx]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.nome}
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500, marginLeft: '6px' }}>
                      ({s.unidade_nome || 'Sem Filial'})
                    </span>
                  </span>
                  <span style={{ color: 'var(--accent-light)', flexShrink: 0, marginLeft: '8px' }}>
                    R$ {val.toFixed(2)}
                  </span>
                </div>

                <div style={{ height: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: idx === 0 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                      borderRadius: '3px',
                      transition: 'width 0.8s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '24px' }}>
            Nenhum lojista com vendas registradas.
          </div>
        )}
      </div>
    </div>
  );
}

// 4. Inventory Health & Stock Distribution
export function InventoryHealthCard({ total, critico, estoqueValor }: { total: number; critico: number; estoqueValor: number }) {
  const regular = Math.max(0, total - critico);
  const percentRegular = total > 0 ? Math.round((regular / total) * 100) : 100;
  const percentCritico = total > 0 ? Math.round((critico / total) * 100) : 0;

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PackageCheck size={18} style={{ color: 'var(--accent-light)' }} />
          <h4>Saúde do Inventário da Rede</h4>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          {total} produtos totais
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '6px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Patrimônio em Mercadoria</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-light)' }}>
              R$ {Number(estoqueValor || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: critico > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: critico > 0 ? '#fbbf24' : '#34d399',
              border: critico > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              {critico > 0 ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
              {critico > 0 ? `${critico} itens em alerta` : 'Estoque 100% Saudável'}
            </span>
          </div>
        </div>

        {/* Progress Bar for Stock Distribution */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
            <span style={{ color: '#34d399' }}>Regular: {regular} ({percentRegular}%)</span>
            {critico > 0 && <span style={{ color: '#f87171' }}>Crítico/Zerado: {critico} ({percentCritico}%)</span>}
          </div>
          <div style={{ height: '10px', background: 'var(--bg-surface)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${percentRegular}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
            {critico > 0 && <div style={{ width: `${percentCritico}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />}
          </div>
        </div>
      </div>
    </div>
  );
}
