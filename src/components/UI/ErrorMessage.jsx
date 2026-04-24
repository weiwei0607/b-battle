import React from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * ErrorMessage
 * 可複用的錯誤訊息元件，支援 dismiss 功能
 *
 * @param {string} message - 錯誤訊息
 * @param {Function} onDismiss - 關閉回調
 * @param {string} variant - 'inline' | 'banner' | 'toast'
 */
const ErrorMessage = ({ message, onDismiss, variant = 'inline' }) => {
  if (!message) return null;

  const variantStyles = {
    inline: 'bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold',
    banner: 'bg-red-600 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-lg flex items-center gap-2',
    toast: 'bg-stone-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-3',
  };

  return (
    <div
      className={`${variantStyles[variant]} animate-in slide-in-from-top-2 duration-300`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle size={variant === 'inline' ? 16 : 18} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
          aria-label="關閉錯誤訊息"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
