import { createContext, useContext, useState } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});

export const useToast = () => useContext(ToastCtx);

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (t: Omit<Toast, 'id'>) =>
    setToasts((prev) => [...prev, { ...t, id: crypto.randomUUID() }]);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow text-sm text-white
              ${t.type === 'success' && 'bg-green-600'}
              ${t.type === 'error' && 'bg-red-600'}
              ${t.type === 'info' && 'bg-blue-600'}
              ${t.type === 'warning' && 'bg-yellow-600 text-gray-900'}
            `}
            onClick={() => dismiss(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};