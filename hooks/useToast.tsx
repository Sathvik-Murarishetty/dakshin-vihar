'use client';


 

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';


 

interface Toast {

  id: number;

  message: string;

  type: 'success' | 'error' | 'info';

}


 

interface ToastContextValue {

  showToast: (message: string, type?: Toast['type']) => void;

}


 

const ToastContext = createContext<ToastContextValue | null>(null);


 

export function ToastProvider({ children }: { children: ReactNode }) {

  const [toasts, setToasts] = useState<Toast[]>([]);


 

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {

    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);

  }, []);


 

  const STYLES: Record<Toast['type'], { bg: string; border: string; color: string; icon: string }> = {

    success: { bg: '#162019',              border: 'rgba(22,160,133,.35)',  color: '#F6F2E9', icon: '✓' },

    error:   { bg: '#1a0a08',              border: 'rgba(185,58,58,.4)',    color: '#F6F2E9', icon: '✕' },

    info:    { bg: 'rgba(22,32,25,.92)',   border: 'rgba(216,177,90,.3)',   color: '#F6F2E9', icon: 'ℹ' },

  };


 

  return (

    <ToastContext.Provider value={{ showToast }}>

      {children}

      {/* Toast stack */}

      <div

        className="fixed top-5 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2"

        style={{ pointerEvents: 'none' }}

        aria-live="polite"

        aria-atomic="false"

      >

        {toasts.map((toast) => {

          const s = STYLES[toast.type];

          return (

            <div

              key={toast.id}

              className="flex items-center gap-3 rounded-full px-5 py-2.5 text-[13px] font-medium"

              style={{

                background:     s.bg,

                border:         `1px solid ${s.border}`,

                color:          s.color,

                boxShadow:      '0 8px 32px rgba(0,0,0,.25)',

                backdropFilter: 'blur(12px)',

                animation:      'toast-in 280ms cubic-bezier(.16,.84,.44,1) both',

                pointerEvents:  'auto',

              }}

            >

              <span

                className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold shrink-0"

                style={{

                  background: toast.type === 'success' ? 'rgba(22,160,133,.25)' : 'rgba(216,177,90,.2)',

                  color: toast.type === 'success' ? '#4ade80' : '#D8B15A',

                }}

              >

                {s.icon}

              </span>

              {toast.message}

            </div>

          );

        })}

      </div>


 

      <style>{`

        @keyframes toast-in {

          from { opacity: 0; transform: translateY(-12px) scale(.95); }

          to   { opacity: 1; transform: translateY(0)     scale(1); }

        }

      `}</style>

    </ToastContext.Provider>

  );

}


 

export function useToast(): ToastContextValue {

  const ctx = useContext(ToastContext);

  if (!ctx) throw new Error('useToast must be used within ToastProvider');

  return ctx;

}