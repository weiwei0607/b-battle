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
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[88%] max-w-sm bg-white/90 backdrop-blur-md border border-stone-200/60 rounded-[2.5rem] p-2 flex justify-around shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-[100]">
      {items.map(item => (
        <button 
          key={item.id} 
          onClick={() => setView(item.id)} 
          className={`flex-1 py-3 rounded-2xl transition-all flex flex-col items-center gap-1 ${view === item.id ? 'bg-stone-800 text-white shadow-lg shadow-stone-200' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <item.icon size={18} />
          <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
