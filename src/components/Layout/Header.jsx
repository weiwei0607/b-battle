import React, { useState } from 'react';
import { Store, Zap, ShieldCheck, AlertTriangle, Swords, Globe, ChevronDown, Crown, Medal } from 'lucide-react';
import { getWalletStatus } from '../../utils/constants';

const Header = ({ currentTier, coins, debt, onShopClick, onAchievementsClick, onLeaderboardClick, setView, willpowerExp, lang, setLang, onWalletClick }) => {
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
    <header className="flex justify-between items-center z-[200] py-4 shrink-0 gap-2 relative">
      <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => setView('battle')}>
        <div className={`w-9 h-9 ${isInDebt ? 'bg-red-600' : 'bg-stone-800'} rounded-xl flex items-center justify-center transition-transform group-active:scale-90 shadow-md shrink-0`}>
          <Swords size={18} className="text-white" />
        </div>
        
        <div className="flex flex-col text-left overflow-hidden">
          <span className={`font-black text-sm leading-none tracking-tighter truncate ${isInDebt ? 'text-red-600' : 'text-stone-800'}`}>
            B-BATTLE
          </span>
          <div onClick={(e) => { e.stopPropagation(); onWalletClick(); }} className="flex items-center gap-1 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-[10px] leading-none shrink-0">{isInDebt ? '💸' : wallet.icon}</span>
            <span className={`text-[7px] font-black uppercase tracking-widest truncate ${isInDebt ? 'text-red-400' : wallet.color}`}>
              {isInDebt ? `負債 (-${debt})` : wallet.name}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 items-center overflow-visible pl-2">
        {/* 🏆 排行榜與成就 */}
        <div className="flex bg-stone-100/50 p-1 rounded-xl border border-stone-200/50 gap-1 shrink-0">
          <button onClick={onLeaderboardClick} className="w-8 h-8 flex items-center justify-center text-amber-600 hover:bg-white rounded-lg transition-all active:scale-90" title="全球排行榜">
            <Crown size={14} className="fill-amber-500/20" />
          </button>
          <button onClick={onAchievementsClick} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-white rounded-lg transition-all active:scale-90" title="個人成就">
            <Medal size={14} />
          </button>
        </div>

        {/* 🌐 語系 */}
        <div className="relative shrink-0">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="bg-white border border-stone-200 h-8 px-2 rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-sm min-w-[48px] justify-center"
          >
            <Globe size={10} className="text-stone-400" />
            <span className="text-[8px] font-black text-stone-600 uppercase">{lang}</span>
          </button>

          {showLangMenu && (
            <div className="absolute top-full mt-2 right-0 w-32 bg-white rounded-xl shadow-2xl border border-stone-100 py-1 z-[500] animate-in slide-in-from-top-2 duration-200 overflow-hidden">
              {langOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { 
                    setLang(opt.id); 
                    setShowLangMenu(false); 
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[10px] font-black transition-colors ${lang === opt.id ? 'text-amber-600 bg-amber-50' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                  {opt.label}
                </button>
              ))}
              <button 
                onClick={() => setShowLangMenu(false)}
                className="w-full text-center py-2 text-[8px] font-bold text-stone-300 border-t border-stone-50 bg-stone-50/50"
              >
                CLOSE
              </button>
            </div>
          )}
        </div>

        <button onClick={onShopClick} className="bg-white border border-stone-200 h-8 w-8 rounded-xl shadow-sm flex items-center justify-center hover:bg-stone-50 transition-colors shrink-0">
          <Store size={12} className="text-stone-500" />
        </button>
        
        <div className={`h-8 px-2.5 rounded-xl shadow-md flex items-center gap-1 text-white text-[10px] font-black transition-colors shrink-0 ${isInDebt ? 'bg-red-600' : 'bg-stone-800'}`}>
          {isInDebt ? <AlertTriangle size={10} className="text-white" /> : <Zap size={10} className="text-amber-400 fill-amber-400" />}
          {coins.toLocaleString()}
        </div>
      </div>
    </header>
  );
};

export default Header;
