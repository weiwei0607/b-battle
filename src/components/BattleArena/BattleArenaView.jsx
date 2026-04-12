import React, { useState } from 'react';
import { Swords, Users, MessageSquare, Loader2, Hash, Heart, Zap, Flame, Globe, Shuffle, Clock, QrCode, UserPlus } from 'lucide-react';
import FriendsListView from '../Friends/FriendsListView';

const VerticalPillar = ({ label, percent, colorClass, icon: Icon, isEnemy = false }) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${isEnemy ? 'scale-90 opacity-80' : ''}`}>
      <div className="w-10 h-1 bg-stone-300 rounded-full shadow-sm" />
      <div className="w-6 h-32 bg-stone-100 border-x border-stone-200 relative flex justify-center shadow-inner overflow-hidden rounded-sm">
        <div className={`absolute bottom-0 w-full transition-all duration-1000 ease-out ${colorClass} opacity-70`} style={{ height: `${percent}%` }} />
        <div className="absolute inset-0 flex justify-evenly opacity-20"><div className="w-px h-full bg-white" /><div className="w-px h-full bg-white" /></div>
      </div>
      <div className={`w-12 h-2 ${isEnemy ? 'bg-red-400' : 'bg-stone-400'} rounded-b-sm shadow-md flex items-center justify-center`}><Icon size={8} className="text-white/50" /></div>
      <span className="text-[7px] font-black text-stone-400 uppercase tracking-tighter text-center leading-none mt-1">{label}</span>
      <span className={`text-[9px] font-black ${percent < 30 ? 'text-red-500 animate-pulse' : 'text-stone-600'}`}>{percent.toFixed(0)}%</span>
    </div>
  );
};

const BattleArenaView = ({ 
  stats, hpData, enemyHpData, isAiProcessing, aiComment, activeMode, setActiveMode, battleLog, activeChallenges, handleClaimChallenge, handleGiveUpChallenge,
  roomId, setRoomId
}) => {
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [showInviteQR, setShowInviteQR] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [tempRoom, setTempRoom] = useState("");

  const handleJoinRoom = (id) => {
    const finalRoom = id || tempRoom;
    setRoomId(finalRoom);
    setShowRoomInput(false);
    if (finalRoom.length === 4) setActiveMode('1v1');
    else setActiveMode('team5v5');
  };

  const startRandomMatchmaking = () => {
    setIsMatchmaking(true);
    // 這裡會觸發 useBattleCore 的配對邏輯
    handleJoinRoom("MATCHMAKING_QUEUE"); 
  };

  const handleStart1v1Duel = () => {
    const newRoom = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomId(newRoom);
    setActiveMode('1v1');
    setShowInviteQR(true);
  };

  const getInviteUrl = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?room=${roomId}&mode=${activeMode}`;
  };

  return (
    <div className="space-y-6 pb-48 animate-in fade-in slide-in-from-left duration-700 text-left">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none">WAR ZONE</h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">意志力戰略防線</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFriends(true)} className="p-2 bg-white border border-stone-100 rounded-xl text-stone-400 hover:text-stone-800 transition-colors shadow-sm active:scale-90"><UserPlus size={18} /></button>
          <div className="flex bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setActiveMode('selection')} className={`px-4 py-2 text-[9px] font-black transition-all ${activeMode === 'selection' || activeMode === '1v1' ? 'bg-stone-800 text-white' : 'text-stone-400'}`}>1v1</button>
            <button onClick={() => setShowRoomInput(true)} className={`px-4 py-2 text-[9px] font-black transition-all ${activeMode === 'team5v5' ? 'bg-amber-500 text-white' : 'text-stone-400'}`}>5v5</button>
          </div>
        </div>
      </div>

      {/* 🚀 戰區連線彈窗 (5v5) */}
      {showRoomInput && (
        <div className="fixed inset-0 z-[6000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#F7F4EF] w-full max-w-xs rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 mx-auto shadow-inner"><Hash size={24} /></div>
            <h3 className="text-xl font-black text-stone-800 mb-1">加入戰場</h3>
            <p className="text-[9px] text-stone-400 font-bold mb-6 uppercase tracking-widest">同步好友的意志力支柱</p>
            <div className="space-y-3">
              <input value={tempRoom} onChange={(e)=>setTempRoom(e.target.value)} placeholder="輸入房號 (例: 8888)" className="w-full bg-white border-2 border-stone-100 p-4 rounded-2xl text-lg font-black text-center focus:border-amber-400 transition-all outline-none" />
              <button onClick={() => handleJoinRoom()} className="w-full py-4 bg-stone-800 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">進入指定戰區</button>
              <div className="flex items-center gap-3 py-2 opacity-30"><div className="flex-1 h-px bg-stone-400" /><span className="text-[8px] font-bold">OR</span><div className="flex-1 h-px bg-stone-400" /></div>
              <button onClick={startRandomMatchmaking} className="w-full py-4 bg-white border border-stone-200 text-amber-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-amber-50">
                {isMatchmaking ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14}/>} 
                {isMatchmaking ? '尋找對手中...' : '隨機匹配戰場'}
              </button>
              <button onClick={()=>setShowRoomInput(false)} className="w-full py-3 text-stone-400 font-bold text-[10px] uppercase tracking-widest">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 對決中心 (QR Code + 手動輸入融合版) */}
      {showInviteQR && (
        <div className="fixed inset-0 z-[6000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#F7F4EF] w-full max-w-xs rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <h3 className="text-xl font-black text-stone-800 mb-1">對決中心</h3>
            <p className="text-[9px] text-stone-400 font-bold mb-6 uppercase tracking-widest">邀請戰友或加入戰場</p>
            <div className="bg-white p-4 rounded-3xl border border-stone-100 mb-6 shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getInviteUrl())}&bgcolor=F7F4EF`} alt="Invite QR" className="w-32 h-32 mx-auto rounded-xl mb-3" />
              <p className="text-[10px] font-black text-stone-400 uppercase">我的房號</p>
              <p className="text-2xl font-black text-stone-800 tracking-widest">{roomId || "----"}</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <input value={tempRoom} onChange={(e)=>setTempRoom(e.target.value)} placeholder="輸入好友房號" className="flex-1 bg-white border border-stone-200 p-3 rounded-xl text-sm font-black text-center focus:border-amber-400 outline-none" />
                <button onClick={() => handleJoinRoom(tempRoom)} className="bg-stone-800 text-white p-3 rounded-xl active:scale-90 transition-all shadow-md">加入</button>
              </div>
            </div>
            <button onClick={() => setShowInviteQR(false)} className="w-full py-4 bg-stone-200 text-stone-600 rounded-2xl font-black text-xs active:scale-95 transition-all">返回戰線</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-100 p-8 rounded-[3.5rem] shadow-sm relative overflow-hidden text-left">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 z-20">
          <Clock size={10} className="animate-spin-slow" />
          <span className="text-[8px] font-black uppercase tracking-widest">{roomId ? `Room: ${roomId}` : 'Solo Mode'}</span>
        </div>
        <div className="flex items-center justify-between gap-4 mt-4 relative">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
            <VerticalPillar label="生存" percent={hpData.survival} colorClass="bg-blue-400" icon={Heart} />
            <VerticalPillar label="進化" percent={hpData.progress} colorClass="bg-emerald-400" icon={Zap} />
            <VerticalPillar label="慾望" percent={hpData.desire} colorClass="bg-orange-400" icon={Flame} />
            <VerticalPillar label="遠征" percent={hpData.expedition} colorClass="bg-purple-500" icon={Globe} />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-200 to-transparent" />
            <div onClick={() => roomId ? setShowInviteQR(true) : handleStart1v1Duel()} className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center text-white shadow-xl rotate-45 border-4 border-white cursor-pointer active:scale-90 transition-all group">
              {roomId ? <QrCode size={18} className="-rotate-45" /> : <Swords size={18} />}
            </div>
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-200 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
            {roomId ? (
              <>
                <VerticalPillar label="生存" percent={enemyHpData.survival} colorClass="bg-red-400" icon={Heart} isEnemy />
                <VerticalPillar label="進化" percent={enemyHpData.progress} colorClass="bg-red-400" icon={Zap} isEnemy />
                <VerticalPillar label="慾望" percent={enemyHpData.desire} colorClass="bg-red-400" icon={Flame} isEnemy />
                <VerticalPillar label="遠征" percent={enemyHpData.expedition} colorClass="bg-red-400" icon={Globe} isEnemy />
              </>
            ) : (
              <div onClick={handleStart1v1Duel} className="col-span-2 flex flex-col items-center justify-center h-full opacity-20 grayscale hover:opacity-40 cursor-pointer transition-all">
                <div className="w-16 h-16 border-4 border-dashed border-stone-300 rounded-full flex items-center justify-center mb-2"><Users size={24} className="text-stone-400" /></div>
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest text-center">Tap to Duel Friend</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#FAF7F2] border border-[#D7C9B1]/30 p-6 rounded-[3rem] flex items-start gap-4 shadow-sm">
        <div className="w-14 h-14 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0">{stats.icon}</div>
        <div className="flex-1 min-h-[60px] flex flex-col justify-center">
          <p className="text-[9px] font-black text-[#BC8F8F] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><MessageSquare size={10} fill="#BC8F8F" fillOpacity={0.2} /> {stats.title} 戰報</p>
          {isAiProcessing ? <div className="flex items-center gap-2 text-stone-400 text-[10px] italic font-medium"><Loader2 size={12} className="animate-spin text-stone-300" />...</div> : <p className="text-xs text-stone-600 leading-relaxed font-bold tracking-tight text-left">「{aiComment}」</p>}
        </div>
      </div>

      <div className="px-2 space-y-4">
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] px-1 text-left">Battle Log</h3>
        <div className="bg-white/50 backdrop-blur-sm border border-stone-100 rounded-[2.5rem] p-6 h-48 overflow-y-auto no-scrollbar space-y-3 shadow-inner">
          {battleLog.map((log, i) => (
            <div key={i} className={`text-[10px] font-black leading-relaxed flex gap-2 animate-in slide-in-from-left duration-300 ${log.includes('🏆') ? 'text-amber-600' : log.includes('⚔️') ? 'text-red-500' : 'text-stone-500'}`}>
              <span className="opacity-30">{battleLog.length - i}</span><span className="tracking-tight text-left">{log}</span>
            </div>
          ))}
        </div>
      </div>

      {activeChallenges.length > 0 && (
        <div className="px-2 space-y-3">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] px-1">Active Stakes</h3>
          {activeChallenges.map((c, i) => (
            <div key={i} className="bg-stone-800 text-white p-5 rounded-[2rem] flex justify-between items-center shadow-xl border border-stone-700/50">
              <div className="text-left">
                <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1">Stakes</p>
                <h4 className="text-sm font-black tracking-tight italic">拒絕「{c.item}」</h4>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleGiveUpChallenge(i)} className="p-2 text-stone-400 hover:text-white transition-colors"><Clock size={16}/></button>
                <button onClick={() => handleClaimChallenge(i)} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black active:scale-90 transition-all">達成</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showFriends && <FriendsListView onClose={() => setShowFriends(false)} />}
    </div>
  );
};

export default BattleArenaView;
