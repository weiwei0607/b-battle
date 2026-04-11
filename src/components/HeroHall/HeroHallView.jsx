import React, { useState, useEffect } from 'react';
import { Settings2, Heart, Lock, Sparkles, Clock, Target, AlertCircle, Home, Hammer, LogOut, LogIn, Cloud, Globe } from 'lucide-react';
import { getHomeStatus, getBondLevel, getFrameStyle } from '../../utils/constants';
import { LOCALES } from '../../utils/locales';
import { auth, signOut } from '../../firebase';

const HeroHallView = ({ 
  userTitle, userFrame, persona, personaStats, setPersona,
  setShowBudgetSetup, currentTier, lastPersonaSwitch, setLastPersonaSwitch, 
  wishlist, setWishlist, debt, homeMaterials, user, setShowLogin, setView, lang, setLang
}) => {
  const [now, setNow] = useState(Date.now());
  const safeMaterials = homeMaterials || 0;
  const home = getHomeStatus(safeMaterials);
  const t = LOCALES[lang] || LOCALES.zh;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  if (!personaStats || !personaStats[persona]) {
    return <div className="p-10 text-center text-stone-400 font-black italic">{t.loading_persona}</div>;
  }

  const currentPersona = personaStats[persona];
  const bondLevel = getBondLevel(currentPersona.intimacy);
  const frameStyle = getFrameStyle(userFrame);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert(lang === 'zh' ? "已安全登出" : lang === 'ja' ? "ログアウトしました" : "Logged out safely");
      setView('battle');
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const toggleLang = () => {
    const next = lang === 'zh' ? 'en' : lang === 'en' ? 'ja' : 'zh';
    setLang(next);
  };

  const checkAndSetPersona = (pId) => {
    if (pId === persona) return;
    let allowed = false;
    let message = "";

    if (currentTier === 'prime') { allowed = true; } 
    else if (currentTier === 'free') {
      if (['peer', 'asian_parent'].includes(pId)) { allowed = true; } 
      else { message = "🔒 VIP Feature: Please upgrade."; }
    } 

    if (allowed) {
      setPersona(pId);
    } else { alert(message); }
  };

  return (
    <div className="space-y-8 p-4 text-center pb-48 animate-in slide-in-from-left duration-500 text-left">
      {/* 頂部建築與語系切換 */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2 text-stone-400">
          <Globe size={14} />
          <button onClick={toggleLang} className="text-[10px] font-black uppercase tracking-widest hover:text-stone-800 transition-colors">
            {lang === 'zh' ? '繁體中文' : lang === 'en' ? 'English' : '日本語'}
          </button>
        </div>
        <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest flex items-center gap-1">
          {user ? <Cloud size={12} className="text-blue-400" /> : <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />}
          {user ? 'Cloud Synced' : 'Local Mode'}
        </div>
      </div>

      <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10 text-left">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="grid grid-cols-6 gap-2 rotate-12 scale-150"><Hammer size={40}/><Hammer size={40}/><Hammer size={40}/></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-bounce">{home.icon}</div>
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">Dream Territory</p>
          <h3 className="text-xl font-black text-white tracking-tight">{home.name}</h3>
          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-stone-400">Materials: {safeMaterials.toFixed(0)}</span>
              <span className="text-[10px] font-bold text-white/40">Next: {home.next}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000" style={{ width: `${Math.min(100, (safeMaterials / (typeof home.next === 'number' ? home.next : (safeMaterials || 1)) * 100))}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative inline-block group text-center w-full">
        <div className={`w-28 h-28 bg-[#FAF7F2] rounded-[2.5rem] flex items-center justify-center text-5xl rotate-3 mx-auto shadow-sm overflow-hidden transition-transform group-hover:scale-105 ${frameStyle} ${debt >= 500 ? 'grayscale sepia' : ''}`}>
          {currentPersona.icon?.startsWith('data:') ? <img src={currentPersona.icon} className="w-full h-full object-cover" alt="avatar" /> : currentPersona.icon}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 bg-stone-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/10">Lv.{bondLevel.level}</div>
      </div>
      
      <h2 className={`text-3xl font-black tracking-tight text-center ${debt >= 500 ? 'text-red-600' : 'text-stone-800'}`}>{userTitle}</h2>

      {/* 人格選擇 */}
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
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Target size={14} className="text-[#D7C9B1]"/> {t.current_goal}</h3>
        <input value={wishlist} onChange={(e) => setWishlist(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-sm font-black text-stone-800 focus:bg-white transition-colors outline-none" placeholder="..." />
      </div>

      <button onClick={setShowBudgetSetup} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl text-[11px] tracking-[0.2em] active:scale-95 transition-all"><Settings2 size={18} /> {t.budget_setup}</button>
      
      {user ? (
        <button onClick={handleLogout} className="w-full py-4 mt-4 bg-transparent border-2 border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] active:scale-95 transition-all">
          <LogOut size={16} /> {t.logout}
        </button>
      ) : (
        <button onClick={() => setShowLogin(true)} className="w-full py-4 mt-4 bg-blue-50 border-2 border-blue-100 text-blue-600 hover:bg-blue-100 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] active:scale-95 transition-all shadow-sm">
          <LogIn size={16} /> {t.login_sync}
        </button>
      )}
    </div>
  );
};

export default HeroHallView;
