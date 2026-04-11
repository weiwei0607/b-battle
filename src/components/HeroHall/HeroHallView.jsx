import React, { useState, useEffect } from 'react';
import { Settings2, Heart, Lock, Sparkles, Clock, Target, AlertCircle, Home, Hammer, LogOut, LogIn, Cloud } from 'lucide-react';
import { getHomeStatus, getBondLevel, getFrameStyle } from '../../utils/constants';
import { auth, signOut } from '../../firebase';

const HeroHallView = ({ 
  userTitle, userFrame, persona, personaStats, setPersona,
  setShowBudgetSetup, currentTier, lastPersonaSwitch, setLastPersonaSwitch, 
  wishlist, setWishlist, debt, homeMaterials, user, setShowLogin, setView
}) => {
  const [now, setNow] = useState(Date.now());
  const safeMaterials = homeMaterials || 0;
  const home = getHomeStatus(safeMaterials);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  if (!personaStats || !personaStats[persona]) {
    return <div className="p-10 text-center text-stone-400 font-black italic">召喚英雄中...</div>;
  }

  const currentPersona = personaStats[persona];
  const bondLevel = getBondLevel(currentPersona.intimacy);
  const frameStyle = getFrameStyle(userFrame);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("已安全登出，資料將保留在本地瀏覽器。");
      setView('battle'); // 自動跳轉回首頁，增加「動態感」
    } catch (err) {
      alert("登出失敗：" + err.message);
    }
  };

  const checkAndSetPersona = (pId) => {
    if (pId === persona) return;
    let allowed = false;
    let message = "";

    if (currentTier === 'prime') { allowed = true; } 
    else if (currentTier === 'free') {
      if (['peer', 'asian_parent'].includes(pId)) { allowed = true; } 
      else { message = "🔒 此人格為高級特權，請先升級 PRO 帳戶。"; }
    } else if (currentTier === 'pro') {
      const cooldown = 7 * 24 * 60 * 60 * 1000;
      if (!lastPersonaSwitch || (now - lastPersonaSwitch) > cooldown) { allowed = true; } 
      else {
        const remaining = Math.ceil((cooldown - (now - lastPersonaSwitch)) / (24 * 3600000));
        message = `⏳ PRO 帳戶每週限切換一次，還需等待 ${remaining} 天。`;
      }
    }

    if (allowed) {
      setPersona(pId);
      if (currentTier === 'pro') setLastPersonaSwitch(now);
    } else { alert(message); }
  };

  return (
    <div className="space-y-8 p-4 text-center pb-48 animate-in slide-in-from-left duration-500 text-left">
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10 text-left">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="grid grid-cols-6 gap-2 rotate-12 scale-150"><Hammer size={40}/><Hammer size={40}/><Hammer size={40}/></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-bounce">{home.icon}</div>
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">Dream Territory {user ? "☁️" : "📡"}</p>
          <h3 className="text-xl font-black text-white tracking-tight">{home.name}</h3>
          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-stone-400">領地建材: {safeMaterials.toFixed(0)}</span>
              <span className="text-[10px] font-bold text-white/40">Next: {home.next}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000" style={{ width: `${Math.min(100, (safeMaterials / (typeof home.next === 'number' ? home.next : (safeMaterials || 1)) * 100))}%` }} />
            </div>
          </div>
          <p className="mt-4 text-[9px] text-stone-500 italic text-center">「自律的血汗，終將化為不朽的城池」</p>
        </div>
      </div>

      <div className="relative inline-block group text-center w-full">
        <div className={`w-28 h-28 bg-[#FAF7F2] rounded-[2.5rem] flex items-center justify-center text-5xl rotate-3 mx-auto shadow-sm overflow-hidden transition-transform group-hover:scale-105 ${frameStyle} ${debt >= 500 ? 'grayscale sepia' : ''}`}>
          {currentPersona.icon?.startsWith('data:') ? <img src={currentPersona.icon} className="w-full h-full object-cover" alt="avatar" /> : currentPersona.icon}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 bg-stone-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/10">Lv.{bondLevel.level}</div>
      </div>
      
      <h2 className={`text-3xl font-black tracking-tight text-center ${debt >= 500 ? 'text-red-600' : 'text-stone-800'}`}>{userTitle}</h2>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
        {Object.entries(personaStats).map(([pId, stats]) => {
          const isLocked = currentTier === 'free' && !['peer', 'asian_parent'].includes(pId);
          return (
            <button key={pId} onClick={() => checkAndSetPersona(pId)} className={`min-w-[110px] p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-3 relative ${persona === pId ? 'border-[#D7C9B1] bg-[#FAF7F2] shadow-md scale-105' : 'border-stone-100 bg-white opacity-60'}`}>
              <span className="text-4xl">{stats.icon}</span>
              <div className="text-[10px] font-black tracking-wider uppercase">{stats.title}</div>
              <div className="flex items-center gap-1 text-[#BC8F8F]"><Heart size={10} fill="#BC8F8F" /><span className="text-[10px] font-black">{stats.intimacy}</span></div>
              {isLocked && <div className="absolute top-2 right-2 text-stone-300"><Lock size={12} /></div>}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-stone-100 p-6 rounded-[2rem] text-left shadow-sm">
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Target size={14} className="text-[#D7C9B1]"/> Current Goal</h3>
        <input value={wishlist} onChange={(e) => setWishlist(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-sm font-black text-stone-800 focus:bg-white transition-colors outline-none" placeholder="輸入你的終極願望..." />
      </div>

      <button onClick={setShowBudgetSetup} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl text-[11px] tracking-[0.2em] active:scale-95 transition-all"><Settings2 size={18} /> 戰略預算部署</button>
      
      {user ? (
        <button onClick={handleLogout} className="w-full py-4 mt-4 bg-transparent border-2 border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] active:scale-95 transition-all">
          <LogOut size={16} /> 登出帳號並備份
        </button>
      ) : (
        <button onClick={() => setShowLogin(true)} className="w-full py-4 mt-4 bg-blue-50 border-2 border-blue-100 text-blue-600 hover:bg-blue-100 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] active:scale-95 transition-all shadow-sm">
          <LogIn size={16} /> 登入並同步雲端
        </button>
      )}
    </div>
  );
};

export default HeroHallView;
