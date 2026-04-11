import { useCallback, useEffect } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../firebase';
import { CATEGORY_MAP, ACHIEVEMENTS } from '../utils/constants';

export const useBattleCore = (
  user, isCloudLoading,
  coins, setCoins, 
  debt, setDebt, 
  history, setHistory, 
  persona, personaStats, setPersonaStats, 
  willpowerExp, setWillpowerExp,
  activeMode, setTeamSpentStates,
  teamSpentStates,
  activeChallenges, setActiveChallenges,
  claimedAvoidedItems, setClaimedAvoidedItems,
  addLog, setAiComment, wishlist, apiKey,
  setIsSevered, isSevered,
  setColdWarEndTime, coldWarEndTime,
  lastTrackDate, setLastTrackDate,
  setPendingTx, setIsAiProcessing, isAiProcessing,
  setNlpInput, now,
  homeMaterials, setHomeMaterials,
  weeklyPools, monthlyPools,
  currentTier,
  shield, setShield,
  userTitle, setUserTitle,
  unlockedTitles, setUnlockedTitles,
  potions, setPotions,
  achievements, setAchievements,
  setAchievementNotification,
  lang
) => {

  const unlockAchievement = useCallback((id) => {
    if (achievements[id]?.unlocked) return;
    const medal = ACHIEVEMENTS[id];
    if (!medal) return;
    setAchievements(prev => ({ ...prev, [id]: { unlocked: true, claimed: false, date: new Date().toLocaleDateString() } }));
    setAchievementNotification({ id, name: medal.name, icon: medal.icon });
    addLog(`🏆 [NEW] ${medal.name}!`);
  }, [achievements, setAchievements, addLog, setAchievementNotification]);

  const handleClaimAchievement = useCallback((id) => {
    const medal = ACHIEVEMENTS[id];
    if (!medal || achievements[id]?.claimed) return;
    setAchievements(prev => ({ ...prev, [id]: { ...prev[id], claimed: true } }));
    const gain = medal.reward || 100;
    if (debt > 0) {
      if (gain >= debt) { setCoins(c => c + (gain - debt)); setDebt(0); }
      else { setDebt(d => d - gain); }
    } else { setCoins(c => c + gain); }
    addLog(`✨ [領取] 獲得 ${gain} 金幣！`);
  }, [achievements, setAchievements, debt, setCoins, setDebt, addLog]);

  const executeTransaction = async (amount, desc, category, source = "manual") => {
    if (isAiProcessing) return;
    
    // --- 還原完整成就檢查邏輯 ---
    unlockAchievement('FIRST_BLOOD');
    if (amount >= 3000) unlockAchievement('BIG_SPENDER');
    const totalCount = history.length + 1;
    if (totalCount >= 100) unlockAchievement('LOGS_100');
    if (totalCount >= 1000) unlockAchievement('LOGS_1000');
    if (totalCount >= 10000) unlockAchievement('LOGS_10000');
    if (totalCount >= 100000) unlockAchievement('LOGS_100000');
    if (totalCount >= 1000000) unlockAchievement('LOGS_1000000');
    
    const h = new Date().getHours();
    if (h >= 0 && h < 4) {
      unlockAchievement('NIGHT_OWL');
      if (category === '餐飲' || category === '飲料') unlockAchievement('MIDNIGHT_SNACK');
    }
    if (h >= 5 && h < 7) unlockAchievement('EARLY_BIRD');
    
    if (desc.includes("咖啡")) {
      const cCount = history.filter(x => x.desc.includes("咖啡")).length + 1;
      if (cCount >= 10) unlockAchievement('CAFFEINE_ADDICT');
    }
    if (desc.match(/7-11|全家|超商|萊爾富/)) {
      const sCount = history.filter(x => x.desc.match(/7-11|全家|超商|萊爾富/)).length + 1;
      if (sCount >= 5) unlockAchievement('CONVENIENCE_STORE_FRIEND');
    }
    if (category === '學習') {
      const bCount = history.filter(x => x.category === '學習').length + 1;
      if (bCount >= 3) unlockAchievement('BOOK_WORM');
    }

    let penaltyHp = 0;
    const pillar = CATEGORY_MAP[category] || 'expedition';
    if (isSevered) penaltyHp += amount * 0.5;

    let totalDamage = amount + penaltyHp;
    if (shield > 0) {
      totalDamage *= 0.8; 
      setShield(s => Math.max(0, s - 0.1));
      unlockAchievement('SHIELD_USER'); 
    }

    const newEntry = { id: Date.now(), amount, desc, category, pillar, damage: totalDamage, isCrit: penaltyHp > 0, source, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() };
    setHistory(prev => [newEntry, ...prev]);
    setWillpowerExp(e => e + 15);

    if (apiKey) {
      setIsAiProcessing(true);
      try {
        const culturalContext = {
          zh: "你是台灣人，用道地繁體中文吐槽，充滿酸民文化或人情味，多用台灣用語。",
          en: "You are a witty New Yorker, use sharp English slang and local idioms.",
          ja: "あなたは江戸っ子、あるいは厳格な日本人です。日本の節約文化に基づいた言い回しを使ってください。"
        };
        const prompt = `你是：${personaStats[persona].prompt}。文化背景：${culturalContext[lang] || culturalContext.zh}。剛剛買了「${desc}」花費 ${amount}元。規則：20字內，展現文化深度。`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Bought ${desc} for ${amount}` }] }], systemInstruction: { parts: [{ text: prompt }] } })
        });
        const data = await res.json();
        setAiComment(data.candidates?.[0]?.content?.parts?.[0]?.text || "...");
      } catch { setAiComment("Done."); }
      setIsAiProcessing(false);
    }
  };

  // 🤖 鏡像機器人系統：學習並模擬用戶行為
  useEffect(() => {
    if (activeMode === 'team5v5') {
      const timer = setInterval(() => {
        // 分析用戶消費模式
        const userCats = history.length > 0 ? history.map(h => h.category) : ['餐飲'];
        const favCat = userCats[Math.floor(Math.random() * userCats.length)];
        const avgAmt = history.length > 0 ? history.reduce((s, h) => s + h.amount, 0) / history.length : 100;
        
        const isTeammate = Math.random() > 0.5;
        const botName = isTeammate ? "影之隊友" : "影之宿敵";
        const dmg = avgAmt * (0.8 + Math.random() * 0.4);
        
        const { setTeamSpentDaily, setTeamSpentMonthly, setEnemySpentDaily, setEnemySpentMonthly } = setTeamSpentStates;
        
        if (isTeammate) {
          if (favCat === '餐飲') setTeamSpentDaily(p => p + dmg); else setTeamSpentMonthly(p => p + dmg);
          addLog(`👥 [鏡像] 『${botName}』模仿你的習慣買了「${favCat}」，全隊防線震盪！`);
        } else {
          if (favCat === '餐飲') setEnemySpentDaily(p => p + dmg); else setEnemySpentMonthly(p => p + dmg);
          addLog(`⚔️ [對抗] 『${botName}』也買了「${favCat}」，對方支柱受損！`);
        }
      }, 40000);
      return () => clearInterval(timer);
    }
  }, [activeMode, history, setTeamSpentStates, addLog]);

  useEffect(() => {
    if (coins >= 10000) unlockAchievement('WEALTHY_WARRIOR');
    if (personaStats[persona]?.intimacy >= 100) unlockAchievement('LOYAL_PARTNER');
    if (Object.values(achievements).filter(a => a.unlocked).length >= 5) unlockAchievement('COLLECTOR');
    if (coins === 0 && debt === 0) unlockAchievement('ZERO_HERO');
  }, [coins, debt, personaStats, persona, achievements, unlockAchievement]);

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    if (lastTrackDate && lastTrackDate !== todayStr) {
      const last = new Date(lastTrackDate);
      const lastDaySpent = history.filter(h => h.date === last.toLocaleDateString() && h.pillar === 'survival').reduce((s, h) => s + h.amount, 0);
      if (lastDaySpent > 0 && lastDaySpent < 200) unlockAchievement('SAVING_EXPERT');
    }
    setLastTrackDate(todayStr);
  }, [lastTrackDate, history, unlockAchievement, setLastTrackDate]);

  useEffect(() => {
    if (!user || isCloudLoading) return;
    const timeout = setTimeout(() => {
      setDoc(doc(db, "users", user.uid), { 
        coins, debt, history, personaStats, persona, exp: willpowerExp, wishlist, lastTrackDate, homeMaterials, currentTier, potions, shield, userTitle, unlockedTitles, achievements, lang 
      }, { merge: true });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user, isCloudLoading, coins, debt, history, personaStats, persona, willpowerExp, wishlist, lastTrackDate, homeMaterials, currentTier, potions, shield, userTitle, unlockedTitles, achievements, lang]);

  return { executeTransaction, processTransaction, deleteTransaction, updateTransaction, generateMonthlyReview, spendCoins, executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, handleClaimAchievement, unlockAchievement };
};
