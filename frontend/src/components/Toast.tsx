import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: AlertTriangle,
      color: 'text-amber-500',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: XCircle,
      color: 'text-rose-500',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      color: 'text-blue-500',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`fixed bottom-5 right-5 flex items-center gap-3 p-4 rounded-xl border shadow-lg max-w-sm z-50 animate-bounce transition-all ${config.bg}`}
      role="alert"
    >
      <Icon className={`flex-shrink-0 ${config.color}`} size={20} />
      <div className="text-sm font-semibold flex-1">{message}</div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-black/5 transition-colors text-gray-500 hover:text-gray-800"
      >
        <X size={16} />
      </button>
    </div>
  );
};
export default Toast;
