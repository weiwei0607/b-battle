import React, { useMemo } from 'react';
import { Trophy, X, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../utils/constants';
import { LOCALES } from '../utils/locales';

const AchievementModal = ({ show, onClose, achievements, onClaim, userTitle, setUserTitle, lang }) => {
  if (!show) return null;
  const t = LOCALES[lang] || LOCALES.zh;

  const medalList = Object.values(ACHIEVEMENTS);
  const visibleMedals = medalList.filter(m => !m.isHidden);
  const hiddenMedals = medalList.filter(m => m.isHidden && achievements[m.id]?.unlocked);

  const unlockedCount = useMemo(() => Object.values(achievements || {}).filter(a => a.unlocked).length, [achievements]);
  const totalCount = medalList.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const MedalItem = ({ medal }) => {
    const status = (achievements && achievements[medal.id]) || { unlocked: false, claimed: false };
    const canClaim = status.unlocked && !status.claimed;
    const isDone = status.claimed;
    const isLocked = !status.unlocked;
    const hasTitle = !!medal.title;
    const isEquipped = userTitle === medal.title;

    // 🚀 [多語系支持]
    const localizedName = t[`ac_${medal.id}_name`] || medal.name;
    const localizedDesc = t[`ac_${medal.id}_desc`] || medal.desc;

    return (
      <div 
        key={medal.id}
        className={`group p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 relative ${
          isDone ? 'bg-white border-amber-100 shadow-sm' : 
          canClaim ? 'bg-amber-50 border-amber-400 animate-pulse cursor-pointer' : 
          'bg-stone-50/50 border-stone-100 opacity-80'
        }`}
        onClick={() => canClaim && onClaim(medal.id)}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all duration-500 ${
          isLocked ? 'bg-stone-200 grayscale opacity-40 scale-90' : 'bg-white group-hover:scale-110'
        }`}>
          {isLocked ? <Lock size={20} className="text-stone-400" /> : medal.icon}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-black transition-colors ${isLocked ? 'text-stone-400' : 'text-stone-800'}`}>
              {localizedName}
            </h4>
            {isDone && <CheckCircle2 size={14} className="text-amber-500" />}
          </div>
          <p className="text-[9px] font-medium text-stone-500 mt-0.5">
            {localizedDesc}
          </p>
          {hasTitle && !isLocked && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-black bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Title: {medal.title}</span>
              {isEquipped ? (
                <span className="text-[8px] font-black text-emerald-500 uppercase">Equipped</span>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); setUserTitle(medal.title); }}
                  className="text-[8px] font-black text-blue-500 hover:underline uppercase"
                >
                  Equip
                </button>
              )}
            </div>
          )}
          {!isLocked && !isDone && (
            <p className="text-[9px] font-black text-amber-600 mt-1 uppercase tracking-tighter text-left">
              Reward: {medal.reward} Coins
            </p>
          )}
        </div>

        {canClaim && (
          <div className="bg-amber-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-amber-200 animate-bounce">
            領獎
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[800] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#F7F4EF] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-stone-200/50 rounded-full text-stone-500 active:scale-90 transition-all z-10">
          <X size={16} />
        </button>

        <div className="text-center mb-6 shrink-0">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600 shadow-inner">
            <Trophy size={32} />
          </div>
          <h3 className="text-2xl font-black text-stone-800 tracking-tight italic uppercase">{t.achievements_title || '勳章成就館'}</h3>
          <div className="mt-3 px-6">
            <div className="flex justify-between text-[10px] font-black text-stone-400 mb-1.5 uppercase tracking-widest">
              <span>{t.collection_progress || '收集進度'}</span>
              <span className="text-amber-600">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out shadow-lg" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-8">
          {['journey', 'discipline', 'mastery', 'emotion', 'supply', 'forbidden'].map(cat => {
            const catMedals = visibleMedals.filter(m => m.cat === cat);
            if (catMedals.length === 0) return null;
            return (
              <div key={cat}>
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
                  <Sparkles size={12} /> {t[`achievement_${cat}`] || cat}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {catMedals.map(medal => <MedalItem key={medal.id} medal={medal} />)}
                </div>
              </div>
            );
          })}

          {hiddenMedals.length > 0 && (
            <div className="pb-6">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" /> {t.medal_hidden}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {hiddenMedals.map(medal => <MedalItem key={medal.id} medal={medal} />)}
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 shrink-0 text-[9px] text-stone-400 text-center italic border-t border-stone-100 pt-4">「每一枚勳章，都是你對抗消費慾望的戰功」</p>
      </div>
    </div>
  );
};

export default AchievementModal;
