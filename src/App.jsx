import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db, auth } from './firebase';
import LoginScreen from './components/LoginScreen';
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { CATEGORY_MAP, getBondLevel, getFrameStyle } from './utils/constants';
import { LOCALES } from './utils/locales';
import { useBattleCore } from './hooks/useBattleCore';
import AppContent from './components/Layout/AppContent';
import { X, Swords, WifiOff } from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || "";
const load = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };

const LoadingScreen = ({ onComplete, persona, lang }) => {
  const [progress, setProgress] = useState(0);
  const t = LOCALES[lang] || LOCALES.zh;
  const messages = [t.loading_report, t.loading_sync, t.loading_ai, t.loading_ready];
  const greetings = { peer: "🙄", asian_parent: "🧧", bestie: "💅", instructor: "👺", partner: "🌹" };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { 
          clearInterval(interval); 
          setTimeout(onComplete, 400);
          return 100; 
        }
        return p + 1;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [onComplete]);

  const msgIdx = Math.min(Math.floor(progress / 25), 3);

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col items-center justify-center animate-in fade-in duration-1000">
      <style>{`
        @keyframes floating { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: floating 3s ease-in-out infinite; }
      `}</style>
      <div className="animate-float mb-12 text-center">
        <div className="w-20 h-20 bg-stone-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl mx-auto mb-4">
          <Swords size={40} className="text-white" />
        </div>
        <div className="text-2xl mt-2">{greetings[persona]}</div>
      </div>
      <div className="w-48 h-1 bg-stone-200 rounded-full relative overflow-hidden mb-6">
        <div className="absolute inset-y-0 left-0 bg-stone-800 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-[11px] font-black text-stone-400 tracking-[0.2em] uppercase h-4 text-center">
        {messages[msgIdx]}
      </div>
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState(() => load('bb_lang', 'zh'));
  const [view, setView] = useState('battle');
  const [coins, setCoins] = useState(() => load('bb_coins', 2000));
  const [debt, setDebt] = useState(() => load('bb_debt', 0));
  const [history, setHistory] = useState(() => load('bb_history', []));
  const [persona, setPersona] = useState(() => load('bb_persona', 'peer'));
  const [willpowerExp, setWillpowerExp] = useState(() => load('bb_exp', 1000));
  const [activeMode, setActiveMode] = useState('selection'); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [teamSpentDaily, setTeamSpentDaily] = useState(() => load('bb_t_daily', 0));
  const [teamSpentWeekly, setTeamSpentWeekly] = useState(() => load('bb_t_weekly', 0));
  const [teamSpentMonthly, setTeamSpentMonthly] = useState(() => load('bb_t_monthly', 0));
  const [enemySpentDaily, setEnemySpentDaily] = useState(0);
  const [enemySpentWeekly, setEnemySpentWeekly] = useState(0);
  const [enemySpentMonthly, setEnemySpentMonthly] = useState(0);

  const [activeChallenges, setActiveChallenges] = useState(() => load('bb_challenges', []));
  const [claimedAvoidedItems, setClaimedAvoidedItems] = useState(() => load('bb_claimed', []));
  const [isSevered, setIsSevered] = useState(() => load('bb_severed', false));
  const [battleLog, setBattleLog] = useState(["意志力系統啟動..."]);
  const [aiComment, setAiComment] = useState("意志力防線準備就緒。");
  const [wishlist, setWishlist] = useState(() => load('bb_wishlist', "日本來回機票"));
  const [lastTrackDate, setLastTrackDate] = useState(() => load('bb_lastTrack', null));
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  const [shouldShowApp, setShouldShowApp] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingTx, setPendingTx] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [coldWarEndTime, setColdWarEndTime] = useState(() => load('bb_coldwar', null));
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementNotification, setAchievementNotification] = useState(null);
  const [nlpInput, setNlpInput] = useState("");
  const [now, setNow] = useState(new Date().getTime());
  
  const [currentTier, setCurrentTier] = useState(() => load('bb_tier', 'free'));
  const [isStudent, setIsStudent] = useState(() => load('bb_isStudent', true));
  const [salaryInput, setSalaryInput] = useState("");
  const [currency, setCurrency] = useState(() => load('bb_currency', 'TWD'));
  const [userFrame, setUserFrame] = useState(() => load('bb_frame', "none"));
  const [userTitle, setUserTitle] = useState(() => load('bb_title', "省錢戰士"));
  const [unlockedTitles, setUnlockedTitles] = useState(() => load('bb_unlocked_titles', ["省錢戰士"]));
  const [achievements, setAchievements] = useState(() => load('bb_achievements', {})); 
  const [shield, setShield] = useState(() => load('bb_shield', 0)); 
  const [lastPersonaSwitch, setLastPersonaSwitch] = useState(() => load('bb_last_switch', null));
  const [homeMaterials, setHomeMaterials] = useState(() => load('bb_materials', 0));
  const [potions, setPotions] = useState(() => load('bb_potions', 0)); 

  const [weeklyPools, setWeeklyPools] = useState(() => load('bb_weekly_pools', { food: { limit: 3000, label: "餐飲" }, transport: { limit: 1000, label: "交通" }, social: { limit: 1500, label: "社交" }, shopping: { limit: 1500, label: "購物" } }));
  const [monthlyPools, setMonthlyPools] = useState(() => load('bb_monthly_pools', { housing: { limit: 8000, label: "房租" }, education: { limit: 3000, label: "學習" } }));
  const [personaStats, setPersonaStats] = useState(() => load('bb_persona_stats', { 
    peer: { intimacy: 50, title: "愛酸同學", icon: "🙄", prompt: "你是一個酸言酸語的同學。" }, 
    asian_parent: { intimacy: 30, title: "亞洲家長", icon: "🧧", prompt: "你是典型的亞洲家長。" },
    bestie: { intimacy: 60, title: "好閨蜜", icon: "💅", prompt: "你是超級好閨蜜。" },
    instructor: { intimacy: 10, title: "毒舌教官", icon: "👺", prompt: "你是軍事化的教官。" },
    partner: { intimacy: 80, title: "溫柔另一半", icon: "🌹", prompt: "你是溫柔但有原則的另一半。" }
  }));

  const addLog = (m) => setBattleLog(prev => [m, ...prev].slice(0, 30));

  const { executeTransaction, processTransaction, spendCoins, executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, deleteTransaction, updateTransaction, handleClaimAchievement, unlockAchievement, generateMonthlyReview } = useBattleCore(
    user, isCloudLoading, coins, setCoins, debt, setDebt, history, setHistory, 
    persona, personaStats, setPersonaStats, willpowerExp, setWillpowerExp,
    activeMode, { setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly, setEnemySpentDaily, setEnemySpentWeekly, setEnemySpentMonthly }, 
    { teamSpentDaily, teamSpentWeekly, teamSpentMonthly, enemySpentDaily, enemySpentWeekly, enemySpentMonthly },
    activeChallenges, setActiveChallenges, claimedAvoidedItems, setClaimedAvoidedItems,
    addLog, setAiComment, wishlist, apiKey, setIsSevered, isSevered,
    setColdWarEndTime, coldWarEndTime, lastTrackDate, setLastTrackDate, setPendingTx, setIsAiProcessing, isAiProcessing,
    setNlpInput, now, homeMaterials, setHomeMaterials, weeklyPools, monthlyPools, currentTier,
    shield, setShield, userTitle, setUserTitle, unlockedTitles, setUnlockedTitles,
    potions, setPotions, achievements, setAchievements, setAchievementNotification, lang
  );

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); };
    const handleOffline = () => { setIsOnline(false); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const s = await getDoc(doc(db, "users", u.uid));
          if (s.exists()) {
            const d = s.data();
            if (d.coins !== undefined) setCoins(d.coins);
            if (d.debt !== undefined) setDebt(d.debt);
            if (d.history !== undefined) setHistory(d.history);
            if (d.exp !== undefined) setWillpowerExp(d.exp);
            if (d.homeMaterials !== undefined) setHomeMaterials(d.homeMaterials);
            if (d.currentTier !== undefined) setCurrentTier(d.currentTier);
            if (d.userFrame !== undefined) setUserFrame(d.userFrame);
            if (d.persona !== undefined) setPersona(d.persona);
            if (d.personaStats !== undefined) setPersonaStats(prev => ({...prev, ...d.personaStats}));
            if (d.wishlist !== undefined) setWishlist(d.wishlist);
            if (d.lastTrackDate !== undefined) setLastTrackDate(d.lastTrackDate);
            if (d.weeklyPools !== undefined) setWeeklyPools(d.weeklyPools);
            if (d.monthlyPools !== undefined) setMonthlyPools(d.monthlyPools);
            if (d.potions !== undefined) setPotions(d.potions);
            if (d.shield !== undefined) setShield(d.shield);
            if (d.userTitle !== undefined) setUserTitle(d.userTitle);
            if (d.unlockedTitles !== undefined) setUnlockedTitles(d.unlockedTitles);
            if (d.achievements !== undefined) setAchievements(d.achievements);
            if (d.lang !== undefined) setLang(d.lang);
          }
        } catch (err) { console.error("Sync Error:", err); }
      } else { setUser(null); }
      setIsCloudLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      const data = { bb_coins: coins, bb_debt: debt, bb_history: history, bb_exp: willpowerExp, bb_persona: persona, bb_persona_stats: personaStats, bb_achievements: achievements, bb_unlocked_titles: unlockedTitles, bb_title: userTitle, bb_frame: userFrame, bb_potions: potions, bb_shield: shield, bb_lang: lang };
      Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
    }
  }, [user, coins, debt, history, willpowerExp, persona, personaStats, achievements, unlockedTitles, userTitle, userFrame, potions, shield, lang]);

  useEffect(() => { const t = setInterval(() => setNow(new Date().getTime()), 1000); return () => clearInterval(t); }, []);

  const hpData = useMemo(() => {
    const getHp = (p) => {
      const isTeam = activeMode === 'team5v5';
      const todayStr = new Date().toLocaleDateString();
      const limits = {
        survival: (weeklyPools.food?.limit || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit || 0),
        progress: (monthlyPools.education?.limit || 0),
        desire: (weeklyPools.social?.limit || 0),
        expedition: (weeklyPools.shopping?.limit || 0)
      };
      const limit = limits[p] || 10000;
      const spent = history.filter(h => CATEGORY_MAP[h.category] === p && (h.date === todayStr || p !== 'survival')).reduce((s, h) => s + h.damage, 0);
      const teamSpent = p === 'survival' ? teamSpentDaily : (p === 'progress' ? teamSpentWeekly : teamSpentMonthly);
      return Math.max(0, 100 - ((isTeam ? teamSpent : spent) / (isTeam ? limit * 5 : limit || 1) * 100));
    };
    return { survival: getHp('survival'), progress: getHp('progress'), desire: getHp('desire'), expedition: getHp('expedition') };
  }, [history, activeMode, teamSpentDaily, teamSpentWeekly, teamSpentMonthly, weeklyPools, monthlyPools]);

  const enemyHpData = useMemo(() => {
    const limits = {
      survival: (weeklyPools.food?.limit || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit || 0),
      progress: (monthlyPools.education?.limit || 0),
      desire: (weeklyPools.social?.limit || 0),
      expedition: (weeklyPools.shopping?.limit || 0)
    };
    return {
      survival: Math.max(0, 100 - (enemySpentDaily / (limits.survival * 5 || 1) * 100)),
      progress: Math.max(0, 100 - (enemySpentWeekly / (limits.progress * 5 || 1) * 100)),
      desire: Math.max(0, 100 - (enemySpentMonthly / (limits.desire * 5 || 1) * 100)),
      expedition: Math.max(0, 100 - (enemySpentMonthly / (limits.expedition * 5 || 1) * 100))
    };
  }, [enemySpentDaily, enemySpentWeekly, enemySpentMonthly, weeklyPools, monthlyPools]);

  const handleAutoCalculate = () => {
    const total = parseInt(salaryInput) || 0;
    const monthly = Math.floor(total * 0.6);
    const weeklyTotal = Math.floor(total * 0.4 / 4);
    setMonthlyPools({ housing: { limit: Math.floor(monthly * 0.7), label: "住居帳單" }, education: { limit: Math.floor(monthly * 0.3), label: "學習健康" } });
    setWeeklyPools({ food: { limit: Math.floor(weeklyTotal * 0.4), label: "餐飲" }, transport: { limit: Math.floor(weeklyTotal * 0.15), label: "交通" }, social: { limit: Math.floor(weeklyTotal * 0.2), label: "社交娛樂" }, shopping: { limit: Math.floor(weeklyTotal * 0.25), label: "購物娛樂" } });
  };

  const handleSavePersona = (id, stats) => { setPersonaStats(prev => ({ ...prev, [id]: stats })); setPersona(id); setShowCustomModal(false); };

  const getSeveredReason = () => {
    if (persona === 'asian_parent') return "老媽：『寫 50 字以上的反省書，保證以後多喝熱水少亂花，不然別想回家！』";
    if (persona === 'peer' || persona === 'instructor') return "對方：『支付 500 金幣請我喝精品咖啡，我才考慮原諒你。』";
    if (persona === 'partner' || persona === 'bestie') {
      if (coldWarEndTime && now < coldWarEndTime) {
        const rem = coldWarEndTime - now;
        return `另一半：『進入冷戰期。還有 ${Math.floor(rem/3600000)} 小時 ${Math.floor((rem%3600000)/60000)} 分鐘。』`;
      }
      return "冷戰結束，執行重生儀式。";
    }
    return "預算防線崩潰！";
  };

  const getHellPlaceholder = () => {
    if (isSevered) {
      const map = { asian_parent: "又是買這些垃圾？", partner: "哼，誰管你有沒有錢...", bestie: "反正我們已經完了...", instructor: "報上你的遺言，戰犯。", peer: "破產了還買？笑死。" };
      return map[persona] || "在恥辱中記錄你的罪行...";
    }
    return "記帳或『我想買...』發起豪賭";
  };

  const healTransaction = (id) => {
    if (potions <= 0) return;
    setHistory(prev => prev.map(h => h.id === id ? { ...h, damage: 0, desc: `✨ [已修復] ${h.desc}` } : h));
    setPotions(p => p - 1);
    addLog("💊 [修復] 使用了忘憂聖水，抹除了一筆戰損血量！");
  };

  // 🚀 使用 useCallback 固定跳轉函式，防止進度條每秒重設
  const completeLoading = useCallback(() => {
    setShouldShowApp(true);
  }, []);

  if (isCloudLoading || !shouldShowApp) {
    return <LoadingScreen onComplete={completeLoading} persona={persona} lang={lang} />;
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full z-[2000] bg-stone-100/90 backdrop-blur-md py-2 border-b border-stone-200 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-500">
          <WifiOff size={12} className="text-stone-400" />
          <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{LOCALES[lang]?.offline_mode}</span>
        </div>
      )}

      <AppContent 
        {...{ isSevered, view, setView, coins, setCoins, debt, setDebt, willpowerExp, persona, personaStats, setPersona,
          history, wishlist, setWishlist, homeMaterials, activeMode, setActiveMode, battleLog, activeChallenges,
          pendingTx, setPendingTx, isAiProcessing, aiComment, reflectionText, setReflectionText, 
          coldWarEndTime, now, nlpInput, setNlpInput, showBudgetSetup, setShowBudgetSetup, showShop, setShowShop, 
          showCustomModal, setShowCustomModal, showAchievements, setShowAchievements, achievements,
          hpData, enemyHpData, executeTransaction, processTransaction, 
          executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, handleAutoCalculate, 
          handleSavePersona, getSeveredReason, getHellPlaceholder, currentTier, lastPersonaSwitch, setLastPersonaSwitch,
          userFrame, setUserFrame, salaryInput, setSalaryInput, isStudent, setIsStudent, currency, setCurrency, setCurrentTier,
          deleteTransaction, updateTransaction, weeklyPools, setWeeklyPools, monthlyPools, setMonthlyPools,
          getBondLevel, getFrameStyle, potions, setPotions, healTransaction,
          shield, setShield, userTitle, setUserTitle, unlockedTitles, setUnlockedTitles, handleClaimAchievement,
          user, setShowLogin, unlockAchievement, generateMonthlyReview, isOnline, lang, setLang }} 
      />
      {showLogin && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md animate-in slide-in-from-bottom-10 duration-300">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 z-[1001] p-2 bg-stone-100 rounded-full text-stone-500"><X size={16}/></button>
            <LoginScreen />
          </div>
        </div>
      )}

      {achievementNotification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-sm bg-stone-900 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-20 duration-500 border border-amber-500/50">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            {achievementNotification.icon}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">成就達成！</p>
            <h4 className="text-sm font-black tracking-tight">{achievementNotification.name}</h4>
          </div>
          <button onClick={() => { setShowAchievements(true); setAchievementNotification(null); }} className="bg-stone-800 px-3 py-2 rounded-xl text-[9px] font-black hover:bg-stone-700 active:scale-95 transition-all">點亮</button>
        </div>
      )}
    </>
  );
};
export default App;
