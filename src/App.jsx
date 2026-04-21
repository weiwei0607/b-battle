import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db, auth } from './firebase';
import LoginScreen from './components/LoginScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { CATEGORY_MAP, getBondLevel, getFrameStyle } from './utils/constants';
import { LOCALES } from './utils/locales';
import { useBattleLogic } from './hooks/useBattleLogic';
import AppContent from './components/Layout/AppContent';
import { TutorialOverlay } from './components/TutorialOverlay';
import { X, Swords, WifiOff } from 'lucide-react';

// ── Zustand Stores ────────────────────────────────────────────────────────────
import { useUserStore } from './stores/useUserStore';
import { useFinanceStore } from './stores/useFinanceStore';
import { useBattleStore } from './stores/useBattleStore';
import { load, save } from './stores/storage';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || "";

// ─────────────────────────────────────────────────────────────────────────────
// Splash & Streak Overlay（純 UI，留在 App.jsx，不需搬進 store）
// ─────────────────────────────────────────────────────────────────────────────
const GlobalSplash = ({ onComplete, persona, lang }) => {
  const [progress, setProgress] = useState(0);
  const t = LOCALES[lang] || LOCALES.zh;
  const messages = [t.loading_report, t.loading_sync, t.loading_ai, t.loading_ready];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); setTimeout(onComplete, 500); return 100; }
        return p + 1;
      });
    }, 25);
    return () => clearInterval(timer);
  }, [onComplete]);

  const msgIdx = Math.min(Math.floor(progress / 25), 3);

  return (
    <div className="fixed inset-0 z-[5000] bg-[#F7F4EF] flex flex-col items-center justify-center animate-in fade-in duration-700">
      <style>{`
        @keyframes floating { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: floating 3s ease-in-out infinite; }
      `}</style>
      <div className="animate-float mb-12 text-center text-stone-800">
        <div className="w-20 h-20 bg-stone-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl mx-auto mb-4">
          <Swords size={40} className="text-white" />
        </div>
        <div className="text-xl font-black tracking-tighter">B-BATTLE</div>
      </div>
      <div className="w-48 h-1 bg-stone-200 rounded-full relative overflow-hidden mb-6 shadow-inner">
        <div className="absolute inset-y-0 left-0 bg-stone-800 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-[11px] font-black text-stone-400 tracking-[0.2em] uppercase h-4 text-center">
        {messages[msgIdx]}
      </div>
      <div className="fixed bottom-16 text-[10px] font-medium text-stone-400 italic px-8 text-center animate-pulse">
        {t[`splash_${persona}`] || "Loading your willpower journey..."}
      </div>
    </div>
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
    homeMaterials, setHomeMaterials,
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
    activeChallenges, setActiveChallenges,
    isSevered, setIsSevered,
    battleLog,
    aiComment, setAiComment,
    isAiProcessing,
    pendingTx, setPendingTx,
    reflectionText, setReflectionText,
    nlpInput, setNlpInput,
    achievementNotification, setAchievementNotification,
    coldWarEndTime, setColdWarEndTime,
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
  } = useBattleStore();

  // ── 純 App.jsx 的本地狀態（不屬於任何 store）─────────────────────────────
  const [isSplashDone, setIsSplashDone] = useState(false);

  const t = LOCALES[lang] || LOCALES.zh;

  // ── 遊戲邏輯（取代 useBattleCore(40個參數)）──────────────────────────────
  const {
    executeTransaction, processTransaction, spendCoins, executeRitual,
    handleClaimChallenge, handleGiveUpChallenge, simulateInvoice,
    deleteTransaction, updateTransaction, handleClaimAchievement,
    unlockAchievement, generateMonthlyReview,
  } = useBattleLogic();

  // ── Firebase 認證 & 雲端資料載入 ─────────────────────────────────────────
  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setUserId(u.uid.slice(0, 6).toUpperCase());
        try {
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
        } catch (err) {
          console.error('Sync Error:', err);
        }
      } else {
        setUser(null);
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
    const getHp = (p) => {
      const isTeam = activeMode === 'team5v5' || activeMode === '1v1';
      const todayStr = new Date().toLocaleDateString();
      const limits = {
        survival:   (weeklyPools.food?.limit  || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit    || 0),
        progress:   (monthlyPools.education?.limit || 0),
        desire:     (weeklyPools.social?.limit    || 0),
        expedition: (weeklyPools.shopping?.limit  || 0),
      };
      const limit = limits[p] || 10000;
      const spent = history
        .filter(h => CATEGORY_MAP[h.category] === p && (h.date === todayStr || p !== 'survival'))
        .reduce((s, h) => s + h.damage, 0);
      const teamSpent = p === 'survival' ? teamSpentDaily : (p === 'progress' ? teamSpentWeekly : teamSpentMonthly);
      return Math.max(0, 100 - ((isTeam ? teamSpent : spent) / (isTeam ? limit * 5 : limit || 1) * 100));
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
    setHistory(prev => {
      const next = prev.map(h => h.id === id ? { ...h, damage: 0, desc: `✨ [Healed] ${h.desc}` } : h);
      const healedCount = next.filter(h => h.desc.includes('[Healed]')).length;
      if (healedCount >= 3)  unlockAchievement('POTION_MASTER');
      if (healedCount >= 10) unlockAchievement('POTION_10');
      return next;
    });
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
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[7000] w-[90%] max-w-sm bg-stone-900 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-20 border border-amber-500/50">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            {achievementNotification.icon}
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-left">成就達成！</p>
            <h4 className="text-sm font-black tracking-tight text-left">{achievementNotification.name}</h4>
          </div>
          <button
            onClick={() => { setShowAchievements(true); setAchievementNotification(null); }}
            className="bg-stone-800 px-3 py-2 rounded-xl text-[9px] font-black"
          >
            點亮
          </button>
        </div>
      )}
    </>
  );
};

export default App;
