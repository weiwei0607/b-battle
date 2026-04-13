import React, { useState } from 'react';
import { User, ShieldCheck, Settings2, LogOut, LogIn, Target, Edit2, Check, Sparkles, BookOpen, Swords } from 'lucide-react';
import { getBondLevel, getFrameStyle, getHomeStatus, getWalletStatus, AVATAR_OPTIONS, WALLET_LEVELS, HOME_LEVELS } from '../../utils/constants';
import { LOCALES } from '../../utils/locales';
import { auth } from '../../firebase';

const HeroHallView = ({ 
  userTitle, persona, personaStats, setPersona, setShowBudgetSetup, setShowManual, currentTier, 
 lastPersonaSwitch, setLastPersonaSwitch, wishlist, setWishlist,
  debt, userFrame, homeMaterials, user, setShowLogin, setView, lang,
  userName, setUserName, userId, userAvatar, setUserAvatar, showEvolutionPath, setShowEvolutionPath, willpowerExp,
  setShowCustomModal, coins = 0, wishlistGoal = 0, setWishlistGoal
}) => {
  const t = LOCALES[lang] || LOCALES.zh;
  const currentPersona = personaStats[persona];
  const bond = getBondLevel(currentPersona.intimacy);
  const home = getHomeStatus(homeMaterials);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    setUserName(tempName);
    setIsEditingName(false);
  };

  const checkAndSetPersona = (id) => {
    const isLocked = currentTier === 'free' && !['peer'].includes(id);
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
          <button 
            onClick={() => setShowAvatarPicker(true)}
            className={`w-24 h-24 rounded-[2.5rem] bg-stone-50 flex items-center justify-center text-5xl shadow-inner relative transition-all active:scale-95 hover:bg-stone-100 ${getFrameStyle(userFrame)}`}
          >
            {userAvatar}
            {currentTier === 'prime' && <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-full shadow-lg"><ShieldCheck size={14}/></div>}
          </button>
          <div className="text-left flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input value={tempName} onChange={(e)=>setTempName(e.target.value)} className="bg-stone-50 border-none px-2 py-1 rounded-lg text-sm font-black w-24 outline-none ring-2 ring-stone-200" />
                  <button onClick={handleSaveName} className="text-emerald-500"><Check size={16}/></button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-stone-800 tracking-tight">{t[userName] || userName || '匿名戰士'}</h2>
                  <button onClick={()=>setIsEditingName(true)} className="text-stone-300 hover:text-stone-500"><Edit2 size={12}/></button>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">ID: {userId || "------"}</p>
              <p className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block uppercase tracking-widest w-fit">{t[userTitle] || userTitle || '省錢新兵'}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-[10px] font-black ${bond.color}`}>{t[bond.key] || '夥伴'}</span>
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
          <div onClick={() => setShowEvolutionPath(true)} className="bg-stone-50/50 p-5 rounded-3xl border border-stone-100 text-left cursor-pointer active:scale-95 transition-all hover:bg-stone-100">
            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">{t.next_level}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{home.icon}</span>
              <div className="flex-1">
                <span className="text-[10px] font-black text-stone-600 leading-tight block">{t[home.nameKey]}</span>
                <p className="text-[8px] font-bold text-stone-400 uppercase">{t[home.titleKey] || home.titleKey}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 space-y-6">
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">意志力夥伴選擇</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
          {Object.entries(personaStats).map(([pId, stats]) => {
            const isLocked = currentTier === 'free' && !['peer'].includes(pId);
            return (
              <button key={pId} onClick={() => checkAndSetPersona(pId)} className={`min-w-[110px] p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-3 relative ${persona === pId ? 'border-[#D7C9B1] bg-[#FAF7F2] shadow-md scale-105' : 'border-stone-100 bg-white opacity-60'}`}>
                {isLocked && <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 rounded-[2.5rem] flex items-center justify-center text-stone-400"><ShieldCheck size={20} /></div>}
                <span className="text-4xl">{stats.icon}</span>
                <span className="text-[10px] font-black text-stone-800 whitespace-nowrap">{t[stats.titleKey] || stats.titleKey}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-stone-100 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2"><Target size={14} className="text-[#D7C9B1]"/> {t.current_goal}</h3>
          <input value={wishlist} onChange={(e) => setWishlist(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-sm font-black text-stone-800 focus:bg-white transition-colors outline-none" placeholder="..." />
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest shrink-0">目標金幣</span>
            <input
              type="number" min="0"
              value={wishlistGoal || ''}
              onChange={(e) => setWishlistGoal(Number(e.target.value) || 0)}
              className="flex-1 bg-stone-50 border border-stone-100 p-2 rounded-xl text-sm font-black text-stone-800 focus:bg-white transition-colors outline-none text-right"
              placeholder="0"
            />
          </div>
          {wishlistGoal > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">進度</span>
                <span className={`text-[10px] font-black ${coins >= wishlistGoal ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {coins >= wishlistGoal ? '🎉 達成！' : `還差 ${(wishlistGoal - coins).toLocaleString()} 金幣`}
                </span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${coins >= wishlistGoal ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min(100, (coins / wishlistGoal) * 100).toFixed(1)}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-black text-stone-400">
                <span>💰 {coins.toLocaleString()}</span>
                <span>{wishlistGoal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {currentTier === 'prime' && (
          <button
            onClick={() => setShowCustomModal(true)}
            className="w-full py-5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl text-[11px] tracking-[0.2em] active:scale-95 transition-all"
          >
            <Sparkles size={18} /> Prime 自定義靈魂
          </button>
        )}

        <button 
          onClick={setShowManual}
          className="w-full py-5 bg-white border-2 border-stone-100 text-stone-800 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-sm text-[11px] tracking-[0.2em] active:scale-95 transition-all mb-3"
        >
          <BookOpen size={18} /> 意志力戰前手冊
        </button>

        <button onClick={setShowBudgetSetup} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl text-[11px] tracking-[0.2em] active:scale-95 transition-all"><Settings2 size={18} /> {t.budget_setup}</button>

        {user ? (
          <button onClick={handleLogout} className="w-full py-4 mt-4 bg-transparent border-2 border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] active:scale-95 transition-all"><LogOut size={16} /> {t.logout}</button>
        ) : (
          <button onClick={() => setShowLogin(true)} className="w-full py-4 mt-4 bg-blue-50 border-2 border-blue-100 text-blue-600 hover:bg-blue-100 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] active:scale-95 transition-all shadow-sm"><LogIn size={16} /> {t.login_sync}</button>
        )}
      </div>

      {/* 🎭 Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-[6000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-stone-800 mb-2 text-center">選擇你的意志頭像</h3>
            <p className="text-[10px] text-stone-400 font-bold mb-6 text-center uppercase tracking-widest">展現你的省錢態度</p>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {AVATAR_OPTIONS.map(opt => (
                <button 
                  key={opt.id} 
                  title={t[opt.nameKey] || opt.nameKey}
                  onClick={() => { setUserAvatar(opt.icon); setShowAvatarPicker(false); }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all active:scale-90 ${userAvatar === opt.icon ? 'bg-stone-800 text-white shadow-lg' : 'bg-stone-50 hover:bg-stone-100'}`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAvatarPicker(false)} className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-black text-xs">取消</button>
          </div>
        </div>
      )}

      {/* 🚀 Evolution Path Modal */}
      {showEvolutionPath && (
        <div className="fixed inset-0 z-[6000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#F7F4EF] w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[80vh] no-scrollbar">
            <h3 className="text-2xl font-black text-stone-800 mb-1 text-center italic tracking-tighter uppercase">基地進化之路</h3>
            <p className="text-[10px] text-stone-400 font-bold mb-8 text-center uppercase tracking-[0.2em]">從廢墟走向輝煌</p>
            
            <div className="space-y-10 relative">
              <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-stone-200 z-0" />
              
              {HOME_LEVELS.map((lvl, idx) => {
                const isReached = homeMaterials >= lvl.minMaterials;
                const isCurrent = home.id === lvl.id;
                return (
                  <div key={lvl.id} className={`flex items-start gap-6 relative z-10 transition-opacity ${isReached ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${isCurrent ? 'bg-stone-800 text-white ring-4 ring-stone-100' : 'bg-white border border-stone-100'}`}>
                      {lvl.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-black ${isCurrent ? 'text-stone-800' : 'text-stone-500'}`}>{t[lvl.nameKey] || lvl.nameKey}</h4>
                        {isCurrent && <span className="text-[8px] font-black bg-stone-800 text-white px-2 py-0.5 rounded-full uppercase">Current</span>}
                      </div>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{t[lvl.titleKey] || lvl.titleKey}</p>
                      {isCurrent && lvl.next && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[8px] font-black text-stone-400 mb-1 uppercase">
                            <span>Progress</span>
                            <span>{homeMaterials} / {lvl.next}</span>
                          </div>
                          <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
                            <div className="h-full bg-stone-800" style={{ width: `${Math.min(100, (homeMaterials / lvl.next) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 pt-6 border-t border-stone-200/50">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 text-center text-left">意志皮夾等級</h4>
              <div className="space-y-6">
                {WALLET_LEVELS.map(lvl => {
                  const isReached = willpowerExp >= lvl.minExp;
                  const isCurrent = getWalletStatus(willpowerExp).id === lvl.id;
                  return (
                    <div key={lvl.id} className={`flex items-start gap-4 transition-opacity ${isReached ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${isCurrent ? 'bg-stone-800 text-white shadow-lg' : 'bg-white border border-stone-100'}`}>
                        {lvl.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className={`text-[11px] font-black ${isCurrent ? 'text-stone-800' : 'text-stone-500'}`}>{t[lvl.nameKey] || lvl.nameKey}</h5>
                          {isCurrent && <span className="text-[7px] font-black text-stone-400 uppercase">Current</span>}
                        </div>
                        <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">{t[lvl.titleKey] || lvl.titleKey}</p>
                        {isCurrent && (
                          <div className="mt-2">
                            <div className="flex justify-between text-[7px] font-black text-stone-400 mb-1 uppercase">
                              <span>Points</span>
                              <span>{willpowerExp} / {lvl.next}</span>
                            </div>
                            <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
                              <div className="h-full bg-stone-800" style={{ width: `${Math.min(100, (willpowerExp / lvl.next) * 100)}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[9px] font-black text-amber-700 leading-relaxed text-left">
                💡 <span className="uppercase tracking-widest">系統提醒：</span><br/>
                生存預算將在 <span className="underline decoration-2">每週一凌晨 00:00</span> 自動重置並發放當週金幣。請確保在重置前完成所有重建儀式。
              </p>
            </div>

            <button onClick={() => setShowEvolutionPath(false)} className="w-full mt-8 py-4 bg-stone-800 text-white rounded-2xl font-black text-xs active:scale-95 transition-all shadow-lg">返回意志殿堂</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroHallView;
