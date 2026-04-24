import React, { useState, memo } from 'react';
import {
  Swords, Users, MessageSquare, Loader2, Hash, Heart, Zap, Flame, Globe, Shuffle,
  Clock, QrCode, Cpu, LogOut, Trophy
} from 'lucide-react';
import FriendsListView from '../Friends/FriendsListView';
import { LOCALES } from '../../utils/locales';
import EmptyState from '../UI/EmptyState';

/* ── 動畫樣式 ─────────────────────────────────────────────── */
const SHAKE_STYLE = `
  @keyframes pillar-shake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    20%  { transform: translateX(-2px) rotate(-0.6deg); }
    40%  { transform: translateX(2px)  rotate(0.6deg); }
    60%  { transform: translateX(-1.5px) rotate(0.3deg); }
    80%  { transform: translateX(1.5px)  rotate(-0.3deg); }
  }
  .pillar-shake { animation: pillar-shake 0.45s ease-in-out infinite; }
  @keyframes combo-glow {
    0%, 100% { filter: drop-shadow(0 0 6px gold) drop-shadow(0 0 3px #fbbf24); }
    50%       { filter: drop-shadow(0 0 14px gold) drop-shadow(0 0 8px #f59e0b); }
  }
  .pillar-combo { animation: combo-glow 1.8s ease-in-out infinite; }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
`;

/* ── 子元件：裂縫 SVG ─────────────────────────────────────── */
const PillarCracks = memo(({ isCollapsing }) => (
  <svg
    viewBox="0 0 24 128"
    className="absolute inset-0 w-full h-full"
    style={{ pointerEvents: 'none' }}
    aria-hidden="true"
  >
    <path
      d="M 4 10 L 9 24 L 5 38 L 13 54"
      stroke="rgba(60,40,20,0.55)"
      strokeWidth={isCollapsing ? 1.6 : 0.9}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 9 24 L 13 19"
      stroke="rgba(60,40,20,0.35)"
      strokeWidth={isCollapsing ? 1 : 0.5}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 17 60 L 10 74 L 19 88"
      stroke="rgba(60,40,20,0.45)"
      strokeWidth={isCollapsing ? 1.4 : 0.7}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 10 74 L 6 70"
      stroke="rgba(60,40,20,0.3)"
      strokeWidth="0.5"
      fill="none"
      strokeLinecap="round"
    />
    {isCollapsing && (
      <>
        <path
          d="M 2 96 L 11 110 L 6 126"
          stroke="rgba(60,40,20,0.65)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 11 110 L 17 106"
          stroke="rgba(60,40,20,0.4)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="3" cy="45" r="1" fill="rgba(60,40,20,0.3)" />
        <circle cx="20" cy="82" r="1" fill="rgba(60,40,20,0.3)" />
        <circle cx="7" cy="118" r="1.2" fill="rgba(60,40,20,0.4)" />
      </>
    )}
  </svg>
));
PillarCracks.displayName = 'PillarCracks';

/* ── 子元件：單根柱狀圖 ──────────────────────────────────── */
const VerticalPillar = memo(({ label, percent, colorClass, icon: Icon, isEnemy = false, isCombo = false }) => {
  const isCracked = percent < 30;
  const isCollapsing = percent < 15;
  const capColor = isEnemy
    ? 'bg-red-400'
    : isCollapsing
      ? 'bg-red-500'
      : isCombo
        ? 'bg-amber-400'
        : 'bg-stone-400';

  const percentText = `${Math.max(0, Math.min(100, percent)).toFixed(0)}%`;

  return (
    <div
      className={`flex flex-col items-center gap-2 ${isEnemy ? 'scale-90 opacity-80' : ''} ${isCollapsing ? 'pillar-shake' : ''} ${isCombo && !isEnemy ? 'pillar-combo' : ''}`}
      role="img"
      aria-label={`${label}: ${percentText}`}
    >
      <div
        className={`w-10 h-1 rounded-full shadow-sm ${isCollapsing ? 'bg-red-300' : isCombo && !isEnemy ? 'bg-amber-300' : 'bg-stone-300'}`}
      />
      <div
        className={`w-6 h-32 border-x relative flex justify-center shadow-inner overflow-hidden rounded-sm ${isCombo && !isEnemy ? 'bg-amber-50 border-amber-200' : 'bg-stone-100 border-stone-200'}`}
      >
        <div
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out ${isCombo && !isEnemy ? 'bg-amber-400' : colorClass} opacity-70`}
          style={{ height: `${Math.max(0, Math.min(100, percent))}%` }}
        />
        <div className="absolute inset-0 flex justify-evenly opacity-20">
          <div className="w-px h-full bg-white" />
          <div className="w-px h-full bg-white" />
        </div>
        {isCracked && !isCombo && <PillarCracks isCollapsing={isCollapsing} />}
      </div>
      <div
        className={`w-12 h-2 ${capColor} rounded-b-sm shadow-md flex items-center justify-center`}
      >
        <Icon size={8} className="text-white/50" aria-hidden="true" />
      </div>
      <span className="text-[7px] font-black text-stone-400 uppercase tracking-tighter text-center leading-none mt-1">
        {label}
      </span>
      <span
        className={`text-[9px] font-black ${isCollapsing ? 'text-red-600 animate-pulse' : isCracked ? 'text-red-400 animate-pulse' : isCombo && !isEnemy ? 'text-amber-500 animate-pulse' : 'text-stone-600'}`}
        aria-live="polite"
      >
        {percentText}
      </span>
    </div>
  );
});
VerticalPillar.displayName = 'VerticalPillar';

/* ── 子元件：對戰日誌項目 ─────────────────────────────────── */
const BattleLogItem = memo(({ log, index, total }) => {
  const pctMatch = log.match(/(\d+\.?\d*)%/);
  const pct = pctMatch ? parseFloat(pctMatch[1]) : null;
  const dmgLabel =
    pct === null
      ? null
      : pct < 1
        ? { text: '[擦傷]', cls: 'text-stone-400' }
        : pct <= 10
          ? { text: '[受損]', cls: 'text-amber-500' }
          : { text: '[致命!!]', cls: 'text-red-600 animate-pulse' };

  const rowCls = log.includes('🏆')
    ? 'text-amber-600'
    : dmgLabel?.cls ??
      (log.includes('⚔️') || log.includes('🧾') ? 'text-stone-600' : 'text-stone-400');

  return (
    <div
      className={`text-[10px] font-black leading-relaxed flex gap-2 animate-in slide-in-from-left duration-300 ${rowCls}`}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <span className="opacity-30 shrink-0 w-4 text-right">{total - index}</span>
      <span className="tracking-tight text-left">
        {dmgLabel && <span className={`mr-1 ${dmgLabel.cls}`}>{dmgLabel.text}</span>}
        {log}
      </span>
    </div>
  );
});
BattleLogItem.displayName = 'BattleLogItem';

/* ── 主元件：對戰場景 ─────────────────────────────────────── */
const BattleArenaView = ({
  stats,
  hpData,
  enemyHpData,
  isAiProcessing,
  aiComment,
  activeMode,
  setActiveMode,
  battleLog,
  activeChallenges,
  handleClaimChallenge,
  handleGiveUpChallenge,
  roomId,
  setRoomId,
  userId,
  lang,
  showFriends,
  setShowFriends,
  showRoomInput,
  setShowRoomInput,
  showInviteQR,
  setShowInviteQR,
  enemyConnected,
  savingStreak = 0,
  bannerText = '',
}) => {
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [tempRoom, setTempRoom] = useState('');
  const t = LOCALES[lang] || LOCALES.zh;

  const handleJoinRoom = (id) => {
    const finalRoom = id || tempRoom;
    if (!finalRoom) return;
    setRoomId(finalRoom);
    setShowRoomInput(false);
    setShowInviteQR(false);
    if (finalRoom.length === 4) setActiveMode('1v1');
    else if (finalRoom.startsWith('BOT_')) setActiveMode('1v1');
    else setActiveMode('team5v5');
  };

  const startRandomMatchmaking = () => {
    setIsMatchmaking(true);
    handleJoinRoom('MATCHMAKING_QUEUE');
  };

  const handleStart1v1Duel = () => {
    const newRoom = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomId(newRoom);
    setActiveMode('1v1');
    setShowInviteQR(true);
  };

  const handleStartBotPK = () => {
    const botRoomId = 'BOT_' + Math.floor(1000 + Math.random() * 9000);
    setRoomId(botRoomId);
    setActiveMode('1v1');
    setShowRoomInput(false);
  };

  const handleLeaveRoom = () => {
    setRoomId('');
    setActiveMode('selection');
  };

  const getInviteUrl = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?room=${roomId}&mode=${activeMode}`;
  };

  const isBotRoom = roomId?.startsWith('BOT_');
  const hasOpponent = enemyConnected;
  const isCombo = savingStreak >= 3;

  /* 防止空值崩潰 */
  const safeStats = stats || { icon: '🙄', titleKey: 'persona_peer' };
  const safeHp = {
    survival: hpData?.survival ?? 100,
    progress: hpData?.progress ?? 100,
    desire: hpData?.desire ?? 100,
    expedition: hpData?.expedition ?? 100,
  };
  const safeEnemyHp = {
    survival: enemyHpData?.survival ?? 100,
    progress: enemyHpData?.progress ?? 100,
    desire: enemyHpData?.desire ?? 100,
    expedition: enemyHpData?.expedition ?? 100,
  };

  return (
    <div className="space-y-6 pb-48 animate-in fade-in slide-in-from-left duration-700 text-left">
      <style>{SHAKE_STYLE}</style>

      {/* Banner */}
      {bannerText && (
        <div className="flex items-center justify-center gap-3 px-4 py-2 bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl shadow-lg animate-in slide-in-from-top duration-500">
          <span className="text-[9px] text-stone-400 uppercase tracking-widest shrink-0">🚩</span>
          <p className="text-[11px] font-black text-white tracking-tight text-center truncate">
            {bannerText}
          </p>
          <span className="text-[9px] text-stone-400 uppercase tracking-widest shrink-0">🚩</span>
        </div>
      )}

      {/* 標題列 */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none uppercase">
            {t.battle}
          </h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
            {t.war_zone_subtitle}
          </p>
          {isCombo && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-md animate-pulse">
              <Trophy size={10} className="text-white" aria-hidden="true" />
              <span className="text-[10px] font-black text-white tracking-widest">
                {savingStreak} DAYS STREAK!
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFriends(true)}
            className="w-10 h-10 flex items-center justify-center bg-white border border-stone-100 rounded-xl text-stone-400 hover:text-stone-800 transition-colors shadow-sm active:scale-90"
            title={t.friends_title || '戰友名單'}
            aria-label={t.friends_title || '戰友名單'}
          >
            <Users size={18} />
          </button>
          <div className="flex bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setActiveMode('selection')}
              className={`px-4 py-2 text-[9px] font-black transition-all ${activeMode === 'selection' || (activeMode === '1v1' && !isBotRoom) ? 'bg-stone-800 text-white' : 'text-stone-400'}`}
              aria-pressed={activeMode === 'selection' || (activeMode === '1v1' && !isBotRoom)}
            >
              1v1
            </button>
            <button
              onClick={() => setShowRoomInput(true)}
              className={`px-4 py-2 text-[9px] font-black transition-all ${activeMode === 'team5v5' || isBotRoom ? 'bg-amber-500 text-white' : 'text-stone-400'}`}
              aria-pressed={activeMode === 'team5v5' || isBotRoom}
            >
              5v5 / {t.bot_mode?.split(' ')[0] || 'Bot'}
            </button>
          </div>
        </div>
      </div>

      {/* 戰區連線彈窗 (5v5 / Bot) */}
      {showRoomInput && (
        <div
          className="fixed inset-0 z-[6000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-input-title"
        >
          <div className="bg-[#F7F4EF] w-full max-w-xs rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 mx-auto shadow-inner">
              <Hash size={24} aria-hidden="true" />
            </div>
            <h3 id="room-input-title" className="text-xl font-black text-stone-800 mb-1">
              {t.duel_center}
            </h3>
            <p className="text-[9px] text-stone-400 font-bold mb-6 uppercase tracking-widest">
              {t.invite_or_join}
            </p>
            <div className="space-y-3">
              <input
                value={tempRoom}
                onChange={(e) => setTempRoom(e.target.value)}
                placeholder={t.enter_room_id}
                className="w-full bg-white border-2 border-stone-100 p-4 rounded-2xl text-lg font-black text-center focus:border-amber-400 transition-all outline-none"
                aria-label={t.enter_room_id}
              />
              <button
                onClick={() => handleJoinRoom()}
                className="w-full py-4 bg-stone-800 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all hover:bg-stone-700"
              >
                {t.join_btn}
              </button>

              <div className="flex items-center gap-3 py-2 opacity-30">
                <div className="flex-1 h-px bg-stone-400" />
                <span className="text-[8px] font-bold">OR</span>
                <div className="flex-1 h-px bg-stone-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleStartBotPK}
                  className="py-4 bg-white border-2 border-stone-200 text-stone-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-stone-50"
                >
                  <Cpu size={14} aria-hidden="true" /> {t.bot_mode}
                </button>
                <button
                  onClick={startRandomMatchmaking}
                  disabled={isMatchmaking}
                  className="py-4 bg-white border-2 border-amber-200 text-amber-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-amber-50 disabled:opacity-50"
                >
                  {isMatchmaking ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Shuffle size={14} aria-hidden="true" />
                  )}
                  {isMatchmaking ? '...' : t.random_match}
                </button>
              </div>

              <button
                onClick={() => setShowRoomInput(false)}
                className="w-full py-3 text-stone-400 font-bold text-[10px] uppercase tracking-widest hover:text-stone-600 transition-colors"
              >
                {t.back_to_war}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 對決中心 (1v1 邀請) */}
      {showInviteQR && (
        <div
          className="fixed inset-0 z-[6000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-qr-title"
        >
          <div className="bg-[#F7F4EF] w-full max-w-xs rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <h3 id="invite-qr-title" className="text-xl font-black text-stone-800 mb-1">
              {t.duel_center}
            </h3>
            <p className="text-[9px] text-stone-400 font-bold mb-6 uppercase tracking-widest">
              {t.invite_or_join}
            </p>
            <div className="bg-white p-4 rounded-3xl border border-stone-100 mb-6 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getInviteUrl())}&bgcolor=F7F4EF`}
                alt="邀請 QR Code"
                className="w-32 h-32 mx-auto rounded-xl mb-3"
                loading="lazy"
              />
              <p className="text-[10px] font-black text-stone-400 uppercase">{t.my_room_id}</p>
              <p className="text-2xl font-black text-stone-800 tracking-widest">{roomId || '----'}</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <input
                  value={tempRoom}
                  onChange={(e) => setTempRoom(e.target.value)}
                  placeholder={t.enter_room_id}
                  className="flex-1 bg-white border border-stone-200 p-3 rounded-xl text-sm font-black text-center focus:border-amber-400 outline-none"
                  aria-label={t.enter_room_id}
                />
                <button
                  onClick={() => handleJoinRoom(tempRoom)}
                  className="bg-stone-800 text-white p-3 rounded-xl active:scale-90 transition-all shadow-md hover:bg-stone-700"
                >
                  {t.join_btn}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInviteQR(false)}
              className="w-full py-4 bg-stone-200 text-stone-600 rounded-2xl font-black text-xs active:scale-95 transition-all hover:bg-stone-300"
            >
              {t.back_to_war}
            </button>
          </div>
        </div>
      )}

      {/* 對戰主區域 */}
      <div className="bg-white border border-stone-100 p-8 rounded-[3.5rem] shadow-sm relative overflow-hidden text-left">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 z-20">
          <Clock size={10} className="animate-spin-slow" aria-hidden="true" />
          <span className="text-[8px] font-black tracking-widest">
            {roomId ? `Room: ${roomId}` : t.solo_mode}
          </span>
        </div>

        {/* 離開房間按鈕 */}
        {roomId && (
          <button
            onClick={handleLeaveRoom}
            className="absolute top-4 right-6 text-stone-300 hover:text-red-400 transition-colors z-20 p-1 rounded-lg hover:bg-red-50"
            title={t.leave_room}
            aria-label={t.leave_room}
          >
            <LogOut size={14} />
          </button>
        )}

        <div className="flex items-center justify-between gap-4 mt-4 relative">
          {/* 我方柱狀圖 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
            <VerticalPillar
              label={t.cat_food?.slice(0, 2) || '食'}
              percent={safeHp.survival}
              colorClass="bg-blue-400"
              icon={Heart}
              isCombo={isCombo}
            />
            <VerticalPillar
              label={t.cat_study?.slice(0, 2) || '學'}
              percent={safeHp.progress}
              colorClass="bg-emerald-400"
              icon={Zap}
              isCombo={isCombo}
            />
            <VerticalPillar
              label={t.cat_ent?.slice(0, 2) || '娛'}
              percent={safeHp.desire}
              colorClass="bg-orange-400"
              icon={Flame}
              isCombo={isCombo}
            />
            <VerticalPillar
              label={t.cat_shop?.slice(0, 2) || '購'}
              percent={safeHp.expedition}
              colorClass="bg-purple-500"
              icon={Globe}
              isCombo={isCombo}
            />
          </div>

          {/* 中央對決按鈕 */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-200 to-transparent" />
            <button
              onClick={() => (roomId ? setShowInviteQR(true) : handleStart1v1Duel())}
              className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center text-white shadow-xl rotate-45 border-4 border-white cursor-pointer active:scale-90 transition-all group hover:bg-stone-700"
              aria-label={roomId ? t.show_qr_code || '顯示 QR Code' : t.start_duel || '開始對決'}
            >
              {roomId ? (
                <QrCode size={18} className="-rotate-45" aria-hidden="true" />
              ) : (
                <Swords size={18} aria-hidden="true" />
              )}
            </button>
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-stone-200 to-transparent" />
          </div>

          {/* 敵方柱狀圖 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
            {hasOpponent ? (
              <>
                <VerticalPillar
                  label={t.cat_food?.slice(0, 2) || '食'}
                  percent={safeEnemyHp.survival}
                  colorClass="bg-red-400"
                  icon={Heart}
                  isEnemy
                />
                <VerticalPillar
                  label={t.cat_study?.slice(0, 2) || '學'}
                  percent={safeEnemyHp.progress}
                  colorClass="bg-red-400"
                  icon={Zap}
                  isEnemy
                />
                <VerticalPillar
                  label={t.cat_ent?.slice(0, 2) || '娛'}
                  percent={safeEnemyHp.desire}
                  colorClass="bg-red-400"
                  icon={Flame}
                  isEnemy
                />
                <VerticalPillar
                  label={t.cat_shop?.slice(0, 2) || '購'}
                  percent={safeEnemyHp.expedition}
                  colorClass="bg-red-400"
                  icon={Globe}
                  isEnemy
                />
              </>
            ) : (
              <button
                onClick={handleStart1v1Duel}
                className="col-span-2 flex flex-col items-center justify-center h-full opacity-20 grayscale hover:opacity-40 cursor-pointer transition-all"
                aria-label={roomId ? t.waiting_friend : t.tap_to_duel}
              >
                <div className="w-16 h-16 border-4 border-dashed border-stone-300 rounded-full flex items-center justify-center mb-2">
                  <Users size={24} className="text-stone-400" aria-hidden="true" />
                </div>
                <span className="text-[8px] font-black text-stone-400 tracking-widest text-center">
                  {roomId ? t.waiting_friend : t.tap_to_duel}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI 評論區 */}
      <div
        className={`p-6 rounded-[3rem] flex items-start gap-4 shadow-sm ${isCombo ? 'bg-amber-50 border-2 border-amber-400 shadow-amber-200' : 'bg-[#FAF7F2] border border-[#D7C9B1]/30'}`}
      >
        <div className="w-14 h-14 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0">
          {safeStats.icon}
        </div>
        <div className="flex-1 min-h-[60px] flex flex-col justify-center">
          <p className="text-[9px] font-black text-[#BC8F8F] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
            <MessageSquare size={10} fill="#BC8F8F" fillOpacity={0.2} aria-hidden="true" />
            {t[safeStats.titleKey] || safeStats.titleKey} {t.report_suffix}
          </p>
          {isAiProcessing ? (
            <div className="flex items-center gap-2 text-stone-400 text-[10px] italic font-medium">
              <Loader2 size={12} className="animate-spin text-stone-300" aria-hidden="true" />
              <span>...</span>
            </div>
          ) : (
            <p className="text-xs text-stone-600 leading-relaxed font-bold tracking-tight text-left">
              「{aiComment === '...' ? t.ai_ready : aiComment}」
            </p>
          )}
        </div>
      </div>

      {/* 對戰日誌 */}
      <div className="px-2 space-y-4">
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] px-1 text-left">
          Battle Log
        </h3>
        <div
          className="bg-white/50 backdrop-blur-sm border border-stone-100 rounded-[2.5rem] p-6 h-48 overflow-y-auto no-scrollbar space-y-3 shadow-inner"
          role="log"
          aria-live="polite"
          aria-label="對戰日誌"
        >
          {battleLog.length === 0 ? (
            <EmptyState
              icon="shield"
              title={t.no_battle_log || '尚無戰鬥紀錄'}
              description={t.start_battle_hint || '開始記帳來累積你的戰鬥紀錄！'}
            />
          ) : (
            battleLog.map((log, i) => (
              <BattleLogItem key={`${i}-${log.slice(0, 20)}`} log={log} index={i} total={battleLog.length} />
            ))
          )}
        </div>
      </div>

      {/* 主動挑戰 */}
      {activeChallenges.length > 0 && (
        <div className="px-2 space-y-3">
          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] px-1">
            Active Stakes
          </h3>
          {activeChallenges.map((c, i) => (
            <div
              key={i}
              className="bg-stone-800 text-white p-5 rounded-[2rem] flex justify-between items-center shadow-xl border border-stone-700/50 animate-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-left">
                <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1">
                  Stakes
                </p>
                <h4 className="text-sm font-black tracking-tight italic">
                  拒絕「{c.item}」
                </h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGiveUpChallenge(i)}
                  className="p-2 text-stone-400 hover:text-white transition-colors rounded-xl hover:bg-stone-700"
                  aria-label="放棄挑戰"
                >
                  <Clock size={16} aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleClaimChallenge(i)}
                  className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black active:scale-90 transition-all hover:bg-amber-400"
                >
                  達成
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 好友名單 */}
      {showFriends && (
        <FriendsListView
          onClose={() => setShowFriends(false)}
          userId={userId}
          lang={lang}
          setRoomId={setRoomId}
          setActiveMode={setActiveMode}
        />
      )}
    </div>
  );
};

export default memo(BattleArenaView);
