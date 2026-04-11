import React, { useMemo } from 'react';
import { Trophy, X, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../utils/constants';
import { LOCALES } from '../utils/locales';

const AchievementModal = ({ show, onClose, achievements, onClaim, lang }) => {
  const t = LOCALES[lang] || LOCALES.zh;
  if (!show) return null;

  const medalList = Object.values(ACHIEVEMENTS);
  const visibleMedals = medalList.filter(m => !m.isHidden);
  const hiddenMedals = medalList.filter(m => m.isHidden && achievements && achievements[m.id]?.unlocked);

  const unlockedCount = useMemo(() => Object.values(achievements || {}).filter(a => a.unlocked).length, [achievements]);
  const totalCount = medalList.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const MedalItem = ({ medal }) => {
    const status = (achievements && achievements[medal.id]) || { unlocked: false, claimed: false };
    const canClaim = status.unlocked && !status.claimed;
    const isDone = status.claimed;
    const isLocked = !status.unlocked;

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
        {/* 圖示：鎖定時顯示鎖頭，解鎖後顯示對應 icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all duration-500 ${
          isLocked ? 'bg-stone-200 grayscale opacity-40' : 'bg-white group-hover:scale-110'
        }`}>
          {isLocked ? <Lock size={20} className="text-stone-400" /> : medal.icon}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            {/* 名稱：公開成就鎖定時也顯示，隱藏成就解鎖後才顯示 */}
            <h4 className={`text-sm font-black transition-colors ${isLocked ? 'text-stone-400' : 'text-stone-800'}`}>
              {medal.name}
            </h4>
            {isDone && <CheckCircle2 size={14} className="text-amber-500" />}
          </div>
          {/* 條件描述：公開成就鎖定時也顯示，讓玩家知道目標 */}
          <p className="text-[9px] font-medium text-stone-500 mt-0.5">
            {medal.desc}
          </p>
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
          <h3 className="text-2xl font-black text-stone-800 tracking-tight">{t.achievements_title}</h3>
          <div className="mt-3 px-6">
            <div className="flex justify-between text-[10px] font-black text-stone-400 mb-1.5 uppercase tracking-widest">
              <span>{t.collection_progress}</span>
              <span className="text-amber-600">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out shadow-lg" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2"><Sparkles size={12} /> {t.medal_public}</h4>
            <div className="grid grid-cols-1 gap-3">
              {visibleMedals.map(medal => <MedalItem key={medal.id} medal={medal} />)}
            </div>
          </div>

          {hiddenMedals.length > 0 && (
            <div className="pb-6">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" /> 神祕禁忌勳章
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
