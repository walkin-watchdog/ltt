import type { Toast } from '@/types.ts';
import { createContext, useContext, useState, useRef, useEffect } from 'react';


const ToastCtx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});

export const useToast = () => useContext(ToastCtx);

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<{ [id: string]: NodeJS.Timeout }>({});

  const push = (t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    // Auto-dismiss after 5 seconds
    timers.current[id] = setTimeout(() => dismiss(id), 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map((t, index) => (
          <div
            key={t.id}
            className={`
              relative flex items-center p-4 rounded-2xl shadow-2xl min-w-[280px] max-w-sm cursor-pointer
              backdrop-blur-sm transition-all duration-500 ease-out transform
              hover:scale-105 hover:shadow-3xl active:scale-95
              ${
                t.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 border border-green-400/30'
                  : t.type === 'error'
                  ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 border border-red-400/30'
                  : t.type === 'info'
                  ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 border border-blue-400/30'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 border border-yellow-400/30'
              }
            `}
            onClick={() => dismiss(t.id)}
            style={{
              boxShadow: `
                0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
              animation: `slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${index * 0.1}s both`,
            }}
          >
            {/* Glowing effect */}
            <div className={`
              absolute inset-0 rounded-2xl opacity-20 blur-xl
              ${
                t.type === 'success'
                  ? 'bg-green-400'
                  : t.type === 'error'
                  ? 'bg-red-400'
                  : t.type === 'info'
                  ? 'bg-blue-400'
                  : 'bg-yellow-400'
              }
            `} style={{ zIndex: -1 }} />

            {/* Icon with enhanced styling */}
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full mr-3 
              backdrop-blur-sm shadow-lg
              ${
                t.type === 'success'
                  ? 'bg-white/20 border border-white/30'
                  : t.type === 'error'
                  ? 'bg-white/20 border border-white/30'
                  : t.type === 'info'
                  ? 'bg-white/20 border border-white/30'
                  : 'bg-black/20 border border-black/30'
              }
            `}>
              {t.type === 'success' && (
                <svg className="h-6 w-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {t.type === 'error' && (
                <svg className="h-6 w-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {t.type === 'info' && (
                <svg className="h-6 w-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
                </svg>
              )}
              {t.type === 'warning' && (
                <svg className="h-6 w-6 text-gray-800 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-2.99l-6.93-12a2 2 0 00-3.48 0l-6.93 12A2 2 0 005.07 19z" />
                </svg>
              )}
            </div>

            {/* Message text */}
            <div className="flex-1">
              <span className={`
                text-sm font-semibold leading-relaxed drop-shadow-sm
                ${t.type === 'warning' ? 'text-gray-800' : 'text-white'}
              `}>
                {t.message}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
              className={`
                ml-2 p-1 rounded-full transition-all duration-200
                hover:bg-white/20 active:bg-white/30
                ${t.type === 'warning' ? 'hover:bg-black/10 active:bg-black/20' : ''}
              `}
            >
              <svg 
                className={`h-4 w-4 ${t.type === 'warning' ? 'text-gray-700' : 'text-white/80'}`} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={2} 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Enhanced progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden">
              <div className={`
                h-full rounded-b-2xl
                ${
                  t.type === 'success'
                    ? 'bg-white/30'
                    : t.type === 'error'
                    ? 'bg-white/30'
                    : t.type === 'info'
                    ? 'bg-white/30'
                    : 'bg-black/30'
                }
              `}>
                <div 
                  className={`
                    h-full rounded-b-2xl shadow-sm
                    ${
                      t.type === 'success'
                        ? 'bg-white/70'
                        : t.type === 'error'
                        ? 'bg-white/70'
                        : t.type === 'info'
                        ? 'bg-white/70'
                        : 'bg-black/70'
                    }
                  `}
                  style={{
                    animation: 'toastProgress 5s linear forwards',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced animations and styles */}
      <style>{`
        @keyframes slideInBounce {
          0% { 
            opacity: 0; 
            transform: translateX(100px) scale(0.8) rotate(10deg);
          }
          60% { 
            opacity: 1; 
            transform: translateX(-10px) scale(1.05) rotate(-2deg);
          }
          100% { 
            opacity: 1; 
            transform: translateX(0) scale(1) rotate(0deg);
          }
        }
        
        @keyframes toastProgress {
          from { 
            width: 100%; 
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          to { 
            width: 0%; 
            opacity: 0.5;
          }
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
          }
          50% { 
            opacity: 0.8; 
          }
        }

        .toast-glow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </ToastCtx.Provider>
  );
};