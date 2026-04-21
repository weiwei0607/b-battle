/**
 * useBattleLogic  (精簡後的 useBattleCore)
 * 職責：純遊戲邏輯控制器。不碰 Firestore，不呼叫 Gemini API。
 *
 * 協作關係：
 *   useFinanceStore  → 金幣 / 歷史紀錄 / 裝備
 *   useUserStore     → persona / 成就 / exp
 *   useBattleStore   → modal / streak / log / AI 狀態
 *   useFirebaseSync  → 同步到 Firestore
 *   useAIComment     → 呼叫 Gemini
 *
 * 回傳 API 與原 useBattleCore 相同，確保現有呼叫端不需要改動。
 */
import { useCallback, useEffect, useRef } from 'react';
import { CATEGORY_MAP, ACHIEVEMENTS } from '../utils/constants';
import { LOCALES } from '../utils/locales';
import { useUserStore } from '../stores/useUserStore';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useBattleStore } from '../stores/useBattleStore';
import { useFirebaseSync } from './useFirebaseSync';
import { useAIComment } from './useAIComment';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || window.VITE_GEMINI_API_KEY || '';

export const useBattleLogic = () => {
  // ── Stores ────────────────────────────────────────────────────────────────
  const {
    user, persona, personaStats, setPersonaStats,
    achievements, setAchievements, wishlist,
    unlockedTitles, setUnlockedTitles, userTitle, setUserTitle,
    lang,
  } = useUserStore();

  const {
    coins, setCoins, debt, setDebt,
    history, setHistory, addToHistory, removeFromHistory, updateInHistory,
    willpowerExp, setWillpowerExp,
    shield, setShield,
    potions, setPotions,
    inventory, setInventory,
    weeklyPools, monthlyPools,
    insuranceExpiry, hasZenSofa,
  } = useFinanceStore();

  const {
    isCloudLoading,
    activeMode, roomId,
    setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly,
    activeChallenges, setActiveChallenges,
    claimedAvoidedItems, setClaimedAvoidedItems,
    isSevered, setIsSevered,
    coldWarEndTime, setColdWarEndTime,
    lastTrackDate, setLastTrackDate,
    setPendingTx, setNlpInput,
    savingStreak, setSavingStreak, setStreakBroken,
    setAchievementNotification,
    addToBattleLog, setAiComment,
    isAiProcessing, setIsAiProcessing,
    homeMaterials, setHomeMaterials,
    now,
  } = useBattleStore();

  // ── 子 Hooks ──────────────────────────────────────────────────────────────
  const {
    syncNewTransaction,
    syncDeleteTransaction,
    syncUpdateTransaction,
    syncDeleteAllHistory,
  } = useFirebaseSync();

  const { generateComment, generateMonthlyReview: _generateMonthlyReview, parseNLPTransaction } = useAIComment(apiKey);

  // ── 工具：用 ref 包住 unlockAchievement 避免 callback 互依賴循環 ────────
  const unlockRef = useRef(null);

  // ── 成就解鎖 ─────────────────────────────────────────────────────────────
  const unlockAchievement = useCallback((id) => {
    if (achievements?.[id]?.unlocked) return;
    const medal = ACHIEVEMENTS[id];
    if (!medal) return;
    const t = LOCALES[lang] || LOCALES.zh;
    const localizedName = t[`ac_${id}_name`] || medal.name;
    setAchievements((prev) => ({
      ...prev,
      [id]: { unlocked: true, claimed: false, date: new Date().toLocaleDateString() },
    }));
    setAchievementNotification({ id, name: localizedName, icon: medal.icon });
    addToBattleLog(`🏆 [Achievement] ${localizedName}!`);
  }, [achievements, setAchievements, setAchievementNotification, addToBattleLog, lang]);

  // 同步 ref，讓 addCoinsWithDebtCheck 能呼叫到最新版本
  unlockRef.current = unlockAchievement;

  // ── 金幣增減 ──────────────────────────────────────────────────────────────
  const spendCoins = useCallback((amount, isPenalty = false) => {
    if (coins >= amount) {
      setCoins((c) => c - amount);
      return true;
    }
    if (isPenalty) {
      const leftover = amount - coins;
      setCoins(0);
      setDebt((d) => d + leftover);
      addToBattleLog(`🧨 [Debt] No coins, added ${leftover} debt.`);
      return true;
    }
    return false;
  }, [coins, setCoins, setDebt, addToBattleLog]);

  const addCoinsWithDebtCheck = useCallback((gain) => {
    if (debt > 0) {
      const wasHighDebt = debt >= 500;
      if (gain >= debt) {
        const remaining = gain - debt;
        setDebt(0);
        setCoins((c) => c + remaining);
        addToBattleLog('💰 Debt Cleared!');
        if (wasHighDebt) unlockRef.current('DEBT_FREE');
      } else {
        setDebt((d) => d - gain);
        addToBattleLog('💰 Income used for debt.');
      }
    } else {
      setCoins((c) => c + gain);
    }
  }, [debt, setDebt, setCoins, addToBattleLog]);

  // ── 成就領取 ──────────────────────────────────────────────────────────────
  const handleClaimAchievement = useCallback((id) => {
    const medal = ACHIEVEMENTS[id];
    if (!medal || !achievements?.[id] || achievements[id].claimed) return;
    setAchievements((prev) => ({ ...prev, [id]: { ...prev[id], claimed: true } }));
    addCoinsWithDebtCheck(medal.reward || 100);
    addToBattleLog('✨ [Claimed] Reward received!');
  }, [achievements, setAchievements, addCoinsWithDebtCheck, addToBattleLog]);

  // ── 戰損計算工具 ─────────────────────────────────────────────────────────
  const getDmgPercent = useCallback((amount, pillar) => {
    const limits = {
      survival:   (weeklyPools.food?.limit  || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit    || 0),
      progress:   (monthlyPools.education?.limit || 0),
      desire:     (weeklyPools.social?.limit    || 0),
      expedition: (weeklyPools.shopping?.limit  || 0),
    };
    return ((amount / (limits[pillar] || 10000)) * 100).toFixed(1);
  }, [weeklyPools, monthlyPools]);

  // ── 主要消費執行 ──────────────────────────────────────────────────────────
  const executeTransaction = useCallback(async (amount, desc, category, source = 'manual') => {
    if (isAiProcessing) return;
    const t = LOCALES[lang] || LOCALES.zh;
    const pillar = CATEGORY_MAP[category] || 'expedition';
    const isUnnecessary = ['desire', 'expedition'].includes(pillar);
    const hour = new Date().getHours();

    // ── 成就監控：次數 ──
    const currentCount = history.length + 1;
    const countMap = { 1: 'LOGS_1', 10: 'LOGS_10', 30: 'LOGS_30', 50: 'LOGS_50', 80: 'LOGS_80', 100: 'LOGS_100', 200: 'LOGS_200', 500: 'LOGS_500', 1000: 'LOGS_1000', 5000: 'LOGS_5000', 10000: 'LOGS_10000' };
    if (countMap[currentCount]) unlockAchievement(countMap[currentCount]);
    if (hour >= 5 && hour < 7) unlockAchievement('EARLY_BIRD');
    if (hour >= 0 && hour < 4) unlockAchievement('NIGHT_OWL');
    if (amount >= 3000) unlockAchievement('BIG_SPENDER');

    // ── 懲罰計算 ──
    let penaltyHp = 0;
    let isPreReported = false;
    let isLying = false;

    if (isSevered) {
      if (isUnnecessary && (persona === 'partner' || persona === 'bestie')) {
        penaltyHp += amount * 2.0;
        setColdWarEndTime((prev) => (prev || Date.now()) + 24 * 3_600_000);
        addToBattleLog('💔 [Betrayal] Spending during cold war!');
      } else {
        penaltyHp += amount * 0.5;
        addToBattleLog('🧨 [Punished] Logging during severance.');
      }
    }

    // 謊言檢測（claimedAvoidedItems）
    const validClaims = claimedAvoidedItems.filter((c) => now < c.expiry);
    for (const c of validClaims) {
      if (desc.includes(c.item)) {
        isLying = true;
        setClaimedAvoidedItems((p) => p.filter((x) => x.item !== c.item));
        break;
      }
    }

    if (isLying) {
      spendCoins(500, true);
      setPersonaStats((p) => ({ ...p, [persona]: { ...p[persona], intimacy: 0 } }));
      penaltyHp += amount * 2;
      addToBattleLog('🤬 [Lying] Fined 500 coins!');
    } else {
      for (let i = 0; i < activeChallenges.length; i++) {
        if (desc.includes(activeChallenges[i].item)) {
          isPreReported = true;
          setActiveChallenges((p) => p.filter((_, idx) => idx !== i));
          addToBattleLog(`🚩 [Approved] Bought ${desc}.`);
          break;
        }
      }
      if (amount >= 2000 && !isPreReported) {
        spendCoins(200, true);
        penaltyHp += amount * 0.2;
        addToBattleLog('🧨 [Impulsive] Large expense without notice!');
      }
    }

    // ── 護盾 / 保險 ──
    let totalDamage = amount + penaltyHp;
    const isInsuranceActive = insuranceExpiry && now < insuranceExpiry;
    if (isInsuranceActive && amount >= 3000) {
      totalDamage *= 0.2;
      addToBattleLog('🛡️ [Insurance] Steel Will active! Damage -80%.');
    }
    if (shield > 0) {
      totalDamage *= 0.8;
      setShield((s) => Math.max(0, s - 0.1));
      addToBattleLog(`🛡️ [Shield] ${lang === 'zh' ? '鐵血護盾啟動！' : 'Shield Active!'}`);
      unlockAchievement('SHIELD_USER');
    }

    // ── 寫入歷史 ──
    const newEntry = {
      id: Date.now(), amount, desc, category, pillar,
      damage: totalDamage, isCrit: penaltyHp > 0, source,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      shielded: shield > 0,
    };
    addToHistory(newEntry);
    syncNewTransaction(newEntry);
    addToBattleLog(`${source === 'invoice' ? '🧾' : '⚔️'} ${t.log_damage} ${getDmgPercent(totalDamage, pillar)}%`);

    if (totalDamage > 5000) unlockAchievement('SURVIVAL');

    // ── 專精成就 ──
    const historyWithNew = [newEntry, ...history];
    const getCount = (cat) => historyWithNew.filter((h) => h.category === cat).length;
    const shieldedCount = historyWithNew.filter((h) => h.shielded).length;
    if (shieldedCount >= 5)  unlockAchievement('SHIELD_USER');
    if (shieldedCount >= 50) unlockAchievement('SHIELD_50');
    const foodCount = getCount('cat_food');
    if (foodCount >= 10)  unlockAchievement('MASTER_FOOD_1');
    if (foodCount >= 50)  unlockAchievement('MASTER_FOOD_2');
    if (foodCount >= 150) unlockAchievement('MASTER_FOOD_3');
    const studyCount = getCount('cat_study') + getCount('cat_book');
    if (studyCount >= 5)  unlockAchievement('MASTER_STUDY_1');
    if (studyCount >= 20) unlockAchievement('MASTER_STUDY_2');
    if (studyCount >= 50) unlockAchievement('MASTER_STUDY_3');
    if (getCount('cat_drink') >= 10 && desc.includes('咖啡')) unlockAchievement('CAFFEINE_ADDICT');
    if (getCount('cat_fitness') >= 5) unlockAchievement('HEALTH_NUT');
    const convenienceCount = historyWithNew.filter((h) =>
      ['cat_drink', 'cat_snack', 'cat_daily'].includes(h.category) &&
      (h.desc.includes('超商') || h.desc.includes('全家') || h.desc.includes('7-11') || h.desc.includes('萊爾富'))
    ).length;
    if (convenienceCount >= 5) unlockAchievement('CONVENIENCE_STORE_FRIEND');
    if (getCount('cat_book') >= 3) unlockAchievement('BOOK_WORM');
    const dailyFoodCount = historyWithNew.filter((h) => h.date === new Date().toLocaleDateString() && h.category === 'cat_food').length;
    if (dailyFoodCount >= 5) unlockAchievement('GOURMET');
    if (hour >= 0 && hour < 4 && category === 'cat_food') unlockAchievement('MIDNIGHT_SNACK');

    // ── Combo 獎勵 ──
    const isCombo = savingStreak >= 3;
    const baseCoins = pillar === 'progress' ? 40 : 20;
    addCoinsWithDebtCheck(isCombo ? baseCoins * 2 : baseCoins);
    if (isCombo) addToBattleLog(`💰 +${isCombo ? baseCoins * 2 : baseCoins} (x2 Combo! 🔥${savingStreak} Days)`);

    setWillpowerExp((e) => {
      const next = e + 15;
      if (next >= 3000) unlockAchievement('WILLPOWER_GOD');
      return Math.min(1_000_000, next);
    });

    if (!isSevered) {
      setPersonaStats((p) => ({
        ...p,
        [persona]: { ...p[persona], intimacy: Math.min(100, p[persona].intimacy + 1) },
      }));
    }

    // ── 委託 AI 評論（非阻塞）──
    generateComment({ amount, desc, isCombo, savingStreak });
  }, [
    isAiProcessing, lang, history, isSevered, persona, claimedAvoidedItems,
    activeChallenges, insuranceExpiry, shield, savingStreak, now,
    setPersonaStats, setActiveChallenges, setClaimedAvoidedItems,
    setColdWarEndTime, setShield, setWillpowerExp,
    spendCoins, addCoinsWithDebtCheck, unlockAchievement,
    addToHistory, syncNewTransaction, addToBattleLog, getDmgPercent, generateComment,
  ]);

  // ── NLP 輸入處理 ──────────────────────────────────────────────────────────
  const processTransaction = useCallback(async (input, source = 'manual') => {
    if (!input.trim() || isAiProcessing) return;

    // 挑戰宣告
    if (input.includes('我想買') || input.includes('挑戰') || input.includes('buy')) {
      const item = input.replace(/我想買|挑戰|buy/g, '').trim() || 'Item';
      if (spendCoins(500)) {
        setActiveChallenges((p) => [...p, { item, startTime: now }]);
        addToBattleLog(`🛡️ [Bet] 500 locked for: ${item}`);
      } else {
        alert('No coins!');
      }
      setNlpInput('');
      return;
    }

    setIsAiProcessing(true);
    const parsed = await parseNLPTransaction(input);
    setIsAiProcessing(false);
    setPendingTx({ ...parsed, source });
    setNlpInput('');
  }, [isAiProcessing, spendCoins, now, setActiveChallenges, setNlpInput,
      setIsAiProcessing, setPendingTx, addToBattleLog, parseNLPTransaction]);

  // ── 刪除 / 更新交易 ────────────────────────────────────────────────────────
  const deleteTransaction = useCallback((id) => {
    const target = history.find((h) => h.id === id);
    if (!target) return;
    if (target.source === 'invoice') { alert('🛡️ Lock!'); return; }

    spendCoins(20, true);
    addToBattleLog('🗑️ [Karma] Record removed, fine 20.');

    const deleteCount = (parseInt(localStorage.getItem('bb_v4_delete_count') || '0', 10)) + 1;
    localStorage.setItem('bb_v4_delete_count', deleteCount.toString());
    if (deleteCount >= 5) unlockAchievement('KARMA_MASTER');

    removeFromHistory(id);
    syncDeleteTransaction(id);
  }, [history, spendCoins, addToBattleLog, unlockAchievement, removeFromHistory, syncDeleteTransaction]);

  const updateTransaction = useCallback((id, newCategory) => {
    const newPillar = CATEGORY_MAP[newCategory] || 'expedition';
    updateInHistory(id, { category: newCategory, pillar: newPillar });
    syncUpdateTransaction(id, { category: newCategory, pillar: newPillar });
    addToBattleLog('🔧 [Fixed] Category updated.');
  }, [updateInHistory, syncUpdateTransaction, addToBattleLog]);

  // ── 儀式（清除歷史，恢復關係）────────────────────────────────────────────
  const executeRitual = useCallback((reflectionText) => {
    if (persona === 'asian_parent' && reflectionText.length < 50) return;
    if ((persona === 'peer' || persona === 'instructor') && !spendCoins(500, true)) return;
    if ((persona === 'partner' || persona === 'bestie') && coldWarEndTime && now < coldWarEndTime) return;

    setIsSevered(false);
    setColdWarEndTime(null);
    addToBattleLog('🛡️ [Ritual] Relation restored.');
    setHistory([]);
    syncDeleteAllHistory();
    setTeamSpentDaily(0);
    setTeamSpentWeekly(0);
    setTeamSpentMonthly(0);
    unlockAchievement('RITUAL_MASTER');
  }, [
    persona, spendCoins, coldWarEndTime, now,
    setIsSevered, setColdWarEndTime, addToBattleLog,
    setHistory, syncDeleteAllHistory,
    setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly,
    unlockAchievement,
  ]);

  // ── 挑戰領取 / 放棄 ──────────────────────────────────────────────────────
  const handleClaimChallenge = useCallback((idx) => {
    const challenge = activeChallenges[idx];
    addCoinsWithDebtCheck(500);
    setWillpowerExp((e) => e + 200);
    setClaimedAvoidedItems((p) => [...p, { item: challenge.item, expiry: now + 86_400_000 }]);
    setActiveChallenges((p) => p.filter((_, i) => i !== idx));
    setAiComment('💰 Deposit refunded.');
    addToBattleLog(`🕵️ AI Monitor: ${challenge.item}`);
  }, [activeChallenges, addCoinsWithDebtCheck, setWillpowerExp,
      setClaimedAvoidedItems, setActiveChallenges, setAiComment, addToBattleLog, now]);

  const handleGiveUpChallenge = useCallback((idx) => {
    const challenge = activeChallenges[idx];
    setActiveChallenges((p) => p.filter((_, i) => i !== idx));
    executeTransaction(100, `Give up: ${challenge.item}`, 'cat_other');
  }, [activeChallenges, setActiveChallenges, executeTransaction]);

  // ── 模擬發票 ─────────────────────────────────────────────────────────────
  const simulateInvoice = useCallback(() => {
    const items = [
      { desc: '御飯糰', amount: 35, category: 'cat_food' },
      { desc: '拿鐵',   amount: 55, category: 'cat_drink' },
      { desc: '網購',   amount: 850, category: 'cat_shop' },
    ];
    const item = items[Math.floor(Math.random() * items.length)];
    setPendingTx({ ...item, source: 'invoice' });
    addToBattleLog(`🧾 Invoice: ${item.desc}`);
  }, [setPendingTx, addToBattleLog]);

  // ── 成就監控 Effects ─────────────────────────────────────────────────────

  // 被動監控：coin/exp/intimacy 觸發的成就
  useEffect(() => {
    if (coins >= 10000)  unlockAchievement('WEALTHY_WARRIOR');
    if (coins >= 100000) unlockAchievement('WEALTH_100000');
    if (personaStats[persona]?.intimacy >= 100) unlockAchievement('LOYAL_PARTNER');
    if (personaStats['asian_parent']?.intimacy >= 80) unlockAchievement('MOM_LOVES_ME');
    const activePersonas = Object.keys(personaStats).filter((k) => personaStats[k]?.intimacy > 0 || k === persona);
    if (activePersonas.length >= 6) unlockAchievement('PERSONA_COLLECTOR');
    if (willpowerExp >= 500)  unlockAchievement('EXP_500');
    if (willpowerExp >= 1500) unlockAchievement('EXP_1500');
    if (willpowerExp >= 3000) unlockAchievement('EXP_3000');
    if (willpowerExp >= 5000) unlockAchievement('EXP_5000');
    if (activeChallenges?.length >= 3) unlockAchievement('GAMBLER');
    const defaultWishlists = ['想買台 PS5...', 'I want to buy a PS5...', 'PS5が欲しい...'];
    if (wishlist && !defaultWishlists.includes(wishlist)) unlockAchievement('SET_WISHLIST');
    if (achievements) {
      const unlockedCount = Object.values(achievements).filter((a) => a.unlocked).length;
      if (unlockedCount >= 5)  unlockAchievement('COLLECTOR');
      if (unlockedCount >= 10) unlockAchievement('COLLECTOR_10');
      if (unlockedCount >= 30) unlockAchievement('COLLECTOR_30');
    }
    if (history.length > 0 && coins === 0 && debt === 0)    unlockAchievement('ZERO_HERO');
    if (history.length > 0 && coins === 0 && debt >= 1000)  unlockAchievement('BANKRUPT');
  }, [coins, debt, personaStats, persona, achievements, willpowerExp, activeChallenges, wishlist, history.length]);
  // ^ 故意不加 unlockAchievement 進依賴陣列（stable callback，加入會無限迴圈）

  // 日/週/月重置 + Streak 計算
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    if (!lastTrackDate || lastTrackDate === todayStr) {
      setLastTrackDate(todayStr);
      return;
    }

    const nowDate = new Date();
    const last = new Date(lastTrackDate);

    // 季度重置
    const currentMonth = nowDate.getMonth() + 1;
    const isNewSeason = [1, 4, 7, 10].includes(currentMonth) && nowDate.getDate() === 1;
    const seasonKey = `${nowDate.getFullYear()}-${Math.ceil(currentMonth / 3)}`;
    const lastResetSeason = localStorage.getItem('bb_v3_last_reset_season');
    if (isNewSeason && lastResetSeason !== seasonKey) {
      addToBattleLog('🌪️ [Season Reset] Willpower season settlement!');
      if (debt >= 500) {
        addToBattleLog('🕊️ [Amnesty] Reset to 2000 coins!');
        setDebt(0);
      } else if (coins > 5000) {
        const bonus = Math.floor((coins - 2000) * 0.1);
        setHomeMaterials((prev) => prev + bonus * 10);
        addToBattleLog(`🏰 [Wealth] Converted to ${bonus * 10} materials!`);
      }
      setCoins(2000);
      localStorage.setItem('bb_v3_last_reset_season', seasonKey);
    }

    // 日重置
    if (nowDate.getDate() !== last.getDate()) {
      addToBattleLog('📅 Daily reset.');
      setTeamSpentDaily(0);

      const lastDaySpent = history
        .filter((h) => h.date === last.toLocaleDateString() && h.pillar === 'survival')
        .reduce((s, h) => s + h.amount, 0);

      if (lastDaySpent > 0 && lastDaySpent < 200) {
        unlockAchievement('SAVING_EXPERT');
        if (lastDaySpent < 100) unlockAchievement('SURVIVAL_100');
        if (lastDaySpent < 50)  unlockAchievement('SURVIVAL_50');
        const newStreak = savingStreak + 1;
        setSavingStreak(newStreak);
        if (newStreak >= 3)   unlockAchievement('STREAK_3');
        if (newStreak >= 7)   unlockAchievement('STREAK_7');
        if (newStreak >= 30)  unlockAchievement('STREAK_30');
        if (newStreak >= 100) unlockAchievement('STREAK_100');
        addToBattleLog('🔥 [Combo] Saving streak continues!');
      } else if (lastDaySpent >= 200) {
        if (savingStreak >= 3) setStreakBroken(true);
        setSavingStreak(0);
        addToBattleLog('❄️ [Streak Lost] Spending exceeded threshold.');
      }
      if (hasZenSofa) {
        setWillpowerExp((e) => e + 5);
        addToBattleLog('🪑 [Zen Sofa] Relaxing at home, Exp +5.');
      }
    }

    // 週重置（週一）
    if (nowDate.getDay() === 1 && nowDate.getDate() !== last.getDate()) {
      addToBattleLog('📅 Weekly reset.');
      setTeamSpentWeekly(0);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const hasExpedition = history.some((h) => new Date(h.date) >= oneWeekAgo && h.pillar === 'expedition');
      if (!hasExpedition) unlockAchievement('NO_EXPEDITION_WEEK');
      const weeklySpent = history.filter((h) => new Date(h.date) >= oneWeekAgo).reduce((s, h) => s + h.amount, 0);
      const totalBudget = (weeklyPools.food?.limit || 1000) + (weeklyPools.transport?.limit || 0) + (weeklyPools.social?.limit || 0) + (weeklyPools.shopping?.limit || 0) + (monthlyPools.housing?.limit || 0) + (monthlyPools.education?.limit || 0);
      if (weeklySpent <= totalBudget * 0.8) unlockAchievement('THRIFTY_WEEK');
    }

    // 月重置
    if (nowDate.getDate() === 1 && nowDate.getMonth() !== last.getMonth()) {
      addToBattleLog('📅 Monthly reset!');
      setTeamSpentMonthly(0);
      const monthlySpent = history
        .filter((h) => h.date?.startsWith(lastTrackDate.slice(0, 7)))
        .reduce((s, h) => s + h.damage, 0);
      const gain = monthlySpent < 20000 ? 5000 : 2000;
      setHomeMaterials((prev) => prev + gain);
      addToBattleLog(`🏛️ Settlement: +${gain} materials!`);
    }

    setLastTrackDate(todayStr);
  }, [lastTrackDate]);
  // ^ 故意只依賴 lastTrackDate，避免每次資料變化都觸發（與原實作行為一致）

  // 寒戰結束成就
  useEffect(() => {
    if (coldWarEndTime && now >= coldWarEndTime && isSevered) {
      unlockAchievement('COLD_WAR_SURVIVOR');
    }
  }, [coldWarEndTime, now, isSevered]);

  // 鏡像 Bot（單機模式下模擬對手）
  useEffect(() => {
    if ((activeMode !== 'team5v5' && activeMode !== '1v1') || roomId) return;

    const timer = setInterval(() => {
      const userCats = history.length > 0 ? history.map((h) => h.category) : ['cat_food'];
      const favCat = userCats[Math.floor(Math.random() * userCats.length)];
      const avgAmt = history.length > 0
        ? history.reduce((s, h) => s + h.amount, 0) / history.length
        : 100;
      const isTeammate = Math.random() > 0.5;
      const dmg = avgAmt * (0.8 + Math.random() * 0.4);

      if (isTeammate) {
        if (CATEGORY_MAP[favCat] === 'survival') setTeamSpentDaily((p) => p + dmg);
        else setTeamSpentMonthly((p) => p + dmg);
        addToBattleLog('👥 [Shadow] Bot bought something!');
      } else {
        addToBattleLog('⚔️ [Shadow] Bot attack!');
      }
    }, 40_000);

    return () => clearInterval(timer);
  }, [activeMode, roomId]);

  // ── 回傳 API（與原 useBattleCore 相同）──────────────────────────────────
  return {
    executeTransaction,
    processTransaction,
    deleteTransaction,
    updateTransaction,
    spendCoins,
    addCoinsWithDebtCheck,
    executeRitual,
    handleClaimChallenge,
    handleGiveUpChallenge,
    simulateInvoice,
    handleClaimAchievement,
    unlockAchievement,
    generateMonthlyReview: _generateMonthlyReview,
  };
};
