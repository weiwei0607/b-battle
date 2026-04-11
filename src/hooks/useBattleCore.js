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

  const cooldownThreshold = 2000;

  const unlockAchievement = useCallback((id) => {
    if (achievements[id]?.unlocked) return;
    const medal = ACHIEVEMENTS[id];
    if (!medal) return;
    setAchievements(prev => ({ ...prev, [id]: { unlocked: true, claimed: false, date: new Date().toLocaleDateString() } }));
    setAchievementNotification({ id, name: medal.name, icon: medal.icon });
    addLog(`🏆 [成就達成] ${medal.name}！`);
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
    addLog(`✨ [點亮] 獲得 ${gain} 金幣！`);
  }, [achievements, setAchievements, debt, setCoins, setDebt, addLog]);

  const executeTransaction = async (amount, desc, category, source = "manual") => {
    if (isAiProcessing) return;
    
    // --- 成就觸發邏輯 ---
    unlockAchievement('FIRST_BLOOD');
    if (amount >= 3000) unlockAchievement('BIG_SPENDER');
    if (history.length + 1 >= 10) unlockAchievement('TEN_LOGS');
    if (history.length + 1 >= 50) unlockAchievement('FIFTY_LOGS');
    if (history.length + 1 >= 100) unlockAchievement('HUNDRED_LOGS');
    
    const h = new Date().getHours();
    if (h >= 0 && h < 4) unlockAchievement('NIGHT_OWL');
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
    if (isSevered) { penaltyHp += amount * 0.5; }

    let totalDamage = amount + penaltyHp;
    if (shield > 0) {
      totalDamage *= 0.8; setShield(s => Math.max(0, s - 0.1));
      const sUses = (localStorage.getItem('bb_shield_uses') || 0) + 1;
      localStorage.setItem('bb_shield_uses', sUses);
      if (sUses >= 5) unlockAchievement('SHIELD_USER');
    }

    const newEntry = { id: Date.now(), amount, desc, category, pillar, damage: totalDamage, isCrit: penaltyHp > 0, source, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() };
    setHistory(prev => [newEntry, ...prev]);
    
    setWillpowerExp(e => {
      const next = e + 15;
      if (next >= 500) unlockAchievement('LEVEL_UP_1');
      if (next >= 1500) unlockAchievement('LEVEL_UP_2');
      if (next >= 3000) unlockAchievement('WILLPOWER_GOD');
      return next;
    });

    if (apiKey) {
      setIsAiProcessing(true);
      try {
        const prompt = `你是：${personaStats[persona].prompt}。目前語系：${lang === 'ja' ? '日文' : lang === 'en' ? '英文' : '繁體中文'}。消費：${amount}元買了「${desc}」。規則：限20字內，用對應語言吐槽。`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `我買了 ${desc} 花 ${amount}` }] }], systemInstruction: { parts: [{ text: prompt }] } })
        });
        const data = await res.json();
        setAiComment(data.candidates?.[0]?.content?.parts?.[0]?.text || "...");
      } catch { setAiComment("Done."); }
      setIsAiProcessing(false);
    }
  };

  useEffect(() => {
    if (coins >= 10000) unlockAchievement('WEALTHY_WARRIOR');
    if (personaStats[persona]?.intimacy >= 100) unlockAchievement('LOYAL_PARTNER');
    if (personaStats['asian_parent']?.intimacy >= 80) unlockAchievement('MOM_LOVES_ME');
    if (Object.values(achievements).filter(a => a.unlocked).length >= 5) unlockAchievement('COLLECTOR');
  }, [coins, personaStats, persona, achievements, unlockAchievement]);

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
