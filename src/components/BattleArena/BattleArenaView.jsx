import React, { useState } from 'react';
import { Swords, Users, MessageSquare, Loader2, Hash, Heart, Zap, Flame, Globe } from 'lucide-react';

// 🏛️ 垂直羅馬柱組件 (還原視覺靈魂)
const VerticalPillar = ({ label, percent, colorClass, icon: Icon, isEnemy = false }) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${isEnemy ? 'scale-90 opacity-80' : ''}`}>
      <div className="w-10 h-1 bg-stone-300 rounded-full shadow-sm" />
      <div className="w-6 h-32 bg-stone-100 border-x border-stone-200 relative flex justify-center shadow-inner overflow-hidden rounded-sm">
        {/* 血量填滿層 */}
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out ${colorClass} opacity-70`} 
          style={{ height: `${percent}%` }} 
        />
        {/* 羅馬柱紋理 */}
        <div className="absolute inset-0 flex justify-evenly opacity-20">
          <div className="w-px h-full bg-white" />
          <div className="w-px h-full bg-white" />
        </div>
      </div>
      <div className={`w-12 h-2 ${isEnemy ? 'bg-red-400' : 'bg-stone-400'} rounded-b-sm shadow-md flex items-center justify-center`}>
        <Icon size={8} className="text-white/50" />
      </div>
      <span className="text-[7px] font-black text-stone-400 uppercase tracking-tighter text-center leading-none mt-1">
        {label}
      </span>
      <span className={`text-[9px] font-black ${percent < 30 ? 'text-red-500 animate-pulse' : 'text-stone-600'}`}>
        {percent.toFixed(0)}%
      </span>
    </div>
  );
};

const BattleArenaView = ({ 
  stats, hpData, enemyHpData, isAiProcessing, aiComment, activeMode, setActiveMode, battleLog, activeChallenges, handleClaimChallenge, handleGiveUpChallenge,
  roomId, setRoomId
}) => {
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [tempRoom, setTempRoom] = useState("");

  const handleJoinRoom = (id) => {
    setRoomId(id || tempRoom);
    setShowRoomInput(false);
    setActiveMode('team5v5');
  };

  const handleRandomJoin = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000).toString();
    handleJoinRoom(randomId);
  };

  const getPillarLabel = (key) => {
    const labels = { survival: "生存", progress: "進化", desire: "慾望", expedition: "遠征" };
    return labels[key] || key;
  };

  return (
    <div className="space-y-6 pb-48 animate-in fade-in slide-in-from-left duration-700 text-left">
      {/* 頂部控制列 */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none">WAR ZONE</h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">意志力戰略防線</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveMode('selection')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeMode === 'selection' ? 'bg-stone-800 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-100'}`}>1v1</button>
          <button onClick={() => setShowRoomInput(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeMode === 'team5v5' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-100'}`}>5v5</button>
        </div>
      </div>

      {/* 🚀 戰區連線彈窗 */}
      {showRoomInput && (
        <div className="fixed inset-0 z-[6000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#F7F4EF] w-full max-w-xs rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 mx-auto shadow-inner"><Hash size={24} /></div>
            <h3 className="text-xl font-black text-stone-800 mb-1 text-center">戰區連線</h3>
            <p className="text-[9px] text-stone-400 font-bold mb-6 uppercase tracking-widest text-center">限時 5 分鐘同步戰場</p>
            
            <div className="space-y-3">
              <input 
                value={tempRoom} 
                onChange={(e)=>setTempRoom(e.target.value)} 
                placeholder="輸入房號 (例: 8888)" 
                className="w-full bg-white border-2 border-stone-100 p-4 rounded-2xl text-lg font-black text-center focus:border-amber-400 transition-all outline-none shadow-sm" 
              />
              <button onClick={() => handleJoinRoom()} className="w-full py-4 bg-stone-800 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">進入指定房間</button>
              
              <div className="flex items-center gap-3 py-2 opacity-30">
                <div className="flex-1 h-px bg-stone-400" />
                <span className="text-[8px] font-bold text-stone-500">OR</span>
                <div className="flex-1 h-px bg-stone-400" />
              </div>
              
              <button 
                onClick={() => handleJoinRoom(Math.floor(1000 + Math.random() * 9000).toString())} 
                className="w-full py-4 bg-white border-2 border-amber-200 text-amber-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-amber-50"
              >
                快速加入隨機戰區
              </button>
              
              <button onClick={()=>setShowRoomInput(false)} className="w-full py-3 text-stone-400 font-bold text-[10px] uppercase tracking-widest">下次再戰</button>
            </div>
          </div>
        </div>
      )}

      {/* ⚔️ 雙邊對峙戰場 (還原柱子視覺) */}
      <div className="bg-white border border-stone-100 p-8 rounded-[3.5rem] shadow-sm relative overflow-hidden text-left">
        {activeMode === 'team5v5' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-red-50 text-red-500 rounded-full border border-red-100 animate-pulse z-20">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span className="text-[8px] font-black uppercase tracking-widest">Zone: {roomId || 'Global'}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mt-4 relative">
          {/* 左側：我方陣營 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
            <VerticalPillar label="生存" percent={hpData.survival} colorClass="bg-blue-400" icon={Heart} />
            <VerticalPillar label="進化" percent={hpData.progress} colorClass="bg-emerald-400" icon={Zap} />
            <VerticalPillar label="慾望" percent={hpData.desire} colorClass="bg-orange-400" icon={Flame} />
            <VerticalPillar label="遠征" percent={hpData.expedition} colorClass="bg-purple-500" icon={Globe} />
          </div>

          {/* 中間：對峙裝飾 */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-200 to-transparent" />
            <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center text-white shadow-xl rotate-45 border-4 border-white">
              <Swords size={18} />
            </div>
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-200 to-transparent" />
          </div>

          {/* 右側：敵方陣營 (5v5 顯示影之分身/好友，1v1 顯示鎖定) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
            {activeMode === 'team5v5' ? (
              <>
                <VerticalPillar label="生存" percent={enemyHpData.survival} colorClass="bg-red-400" icon={Heart} isEnemy />
                <VerticalPillar label="進化" percent={enemyHpData.progress} colorClass="bg-red-400" icon={Zap} isEnemy />
                <VerticalPillar label="慾望" percent={enemyHpData.desire} colorClass="bg-red-400" icon={Flame} isEnemy />
                <VerticalPillar label="遠征" percent={enemyHpData.expedition} colorClass="bg-red-400" icon={Globe} isEnemy />
              </>
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center h-full opacity-20 grayscale">
                <div className="w-16 h-16 border-4 border-dashed border-stone-300 rounded-full flex items-center justify-center mb-2">
                  <Users size={24} className="text-stone-400" />
                </div>
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Waiting...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI 吐槽區 (維持靈魂細節) */}
      <div className="bg-[#FAF7F2] border border-[#D7C9B1]/30 p-6 rounded-[3rem] flex items-start gap-4 shadow-sm">
        <div className="w-14 h-14 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0">{stats.icon}</div>
        <div className="flex-1 min-h-[60px] flex flex-col justify-center">
          <p className="text-[9px] font-black text-[#BC8F8F] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><MessageSquare size={10} fill="#BC8F8F" fillOpacity={0.2} /> {stats.title} 戰報</p>
          {isAiProcessing ? <div className="flex items-center gap-2 text-stone-400 text-[10px] italic font-medium"><Loader2 size={12} className="animate-spin text-stone-300" />...</div> : <p className="text-xs text-stone-600 leading-relaxed font-bold tracking-tight">「{aiComment}」</p>}
        </div>
      </div>

      {/* 戰鬥日誌 */}
      <div className="px-2 space-y-4">
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] px-1">Battle Log</h3>
        <div className="bg-white/50 backdrop-blur-sm border border-stone-100 rounded-[2.5rem] p-6 h-48 overflow-y-auto no-scrollbar space-y-3 shadow-inner">
          {battleLog.length === 0 ? <p className="text-stone-300 text-[10px] italic text-center py-10">等待訊號...</p> : battleLog.map((log, i) => (
            <div key={i} className={`text-[10px] font-black leading-relaxed flex gap-2 animate-in slide-in-from-left duration-300 ${log.includes('🏆') ? 'text-amber-600' : log.includes('⚔️') ? 'text-red-500' : 'text-stone-500'}`}>
              <span className="opacity-30">{battleLog.length - i}</span>
              <span className="tracking-tight">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleArenaView;
