import React, { useState } from 'react';
import { Swords, ShieldAlert, Users, MessageSquare, Loader2, Send, Lock, ChevronRight, Hash } from 'lucide-react';

const BattleArenaView = ({ 
  stats, hpData, enemyHpData, isAiProcessing, aiComment, activeMode, setActiveMode, battleLog, activeChallenges, handleClaimChallenge, handleGiveUpChallenge,
  roomId, setRoomId
}) => {
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [tempRoom, setTempRoom] = useState(roomId);

  const handleJoinRoom = () => {
    setRoomId(tempRoom);
    setShowRoomInput(false);
    setActiveMode('team5v5');
  };

  const getPillarLabel = (key) => {
    const labels = { survival: "生存", progress: "進化", desire: "慾望", expedition: "遠征" };
    return labels[key] || key;
  };

  const HpBar = ({ label, percent, color }) => (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1 px-1">
        <span className="text-[8px] font-black text-stone-400 uppercase tracking-tighter">{label}</span>
        <span className="text-[8px] font-black text-stone-500">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden shadow-inner border border-stone-200/50">
        <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-48 animate-in fade-in slide-in-from-left duration-700 text-left">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none">WAR ZONE</h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">意志力意志防線</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveMode('selection')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeMode === 'selection' ? 'bg-stone-800 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-100'}`}>1v1</button>
          <button onClick={() => setShowRoomInput(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeMode === 'team5v5' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-100'}`}>5v5</button>
        </div>
      </div>

      {/* 🚀 房號輸入彈窗 */}
      {showRoomInput && (
        <div className="fixed inset-0 z-[5000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-stone-800 mb-2 flex items-center gap-2"><Hash size={20} className="text-amber-500" /> 輸入戰區代碼</h3>
            <p className="text-[10px] text-stone-400 font-bold mb-6 uppercase tracking-widest">與好友同步意志力防線</p>
            <input 
              value={tempRoom} 
              onChange={(e)=>setTempRoom(e.target.value)} 
              placeholder="例如: 8888" 
              className="w-full bg-stone-50 border-2 border-stone-100 p-4 rounded-2xl text-lg font-black text-center mb-6 focus:border-amber-400 transition-all outline-none" 
            />
            <div className="flex gap-3">
              <button onClick={()=>setShowRoomInput(false)} className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
              <button onClick={handleJoinRoom} className="flex-1 py-4 bg-stone-800 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">進入戰區</button>
            </div>
          </div>
        </div>
      )}

      {/* 戰場數據視覺化 */}
      <div className="bg-white border border-stone-100 p-6 rounded-[3rem] shadow-sm relative overflow-hidden text-left">
        <div className="flex justify-between items-center mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-800 rounded-xl flex items-center justify-center text-white shadow-lg"><Users size={16} /></div>
            <span className="text-[10px] font-black text-stone-800 uppercase tracking-widest">
              {activeMode === 'team5v5' ? `戰區: ${roomId || '全球混戰'}` : '個人防線'}
            </span>
          </div>
          {activeMode === 'team5v5' && <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 rounded-full border border-red-100 animate-pulse"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /><span className="text-[9px] font-black uppercase">Live Battle</span></div>}
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> 我方意志支柱</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {Object.entries(hpData).map(([k, v]) => <HpBar key={k} label={getPillarLabel(k)} percent={v} color={v < 30 ? 'bg-red-500' : 'bg-blue-500'} />)}
            </div>
          </div>

          {activeMode === 'team5v5' && (
            <div className="pt-6 border-t border-stone-50 space-y-4">
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full" /> 敵方意志支柱</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(enemyHpData).map(([k, v]) => <HpBar key={k} label={getPillarLabel(k)} percent={v} color="bg-red-400" />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI 吐槽區 (還原細節) */}
      <div className="bg-[#FAF7F2] border border-[#D7C9B1]/30 p-6 rounded-[3rem] flex items-start gap-4 relative shadow-sm">
        <div className="w-14 h-14 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0">{stats.icon}</div>
        <div className="flex-1 min-h-[60px] flex flex-col justify-center">
          <p className="text-[9px] font-black text-[#BC8F8F] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><MessageSquare size={10} fill="#BC8F8F" fillOpacity={0.2} /> {stats.title} 指令</p>
          {isAiProcessing ? <div className="flex items-center gap-2 text-stone-400 text-[10px] italic font-medium"><Loader2 size={12} className="animate-spin text-stone-300" /> 正在分析你的弱點...</div> : <p className="text-xs text-stone-600 leading-relaxed font-bold tracking-tight">「{aiComment}」</p>}
        </div>
      </div>

      {/* 戰鬥日誌 (還原大寫質感) */}
      <div className="px-2 space-y-4">
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">Battle Log</h3>
        <div className="bg-white/50 backdrop-blur-sm border border-stone-100 rounded-[2.5rem] p-6 h-48 overflow-y-auto no-scrollbar space-y-3 shadow-inner">
          {battleLog.length === 0 ? <p className="text-stone-300 text-[10px] italic text-center py-10">等待戰鬥訊號...</p> : battleLog.map((log, i) => (
            <div key={i} className={`text-[10px] font-black leading-relaxed flex gap-2 animate-in slide-in-from-left duration-300 ${log.includes('🏆') ? 'text-amber-600' : log.includes('⚔️') ? 'text-red-500' : 'text-stone-500'}`}>
              <span className="opacity-30">{battleLog.length - i}</span>
              <span className="tracking-tight">{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 願望押金挑戰 */}
      {activeChallenges.length > 0 && (
        <div className="px-2 space-y-3">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] px-1">Active Stakes</h3>
          {activeChallenges.map((c, i) => (
            <div key={i} className="bg-stone-800 text-white p-5 rounded-[2rem] flex justify-between items-center shadow-xl border border-stone-700/50">
              <div className="text-left">
                <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1">意志力賭局</p>
                <h4 className="text-sm font-black tracking-tight italic">拒絕購買「{c.item}」</h4>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleGiveUpChallenge(i)} className="p-2 text-stone-400 hover:text-white transition-colors"><Lock size={16}/></button>
                <button onClick={() => handleClaimChallenge(i)} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black active:scale-90 transition-all">達成回血</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BattleArenaView;
