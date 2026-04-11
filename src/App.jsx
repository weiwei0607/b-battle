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

// 🌿 外部穩定組件：不受 App 重繪影響，保證進度條跑滿 100%
const GlobalSplash = ({ onComplete, persona, lang }) => {
  const [progress, setProgress] = useState(0);
  const t = LOCALES[lang] || LOCALES.zh;
  const messages = [t.loading_report, t.loading_sync, t.loading_ai, t.loading_ready];
  const greetings = { peer: "🙄", asian_parent: "🧧", bestie: "💅", instructor: "👺", partner: "🌹" };

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
      <div className="animate-float mb-12 text-center">
        <div className="w-20 h-20 bg-stone-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl mx-auto mb-4">
          <Swords size={40} className="text-white" />
        </div>
        <div className="text-2xl mt-2">{greetings[persona]}</div>
      </div>
      <div className="w-48 h-1 bg-stone-200 rounded-full relative overflow-hidden mb-6">
        <div className="absolute inset-y-0 left-0 bg-stone-800 transition-all duration-300" style={{ width: `${progress}%` }} />
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
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  const [isSplashDone, setIsSplashDone] = useState(false);

  // --- 戰場數據 (確保不被刪除) ---
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
  const [now, setNow] = useState(Date.now());
  
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
            if (d.persona !== undefined) setPersona(d.persona);
            if (d.personaStats !== undefined) setPersonaStats(prev => ({...prev, ...d.personaStats}));
            if (d.achievements !== undefined) setAchievements(d.achievements);
            if (d.lang !== undefined) setLang(d.lang);
          }
        } catch (err) { console.error("Sync Error:", err); }
      } else { setUser(null); }
      setIsCloudLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

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

  const handleSplashComplete = useCallback(() => setIsSplashDone(true), []);

  return (
    <>
      {/* 🌿 頂層 Splash Screen，絕對保證跑滿 100% */}
      {!isSplashDone && <GlobalSplash onComplete={handleSplashComplete} persona={persona} lang={lang} />}
      
      <div className={`transition-opacity duration-1000 ${isSplashDone ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        {!isOnline && (
          <div className="fixed top-0 left-0 w-full z-[4000] bg-stone-100/90 backdrop-blur-md py-2 border-b border-stone-200 flex items-center justify-center gap-2 animate-in slide-in-from-top">
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
      </div>

      {showLogin && (
        <div className="fixed inset-0 z-[6000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md animate-in slide-in-from-bottom-10">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 z-[6001] p-2 bg-stone-100 rounded-full text-stone-500"><X size={16}/></button>
            <LoginScreen />
          </div>
        </div>
      )}

      {achievementNotification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[7000] w-[90%] max-w-sm bg-stone-900 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-20 border border-amber-500/50">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">{achievementNotification.icon}</div>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-left">成就達成！</p>
            <h4 className="text-sm font-black tracking-tight text-left">{achievementNotification.name}</h4>
          </div>
          <button onClick={() => { setShowAchievements(true); setAchievementNotification(null); }} className="bg-stone-800 px-3 py-2 rounded-xl text-[9px] font-black">點亮</button>
        </div>
      )}
    </>
  );
};
export default App;
