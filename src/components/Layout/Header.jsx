import React, { useState } from 'react';
import { Store, Zap, ShieldCheck, AlertTriangle, Swords, Globe, ChevronDown } from 'lucide-react';
import { getWalletStatus } from '../../utils/constants';

const Header = ({ currentTier, coins, debt, onShopClick, setView, willpowerExp, lang, setLang }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const wallet = getWalletStatus(willpowerExp);
  const isInDebt = debt >= 500;

  const langOptions = [
    { id: 'zh', label: '繁體中文' },
    { id: 'en', label: 'English' },
    { id: 'ja', label: '日本語' }
  ];

  const currentLangLabel = langOptions.find(o => o.id === lang)?.label || '繁中';

  return (
    <header className="flex justify-between items-center z-[200] py-6 shrink-0 gap-2 relative">
      <div className="flex items-center gap-3 cursor-pointer group flex-1" onClick={() => setView('battle')}>
        <div className={`w-10 h-10 ${isInDebt ? 'bg-red-600' : 'bg-stone-800'} rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 shadow-lg shadow-stone-200 shrink-0`}>
          <Swords size={20} className="text-white" />
        </div>
        
        <div className="flex flex-col text-left overflow-hidden">
          <span className={`font-black text-base leading-none tracking-tighter truncate ${isInDebt ? 'text-red-600' : 'text-stone-800'}`}>
            B-BATTLE
          </span>
          <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
            <span className="text-[12px] leading-none shrink-0">{isInDebt ? '💸' : wallet.icon}</span>
            <span className={`text-[8px] font-black uppercase tracking-widest truncate ${isInDebt ? 'text-red-400' : wallet.color}`}>
              {isInDebt ? `負債超人 (-${debt})` : wallet.name}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 items-center shrink-0">
        {/* 🌐 語系下拉選單 */}
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="bg-white/50 backdrop-blur-sm hover:bg-white text-stone-500 px-2.5 py-2 rounded-xl flex items-center gap-1 transition-all border border-stone-200 active:scale-95 shadow-sm"
          >
            <Globe size={12} />
            <span className="text-[9px] font-black">{currentLangLabel}</span>
            <ChevronDown size={10} className={`transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>

          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-[210]" onClick={() => setShowLangMenu(false)} />
              <div className="absolute top-full mt-2 right-0 w-32 bg-white rounded-2xl shadow-2xl border border-stone-100 py-2 z-[220] animate-in slide-in-from-top-2 duration-200">
                {langOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setLang(opt.id); setShowLangMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[10px] font-black transition-colors ${lang === opt.id ? 'text-amber-600 bg-amber-50' : 'text-stone-500 hover:bg-stone-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button onClick={onShopClick} className="bg-white/50 backdrop-blur-sm border border-stone-200/50 px-3 py-2 rounded-xl shadow-sm hover:bg-white transition-colors">
          <Store size={14} className="text-stone-500" />
        </button>
        
        <div className={`px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5 text-white text-xs font-black transition-colors ${isInDebt ? 'bg-red-600' : 'bg-stone-800'}`}>
          {isInDebt ? <AlertTriangle size={12} className="text-white" /> : <Zap size={12} className="text-[#D7C9B1]" />}
          {coins}
        </div>
      </div>
    </header>
  );
};

export default Header;
