import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme, playClick } = useTheme();

  const handleToggle = () => {
    playClick();
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`theme-toggle-btn ${className}`}
      title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
      aria-label="Alternar tema claro/escuro"
    >
      <div className={`theme-toggle-slider ${theme}`}>
        {theme === 'dark' ? (
          <Moon size={16} className="theme-toggle-icon moon" />
        ) : (
          <Sun size={16} className="theme-toggle-icon sun" />
        )}
      </div>
      <span className="theme-toggle-label">
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
