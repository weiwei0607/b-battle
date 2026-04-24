import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingButton
 * 可複用的載入按鈕元件，自動處理 loading 狀態的視覺反饋
 *
 * @param {boolean} loading - 是否處於載入中
 * @param {boolean} disabled - 是否禁用（會與 loading 合併）
 * @param {ReactNode} children - 按鈕內容
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {Function} onClick - 點擊事件
 * @param {string} className - 額外樣式
 * @param {string} type - 按鈕類型
 */
const LoadingButton = ({
  loading = false,
  disabled = false,
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = loading || disabled;

  const variantStyles = {
    primary: 'bg-stone-800 text-white hover:bg-stone-700 shadow-lg',
    secondary: 'bg-white border-2 border-stone-200 text-stone-800 hover:bg-stone-50',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-lg',
    ghost: 'bg-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-100',
    amber: 'bg-amber-500 text-white hover:bg-amber-400 shadow-lg',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-[10px] rounded-xl',
    md: 'px-4 py-3 text-xs rounded-2xl',
    lg: 'w-full py-4 text-xs rounded-2xl font-black',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        flex items-center justify-center gap-2
        font-black tracking-widest uppercase
        active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2
          size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14}
          className="animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      <span className={loading ? 'opacity-90' : ''}>{children}</span>
    </button>
  );
};

export default LoadingButton;
