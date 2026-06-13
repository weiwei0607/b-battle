import React from 'react';
import { Zap, BarChart3, User } from 'lucide-react';
import { LOCALES } from '../../utils/locales';

const BottomNav = ({ view, setView, lang }) => {
  const t = LOCALES[lang] || LOCALES.zh;
  const items = [
    { id: 'battle',   icon: Zap,      label: t.battle },
    { id: 'history',  icon: BarChart3, label: t.history },
    { id: 'heroHall', icon: User,      label: t.hall }
  ];

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[88%] max-w-sm flex z-[100]"
      style={{
        borderRadius: '1.75rem',
        background: '#FAF8F4',
        border: '1px solid #D8CFC3',
        boxShadow: '0 8px 32px rgba(42,34,24,0.12), 0 2px 8px rgba(42,34,24,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))',
        padding: '0.375rem',
        paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Top gold line accent */}
      <div className="absolute top-0 left-8 right-8 h-px rounded-full pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(197,161,64,0.35), transparent)' }} />

      {items.map(item => {
        const active = view === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-200 active:scale-95"
            style={{
              borderRadius: '1.375rem',
              background: active
                ? 'linear-gradient(135deg, #2A2218 0%, #1a1510 100%)'
                : 'transparent',
              boxShadow: active
                ? '0 4px 12px rgba(42,34,24,0.25), inset 0 1px 0 rgba(255,255,255,0.07)'
                : 'none',
            }}
          >
            <Icon
              size={17}
              style={{
                color: active
                  ? (item.id === 'battle' ? '#C5A140' : '#FAF8F4')
                  : '#B8A898',
                filter: active && item.id === 'battle'
                  ? 'drop-shadow(0 0 4px rgba(197,161,64,0.5))'
                  : 'none',
              }}
            />
            <span
              className="text-[8px] tracking-[0.15em] uppercase"
              style={{
                fontFamily: 'Cinzel, serif',
                color: active ? (item.id === 'battle' ? '#C5A140' : '#FAF8F4') : '#B8A898',
                fontWeight: active ? 600 : 400,
              }}
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
