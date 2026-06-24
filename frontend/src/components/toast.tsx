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

  const colors = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-amber-500 text-black',
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-auto">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${colors[toast.type]} px-4 py-3 rounded-lg shadow-lg animate-slide-in w-full sm:w-auto sm:max-w-sm break-words font-medium`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
