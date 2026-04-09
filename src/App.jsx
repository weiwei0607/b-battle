import React, { useState, useEffect } from 'react';
import { db, auth, signInAnonymously } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { Receipt, Send } from 'lucide-react';
import { CURRENCIES, getBondLevel, getFrameStyle, CATEGORY_MAP, getHomeStatus } from './utils/constants';
import { useBattleCore } from './hooks/useBattleCore';

import BudgetSetupModal from './modals/BudgetSetupModal';
import ShopModal from './modals/ShopModal';
import PendingTxModal from './modals/PendingTxModal';
import CustomPersonaModal from './modals/CustomPersonaModal';
import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import BattleArenaView from './components/BattleArena/BattleArenaView';
import HistoryView from './components/History/HistoryView';
import HeroHallView from './components/HeroHall/HeroHallView';

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
  const [nlpInput, setNlpInput] = useState("");
  const [now, setNow] = useState(new Date().getTime());
  
  // States previously missing or emptied
  const [currentTier, setCurrentTier] = useState(() => load('bb_tier', 'free'));
  const [isStudent, setIsStudent] = useState(() => load('bb_isStudent', true));
  const [salaryInput, setSalaryInput] = useState("");
  const [currency, setCurrency] = useState(() => load('bb_currency', 'TWD'));
  const [userFrame, setUserFrame] = useState(() => load('bb_frame', "none"));
  const [lastPersonaSwitch, setLastPersonaSwitch] = useState(() => load('bb_last_switch', null));
  const [showCustomModal, setShowCustomModal] = useState(false);
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
    activeMode, { setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly }, 
    { teamSpentDaily, teamSpentWeekly, teamSpentMonthly },
    activeChallenges, setActiveChallenges, claimedAvoidedItems, setClaimedAvoidedItems,
    addLog, setAiComment, wishlist, apiKey, setIsSevered, isSevered,
    setColdWarEndTime, coldWarEndTime, lastTrackDate, setLastTrackDate, setPendingTx, setIsAiProcessing,
    setNlpInput, now, homeMaterials, setHomeMaterials
  );

  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, async (u) => { if (u) { setUser(u); const s = await getDoc(doc(db, "users", u.uid)); if (s.exists()) { const d = s.data(); if(d.coins!==undefined)setCoins(d.coins); if(d.debt!==undefined)setDebt(d.debt); if(d.homeMaterials!==undefined)setHomeMaterials(d.homeMaterials); if(d.currentTier!==undefined)setCurrentTier(d.currentTier); } setIsCloudLoading(false); } });
  }, []);

  useEffect(() => { const t = setInterval(() => setNow(new Date().getTime()), 1000); return () => clearInterval(t); }, []);

  const hpData = {
    survival: Math.max(0, 100 - (history.filter(h=>CATEGORY_MAP[h.category]==='survival').reduce((s,h)=>s+h.damage,0) / 10000 * 100)),
    progress: Math.max(0, 100 - (history.filter(h=>CATEGORY_MAP[h.category]==='progress').reduce((s,h)=>s+h.damage,0) / 5000 * 100)),
    desire: Math.max(0, 100 - (history.filter(h=>CATEGORY_MAP[h.category]==='desire').reduce((s,h)=>s+h.damage,0) / 3000 * 100)),
    expedition: Math.max(0, 100 - (history.filter(h=>CATEGORY_MAP[h.category]==='expedition').reduce((s,h)=>s+h.damage,0) / 15000 * 100))
  };

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
      return "冷戰結束，執行儀式來求我原諒吧。";
    }
    return "預算防線崩潰！";
  };

  const getHellPlaceholder = () => {
    if (!isSevered) return "記帳或『我想買...』發起豪賭";
    const map = { asian_parent: "又是買這些垃圾？", partner: "哼，誰管你有沒有錢...", bestie: "反正我們已經完了...", instructor: "報上你的遺言，戰犯。", peer: "破產了還買？笑死。" };
    return map[persona] || "在恥辱中記錄你的罪行...";
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${isSevered ? 'bg-[#450a0a]' : 'bg-[#F7F4EF]'} text-stone-800 font-sans text-left`}>
      <div className="max-w-md mx-auto p-6 h-screen flex flex-col relative overflow-hidden">
        {!isSevered && <Header currentTier={currentTier} coins={coins} debt={debt} willpowerExp={willpowerExp} setView={setView} onShopClick={() => setShowShop(true)} />}
        <main className="flex-1 mt-2 z-10 overflow-y-auto no-scrollbar px-1">
          {isSevered ? (
            <div className="flex flex-col h-full justify-center text-center text-white animate-in zoom-in-95">
              <h2 className="text-4xl font-black text-red-500 mb-4 uppercase italic">關係斷絕中</h2>
              <p className="text-sm text-red-200 mb-8 px-8 opacity-80 leading-relaxed text-center font-medium">{getSeveredReason()}</p>
              {persona === 'asian_parent' && (
                <div className="relative w-full max-w-[280px] mx-auto mb-6 text-left">
                  <textarea value={reflectionText} onChange={e=>setReflectionText(e.target.value)} placeholder="輸入 50 字反省..." className="bg-white/10 border border-white/20 p-4 rounded-xl text-white w-full h-32 outline-none focus:border-red-500 text-sm" />
                  <span className={`absolute bottom-2 right-2 text-[10px] ${reflectionText.length >= 50 ? 'text-green-400' : 'text-white/40'}`}>{reflectionText.length}/50</span>
                </div>
              )}
              <button onClick={() => executeRitual(reflectionText)} disabled={(persona === 'asian_parent' && reflectionText.length < 50) || ((persona === 'partner' || persona === 'bestie') && coldWarEndTime && now < coldWarEndTime)} className="w-full max-w-[280px] mx-auto py-5 bg-red-600 text-white rounded-[2rem] font-black tracking-widest active:scale-95 disabled:opacity-30 transition-all shadow-2xl">執行重建儀式</button>
            </div>
          ) : (
            <>
              {view === 'battle' && <BattleArenaView stats={personaStats[persona]} hpData={{ daily: hpData.survival, weekly: hpData.desire, monthly: hpData.expedition }} isAiProcessing={isAiProcessing} aiComment={aiComment} activeMode={activeMode} setActiveMode={setActiveMode} battleLog={battleLog} scapegoatAlert="" activeChallenges={activeChallenges} handleClaimChallenge={handleClaimChallenge} handleGiveUpChallenge={handleGiveUpChallenge} />}
              {view === 'history' && <HistoryView history={history} aiComment={aiComment} />}
              {view === 'heroHall' && <HeroHallView userTitle={debt > 0 ? "負債超人" : "省錢戰士"} persona={persona} personaStats={personaStats} setPersona={setPersona} getBondLevel={getBondLevel} getFrameStyle={getFrameStyle} setShowBudgetSetup={()=>setShowBudgetSetup(true)} currentTier={currentTier} lastPersonaSwitch={lastPersonaSwitch} setLastPersonaSwitch={setLastPersonaSwitch} setShowCustomModal={()=>setShowCustomModal(true)} wishlist={wishlist} setWishlist={setWishlist} debt={debt} userFrame={userFrame} homeMaterials={homeMaterials} />}
            </>
          )}
        </main>

        {!isSevered && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[150]">
            <div className={`bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl p-2 shadow-xl flex items-center gap-2 ${isSevered ? 'opacity-100 scale-105 border-red-500 shadow-red-900/20' : ''}`}>
              <button onClick={simulateInvoice} className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"><Receipt size={16} /></button>
              <input value={nlpInput} onChange={(e)=>setNlpInput(e.target.value)} placeholder={getHellPlaceholder()} className={`bg-stone-50/50 flex-1 text-xs px-4 py-3.5 rounded-xl outline-none focus:bg-white transition-all shadow-inner ${isSevered ? 'text-red-600 placeholder:text-red-300 font-bold' : 'text-stone-800'}`} onKeyPress={(e) => e.key === 'Enter' && processTransaction(nlpInput)} />
              <button onClick={() => processTransaction(nlpInput)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all shrink-0 ${isSevered ? 'bg-red-600' : 'bg-stone-800'}`}><Send size={16} /></button>
            </div>
          </div>
        )}
        {!isSevered && <BottomNav view={view} setView={setView} />}

        <PendingTxModal pendingTx={pendingTx} setPendingTx={setPendingTx} executeTransaction={executeTransaction} />
        <BudgetSetupModal show={showBudgetSetup} onClose={() => setShowBudgetSetup(false)} salaryInput={salaryInput} setSalaryInput={setSalaryInput} handleAutoCalculate={handleAutoCalculate} weeklyPools={weeklyPools} setWeeklyPools={setWeeklyPools} monthlyPools={monthlyPools} setMonthlyPools={setMonthlyPools} isStudent={isStudent} setIsStudent={setIsStudent} currency={currency} setCurrency={setCurrency} CURRENCIES={CURRENCIES} currentTier={currentTier} setCurrentTier={setCurrentTier} />
        <ShopModal show={showShop} onClose={() => setShowShop(false)} coins={coins} setCoins={setCoins} setUserFrame={setUserFrame} />
        <CustomPersonaModal show={showCustomModal} onClose={() => setShowCustomModal(false)} onSave={handleSavePersona} />
      </div>
    </div>
  );
};
export default App;
