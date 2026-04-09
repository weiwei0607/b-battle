// Last updated: 2026-04-09 16:10:00
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { db, auth, signInAnonymously } from './firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Shield, Zap, User, MessageCircle, Loader2, Flame, X,
  CloudLightning, Send, AlertCircle,
  HeartOff, Timer, Swords,
  CheckCircle2, LockKeyhole, Settings2,
  BarChart3, ShieldCheck, Edit3, Upload,
  UsersRound, Store, Calculator, Heart
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isCloudLoading, setIsCloudLoading] = useState(true);
  const [view, setView] = useState('battle');
  const [currentTier, setCurrentTier] = useState(() => load('bb_tier', 'free'));
  const [isStudent, setIsStudent] = useState(() => load('bb_isStudent', true));
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [nlpInput, setNlpInput] = useState("");
  const [pendingTx, setPendingTx] = useState(null);
  const [salaryInput, setSalaryInput] = useState("");
  const [budgetWarning, setBudgetWarning] = useState("");
  const [currency, setCurrency] = useState(() => load('bb_currency', 'TWD'));
  const currencies = { TWD: 'NT$', USD: '$', JPY: '¥', CNY: '¥', KRW: '₩', EUR: '€' };
  const currSymbol = currencies[currency] || 'NT$';

  const [coins, setCoins] = useState(() => load('bb_coins', 1500));
  const [willpowerExp, setWillpowerExp] = useState(() => load('bb_exp', 450));
  const [userTitle, setUserTitle] = useState(() => load('bb_title', "戰士 #9527"));
  const [userFrame, setUserFrame] = useState(() => load('bb_frame', "none"));
  const [persona, setPersona] = useState(() => load('bb_persona', 'peer'));
  const [history, setHistory] = useState(() => load('bb_history', []));
  const [lastTrackDate, setLastTrackDate] = useState(() => load('bb_lastTrack', null));
  
  const [weeklyPools, setWeeklyPools] = useState(() => load('bb_weekly_pools', {
    food: { limit: 3000, label: "餐飲" },
    transport: { limit: 1000, label: "交通" },
    social: { limit: 1500, label: "社交娛樂" },
    shopping: { limit: 1500, label: "購物娛樂" },
  }));
  const [monthlyPools, setMonthlyPools] = useState(() => load('bb_monthly_pools', {
    housing: { limit: 8000, label: "住居帳單" },
    education: { limit: 3000, label: "學習健康" },
  }));

  const [personaStats, setPersonaStats] = useState(() => load('bb_persona_stats', {
    peer: { intimacy: 50, level: 1, title: "愛酸同學", icon: "🙄", prompt: "你是一個酸言酸語的同學。" },
    asian_parent: { intimacy: 30, level: 1, title: "亞洲家長", icon: "🧧", prompt: "你是典型的亞洲家長（媽媽）。" },
    bestie: { intimacy: 60, level: 1, title: "好閨蜜", icon: "💅", prompt: "你是超級好閨蜜。" },
    instructor: { intimacy: 10, level: 2, title: "菜鳥教官", icon: "👺", prompt: "你是軍事化的教官。" },
    partner: { intimacy: 80, level: 1, title: "純愛另一半", icon: "🌹", prompt: "你是溫柔但有原則的另一半。" }
  }));

  const [isSevered, setIsSevered] = useState(() => load('bb_severed', false));
  const [aiComment, setAiComment] = useState("意志力系統監控中。");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [undoTx, setUndoTx] = useState(null);
  const undoTimerRef = useRef(null);

  // --- Firebase 同步邏輯 ---
  useEffect(() => {
    signInAnonymously(auth).catch(e => console.error("Firebase Login Failed", e));
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const docSnap = await getDoc(doc(db, "users", u.uid));
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.coins !== undefined) setCoins(d.coins);
          if (d.history !== undefined) setHistory(d.history);
          if (d.personaStats !== undefined) setPersonaStats(prev => ({...prev, ...d.personaStats}));
          if (d.weeklyPools !== undefined) setWeeklyPools(d.weeklyPools);
          if (d.monthlyPools !== undefined) setMonthlyPools(d.monthlyPools);
          if (d.lastTrackDate !== undefined) setLastTrackDate(d.lastTrackDate);
        }
        setIsCloudLoading(false);
      }
    });
    return unsub;
  }, []);

  const syncTimeoutRef = useRef(null);
  useEffect(() => {
    if (!user || isCloudLoading) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setDoc(doc(db, "users", user.uid), {
        coins, history, personaStats, persona, exp: willpowerExp, 
        weeklyPools, monthlyPools, lastTrackDate,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    }, 2000);
  }, [coins, history, personaStats, persona, willpowerExp, weeklyPools, monthlyPools, user, lastTrackDate]);

  // --- 每日清晨戰報邏輯 ---
  useEffect(() => {
    const checkMorningBriefing = async () => {
      const todayStr = new Date().toLocaleDateString();
      if (lastTrackDate && lastTrackDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString();
        const yesterdayHistory = history.filter(h => h.date === yesterdayStr || h.date === lastTrackDate);
        const hadDrinks = yesterdayHistory.some(h => h.desc.includes("杯") || h.desc.includes("手搖") || h.desc.includes("茶"));
        const totalSpent = yesterdayHistory.reduce((sum, h) => sum + h.amount, 0);

        setIsAiProcessing(true);
        try {
          const prompt = `你是${personaStats[persona].title}。今天早上使用者剛打開App。昨天他共支出 $${totalSpent}。狀況：${hadDrinks ? "昨天有喝手搖飲（浪費）" : "昨天完全沒喝手搖飲（極度自律，棒！）"}。請根據你的角色風格給予第一句話的開場白。限20字。`;
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const result = await response.json();
          setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "新的一天開始了，準備好防守了嗎？");
        } catch { setAiComment("早安，意志力戰士。"); }
        setIsAiProcessing(false);
      }
      setLastTrackDate(todayStr);
    };
    if (!isCloudLoading) checkMorningBriefing();
  }, [isCloudLoading]);

  // --- 核心工具函數 ---
  const weeklyMap = { '餐飲': 'food', '交通': 'transport', '社交': 'social', '購物': 'shopping', '服飾': 'shopping' };
  const monthlyMap = { '住宿': 'housing', '房租': 'housing', '水電': 'housing', '學習': 'education' };

  const getSpentAmount = (type, isMonthly = false) => {
    return history.reduce((sum, h) => {
      const path = isMonthly ? monthlyMap[h.category] : weeklyMap[h.category];
      if (path === type) return sum + Number(h.damage || 0);
      return sum;
    }, 0);
  };

  const getHp = (type, isMonthly = false) => {
    const pool = isMonthly ? monthlyPools[type] : weeklyPools[type];
    if (!pool || pool.limit === 0) return 100;
    const spent = getSpentAmount(type, isMonthly);
    return Math.max(0, 100 - (spent / pool.limit * 100));
  };

  const getBondLevel = (intimacy) => intimacy >= 81 ? 4 : (intimacy >= 51 ? 3 : (intimacy >= 21 ? 2 : 1));
  const getPersonaPerk = (pId, intimacy) => {
    const lv = getBondLevel(intimacy);
    if (lv < 3) return null;
    const perks = { asian_parent: "【慈母手中錢】", bestie: "【湊免運】", instructor: "【鐵血護盾】", partner: "【愛的魔法】", peer: "【請喝咖啡】" };
    return perks[pId] || null;
  };

  const getPoolColorClass = (key) => {
    const colors = { food: 'bg-[#D7C9B1]', transport: 'bg-[#A8A297]', housing: 'bg-[#7D746D]', social: 'bg-[#9D8C83]', shopping: 'bg-[#B5A391]', education: 'bg-[#8E9794]' };
    return colors[key] || 'bg-stone-400';
  };

  const getFrameStyle = (frameName) => {
    if (frameName === 'neon') return 'ring-4 ring-[#8E9794] ring-offset-2';
    if (frameName === 'fire') return 'ring-4 ring-[#BC8F8F] ring-offset-2 animate-pulse';
    if (frameName === 'gold') return 'ring-4 ring-[#D7C9B1] ring-offset-2';
    return 'border border-stone-100';
  };

  const handleUndo = () => {
    if (!undoTx) return;
    setHistory(prev => prev.filter(h => h.id !== undoTx.id));
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoTx(null);
    setAiComment("時光倒流成功！");
  };

  const executeTransaction = async (amount, desc, category) => {
    const todayStr = new Date().toLocaleDateString();
    const newEntry = { id: Date.now(), amount, desc, category, time: new Date().toLocaleTimeString(), date: todayStr, damage: Number(amount) };
    setHistory(prev => [newEntry, ...prev]);
    setUndoTx(newEntry);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoTx(null), 5000);

    setPersonaStats(prev => {
      const current = prev[persona];
      const isWater = desc.includes("水");
      const isLuxury = desc.includes("杯") || desc.includes("手搖") || amount >= 500;
      let change = isWater ? 3 : (isLuxury ? -10 : 1);
      return { ...prev, [persona]: { ...current, intimacy: Math.max(0, Math.min(100, current.intimacy + change)) } };
    });

    setIsAiProcessing(true);
    try {
      const stats = personaStats[persona];
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: `我買了 ${desc} 花了 ${amount}。` }] }], 
          systemInstruction: { parts: [{ text: stats.prompt + `\n嚴格教條：水是聖品，手搖飲是奢侈大罪，麥香是浪費。限20字。` }] } 
        })
      });
      const result = await response.json();
      setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "紀錄成功。");
    } catch { setAiComment("紀錄成功。"); }
    setIsAiProcessing(false);
  };

  const processTransaction = async (input) => {
    setIsAiProcessing(true);
    let amount = parseInt(input.match(/\d+/)?.[0] || 0);
    let desc = input.replace(/\d+/g, '').trim() || "消費";
    setPendingTx({ amount, desc, category: "餐飲", source: "manual" });
    setIsAiProcessing(false);
  };

  const handleAutoCalculate = () => {
    const total = parseInt(salaryInput) || 0;
    const monthly = Math.floor(total * 0.6);
    const weeklyTotal = Math.floor(total * 0.4 / 4);
    setMonthlyPools({ housing: { limit: Math.floor(monthly * 0.7), label: "住居帳單" }, education: { limit: Math.floor(monthly * 0.3), label: "學習健康" } });
    setWeeklyPools({ food: { limit: Math.floor(weeklyTotal * 0.4), label: "餐飲" }, transport: { limit: Math.floor(weeklyTotal * 0.15), label: "交通" }, social: { limit: Math.floor(weeklyTotal * 0.2), label: "社交娛樂" }, shopping: { limit: Math.floor(weeklyTotal * 0.25), label: "購物娛樂" } });
  };

  const renderBattleArena = () => {
    const stats = personaStats[persona];
    const safeWeekly = weeklyPools || {};
    const safeMonthly = monthlyPools || {};

    return (
      <div className="space-y-8 pb-48 px-1 animate-in fade-in duration-500">
        <div className="mx-1 p-6 rounded-[2rem] bg-white border border-stone-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl bg-[#FAF7F2] flex items-center justify-center text-4xl shadow-inner`}>{stats.icon}</div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 border border-stone-100 flex items-center gap-0.5 shadow-sm">
                <Heart size={10} className="text-[#BC8F8F] fill-[#BC8F8F]" /><span className="text-[10px] font-bold text-stone-600">{stats.intimacy}</span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">{stats.title}</p>
              <p className="text-2xl font-bold text-stone-800">Lv.{getBondLevel(stats.intimacy)}</p>
              <div className="w-24 h-1 bg-stone-100 rounded-full mt-3 overflow-hidden"><div className="h-full bg-[#BC8F8F]" style={{width:`${stats.intimacy}%`}}></div></div>
            </div>
          </div>
          {getPersonaPerk(persona, stats.intimacy) && <div className="bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#D7C9B1]/30 text-[8px] font-bold text-[#D7C9B1] animate-pulse">{getPersonaPerk(persona, stats.intimacy)}</div>}
        </div>

        {/* --- 預算防線區域 --- */}
        <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm space-y-10">
          {/* 每週 */}
          <div>
            <h3 className="text-sm font-bold text-stone-800 mb-6 flex items-center gap-2"><Zap size={16} className="text-[#A8A297]" /> 本週預算防線</h3>
            <div className="space-y-6">
              {['food', 'transport', 'social', 'shopping'].map(key => {
                const pool = safeWeekly[key] || { label: "項目", limit: 0 };
                const spent = getSpentAmount(key) || 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-stone-600">{pool.label}</span>
                      <span className="text-[11px] font-mono text-stone-400">{currSymbol}{spent.toLocaleString()} / {pool.limit.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-50 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${spent > pool.limit && pool.limit > 0 ? 'bg-[#BC8F8F]' : getPoolColorClass(key)}`} style={{ width: `${pool.limit > 0 ? Math.min(100, (spent / pool.limit * 100)) : 0}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-stone-50 h-[1px]" />

          {/* 每月 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2"><Shield size={16} className="text-[#D7C9B1]" /> 每月預算防線</h3>
              <button onClick={() => setShowBudgetSetup(true)} className="text-[10px] font-bold text-[#D7C9B1] underline">調整部署</button>
            </div>
            <div className="space-y-6">
              {['housing', 'education'].map(key => {
                const pool = safeMonthly[key] || { label: key === 'housing' ? "住居帳單" : "學習健康", limit: 0 };
                const spent = getSpentAmount(key, true) || 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-stone-600">{pool.label}</span>
                      <span className="text-[11px] font-mono text-stone-400">{currSymbol}{spent.toLocaleString()} / {pool.limit.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-50 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${spent > pool.limit && pool.limit > 0 ? 'bg-[#BC8F8F]' : getPoolColorClass(key)}`} style={{ width: `${pool.limit > 0 ? Math.min(100, (spent / pool.limit * 100)) : 0}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-[2rem] p-6 shadow-sm relative min-h-[100px] flex items-center group">
          <div className="absolute -top-3 left-6 bg-stone-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-md"><MessageCircle size={10} /> {stats.title}</div>
          {isAiProcessing ? <Loader2 className="animate-spin text-stone-300 mx-auto" size={24} /> : <p className="text-[13px] text-stone-600 leading-relaxed font-medium">「{aiComment}」</p>}
        </div>

        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[100]">
          <div className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl p-2 shadow-xl flex items-center gap-2">
            <input value={nlpInput} onChange={(e)=>setNlpInput(e.target.value)} placeholder="記下一筆..." className="bg-stone-50/50 flex-1 text-sm px-5 py-3.5 rounded-xl text-stone-800 outline-none focus:bg-white transition-all shadow-inner" onKeyPress={(e) => e.key === 'Enter' && processTransaction(nlpInput)} />
            <button onClick={() => processTransaction(nlpInput)} className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"><Send size={18} /></button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${isSevered ? 'bg-[#FAF7F2]' : 'bg-[#F7F4EF]'} text-stone-800 font-sans`}>
      <div className="max-w-md mx-auto p-6 h-screen flex flex-col relative overflow-hidden">
        <header className="flex justify-between items-center z-10 py-6 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('battle')}>
            <div className="w-10 h-10 bg-stone-800 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 shadow-lg"><Flame size={20} className="text-[#D7C9B1]" /></div>
            <div className="flex flex-col"><span className="font-bold text-base text-stone-800 leading-none">B-BATTLE</span><span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">Willpower</span></div>
          </div>
          <div className="flex gap-2 items-center">
            {currentTier === 'pro' && (
              <div className="bg-[#D7C9B1]/10 px-3 py-1.5 rounded-xl border border-[#D7C9B1]/30 flex items-center gap-1.5">
                <ShieldCheck size={10} className="text-[#D7C9B1]" />
                <span className="text-[8px] font-black text-[#D7C9B1] uppercase tracking-widest">PRO</span>
              </div>
            )}
            <button onClick={() => setShowShop(true)} className="bg-white/50 backdrop-blur-sm border border-stone-200/50 px-4 py-2 rounded-2xl shadow-sm"><Store size={14} className="text-stone-500" /></button>
            <div className="bg-stone-800 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-white text-xs font-bold"><Zap size={14} className="text-[#D7C9B1]" />{coins}</div>
          </div>
        </header>

        <main className="flex-1 mt-2 z-10 overflow-y-auto no-scrollbar px-1">
          {view === 'battle' && renderBattleArena()}
          {view === 'history' && (
            <div className="space-y-8 pb-32 animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-bold text-stone-800 px-2 tracking-tight">Damage Report</h2>
              <div className="bg-white border border-stone-100 rounded-[2.5rem] p-8 shadow-sm flex gap-4 items-end h-48">
                {Object.entries({...weeklyPools, ...monthlyPools}).map(([k, p]) => (
                  <div key={k} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                    <div className={`w-full rounded-t-2xl transition-all duration-1000 ${getPoolColorClass(k)}`} style={{height: `${p?.limit > 0 ? Math.min(100, (getSpentAmount(k, k==='housing'||k==='education') / p.limit * 100)) : 0}%`}}></div>
                    <span className="text-[8px] font-bold text-stone-400 uppercase">{p?.label?.slice(0,2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4 mt-8">
                {history.map(h => (
                  <div key={h.id} className="bg-white border border-stone-100 p-5 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-xs font-bold text-stone-400">{h.category.slice(0,1)}</div>
                      <div><p className="text-stone-800 font-bold text-sm tracking-tight">{h.desc}</p><p className="text-[10px] text-stone-400 font-medium">{h.time}</p></div>
                    </div>
                    <div className="text-right text-[#BC8F8F] font-bold text-sm">-{h.damage} HP</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {view === 'heroHall' && (
            <div className="space-y-8 p-4 text-center pb-32 animate-in slide-in-from-left duration-500">
              <div className="relative inline-block mt-8">
                <div className={`w-28 h-28 bg-[#FAF7F2] rounded-[2.5rem] flex items-center justify-center text-5xl rotate-3 mx-auto shadow-sm overflow-hidden ${getFrameStyle(userFrame)}`}>{personaStats[persona].icon}</div>
                <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-md">Lv.{getBondLevel(personaStats[persona].intimacy)}</div>
              </div>
              <h2 className="text-3xl font-bold text-stone-800 tracking-tight">{userTitle}</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
                {Object.entries(personaStats).map(([pId, stats]) => (
                  <button key={pId} onClick={() => setPersona(pId)} className={`min-w-[110px] p-6 rounded-[2.5rem] border transition-all flex flex-col items-center gap-3 relative ${persona === pId ? 'border-[#D7C9B1] bg-[#FAF7F2] shadow-md scale-105' : 'border-stone-100 bg-white opacity-60 hover:opacity-100'}`}>
                    <span className="text-4xl">{stats.icon}</span>
                    <div className="text-[10px] font-bold tracking-wider">{stats.title}</div>
                    <div className="flex items-center gap-1 text-[#BC8F8F]"><Heart size={10} fill="#BC8F8F" /><span className="text-[10px] font-bold">{stats.intimacy}</span></div>
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowBudgetSetup(true)} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-xs tracking-[0.2em]"><Settings2 size={18} /> 戰略預算部署</button>
            </div>
          )}
        </main>

        {undoTx && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[280px] z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-stone-800 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
              <span className="text-xs font-bold tracking-tight">已損耗 {currSymbol}{undoTx.damage} HP</span>
              <button onClick={handleUndo} className="bg-[#D7C9B1] text-stone-900 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase active:scale-90">撤銷</button>
            </div>
          </div>
        )}

        {showBudgetSetup && (
          <div className="fixed inset-0 z-[600] bg-stone-900/10 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowBudgetSetup(false)}>
            <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center mb-8">
                <Calculator size={32} className="text-[#D7C9B1] mb-2" />
                <h3 className="text-xl font-bold text-stone-800 tracking-tight">預算戰略部署</h3>
              </div>
              <div className="bg-stone-50 border border-stone-100 p-6 rounded-3xl mb-8">
                <label className="text-[10px] font-bold text-stone-400 uppercase mb-3 block px-1 tracking-widest">AI 智能防線試算</label>
                <div className="flex gap-2">
                  <input type="number" value={salaryInput} onChange={e => setSalaryInput(e.target.value)} placeholder="支配總額" className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-stone-800 font-bold text-sm outline-none focus:border-[#D7C9B1] transition-all" />
                  <button onClick={handleAutoCalculate} className="bg-stone-800 text-white px-5 py-3 rounded-xl font-bold text-xs whitespace-nowrap active:scale-95 shadow-md">試算</button>
                </div>
              </div>
              <div className="space-y-8">
                <div><p className="text-[10px] font-bold text-stone-400 uppercase mb-4 px-1 tracking-widest">每週戰鬥預算</p>
                  {Object.entries(weeklyPools).map(([k, p]) => (
                    <div key={k} className="mb-4 space-y-1"><label className="text-[10px] font-bold text-stone-500 px-2 uppercase">{p.label}</label><input type="number" value={p.limit} onChange={e => setWeeklyPools(prev=>({...prev, [k]:{...p, limit:parseInt(e.target.value)||0}}))} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-mono font-bold text-sm outline-none focus:bg-white focus:border-[#D7C9B1] transition-all" /></div>
                  ))}
                </div>
                <div><p className="text-[10px] font-bold text-stone-400 uppercase mb-4 px-1 tracking-widest">每月固定支出</p>
                  {Object.entries(monthlyPools).map(([k, p]) => (
                    <div key={k} className="mb-4 space-y-1"><label className="text-[10px] font-bold text-stone-500 px-2 uppercase">{p.label}</label><input type="number" value={p.limit} onChange={e => setMonthlyPools(prev=>({...prev, [k]:{...p, limit:parseInt(e.target.value)||0}}))} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-mono font-bold text-sm outline-none focus:bg-white focus:border-[#8E9794] transition-all" /></div>
                  ))}
                </div>
                <button onClick={()=>setShowBudgetSetup(false)} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-stone-200 active:scale-95 transition-all">確認部署</button>
              </div>
            </div>
          </div>
        )}

        {pendingTx && (
          <div className="fixed inset-0 z-[500] bg-stone-50/90 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setPendingTx(null)}>
            <div className="bg-white border-2 border-[#D7C9B1] rounded-[3rem] p-8 w-full max-w-sm shadow-xl animate-in zoom-in-95" onClick={e=>e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-stone-800 italic text-center mb-6 tracking-tight">情報解析完成</h3>
              <div className="space-y-4">
                <input value={pendingTx.desc} onChange={e => setPendingTx({...pendingTx, desc: e.target.value})} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-bold text-sm" />
                <input type="number" value={pendingTx.amount} onChange={e => setPendingTx({...pendingTx, amount: parseInt(e.target.value)||0})} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-bold text-sm" />
                <button onClick={() => { executeTransaction(pendingTx.amount, pendingTx.desc, pendingTx.category); setPendingTx(null); }} className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold uppercase text-xs shadow-xl active:scale-95">確認送出攻擊</button>
              </div>
            </div>
          </div>
        )}

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[88%] max-w-sm bg-white/90 backdrop-blur-md border border-stone-200/60 rounded-[2.5rem] p-2 flex justify-around shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-[100]">
          {[{id:'battle', icon:Zap, label:'戰場'},{id:'history', icon:BarChart3, label:'分析'},{id:'heroHall', icon:User, label:'殿堂'}].map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`flex-1 py-3 rounded-2xl transition-all flex flex-col items-center gap-1 ${view === item.id ? 'bg-stone-800 text-white shadow-lg shadow-stone-200' : 'text-stone-400 hover:text-stone-600'}`}>
              <item.icon size={18} /><span className="text-[9px] font-bold tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        {showShop && (
          <div className="fixed inset-0 z-[700] bg-stone-900/40 backdrop-blur-md flex items-end justify-center" onClick={() => setShowShop(false)}>
            <div className="bg-[#F7F4EF] w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                <div><h3 className="text-2xl font-black text-stone-800 tracking-tight text-left">道具屋</h3><p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-left">Willpower Equipment</p></div>
                <div className="bg-stone-800 px-4 py-2 rounded-2xl text-white text-xs font-bold flex items-center gap-2 shadow-lg"><Zap size={14} className="text-[#D7C9B1]" />{coins}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'neon', name: '青色電鍍', price: 500, icon: '💎' },
                  { id: 'fire', name: '紅蓮業火', price: 1200, icon: '🔥' },
                  { id: 'gold', name: '黃金裝甲', price: 3000, icon: '🏆' }
                ].map(item => (
                  <button key={item.id} onClick={() => { if(coins >= item.price) { setCoins(c => c - item.price); setUserFrame(item.id); setShowShop(false); } }} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all group">
                    <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div className="text-center"><p className="text-xs font-bold text-stone-800">{item.name}</p><p className="text-[10px] font-black text-[#BC8F8F] mt-1">{item.price} COINS</p></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
