import React from 'react';
import { Zap, BarChart3, User } from 'lucide-react';
import { LOCALES } from '../../utils/locales';

const BottomNav = ({ view, setView, lang }) => {
  const t = LOCALES[lang] || LOCALES.zh;
  const items = [
    { id: 'battle', icon: Zap, label: t.battle },
    { id: 'history', icon: BarChart3, label: t.history },
    { id: 'heroHall', icon: User, label: t.hall }
  ];

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[88%] max-w-sm rounded-[2rem] p-1.5 flex justify-around z-[100]"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 8px 32px rgba(28,25,23,0.10), 0 2px 8px rgba(28,25,23,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))',
      }}
    >
      {items.map(item => {
        const active = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="flex-1 py-2.5 rounded-[1.5rem] transition-all duration-200 flex flex-col items-center gap-1 active:scale-95"
            style={active ? {
              background: '#1c1917',
              boxShadow: '0 4px 12px rgba(28,25,23,0.22)',
            } : {}}
          >
            <item.icon
              size={17}
              style={{ color: active ? (item.id === 'battle' ? '#fbbf24' : 'white') : '#a8a29e' }}
              className={active && item.id === 'battle' ? 'fill-amber-400/20' : ''}
            />
            <span
              className="text-[8.5px] font-black tracking-wider uppercase"
              style={{ color: active ? 'white' : '#a8a29e' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
