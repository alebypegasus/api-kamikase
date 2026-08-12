import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastItem {
  id: number;
  type: 'success' | 'danger' | 'warning' | 'info';
  title?: string;
  message: string;
  exiting?: boolean;
}

interface ToastContextType {
  addToast: (type: ToastItem['type'], message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const TOAST_ICONS = {
  success: CheckCircle,
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_TITLES = {
  success: 'Sucesso',
  danger: 'Erro',
  warning: 'Atenção',
  info: 'Informação',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastItem['type'], message: string, title?: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message, title }]);

    // Auto-dismiss after 4s
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => {
          const Icon = TOAST_ICONS[toast.type];
          return (
            <div key={toast.id} className={`toast ${toast.type} ${toast.exiting ? 'exiting' : ''}`}>
              <Icon size={18} className="toast-icon" />
              <div className="toast-body">
                <div className="toast-title">{toast.title || TOAST_TITLES[toast.type]}</div>
                <div className="toast-message">{toast.message}</div>
              </div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
              <div className="toast-progress" />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
