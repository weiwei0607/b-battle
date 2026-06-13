import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db, auth } from './firebase';
import LoginScreen from './components/LoginScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { CATEGORY_MAP, getBondLevel, getFrameStyle } from './utils/constants';
import { LOCALES } from './utils/locales';
import { useBattleLogic } from './hooks/useBattleLogic';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import AppContent from './components/Layout/AppContent';
import { TutorialOverlay } from './components/TutorialOverlay';
import { X, Swords, WifiOff, AlertCircle, Loader2 } from 'lucide-react';

// ── Zustand Stores ────────────────────────────────────────────────────────────
import { useUserStore } from './stores/useUserStore';
import { useFinanceStore } from './stores/useFinanceStore';
import { useBattleStore } from './stores/useBattleStore';
import { load, save } from './stores/storage';

const AchievementToast = ({ notification, onDismiss, onDetail }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[7000] w-[90%] max-w-sm bg-stone-900 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-20 border border-amber-500/50">
      <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
        {notification.icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">成就達成！</p>
        <h4 className="text-sm font-black tracking-tight">{notification.name}</h4>
      </div>
      <button onClick={onDetail} className="bg-stone-800 px-3 py-2 rounded-xl text-[9px] font-black">
        點亮
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Splash & Streak Overlay（純 UI，留在 App.jsx，不需搬進 store）
// ─────────────────────────────────────────────────────────────────────────────
const GlobalSplash = ({ onComplete }) => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    // Marble crack lines
    const cracks = [];
    const DURATION = 2400;
    const startTime = performance.now();
    let frame = 0;
    let raf;

    // Gold dust particles
    const dust = [];

    function spawnCrack(x, y, angle, depth, t) {
      if (depth <= 0 || t > 0.7) return;
      const len = 30 + Math.random() * 80 * (1 - depth / 6);
      const endX = x + Math.cos(angle) * len;
      const endY = y + Math.sin(angle) * len;
      cracks.push({ x1: x, y1: y, x2: endX, y2: endY, alpha: 0, maxAlpha: 0.3 + Math.random() * 0.4, depth });
      // Branch
      if (depth > 1 && Math.random() < 0.55) {
        const branchAngle = angle + (Math.random() - 0.5) * 1.4;
        spawnCrack(endX, endY, branchAngle, depth - 1, t);
      }
      if (depth > 2 && Math.random() < 0.3) {
        spawnCrack(endX, endY, angle + (Math.random() - 0.5) * 0.6, depth - 2, t);
      }
      // Gold dust at crack tips
      for (let i = 0; i < 3; i++) {
        dust.push({
          x: endX + (Math.random() - 0.5) * 8,
          y: endY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          life: 1, size: 0.8 + Math.random() * 1.5,
        });
      }
    }

    let nextCrack = 0;
    const CENTER_MARBLE = '#F2EDE3';

    function draw(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, W, H);

      // Marble background
      ctx.fillStyle = CENTER_MARBLE;
      ctx.fillRect(0, 0, W, H);

      // Marble veining (repeating-linear-gradient equivalent via canvas)
      for (let i = 0; i < 8; i++) {
        const x1 = Math.random() * W * 2 - W * 0.5;
        const y1 = Math.random() * H * 2 - H * 0.5;
        const x2 = x1 + Math.cos(1.88) * W;
        const y2 = y1 + Math.sin(1.88) * H;
        const grd = ctx.createLinearGradient(x1, y1, x2, y2);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(0.48, 'transparent');
        grd.addColorStop(0.5, 'rgba(197,161,64,0.06)');
        grd.addColorStop(0.52, 'transparent');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Radial gold glow from center
      const glowR = 200 + Math.sin(frame * 0.04) * 20;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      grd.addColorStop(0, 'rgba(197,161,64,0.12)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Spawn cracks from center outward
      if (now > nextCrack && t < 0.68) {
        const angle = Math.random() * Math.PI * 2;
        const startDist = 10 + Math.random() * 40;
        spawnCrack(
          cx + Math.cos(angle) * startDist,
          cy + Math.sin(angle) * startDist,
          angle, 4 + Math.round(Math.random() * 2), t
        );
        nextCrack = now + 80 + Math.random() * 120;
      }

      // Grow cracks
      cracks.forEach(c => {
        c.alpha = Math.min(c.alpha + 0.04, c.maxAlpha);
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.strokeStyle = `rgba(42,34,24,${c.alpha})`;
        ctx.lineWidth = 0.5 + c.depth * 0.2;
        ctx.stroke();
      });

      // Gold dust
      for (let i = dust.length - 1; i >= 0; i--) {
        const p = dust[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.02; // gravity
        p.life -= 0.015;
        if (p.life <= 0) { dust.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197,161,64,${p.life * 0.8})`;
        ctx.fill();
      }

      // Center ornament
      const ornAlpha = Math.min(t * 2.5, 1) * (t < 0.75 ? 1 : (1 - t) * 4);
      if (ornAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ornAlpha);
        // Gold circle
        ctx.beginPath();
        ctx.arc(cx, cy, 36, 0, Math.PI * 2);
        ctx.strokeStyle = '#C5A140';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Inner dot
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#C5A140';
        ctx.fill();

        // B·BATTLE text
        ctx.font = `900 ${Math.round(W * 0.072)}px 'Cinzel', Georgia, serif`;
        ctx.fillStyle = '#2A2218';
        ctx.textAlign = 'center';
        ctx.fillText('B·BATTLE', cx, cy + 70);
        ctx.font = `500 ${Math.round(W * 0.028)}px 'Cinzel', serif`;
        ctx.fillStyle = '#C5A140';
        ctx.fillText('意志力決鬥場', cx, cy + 100);
        ctx.restore();
      }

      // Fade to cream
      if (t > 0.76) {
        const fade = (t - 0.76) / 0.24;
        ctx.fillStyle = `rgba(242,237,227,${fade})`;
        ctx.fillRect(0, 0, W, H);
      }

      frame++;
      if (t < 1) { raf = requestAnimationFrame(draw); }
      else { onComplete(); }
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 5000, width: '100vw', height: '100vh', cursor: 'none' }}
    />
  );
};

const StreakBrokenOverlay = ({ onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2800);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div onClick={onDismiss} className="fixed inset-0 z-[9000] flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-300" style={{ background: 'rgba(20,20,30,0.92)', backdropFilter: 'grayscale(100%) blur(2px)' }}>
      <div className="text-8xl mb-6 animate-in zoom-in-50 duration-500">❄️</div>
      <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-3 animate-in slide-in-from-bottom-8 duration-500">Streak Broken</h2>
      <p className="text-stone-400 text-sm font-bold tracking-widest uppercase animate-in slide-in-from-bottom-10 duration-700">連勝中斷</p>
      <p className="text-stone-600 text-[10px] font-bold mt-8 uppercase tracking-widest">點擊繼續</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  // ── 從 Stores 讀取所有狀態（取代 71 個 useState）─────────────────────────

  // useUserStore
  const {
    user, setUser,
    lang, setLang,
    userName, setUserName,
    userId, setUserId,
    userAvatar, setUserAvatar,
    persona, setPersona,
    personaStats, setPersonaStats,
    achievements, setAchievements,
    unlockedTitles, setUnlockedTitles,
    userTitle, setUserTitle,
    userFrame, setUserFrame,
    currentTier, setCurrentTier,
    isStudent, setIsStudent,
    currency, setCurrency,
    wishlist, setWishlist,
    wishlistGoal, setWishlistGoal,
    homeMaterials,
    salaryInput, setSalaryInput,
  } = useUserStore();

  // useFinanceStore
  const {
    coins, setCoins,
    debt, setDebt,
    history, setHistory,
    willpowerExp, setWillpowerExp,
    shield, setShield,
    potions, setPotions,
    inventory, setInventory,
    weeklyPools, setWeeklyPools,
    monthlyPools, setMonthlyPools,
    insuranceExpiry, setInsuranceExpiry,
    hasZenSofa, setHasZenSofa,
  } = useFinanceStore();

  // useBattleStore
  const {
    view, setView,
    activeMode, setActiveMode,
    roomId, setRoomId,
    isOnline, setIsOnline,
    isCloudLoading, setIsCloudLoading,
    savingStreak,
    streakBroken, setStreakBroken,
    teamSpentDaily, teamSpentWeekly, teamSpentMonthly,
    enemySpentDaily, enemySpentWeekly, enemySpentMonthly,
    activeChallenges,
    isSevered,
    battleLog,
    aiComment,
    isAiProcessing,
    pendingTx, setPendingTx,
    reflectionText, setReflectionText,
    nlpInput, setNlpInput,
    achievementNotification, setAchievementNotification,
    coldWarEndTime,
    bannerText, setBannerText,
    hasCompletedTutorial, setHasCompletedTutorial,
    showTutorial, setShowTutorial,
    showLogin, setShowLogin,
    showBudgetSetup, setShowBudgetSetup,
    showShop, setShowShop,
    showCustomModal, setShowCustomModal,
    showAchievements, setShowAchievements,
    showEvolutionPath, setShowEvolutionPath,
    showFriends, setShowFriends,
    showRoomInput, setShowRoomInput,
    showInviteQR, setShowInviteQR,
    lastPersonaSwitch, setLastPersonaSwitch,
    now, setNow,
    errorMessage, clearError, isFirebaseRetrying,
  } = useBattleStore();

  // ── 純 App.jsx 的本地狀態（不屬於任何 store）─────────────────────────────
  const [isSplashDone, setIsSplashDone] = useState(false);

  const t = LOCALES[lang] || LOCALES.zh;

  // ── 遊戲邏輯（取代 useBattleCore(40個參數)）──────────────────────────────
  const {
    executeTransaction, processTransaction, executeRitual,
    handleClaimChallenge, handleGiveUpChallenge, simulateInvoice,
    deleteTransaction, updateTransaction, handleClaimAchievement,
    unlockAchievement, generateMonthlyReview, syncUpdateTransaction,
  } = useBattleLogic();

  // ── Firestore 聯機對戰同步（房間監聽、HP 上傳、隨機匹配）──────────────────
  useFirebaseSync();

  // ── Firebase 認證 & 雲端資料載入 ─────────────────────────────────────────
  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Auth fetch cache: avoid redundant Firestore reads within 30s for same user
    const lastAuthFetchKey = 'bb_v4_lastAuthFetch';
    const lastAuthUidKey = 'bb_v4_lastAuthUid';

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setUserId(u.uid.slice(0, 6).toUpperCase());
        try {
          const lastFetch = parseInt(load(lastAuthFetchKey, '0'), 10);
          const lastUid = load(lastAuthUidKey, '');
          const shouldSkipFetch = lastUid === u.uid && Date.now() - lastFetch < 30_000;

          if (!shouldSkipFetch) {
            save(lastAuthFetchKey, Date.now().toString());
            save(lastAuthUidKey, u.uid);

            const snap = await getDoc(doc(db, 'users', u.uid));
            if (snap.exists()) {
              const d = snap.data();
              const localUpdatedAt = load('updatedAt', 0);
              const cloudUpdatedAt = d.updatedAt || 0;

              // 雲端比本機新才覆蓋（保護離線期間修改的資料）
              if (cloudUpdatedAt >= localUpdatedAt) {
                if (d.coins     !== undefined) setCoins(d.coins);
                if (d.debt      !== undefined) setDebt(d.debt);
                if (d.exp       !== undefined) setWillpowerExp(d.exp);
                if (d.persona   !== undefined) setPersona(d.persona);
                if (d.personaStats !== undefined) setPersonaStats(prev => ({ ...prev, ...(d.personaStats || {}) }));
                if (d.achievements !== undefined) setAchievements(d.achievements || {});
                if (d.wishlistGoal !== undefined) setWishlistGoal(d.wishlistGoal || 0);
                // history 從 subcollection 讀取（有 index 時才生效）
                try {
                  const hSnap = await getDocs(query(collection(db, 'users', u.uid, 'history'), orderBy('id', 'desc')));
                  if (!hSnap.empty) setHistory(hSnap.docs.map(d => d.data()));
                } catch { /* index 未建立時靜默失敗，沿用 localStorage */ }
              }

              // 身份資料永遠以雲端為準
              if (d.lang      !== undefined) setLang(d.lang || 'zh');
              if (d.userName  !== undefined) setUserName(d.userName);
              if (d.userId    !== undefined) setUserId(d.userId);
              if (d.userAvatar !== undefined) setUserAvatar(d.userAvatar);
              if (d.roomId    !== undefined) setRoomId(d.roomId);
              if (d.hasTutorial !== undefined) setHasCompletedTutorial(d.hasTutorial);
            }
          }
        } catch (err) {
          console.error('Sync Error:', err);
        }
      } else {
        setUser(null);
        save(lastAuthFetchKey, '0');
        save(lastAuthUidKey, '');
        if (!userId) setUserId(Math.random().toString(36).substring(2, 8).toUpperCase());
      }
      setIsCloudLoading(false);
    });

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []); // 只跑一次：onAuthStateChanged 本身是持久監聽

  // 離線模式 → 同步 localStorage（無登入時的備份）
  useEffect(() => {
    if (!user && !isCloudLoading) {
      const snapshot = {
        lang, coins, debt, history, persona, exp: willpowerExp,
        achievements, userTitle, userFrame, potions, shield, personaStats,
        userName, userId, userAvatar, roomId,
        has_tutorial: hasCompletedTutorial,
        wishlist_goal: wishlistGoal,
        updatedAt: Date.now(),
      };
      Object.entries(snapshot).forEach(([k, v]) => save(k, v));
    }
  }, [user, isCloudLoading, lang, coins, debt, history, persona, willpowerExp,
      achievements, userTitle, userFrame, potions, shield, personaStats,
      userName, userId, userAvatar, roomId, hasCompletedTutorial, wishlistGoal]);

  // 全域時鐘（每秒更新 now）
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [setNow]);

  // 教學流程
  useEffect(() => {
    if (!hasCompletedTutorial && isSplashDone) setShowTutorial(true);
  }, [hasCompletedTutorial, isSplashDone]);

  const handleSkipTutorial    = () => { setHasCompletedTutorial(true); setShowTutorial(false); };
  const handleCompleteTutorial = () => { setHasCompletedTutorial(true); setShowTutorial(false); };

  // ── 語言切換（需額外寫回 Firestore）─────────────────────────────────────
  const handleSetLang = async (newLang) => {
    setLang(newLang);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { lang: newLang }, { merge: true });
      } catch (err) { console.error('Update Lang Error:', err); }
    }
  };

  // ── 衍生計算（useMemo，不屬於任何 store）─────────────────────────────────
  const hpData = useMemo(() => {
    const currentMonth = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date()).slice(0, 7);
    const getMonthKey = (dateStr) => (dateStr || '').slice(0, 7);
    // Monthly-equivalent limits from user's pool settings (same formula as HistoryView)
    const limits = {
      survival:   ((weeklyPools.food?.limit || 0) + (weeklyPools.transport?.limit || 0)) * 4 + (monthlyPools.housing?.limit || 0) || 10000,
      progress:   monthlyPools.education?.limit || 5000,
      desire:     (weeklyPools.social?.limit || 0) * 4 || 3000,
      expedition: (weeklyPools.shopping?.limit || 0) * 4 || 15000,
    };
    const getHp = (p) => {
      const isTeam = activeMode === 'team5v5' || activeMode === '1v1';
      const limit = limits[p];
      const spent = history
        .filter(h => h.pillar === p && getMonthKey(h.date) === currentMonth)
        .reduce((s, h) => s + h.damage, 0);
      const teamSpent = p === 'survival' ? teamSpentDaily : (p === 'progress' ? teamSpentWeekly : teamSpentMonthly);
      return Math.max(0, 100 - ((isTeam ? teamSpent : spent) / (isTeam ? limit * 5 : limit) * 100));
    };
    return { survival: getHp('survival'), progress: getHp('progress'), desire: getHp('desire'), expedition: getHp('expedition') };
  }, [history, activeMode, teamSpentDaily, teamSpentWeekly, teamSpentMonthly, weeklyPools, monthlyPools]);

  const enemyHpData = useMemo(() => ({
    survival:   enemySpentDaily   < 0 ? 100 : enemySpentDaily,
    progress:   enemySpentWeekly  < 0 ? 100 : enemySpentWeekly,
    desire:     enemySpentMonthly < 0 ? 100 : enemySpentMonthly,
    expedition: enemySpentMonthly < 0 ? 100 : enemySpentMonthly,
  }), [enemySpentDaily, enemySpentWeekly, enemySpentMonthly]);

  // ── 業務函式（留在 App.jsx，因為要組合多個 store + Firestore）────────────
  const handleAutoCalculate = () => {
    const total = parseInt(salaryInput) || 0;
    const monthly = Math.floor(total * 0.6);
    const weeklyTotal = Math.floor(total * 0.4 / 4);
    setMonthlyPools({
      housing:   { limit: Math.floor(monthly * 0.7),      label: '住居帳單' },
      education: { limit: Math.floor(monthly * 0.3),      label: '學習健康' },
    });
    setWeeklyPools({
      food:      { limit: Math.floor(weeklyTotal * 0.4),  label: '餐飲' },
      transport: { limit: Math.floor(weeklyTotal * 0.15), label: '交通' },
      social:    { limit: Math.floor(weeklyTotal * 0.2),  label: '社交娛樂' },
      shopping:  { limit: Math.floor(weeklyTotal * 0.25), label: '購物娛樂' },
    });
  };

  const handleSavePersona = (id, stats) => {
    setPersonaStats(prev => ({ ...prev, [id]: stats }));
    setPersona(id);
    setShowCustomModal(false);
  };

  const getSeveredReason = () => {
    if (persona === 'asian_parent') return t.severed_asian_parent;
    if (persona === 'peer' || persona === 'instructor') return t.severed_standard;
    if (persona === 'partner' || persona === 'bestie') {
      if (coldWarEndTime && now < coldWarEndTime) {
        const rem = coldWarEndTime - now;
        return `${t.severed_partner} ${Math.floor(rem / 3_600_000)}h ${Math.floor((rem % 3_600_000) / 60_000)}m.`;
      }
      return t.severed_ended;
    }
    return 'Budget defense collapsed!';
  };

  const getHellPlaceholder = () =>
    isSevered
      ? t[`placeholder_severed_${persona}`] || t.placeholder_severed_default
      : t.placeholder_normal;

  const healTransaction = (id) => {
    if (potions <= 0) return;
    const original = history.find(h => h.id === id);
    if (!original) return;
    const healed = { ...original, damage: 0, desc: `✨ [Healed] ${original.desc}` };
    setHistory(prev => {
      const next = prev.map(h => h.id === id ? healed : h);
      const healedCount = next.filter(h => h.desc.includes('[Healed]')).length;
      if (healedCount >= 3)  unlockAchievement('POTION_MASTER');
      if (healedCount >= 10) unlockAchievement('POTION_10');
      return next;
    });
    syncUpdateTransaction(healed);
    setPotions(p => p - 1);
  };

  const handleSplashComplete = useCallback(() => setIsSplashDone(true), []);

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {!isSplashDone && <GlobalSplash onComplete={handleSplashComplete} persona={persona} lang={lang} />}
      <div className={`transition-opacity duration-1000 ${isSplashDone ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        {!isOnline && (
          <div className="fixed top-0 left-0 w-full z-[4000] bg-stone-100/90 backdrop-blur-md py-2 border-b border-stone-200 flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <WifiOff size={12} className="text-stone-400" />
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{t.offline_mode}</span>
          </div>
        )}

        {isFirebaseRetrying && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[4001] bg-amber-50 border border-amber-200 px-4 py-2 rounded-full flex items-center gap-2 animate-in fade-in duration-300">
            <Loader2 size={12} className="animate-spin text-amber-500" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">同步中…</span>
          </div>
        )}

        {/* ── Phase 1：Props 維持原樣傳給 AppContent，AppContent 零改動 ── */}
        <AppContent
          {...{
            isSevered, view, setView, coins, setCoins, debt, setDebt, willpowerExp, persona, personaStats, setPersona,
            history, wishlist, setWishlist, homeMaterials, activeMode, setActiveMode, battleLog, activeChallenges,
            pendingTx, setPendingTx, isAiProcessing, aiComment, reflectionText, setReflectionText,
            coldWarEndTime, now, nlpInput, setNlpInput, showBudgetSetup, setShowBudgetSetup, showShop, setShowShop,
            showCustomModal, setShowCustomModal, showAchievements, setShowAchievements, achievements,
            showEvolutionPath, setShowEvolutionPath, showFriends, setShowFriends, showRoomInput, setShowRoomInput, showInviteQR, setShowInviteQR,
            hpData, enemyHpData, executeTransaction, processTransaction,
            executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, handleAutoCalculate,
            handleSavePersona, getSeveredReason, getHellPlaceholder, currentTier, lastPersonaSwitch, setLastPersonaSwitch,
            userFrame, setUserFrame, salaryInput, setSalaryInput, isStudent, setIsStudent, currency, setCurrency, setCurrentTier,
            deleteTransaction, updateTransaction, weeklyPools, setWeeklyPools, monthlyPools, setMonthlyPools,
            getBondLevel, getFrameStyle, potions, setPotions, healTransaction,
            shield, setShield, userTitle, setUserTitle, unlockedTitles, setUnlockedTitles, handleClaimAchievement,
            user, setShowLogin, unlockAchievement, generateMonthlyReview, isOnline, lang, setLang: handleSetLang,
            userName, setUserName, userId, userAvatar, setUserAvatar, roomId, setRoomId,
            enemyConnected: enemySpentDaily >= 0,
            savingStreak,
            wishlistGoal, setWishlistGoal,
            insuranceExpiry, setInsuranceExpiry,
            hasZenSofa, setHasZenSofa,
            bannerText, setBannerText,
            inventory, setInventory,
            hasCompletedTutorial, setHasCompletedTutorial, showTutorial, setShowTutorial,
          }}
        />
      </div>

      {showTutorial && (
        <TutorialOverlay
          persona={persona} personaStats={personaStats} lang={lang}
          onSkip={handleSkipTutorial} onComplete={handleCompleteTutorial}
          setShowBudgetSetup={setShowBudgetSetup}
        />
      )}
      {streakBroken && <StreakBrokenOverlay onDismiss={() => setStreakBroken(false)} />}
      {showLogin && (
        <div className="fixed inset-0 z-[6000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md animate-in slide-in-from-bottom-10 duration-300">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 z-[6001] p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors">
              <X size={16} />
            </button>
            <LoginScreen isModal={true} onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
      {achievementNotification && (
        <AchievementToast
          notification={achievementNotification}
          onDismiss={() => setAchievementNotification(null)}
          onDetail={() => { setShowAchievements(true); setAchievementNotification(null); }}
        />
      )}

      {errorMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[7001] w-[90%] max-w-sm">
          <div
            className="bg-red-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300"
            role="alert"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={clearError}
              className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
              aria-label="關閉錯誤訊息"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
