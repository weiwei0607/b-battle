import React, { useState } from 'react';
import { User, ShieldCheck, Settings2, LogOut, LogIn, Target, Edit2, Check } from 'lucide-react';
import { getBondLevel, getFrameStyle, getHomeStatus } from '../../utils/constants';
import { LOCALES } from '../../utils/locales';

const HeroHallView = ({ 
  userTitle, persona, personaStats, setPersona, setShowBudgetSetup, 
  currentTier, lastPersonaSwitch, setLastPersonaSwitch, wishlist, setWishlist,
  debt, userFrame, homeMaterials, user, setShowLogin, setView, lang,
  userName, setUserName 
}) => {
  const t = LOCALES[lang] || LOCALES.zh;
  const currentPersona = personaStats[persona];
  const bond = getBondLevel(currentPersona.intimacy);
  const home = getHomeStatus(homeMaterials);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempCategory] = useState(userName);

  const handleSaveName = () => {
    setUserName(tempName);
    setIsEditingName(false);
  };

  const checkAndSetPersona = (id) => {
    const isLocked = currentTier === 'free' && !['peer', 'asian_parent'].includes(id);
    if (isLocked) { alert("此人格為高級版專屬，請升級意志力會員！"); return; }
    const now = Date.now();
    if (lastPersonaSwitch && now - lastPersonaSwitch < 3600000) {
      alert("頻繁切換人格會導致關係不穩！請一小時後再試。"); return;
    }
    setPersona(id);
    setLastPersonaSwitch(now);
  };

  const handleLogout = () => { auth.signOut(); alert(t.logout_success); };

  return (
    <div className="space-y-8 pb-48 animate-in fade-in slide-in-from-bottom duration-700 text-left">
      {/* 👤 個人檔案區 */}
      <div className="bg-white border border-stone-100 p-8 rounded-[3rem] shadow-sm relative overflow-hidden text-left">
        <div className="flex items-center gap-6 mb-8">
          <div className={`w-24 h-24 rounded-[2.5rem] bg-stone-50 flex items-center justify-center text-5xl shadow-inner relative transition-all ${getFrameStyle(userFrame)}`}>
            {currentPersona.icon}
            {currentTier === 'prime' && <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-full shadow-lg"><ShieldCheck size={14}/></div>}
          </div>
          <div className="text-left flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input value={tempName} onChange={(e)=>setTempCategory(e.target.value)} className="bg-stone-50 border-none px-2 py-1 rounded-lg text-sm font-black w-24 outline-none ring-2 ring-stone-200" />
                  <button onClick={handleSaveName} className="text-emerald-500"><Check size={16}/></button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-stone-800 tracking-tight">{userName}</h2>
                  <button onClick={()=>setIsEditingName(true)} className="text-stone-300 hover:text-stone-500"><Edit2 size={12}/></button>
                </>
              )}
            </div>
            <p className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block uppercase tracking-widest">{userTitle}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-[10px] font-black ${bond.color}`}>{t[bond.key]}</span>
              <div className="flex-1 h-1 w-20 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-stone-800 transition-all duration-1000" style={{ width: `${currentPersona.intimacy}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-stone-50/50 p-5 rounded-3xl border border-stone-100">
            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">{t.territory}</p>
            <h4 className="text-lg font-black text-stone-800">{homeMaterials}</h4>
          </div>
          <div className="bg-stone-50/50 p-5 rounded-3xl border border-stone-100 text-left">
            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">{t.next_level}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{home.icon}</span>
              <span className="text-[10px] font-black text-stone-600 leading-tight">{t[home.nameKey]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 space-y-6">
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">意志力夥伴選擇</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
          {Object.entries(personaStats).map(([pId, stats]) => {
            const isLocked = currentTier === 'free' && !['peer', 'asian_parent'].includes(pId);
            return (
              <button key={pId} onClick={() => checkAndSetPersona(pId)} className={`min-w-[110px] p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-3 relative ${persona === pId ? 'border-[#D7C9B1] bg-[#FAF7F2] shadow-md scale-105' : 'border-stone-100 bg-white opacity-60'}`}>
                {isLocked && <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 rounded-[2.5rem] flex items-center justify-center text-stone-400"><ShieldCheck size={20} /></div>}
                <span className="text-4xl">{stats.icon}</span>
                <span className="text-[10px] font-black text-stone-800 whitespace-nowrap">{stats.title}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-stone-100 p-6 rounded-[2rem] shadow-sm">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Target size={14} className="text-[#D7C9B1]"/> {t.current_goal}</h3>
          <input value={wishlist} onChange={(e) => setWishlist(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-sm font-black text-stone-800 focus:bg-white transition-colors outline-none" placeholder="..." />
        </div>

        <button onClick={setShowBudgetSetup} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl text-[11px] tracking-[0.2em] active:scale-95 transition-all"><Settings2 size={18} /> {t.budget_setup}</button>

        {user ? (
          <button onClick={handleLogout} className="w-full py-4 mt-4 bg-transparent border-2 border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] active:scale-95 transition-all"><LogOut size={16} /> {t.logout}</button>
        ) : (
          <button onClick={() => setShowLogin(true)} className="w-full py-4 mt-4 bg-blue-50 border-2 border-blue-100 text-blue-600 hover:bg-blue-100 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] active:scale-95 transition-all shadow-sm"><LogIn size={16} /> {t.login_sync}</button>
        )}
      </div>
    </div>
  );
};

export default HeroHallView;
