import { Minus, Plus, Trash2 } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (newValue: number) => void;
  onRemove: () => void;
}

export default function QuantitySelector({ value, max, onChange, onRemove }: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value <= 1) {
      onRemove();
    } else {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="qty-selector">
      <button className={`qty-btn ${value <= 1 ? 'danger' : ''}`} onClick={handleDecrease} title={value <= 1 ? 'Remover' : 'Diminuir'}>
        {value <= 1 ? <Trash2 size={12} /> : <Minus size={12} />}
      </button>
      <span className="qty-value">{value}</span>
      <button className="qty-btn" onClick={handleIncrease} disabled={value >= max} title="Aumentar">
        <Plus size={12} />
      </button>
    </div>
  );
}
