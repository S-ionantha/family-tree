import React, { useEffect } from 'react';

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface ToastProps extends ToastData {
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in`}>
      {message}
    </div>
  );
}
