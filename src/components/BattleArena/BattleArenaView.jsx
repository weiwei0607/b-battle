import React from 'react';
import { Zap, Heart, ArrowLeft, Users, Crosshair, ShieldAlert } from 'lucide-react';

const RomanPillar = ({ label, hp, colorClass }) => {
  const isLow = hp <= 20;
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-16 h-3 bg-stone-200 rounded-t-sm shadow-sm" />
      <div className="w-12 h-48 bg-stone-50 border border-stone-200 relative flex justify-center shadow-inner overflow-hidden">
        {isLow && <div className="absolute inset-0 flex items-center justify-center text-red-500/20"><Heart size={24} /></div>}
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ${isLow ? 'bg-red-400' : colorClass}`}
          style={{ height: `${hp}%` }}
        />
        <div className="absolute inset-0 flex justify-evenly">
          <div className="w-px h-full bg-white/20" />
          <div className="w-px h-full bg-white/20" />
          <div className="w-px h-full bg-white/20" />
        </div>
      </div>
      <div className="w-20 h-4 bg-stone-300 rounded-b-sm shadow-sm" />
      <span className="text-[10px] font-bold text-stone-400 mt-3">{label}</span>
      <span className={`text-xs font-black ${isLow ? 'text-red-500' : 'text-stone-700'}`}>{hp.toFixed(0)}%</span>
    </div>
  );
};

const BattleArenaView = ({
  stats,
  hpData,
  activeMode,
  setActiveMode,
  battleLog,
  scapegoatAlert,
  activeChallenges,
  handleClaimChallenge,
  handleGiveUpChallenge
}) => {

  if (activeMode === 'selection') {
    return (
      <div className="space-y-6 pb-48 px-2 animate-in fade-in duration-500 text-left">
        <h2 className="text-3xl font-bold text-stone-800 tracking-tight italic">ARENA CENTER</h2>
        <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mb-8">選擇你的戰場預算防線</p>
        
        <button onClick={() => setActiveMode('random1v1')} className="w-full bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm active:scale-95 transition-all text-left flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500"><Zap size={24}/></div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">隨機 1v1 鬥技</h3>
            <p className="text-[10px] text-stone-400 font-medium">與匿名省錢王者進行意志力對決</p>
          </div>
        </button>

        <button onClick={() => setActiveMode('team5v5')} className="w-full bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm active:scale-95 transition-all text-left flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500"><Users size={24}/></div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">團隊 5v5 突擊</h3>
            <p className="text-[10px] text-stone-400 font-medium">共享全隊血池，揪出那個戰犯</p>
          </div>
        </button>

        <button onClick={() => alert("好友連線功能開發中...")} className="w-full bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm active:scale-95 transition-all text-left flex items-center gap-5">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500"><Crosshair size={24}/></div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">好友情報雷達</h3>
            <p className="text-[10px] text-stone-400 font-medium">偷看好友的存款與損血紀錄</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-48 px-1 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <button onClick={() => setActiveMode('selection')} className="p-2 bg-white rounded-full shadow-sm text-stone-500 active:scale-90">
          <ArrowLeft size={16} />
        </button>
        <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
          {activeMode === 'team5v5' ? <><Users size={14} className="text-purple-500"/> 團隊 5v5 模式</> : <><Zap size={14} className="text-orange-500"/> 1v1 鬥技</>}
        </span>
        <div className="w-10"/>
      </div>

      {activeMode === 'team5v5' && scapegoatAlert && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-pulse">
          <ShieldAlert className="text-red-500 shrink-0" size={20} />
          <p className="text-xs text-red-700 font-bold">{scapegoatAlert}</p>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm flex justify-between items-end h-72">
        <RomanPillar label="生存 (餐飲)" hp={hpData.daily} colorClass="bg-[#D7C9B1]" />
        <RomanPillar label="享樂 (飲料)" hp={hpData.weekly} colorClass="bg-[#A8A297]" />
        <RomanPillar label="大宗 (購物)" hp={hpData.monthly} colorClass="bg-[#7D746D]" />
      </div>

      {activeChallenges.length > 0 && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {activeChallenges.map((c, idx) => (
            <div key={idx} className="min-w-[200px] bg-gradient-to-br from-amber-300 to-orange-400 p-4 rounded-2xl shadow-lg border border-white/20 flex flex-col justify-between text-left">
              <p className="text-[9px] font-black text-amber-900/50 uppercase tracking-wider mb-1">WILLPOWER STAKE</p>
              <h4 className="text-sm font-black text-stone-900 mb-3">不買 {c.item}</h4>
              <div className="flex gap-2">
                <button onClick={() => handleClaimChallenge(idx)} className="flex-1 bg-stone-900 text-white text-[10px] font-bold py-2 rounded-lg">我忍住了</button>
                <button onClick={() => handleGiveUpChallenge(idx)} className="flex-1 bg-white/20 text-stone-900 text-[10px] font-bold py-2 rounded-lg">認輸買了</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-stone-800 rounded-[2rem] p-5 h-40 overflow-y-auto no-scrollbar relative shadow-inner border border-stone-700">
        <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-stone-800 to-transparent pointer-events-none" />
        <div className="space-y-3 mt-2 text-left text-white/40 text-[10px]">
          {battleLog.map((log, i) => (
            <p key={i} className={i === 0 ? 'text-[#D7C9B1] font-bold' : ''}>{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleArenaView;
