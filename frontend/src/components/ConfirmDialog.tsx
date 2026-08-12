import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      setState({ isOpen: true, options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const { isOpen, options } = state;
  const isDanger = options.type === 'danger';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="confirm-overlay" onClick={handleCancel}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className={`confirm-dialog-icon ${options.type || 'danger'}`}>
              {isDanger ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
            </div>
            <h3 className="confirm-dialog-title">{options.title}</h3>
            <p className="confirm-dialog-message">{options.message}</p>
            <div className="confirm-dialog-actions">
              <button className="confirm-btn-cancel" onClick={handleCancel}>
                {options.cancelText || 'Cancelar'}
              </button>
              <button
                className={isDanger ? 'confirm-btn-danger' : 'confirm-btn-primary'}
                onClick={handleConfirm}
              >
                {options.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
