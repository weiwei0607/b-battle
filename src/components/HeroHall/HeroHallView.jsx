import React, { useState, useEffect } from 'react';
import { Settings2, Heart, Lock, Sparkles, Clock, Target, AlertCircle, Home, Hammer } from 'lucide-react';
import { getHomeStatus } from '../../utils/constants';

const HeroHallView = ({ 
  userTitle, userFrame, persona, personaStats, setPersona, getBondLevel, getFrameStyle, 
  setShowBudgetSetup, currentTier, lastPersonaSwitch, setLastPersonaSwitch, 
  setShowCustomModal, wishlist, setWishlist, debt, homeMaterials
}) => {
  const [now, setNow] = useState(Date.now());
  const home = getHomeStatus(homeMaterials || 0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const canSwitch = (pId) => {
    if (pId === persona || currentTier === 'prime') return true;
    if (currentTier === 'free') return pId === 'peer' || pId === 'asian_parent';
    if (currentTier === 'pro') {
      if (!lastPersonaSwitch) return true;
      return (now - lastPersonaSwitch) > 7 * 24 * 60 * 60 * 1000;
    }
    return false;
  };

  return (
    <div className="space-y-8 p-4 text-center pb-48 animate-in slide-in-from-left duration-500">
      
      {/* 夢想領地建設模組 */}
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="grid grid-cols-6 gap-2 rotate-12 scale-150"><Hammer size={40}/><Hammer size={40}/><Hammer size={40}/></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-bounce">{home.icon}</div>
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">Dream Territory</p>
          <h3 className="text-xl font-black text-white tracking-tight">{home.name}</h3>
          
          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-stone-400">大理石建材: {homeMaterials.toFixed(0)}</span>
              <span className="text-[10px] font-bold text-white/40">Next: {home.next}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                style={{ width: `${Math.min(100, (homeMaterials / (typeof home.next === 'number' ? home.next : homeMaterials) * 100))}%` }} 
              />
            </div>
          </div>
          <p className="mt-4 text-[9px] text-stone-500 italic">「守住每月的生存血量，將其轉化為永恆的領地」</p>
        </div>
      </div>

      <div className="relative inline-block">
        <div className={`w-28 h-28 bg-[#FAF7F2] rounded-[2.5rem] flex items-center justify-center text-5xl rotate-3 mx-auto shadow-sm overflow-hidden ${getFrameStyle(userFrame)} ${debt > 0 ? 'grayscale sepia' : ''}`}>
          {personaStats[persona]?.icon?.startsWith('data:') ? <img src={personaStats[persona].icon} className="w-full h-full object-cover" /> : personaStats[persona]?.icon}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl">Lv.{getBondLevel(personaStats[persona].intimacy)}</div>
      </div>
      
      <h2 className={`text-3xl font-bold tracking-tight ${debt > 0 ? 'text-red-600' : 'text-stone-800'}`}>{userTitle}</h2>
      {debt > 0 && <div className="text-red-500 font-black text-[10px] uppercase tracking-widest mt-1 italic animate-pulse">! 負債超人模式限制中 !</div>}

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
        {Object.entries(personaStats).map(([pId, stats]) => (
          <button key={pId} onClick={() => setPersona(pId)} className={`min-w-[110px] p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-3 relative ${persona === pId ? 'border-[#D7C9B1] bg-[#FAF7F2] shadow-md scale-105' : 'border-stone-100 bg-white opacity-60'}`}>
            <span className="text-4xl">{stats.icon}</span>
            <div className="text-[10px] font-bold tracking-wider">{stats.title}</div>
            <div className="flex items-center gap-1 text-[#BC8F8F]"><Heart size={10} fill="#BC8F8F" /><span className="text-[10px] font-bold">{stats.intimacy}</span></div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-stone-100 p-6 rounded-[2rem] text-left">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Target size={16} className="text-[#D7C9B1]"/> 本月願望清單</h3>
        <input value={wishlist} onChange={(e) => setWishlist(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl text-sm font-bold" />
      </div>

      <button onClick={setShowBudgetSetup} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-xl text-xs tracking-[0.2em]"><Settings2 size={18} /> 戰略預算部署</button>
    </div>
  );
};

export default HeroHallView;
