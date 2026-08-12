interface SkeletonProps {
  variant?: 'text' | 'card' | 'stat' | 'row' | 'circle';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

export default function Skeleton({ variant = 'text', width, height, count = 1, className = '' }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  const getClass = () => {
    switch (variant) {
      case 'card': return 'skeleton skeleton-card';
      case 'stat': return 'skeleton skeleton-stat';
      case 'row': return 'skeleton skeleton-row';
      case 'circle': return 'skeleton skeleton-circle';
      default: return 'skeleton skeleton-text';
    }
  };

  return (
    <>
      {items.map(i => (
        <div
          key={i}
          className={`${getClass()} ${className}`}
          style={{
            width: width || undefined,
            height: height || undefined,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <table className="custom-table" style={{ width: '100%' }}>
      <thead>
        <tr>
          {Array.from({ length: cols }, (_, i) => (
            <th key={i}>
              <Skeleton width={`${60 + Math.random() * 40}%`} height="12px" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }, (_, c) => (
              <td key={c}>
                <Skeleton width={`${50 + Math.random() * 40}%`} height="14px" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="pdv-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  );
}
