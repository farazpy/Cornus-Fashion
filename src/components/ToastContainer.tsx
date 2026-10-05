import React from 'react';
import { useShop } from '../context/ShopContext';
import { Check, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto glass-card bg-black text-white px-4 py-3 rounded-xs shadow-2xl flex items-center justify-between gap-3 text-xs tracking-wide animate-slideUp border border-white/15"
        >
          <div className="flex items-center gap-2.5">
            <Check className="w-3.5 h-3.5 text-white/90 shrink-0" />
            <span className="font-light">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
