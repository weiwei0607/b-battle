import React from 'react';
import { Inbox, Users, Search, ShieldCheck } from 'lucide-react';

/**
 * EmptyState
 * 空狀態元件，用於無資料時的友好提示
 *
 * @param {string} icon - 'inbox' | 'users' | 'search' | 'shield'
 * @param {string} title - 標題
 * @param {string} description - 描述
 * @param {ReactNode} action - 操作按鈕
 */
const EmptyState = ({
  icon = 'inbox',
  title,
  description,
  action,
}) => {
  const icons = {
    inbox: Inbox,
    users: Users,
    search: Search,
    shield: ShieldCheck,
  };

  const Icon = icons[icon] || Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-stone-100 rounded-3xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-stone-300" />
      </div>
      <h3 className="text-sm font-black text-stone-600 mb-2">{title}</h3>
      {description && (
        <p className="text-[11px] text-stone-400 font-medium max-w-[200px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
