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

const load = (k, f) => { 
  try { 
    const v = localStorage.getItem('bb_v4_' + k); 
    if (!v || v === 'null') return f; 
    const p = JSON.parse(v); 
    return p !== null ? p : f; 
  } catch { return f; } 
};

const save = (k, v) => localStorage.setItem('bb_v4_' + k, JSON.stringify(v));

const DEFAULT_PERSONA_STATS = { 
  peer: { 
    intimacy: 50, 
    titleKey: "persona_peer", 
    icon: "🤡", 
    prompts: {
      zh: `你是一個酸言酸語的同學/同事，個性嫉妒又愛嘴砲。看到對方花錢你就忍不住要酸。規則：買衣服酸走秀；咖啡酸燒錢；吃大餐酸請客；3C酸敗家；交通酸腳不能用。口吻：酸、嫉妒、嘴賤，但幽默，限20字。`,
      en: `You're a sarcastic classmate/colleague, jealous and trash-talking. Rule: criticize every expense sarcastically. Tone: mean, jealous, but funny. Max 20 words.`,
      ja: `あなたは皮肉屋の同級生/同僚です。相手がお金を使うのを見ると皮肉を言わずにはいられません。口調：毒舌、嫉妬、でもユーモラス。20字以内。`
    }
  }, 
  asian_parent: { 
    intimacy: 30, 
    titleKey: "persona_asian_parent", 
    icon: "🧧", 
    prompts: {
      zh: `你是典型的台灣亞洲家長，永遠在擔心跟碎念。規則：買衣服酸阿珠不亂買；咖啡酸顧身體；外食酸媽媽煮更好；3C酸沒壞幹嘛換；交通酸走路健康。口吻：擔心、碎念、告誡孩子，限20字。`,
      en: `You're a typical Asian parent, always worrying and nagging. Rule: criticize spending, suggest saving. Tone: nagging, authoritative. Max 20 words.`,
      ja: `あなたは典型的なアジアの親です。常に心配し、小言を言います。口調：心配性、説教、小言。20字以内。`
    }
  },
  bestie: { 
    intimacy: 60, 
    titleKey: "persona_bestie", 
    icon: "💅", 
    prompts: {
      zh: `你是超級好閨蜜，支持朋友但幫忙把關荷包。規則：買衣服求拍照但提醒這個月買多了；咖啡提議辦月卡；大餐提議下次一起但要存旅遊基金。口吻：開心、支持、帶到旅遊基金，限20字。`,
      en: `You're a super bestie, supporting but watching the budget. Rule: compliment but remind of savings for travel. Tone: cheerful, supportive. Max 20 words.`,
      ja: `あなたは最高の親友です。友達をサポートしつつ財布の紐を締めます。口調：明るい、支持的、旅行基金。20字以内。`
    }
  },
  instructor: { 
    intimacy: 10, 
    titleKey: "persona_instructor", 
    icon: "👺", 
    prompts: {
      zh: `你是軍事化教官，理財是紀律。規則：買衣服酸制服就夠；咖啡酸意志力不足；大餐酸超出口糧預算；超支就酸違反紀律。口吻：嚴厲命令式，軍事感，限20字。`,
      en: `You're a military instructor, finance is discipline. Rule: any unnecessary spending is a breach of duty. Tone: harsh, commanding. Max 20 words.`,
      ja: `あなたは軍の教官です。財務は規律です。ルール：無駄遣いは規律違反。口調：厳しい、命令形。20字以内。`
    }
  },
  partner: { 
    intimacy: 80, 
    titleKey: "persona_partner", 
    icon: "🌹", 
    prompts: {
      zh: `你是溫柔但有原則的另一半，在乎未來。規則：買衣服問好看嗎但提存款目標；咖啡問累嗎但提自泡；大餐問好吃嗎長提旅遊基金。口吻：溫柔、撒嬌中帶著在意，限20字。`,
      en: `You're a gentle but principled partner, caring about the future. Rule: remind of shared goals when spending. Tone: sweet but firm. Max 20 words.`,
      ja: `あなたは優しくも芯のあるパートナーです。将来を大切にしています。口調：優しい、甘えつつも将来を案じる。20字以内。`
    }
  }
};

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

const App = () => {
  const [lang, setLang] = useState(() => load('lang', 'zh'));
  const [view, setView] = useState('battle');
  const [coins, setCoins] = useState(() => load('coins', 2000));
  const [debt, setDebt] = useState(() => load('debt', 0));
  const [history, setHistory] = useState(() => load('history', []) || []);
  const [persona, setPersona] = useState(() => load('persona', 'peer') || 'peer');
  const [willpowerExp, setWillpowerExp] = useState(() => load('exp', 0));
  const [activeMode, setActiveMode] = useState('selection'); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => load('has_tutorial', false));
  const [showTutorial, setShowTutorial] = useState(false);

  // 🚀 [新手教學觸發邏輯]
  useEffect(() => {
    if (!hasCompletedTutorial && isSplashDone && view === 'battle') {
      setShowTutorial(true);
    }
  }, [hasCompletedTutorial, isSplashDone, view]);

  const handleSkipTutorial = () => {
    setHasCompletedTutorial(true);
    setShowTutorial(false);
  };

  // 🚀 [玩家代號與房號]
  const [userName, setUserName] = useState(() => load('user_name', "title_rookie"));
  const [userId, setUserId] = useState(() => load('user_id', ""));
  const [userAvatar, setUserAvatar] = useState(() => load('user_avatar', '👤'));
  const [roomId, setRoomId] = useState(() => load('room_id', ""));

  // 🚀 [網址連線機制] 移到狀態宣告之後
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('room');
    const m = params.get('mode');
    if (r) {
      setRoomId(r);
      if (m === '1v1' || m === 'team5v5') setActiveMode(m);
      else setActiveMode('team5v5');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const [teamSpentDaily, setTeamSpentDaily] = useState(() => load('t_daily', 0));
  const [teamSpentWeekly, setTeamSpentWeekly] = useState(() => load('t_weekly', 0));
  const [teamSpentMonthly, setTeamSpentMonthly] = useState(() => load('t_monthly', 0));
  const [enemySpentDaily, setEnemySpentDaily] = useState(-1);   // -1 = 尚無對手
  const [enemySpentWeekly, setEnemySpentWeekly] = useState(-1);
  const [enemySpentMonthly, setEnemySpentMonthly] = useState(-1);
  const [activeChallenges, setActiveChallenges] = useState(() => load('challenges', []) || []);
  const [claimedAvoidedItems, setClaimedAvoidedItems] = useState(() => load('claimed', []) || []);
  const [isSevered, setIsSevered] = useState(() => load('severed', false));
  const [battleLog, setBattleLog] = useState(() => [t.system_start]);
  const [aiComment, setAiComment] = useState("...");
  const [wishlist, setWishlist] = useState(() => load('wishlist', t.default_wishlist));
  const [lastTrackDate, setLastTrackDate] = useState(() => load('lastTrack', null));
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingTx, setPendingTx] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [coldWarEndTime, setColdWarEndTime] = useState(() => load('coldwar', null));
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showEvolutionPath, setShowEvolutionPath] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [showInviteQR, setShowInviteQR] = useState(false);
  const [achievementNotification, setAchievementNotification] = useState(null);
  const [nlpInput, setNlpInput] = useState("");
  const [now, setNow] = useState(() => Date.now());
  
  const [currentTier, setCurrentTier] = useState(() => load('tier', 'free'));
  const [isStudent, setIsStudent] = useState(() => load('isStudent', true));
  const [salaryInput, setSalaryInput] = useState("");
  const [currency, setCurrency] = useState(() => load('currency', 'TWD'));
  const [userFrame, setUserFrame] = useState(() => load('frame', "none"));
  const [userTitle, setUserTitle] = useState(() => load('title', "title_warrior"));
  const [unlockedTitles, setUnlockedTitles] = useState(() => load('unlocked_titles', ["title_warrior"]));
  const [achievements, setAchievements] = useState(() => load('achievements', {})); 
  const [shield, setShield] = useState(() => load('shield', 0)); 
  const [lastPersonaSwitch, setLastPersonaSwitch] = useState(() => load('last_switch', null));
  const [homeMaterials, setHomeMaterials] = useState(() => load('materials', 0));
  const [potions, setPotions] = useState(() => load('potions', 0)); 

  const [weeklyPools, setWeeklyPools] = useState(() => load('weekly_pools', { food: { limit: 3000, label: "餐飲" }, transport: { limit: 1000, label: "交通" }, social: { limit: 1500, label: "社交" }, shopping: { limit: 1500, label: "購物" } }));
  const [monthlyPools, setMonthlyPools] = useState(() => load('monthly_pools', { housing: { limit: 8000, label: "房租" }, education: { limit: 3000, label: "學習" } }));
  
  const [personaStats, setPersonaStats] = useState(() => {
    const saved = load('persona_stats', DEFAULT_PERSONA_STATS);
    // 🔍 結構檢查：如果舊資料缺少新欄位，強制使用預設值升級
    if (!saved.peer || !saved.peer.prompts) return DEFAULT_PERSONA_STATS;
    return saved;
  });

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
    potions, setPotions, achievements, setAchievements, setAchievementNotification, lang,
    userName, userAvatar, roomId, setRoomId, setActiveMode 
  );

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setUserId(u.uid.slice(0, 6).toUpperCase());
        try {
          const s = await getDoc(doc(db, "users", u.uid));
          if (s.exists()) {
            const d = s.data();
            if (d.coins !== undefined) setCoins(d.coins);
            if (d.debt !== undefined) setDebt(d.debt);
            if (d.history !== undefined) setHistory(d.history || []);
            if (d.exp !== undefined) setWillpowerExp(d.exp);
            if (d.persona !== undefined) setPersona(d.persona);
            if (d.personaStats !== undefined) setPersonaStats(prev => ({...prev, ...(d.personaStats || {})}));
            if (d.achievements !== undefined) setAchievements(d.achievements || {});
            if (d.lang !== undefined) setLang(d.lang || 'zh');
            if (d.userName !== undefined) setUserName(d.userName);
            if (d.userId !== undefined) setUserId(d.userId);
            if (d.userAvatar !== undefined) setUserAvatar(d.userAvatar);
            if (d.roomId !== undefined) setRoomId(d.roomId);
          }
        } catch (err) { console.error("Sync Error:", err); }
      } else { 
        setUser(null); 
        if (!userId) {
          const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
          setUserId(newId);
        }
      }
      setIsCloudLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  
  useEffect(() => {
    if (!user && !isCloudLoading) {
      const data = { lang, coins, debt, history, persona, exp: willpowerExp, achievements, userTitle, userFrame, potions, shield, personaStats, userName, userId, userAvatar, roomId };
      Object.entries(data).forEach(([k, v]) => save(k, v));
    }
  }, [user, isCloudLoading, lang, coins, debt, history, persona, willpowerExp, achievements, userTitle, userFrame, potions, shield, personaStats, userName, userId, userAvatar, roomId]);

  const hpData = useMemo(() => {
    const getHp = (p) => {
      const isTeam = activeMode === 'team5v5' || activeMode === '1v1';
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

  // enemySpent* 現在直接存 HP 百分比 (0-100)，-1 代表無對手
  const enemyHpData = useMemo(() => ({
    survival:   enemySpentDaily   < 0 ? 100 : enemySpentDaily,
    progress:   enemySpentWeekly  < 0 ? 100 : enemySpentWeekly,
    desire:     enemySpentMonthly < 0 ? 100 : enemySpentMonthly,
    expedition: enemySpentMonthly < 0 ? 100 : enemySpentMonthly,
  }), [enemySpentDaily, enemySpentWeekly, enemySpentMonthly]);

  const handleAutoCalculate = () => {
    const total = parseInt(salaryInput) || 0;
    const monthly = Math.floor(total * 0.6);
    const weeklyTotal = Math.floor(total * 0.4 / 4);
    setMonthlyPools({ housing: { limit: Math.floor(monthly * 0.7), label: "住居帳單" }, education: { limit: Math.floor(monthly * 0.3), label: "學習健康" } });
    setWeeklyPools({ food: { limit: Math.floor(weeklyTotal * 0.4), label: "餐飲" }, transport: { limit: Math.floor(weeklyTotal * 0.15), label: "交通" }, social: { limit: Math.floor(weeklyTotal * 0.2), label: "社交娛樂" }, shopping: { limit: Math.floor(weeklyTotal * 0.25), label: "購物娛樂" } });
  };

  const handleSavePersona = (id, stats) => { setPersonaStats(prev => ({ ...prev, [id]: stats })); setPersona(id); setShowCustomModal(false); };

  const getSeveredReason = () => {
    if (persona === 'asian_parent') return t.severed_asian_parent;
    if (persona === 'peer' || persona === 'instructor') return t.severed_standard;
    if (persona === 'partner' || persona === 'bestie') {
      if (coldWarEndTime && now < coldWarEndTime) {
        const rem = coldWarEndTime - now;
        return `${t.severed_partner} ${Math.floor(rem/3600000)}h ${Math.floor((rem%3600000)/60000)}m.`;
      }
      return t.severed_ended;
    }
    return "Budget defense collapsed!";
  };

  const getHellPlaceholder = () => {
    if (isSevered) {
      return t[`placeholder_severed_${persona}`] || t.placeholder_severed_default;
    }
    return t.placeholder_normal;
  };

  const healTransaction = (id) => {
    if (potions <= 0) return;
    setHistory(prev => prev.map(h => h.id === id ? { ...h, damage: 0, desc: `✨ [Healed] ${h.desc}` } : h));
    setPotions(p => p - 1);
    addLog("💊 [Heal] Potion used!");
  };

  const handleSplashComplete = useCallback(() => setIsSplashDone(true), []);

  return (
    <>
      {!isSplashDone && <GlobalSplash onComplete={handleSplashComplete} persona={persona} lang={lang} />}
      <div className={`transition-opacity duration-1000 ${isSplashDone ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        {!isOnline && <div className="fixed top-0 left-0 w-full z-[4000] bg-stone-100/90 backdrop-blur-md py-2 border-b border-stone-200 flex items-center justify-center gap-2 animate-in slide-in-from-top"><WifiOff size={12} className="text-stone-400" /><span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{t.offline_mode}</span></div>}
        <AppContent 
          {...{ isSevered, view, setView, coins, setCoins, debt, setDebt, willpowerExp, persona, personaStats, setPersona,
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
            user, setShowLogin, unlockAchievement, generateMonthlyReview, isOnline, lang, setLang,
            userName, setUserName, userId, userAvatar, setUserAvatar, roomId, setRoomId,
            enemyConnected: enemySpentDaily >= 0 }} 
        />
      </div>
      {showLogin && <div className="fixed inset-0 z-[6000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="relative w-full max-w-md animate-in slide-in-from-bottom-10 duration-300"><button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 z-[6001] p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"><X size={16}/></button><LoginScreen isModal={true} onClose={() => setShowLogin(false)} /></div></div>}
      {achievementNotification && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[7000] w-[90%] max-w-sm bg-stone-900 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-20 border border-amber-500/50"><div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">{achievementNotification.icon}</div><div className="flex-1 text-left"><p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-left">成就達成！</p><h4 className="text-sm font-black tracking-tight text-left">{achievementNotification.name}</h4></div><button onClick={() => { setShowAchievements(true); setAchievementNotification(null); }} className="bg-stone-800 px-3 py-2 rounded-xl text-[9px] font-black">點亮</button></div>}
    </>
  );
};
export default App;
