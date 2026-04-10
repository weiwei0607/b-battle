import React, { useState, useEffect, useMemo } from 'react';
import { db, auth, signInAnonymously } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { CATEGORY_MAP } from './utils/constants';
import { useBattleCore } from './hooks/useBattleCore';
import AppContent from './components/Layout/AppContent';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const load = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };

const App = () => {
  const [view, setView] = useState('battle');
  const [coins, setCoins] = useState(() => load('bb_coins', 1500));
  const [debt, setDebt] = useState(() => load('bb_debt', 0));
  const [history, setHistory] = useState(() => load('bb_history', []));
  const [persona, setPersona] = useState(() => load('bb_persona', 'peer'));
  const [willpowerExp, setWillpowerExp] = useState(() => load('bb_exp', 450));
  const [activeMode, setActiveMode] = useState('selection');
  const [teamSpentDaily, setTeamSpentDaily] = useState(() => load('bb_t_daily', 0));
  const [teamSpentWeekly, setTeamSpentWeekly] = useState(() => load('bb_t_weekly', 0));
  const [teamSpentMonthly, setTeamSpentMonthly] = useState(() => load('bb_t_monthly', 0));
  const [enemySpentDaily, setEnemySpentDaily] = useState(0);
  const [enemySpentWeekly, setEnemySpentWeekly] = useState(0);
  const [enemySpentMonthly, setEnemySpentMonthly] = useState(0);
  const [activeChallenges, setActiveChallenges] = useState(() => load('bb_challenges', []));
  const [claimedAvoidedItems, setClaimedAvoidedItems] = useState(() => load('bb_claimed', []));
  const [isSevered, setIsSevered] = useState(() => load('bb_severed', false));
  const [battleLog, setBattleLog] = useState(["系統連線穩定..."]);
  const [aiComment, setAiComment] = useState("意志力防線準備就緒。");
  const [wishlist, setWishlist] = useState(() => load('bb_wishlist', "日本來回機票"));
  const [lastTrackDate, setLastTrackDate] = useState(() => load('bb_lastTrack', null));
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pendingTx, setPendingTx] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [coldWarEndTime, setColdWarEndTime] = useState(() => load('bb_coldwar', null));
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [nlpInput, setNlpInput] = useState("");
  const [now, setNow] = useState(new Date().getTime());
  const [currentTier, setCurrentTier] = useState(() => load('bb_tier', 'free'));
  const [isStudent, setIsStudent] = useState(() => load('bb_isStudent', true));
  const [salaryInput, setSalaryInput] = useState("");
  const [currency, setCurrency] = useState(() => load('bb_currency', 'TWD'));
  const [userFrame, setUserFrame] = useState(() => load('bb_frame', "none"));
  const [lastPersonaSwitch, setLastPersonaSwitch] = useState(() => load('bb_last_switch', null));
  const [homeMaterials, setHomeMaterials] = useState(() => load('bb_materials', 0));

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

  const { executeTransaction, processTransaction, spendCoins, executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice } = useBattleCore(
    user, isCloudLoading, coins, setCoins, debt, setDebt, history, setHistory, 
    persona, personaStats, setPersonaStats, willpowerExp, setWillpowerExp,
    activeMode, { setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly, setEnemySpentDaily, setEnemySpentWeekly, setEnemySpentMonthly }, 
    { teamSpentDaily, teamSpentWeekly, teamSpentMonthly, enemySpentDaily, enemySpentWeekly, enemySpentMonthly },
    activeChallenges, setActiveChallenges, claimedAvoidedItems, setClaimedAvoidedItems,
    addLog, setAiComment, wishlist, apiKey, setIsSevered, isSevered,
    setColdWarEndTime, coldWarEndTime, lastTrackDate, setLastTrackDate, setPendingTx, setIsAiProcessing, isAiProcessing,
    setNlpInput, now, homeMaterials, setHomeMaterials, weeklyPools, monthlyPools, currentTier
  );

  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const s = await getDoc(doc(db, "users", u.uid));
        if (s.exists()) {
          const d = s.data();
          if (d.coins !== undefined) setCoins(d.coins);
          if (d.debt !== undefined) setDebt(d.debt);
          if (d.history !== undefined) setHistory(d.history);
          if (d.exp !== undefined) setWillpowerExp(d.exp);
          if (d.homeMaterials !== undefined) setHomeMaterials(d.homeMaterials);
          if (d.currentTier !== undefined) setCurrentTier(d.currentTier);
          if (d.isStudent !== undefined) setIsStudent(d.isStudent);
          if (d.userFrame !== undefined) setUserFrame(d.userFrame);
          if (d.persona !== undefined) setPersona(d.persona);
          if (d.personaStats !== undefined) setPersonaStats(prev => ({...prev, ...d.personaStats}));
          if (d.wishlist !== undefined) setWishlist(d.wishlist);
          if (d.lastPersonaSwitch !== undefined) setLastPersonaSwitch(d.lastPersonaSwitch);
          if (d.lastTrackDate !== undefined) setLastTrackDate(d.lastTrackDate);
          if (d.weeklyPools !== undefined) setWeeklyPools(d.weeklyPools);
          if (d.monthlyPools !== undefined) setMonthlyPools(d.monthlyPools);
        }
        setIsCloudLoading(false);
      }
    });
  }, []);

  useEffect(() => { const t = setInterval(() => setNow(new Date().getTime()), 1000); return () => clearInterval(t); }, []);

  const limits = useMemo(() => ({
    survival: (weeklyPools.food?.limit || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit || 0),
    progress: (monthlyPools.education?.limit || 0),
    desire: (weeklyPools.social?.limit || 0),
    expedition: (weeklyPools.shopping?.limit || 0)
  }), [weeklyPools, monthlyPools]);

  const hpData = useMemo(() => {
    const getHp = (p, l) => {
      const isTeam = activeMode === 'team5v5';
      const spent = history.filter(h => CATEGORY_MAP[h.category] === p && (new Date(h.date).toLocaleDateString() === new Date().toLocaleDateString() || p !== 'survival')).reduce((s, h) => s + h.damage, 0);
      const teamSpent = p === 'survival' ? teamSpentDaily : (p === 'progress' ? teamSpentWeekly : teamSpentMonthly);
      return Math.max(0, 100 - ((isTeam ? teamSpent : spent) / (isTeam ? l * 5 : l || 1) * 100));
    };
    return { survival: getHp('survival', limits.survival), progress: getHp('progress', limits.progress), desire: getHp('desire', limits.desire), expedition: getHp('expedition', limits.expedition) };
  }, [history, activeMode, teamSpentDaily, teamSpentWeekly, teamSpentMonthly, limits]);

  const enemyHpData = useMemo(() => ({
    survival: Math.max(0, 100 - (enemySpentDaily / (limits.survival * 5 || 1) * 100)),
    progress: Math.max(0, 100 - (enemySpentWeekly / (limits.progress * 5 || 1) * 100)),
    desire: Math.max(0, 100 - (enemySpentMonthly / (limits.desire * 5 || 1) * 100)),
    expedition: Math.max(0, 100 - (enemySpentMonthly / (limits.expedition * 5 || 1) * 100))
  }), [enemySpentDaily, enemySpentWeekly, enemySpentMonthly, limits]);

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

  return (
    <AppContent 
      {...{ isSevered, view, setView, coins, setCoins, debt, willpowerExp, persona, personaStats, setPersona,
        history, wishlist, setWishlist, homeMaterials, activeMode, setActiveMode, battleLog, activeChallenges,
        pendingTx, setPendingTx, isAiProcessing, aiComment, reflectionText, setReflectionText, 
        coldWarEndTime, now, nlpInput, setNlpInput, showBudgetSetup, setShowBudgetSetup, showShop, setShowShop, 
        showCustomModal, setShowCustomModal, hpData, enemyHpData, executeTransaction, processTransaction, 
        executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, handleAutoCalculate, 
        handleSavePersona, getSeveredReason, getHellPlaceholder, currentTier, lastPersonaSwitch, setLastPersonaSwitch,
        userFrame, setUserFrame, salaryInput, setSalaryInput, isStudent, setIsStudent, currency, setCurrency, setCurrentTier }} 
    />
  );
};
export default App;
