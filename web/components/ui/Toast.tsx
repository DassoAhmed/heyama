'use client'

import React, { createContext, useContext, useState } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toast: (props: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default' }: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              t.variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            <div className="font-semibold">{t.title}</div>
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function Toaster() {
  return null; // The toasts are rendered in the ToastProvider
}