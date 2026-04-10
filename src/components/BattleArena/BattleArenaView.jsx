import React from 'react';
import { Zap, Heart, MessageCircle, Loader2, ArrowLeft, Users, Crosshair, ShieldAlert, Flame, Globe, Swords, Radar, Target } from 'lucide-react';

const RomanPillar = ({ label, hp, colorClass, icon: Icon, isSmall = false }) => {
  const isLow = hp <= 20;
  const height = isSmall ? 'h-24' : 'h-40';
  const width = isSmall ? 'w-5' : 'w-10'; // 🛡️ 進一步縮小寬度
  
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className={`${isSmall ? 'w-6' : 'w-14'} h-1 bg-stone-300 rounded-t-sm opacity-50`} />
      <div className={`${width} ${height} bg-stone-100 border-x border-stone-200 relative flex justify-center shadow-inner overflow-hidden`}>
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out ${isLow ? 'bg-red-400' : colorClass} opacity-80`}
          style={{ height: `${hp}%` }}
        />
        <div className="absolute inset-0 flex justify-evenly pointer-events-none opacity-10">
          <div className="w-px h-full bg-white" />
          <div className="w-px h-full bg-white" />
        </div>
      </div>
      <div className={`${isSmall ? 'w-8' : 'w-16'} h-1.5 bg-stone-400 rounded-b-sm shadow-sm`} />
      
      {!isSmall ? (
        <div className="mt-2 flex flex-col items-center">
          <span className="text-[6px] font-black text-stone-400 uppercase tracking-tighter leading-none mb-1">{label}</span>
          <span className={`text-[9px] font-black leading-none ${isLow ? 'text-red-500' : 'text-stone-700'}`}>{hp.toFixed(0)}%</span>
        </div>
      ) : (
        <span className="text-[6px] font-black text-stone-400 mt-1">{label[0]}</span>
      )}
    </div>
  );
};

const BattleArenaView = ({ 
  stats, hpData, enemyHpData, isAiProcessing, aiComment, activeMode, setActiveMode,
  battleLog, activeChallenges, handleClaimChallenge, handleGiveUpChallenge
}) => {

  if (activeMode === 'selection') {
    return (
      <div className="space-y-6 pb-48 px-2 animate-in fade-in duration-500 text-left">
        <h2 className="text-3xl font-black text-stone-800 tracking-tighter italic">ARENA CENTER</h2>
        <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mb-8 text-left">選擇預算防線</p>
        
        <button onClick={() => setActiveMode('random1v1')} className="w-full bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm active:scale-95 transition-all text-left flex items-center gap-5 group">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors"><Zap size={24}/></div>
          <div><h3 className="text-lg font-bold text-stone-800 text-left">隨機 1v1 鬥技</h3><p className="text-[10px] text-stone-400 font-medium">意志力對決</p></div>
        </button>

        <button onClick={() => setActiveMode('team5v5')} className="w-full bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm active:scale-95 transition-all text-left flex items-center gap-5 group">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors"><Users size={24}/></div>
          <div><h3 className="text-lg font-bold text-stone-800 text-left">團隊 5v5 突擊</h3><p className="text-[10px] text-stone-400 font-medium">共享血池，揪出戰犯</p></div>
        </button>

        <button onClick={() => setActiveMode('spyRadar')} className="w-full bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm active:scale-95 transition-all text-left flex items-center gap-5 group">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors"><Radar size={24}/></div>
          <div><h3 className="text-lg font-bold text-stone-800 text-left">好友情報雷達</h3><p className="text-[10px] text-stone-400 font-medium text-left">偷看好友的存款與損血紀錄</p></div>
        </button>
      </div>
    );
  }

  // 🛡️ [好友雷達畫面實裝]
  if (activeMode === 'spyRadar') {
    const mockFriends = [
      { name: "阿強", saved: 4200, hp: 85, icon: "🔥" },
      { name: "小美", saved: -150, hp: 12, icon: "🎀" },
      { name: "老王", saved: 1200, hp: 60, icon: "🍺" },
    ];

    return (
      <div className="space-y-6 pb-48 px-1 animate-in slide-in-from-right duration-500 text-left">
        <div className="flex items-center gap-4 px-2">
          <button onClick={() => setActiveMode('selection')} className="p-2 bg-white rounded-full shadow-sm text-stone-500 active:scale-90"><ArrowLeft size={16} /></button>
          <h2 className="text-xl font-black text-stone-800 tracking-tight">好友情報雷達</h2>
        </div>

        <div className="space-y-4">
          {mockFriends.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-3xl bg-stone-50 w-14 h-14 rounded-2xl flex items-center justify-center">{f.icon}</div>
                <div>
                  <h4 className="font-black text-stone-800">{f.name}</h4>
                  <p className={`text-[10px] font-bold ${f.saved > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    上週省下: {f.saved > 0 ? '+' : ''}{f.saved} 金幣
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-stone-400 uppercase mb-1">Defense HP</div>
                <div className="flex items-end gap-1">
                  <div className="w-16 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div className={`h-full ${f.hp < 20 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${f.hp}%` }} />
                  </div>
                  <span className="text-xs font-black text-stone-800 leading-none">{f.hp}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[9px] text-stone-400 italic">「在戰場上，情報就是一切」</p>
      </div>
    );
  }

  const isTeam = activeMode === 'team5v5';

  return (
    <div className="space-y-6 pb-48 px-1 animate-in fade-in duration-500 text-left">
      <div className="flex items-center justify-between px-2">
        <button onClick={() => setActiveMode('selection')} className="p-2 bg-white rounded-full shadow-sm text-stone-500 active:scale-90 transition-all"><ArrowLeft size={16} /></button>
        <span className="text-[10px] font-black text-stone-800 uppercase tracking-[0.2em] flex items-center gap-2">
          {isTeam ? <Users size={12}/> : <Zap size={12}/>}
          {isTeam ? 'Team 5V5' : '1V1 Duel'}
        </span>
        <div className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded italic animate-pulse">LIVE</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[2.5rem] p-4 border border-stone-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 left-4 text-[7px] font-black text-blue-500 uppercase tracking-widest">Our Ally</div>
          <div className="flex justify-between items-end h-32 gap-1 mt-4">
            <RomanPillar label="生存" hp={hpData.survival} colorClass="bg-blue-400" icon={Heart} isSmall />
            <RomanPillar label="進化" hp={hpData.progress} colorClass="bg-emerald-400" icon={Zap} isSmall />
            <RomanPillar label="慾望" hp={hpData.desire} colorClass="bg-orange-400" icon={Flame} isSmall />
            <RomanPillar label="遠征" hp={hpData.expedition} colorClass="bg-purple-500" icon={Globe} isSmall />
          </div>
        </div>

        <div className="bg-stone-800 rounded-[2.5rem] p-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-2 right-4 text-[7px] font-black text-red-400 uppercase tracking-widest text-right">Enemy Team</div>
          <div className="flex justify-between items-end h-32 gap-1 mt-4 text-left">
            <RomanPillar label="生存" hp={enemyHpData.survival} colorClass="bg-red-500" icon={Heart} isSmall />
            <RomanPillar label="進化" hp={enemyHpData.progress} colorClass="bg-red-500" icon={Zap} isSmall />
            <RomanPillar label="慾望" hp={enemyHpData.desire} colorClass="bg-red-500" icon={Flame} isSmall />
            <RomanPillar label="遠征" hp={enemyHpData.expedition} colorClass="bg-red-500" icon={Globe} isSmall />
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-100 rounded-[2rem] p-6 shadow-sm relative min-h-[80px] flex items-center group">
        <div className="absolute -top-3 left-6 bg-stone-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
          <Swords size={10} /> {stats.title}
        </div>
        {isAiProcessing ? (
          <Loader2 className="animate-spin text-stone-300 mx-auto" size={20} />
        ) : (
          <p className="text-xs text-stone-600 leading-relaxed font-medium text-left">「{aiComment}」</p>
        )}
      </div>

      <div className="bg-stone-800 p-5 rounded-[2rem] h-36 overflow-y-auto no-scrollbar shadow-inner text-left">
        {battleLog.map((log, i) => (
          <p key={i} className={`text-[9px] font-mono mb-2 ${i === 0 ? 'text-[#D7C9B1] font-bold' : 'text-white/30'}`}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default BattleArenaView;
