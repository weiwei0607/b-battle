import React, { useState } from 'react';
import { Store, Zap, ShieldCheck, AlertTriangle, Swords, Globe, ChevronDown, Crown, Trophy, Medal, Loader2 } from 'lucide-react';
import { getWalletStatus } from '../../utils/constants';

const Header = ({ coins, debt, onShopClick, onAchievementsClick, onLeaderboardClick, setView, willpowerExp, lang, setLang, onWalletClick }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [langLoading, setLangLoading] = useState(false);
  const wallet = getWalletStatus(willpowerExp);
  const isInDebt = debt >= 500;

  const langOptions = [
    { id: 'zh', label: '繁體中文' },
    { id: 'en', label: 'English' },
    { id: 'ja', label: '日本語' }
  ];

  return (
    <header className="flex justify-between items-center z-[200] py-3.5 shrink-0 gap-2 relative">
      {/* Brand */}
      <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => setView('battle')}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-active:scale-90 shrink-0"
          style={isInDebt
            ? { background: '#dc2626', boxShadow: '0 3px 10px rgba(220,38,38,0.35)' }
            : { background: 'linear-gradient(135deg, #2A2218 0%, #1a1510 100%)', boxShadow: '0 3px 10px rgba(42,34,24,0.22), inset 0 1px 0 rgba(255,255,255,0.07)' }}
        >
          <Swords size={18} style={{ color: isInDebt ? '#fff' : '#C5A140' }} />
        </div>

        <div className="flex flex-col text-left overflow-hidden">
          <span className="font-cinzel font-bold text-[14px] leading-none tracking-[0.1em] truncate"
            style={{ color: isInDebt ? '#dc2626' : '#2A2218', fontFamily: 'Cinzel, serif' }}>
            B·BATTLE
          </span>
          <div onClick={(e) => { e.stopPropagation(); onWalletClick(); }}
            className="flex items-center gap-1 mt-0.5 cursor-pointer hover:opacity-75 transition-opacity">
            <span className="text-[10px] leading-none shrink-0">{isInDebt ? '💸' : wallet.icon}</span>
            <span className="text-[7px] font-semibold uppercase tracking-widest truncate font-cinzel"
              style={{ color: isInDebt ? '#ef4444' : '#B8A898', fontFamily: 'Cinzel, serif' }}>
              {isInDebt ? `負債 (-${debt})` : wallet.name}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 items-center overflow-visible">
        {/* 排行榜 & 成就 */}
        <div className="flex p-1 rounded-xl gap-0.5 shrink-0"
          style={{ background: 'rgba(42,34,24,0.05)', border: '1px solid #D8CFC3' }}>
          <button onClick={onLeaderboardClick}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 hover:bg-white/60"
            style={{ color: '#C5A140' }} title="排行榜">
            <Crown size={14} />
          </button>
          <button onClick={onAchievementsClick}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 hover:bg-white/60"
            style={{ color: '#6B5B45' }} title="成就">
            <Trophy size={14} />
          </button>
        </div>

        {/* 語系 */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="h-8 px-2 rounded-xl flex items-center gap-1 transition-all active:scale-95 min-w-[46px] justify-center"
            style={{ background: '#FAF8F4', border: '1px solid #D8CFC3', boxShadow: '0 1px 4px rgba(42,34,24,0.06)' }}
          >
            {langLoading
              ? <Loader2 size={10} className="animate-spin" style={{ color: '#B8A898' }} />
              : <Globe size={10} style={{ color: '#B8A898' }} />}
            <span className="text-[8px] font-semibold uppercase font-cinzel" style={{ color: '#6B5B45', fontFamily: 'Cinzel, serif' }}>{lang}</span>
          </button>

          {showLangMenu && (
            <div className="absolute top-full mt-2 right-0 w-36 rounded-2xl py-1.5 z-[500] overflow-hidden"
              style={{ background: '#FAF8F4', border: '1px solid #D8CFC3', boxShadow: '0 12px 32px rgba(42,34,24,0.14)' }}>
              {langOptions.map((opt) => (
                <button key={opt.id}
                  onClick={async () => {
                    setLangLoading(true);
                    try { await setLang(opt.id); } finally { setLangLoading(false); setShowLangMenu(false); }
                  }}
                  className="w-full text-left px-4 py-2.5 text-[11px] transition-colors"
                  style={{
                    color: lang === opt.id ? '#C5A140' : '#6B5B45',
                    background: lang === opt.id ? 'rgba(197,161,64,0.06)' : 'transparent',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: lang === opt.id ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <div className="h-px mx-3 my-1" style={{ background: '#D8CFC3' }} />
              <button onClick={() => setShowLangMenu(false)}
                className="w-full text-center py-1.5 text-[9px] font-cinzel tracking-widest"
                style={{ color: '#B8A898', fontFamily: 'Cinzel, serif' }}>
                CLOSE
              </button>
            </div>
          )}
        </div>

        {/* Shop */}
        <button onClick={onShopClick}
          className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors shrink-0"
          style={{ background: '#FAF8F4', border: '1px solid #D8CFC3' }}>
          <Store size={12} style={{ color: '#6B5B45' }} />
        </button>

        {/* 金幣 */}
        <div
          className="h-8 px-3 rounded-xl flex items-center gap-1.5 shrink-0 transition-all"
          style={isInDebt
            ? { background: '#dc2626', boxShadow: '0 3px 10px rgba(220,38,38,0.3)' }
            : { background: 'linear-gradient(135deg, #2A2218 0%, #1a1510 100%)', boxShadow: '0 3px 10px rgba(42,34,24,0.22), inset 0 1px 0 rgba(255,255,255,0.07)' }}
        >
          {isInDebt
            ? <AlertTriangle size={10} style={{ color: '#fff' }} />
            : <Zap size={11} style={{ color: '#C5A140', fill: 'rgba(197,161,64,0.4)' }} />}
          <span className="font-cinzel text-[11px] font-semibold"
            style={{ color: isInDebt ? '#fff' : '#D4B55A', fontFamily: 'Cinzel, serif' }}>
            {coins.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
