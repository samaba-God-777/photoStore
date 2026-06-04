'use client';

import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastId = 0;
let toastCallbacks: ((toast: Toast) => void)[] = [];

export const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const id = String(toastId++);
  const toast = { id, message, type };
  toastCallbacks.forEach(cb => cb(toast));
  return id;
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      const timeout = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3500);
      return () => clearTimeout(timeout);
    };

    toastCallbacks.push(handleToast);
    return () => {
      toastCallbacks = toastCallbacks.filter(cb => cb !== handleToast);
    };
  }, []);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
