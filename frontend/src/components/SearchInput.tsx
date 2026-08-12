import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  debounceMs = 300,
  className = '',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={`search-input-wrapper ${className}`}>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={localValue}
        onChange={e => handleChange(e.target.value)}
      />
      <Search size={16} className="search-icon" />
    </div>
  );
}
