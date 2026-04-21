import { useCallback, useEffect } from 'react';
import { doc, setDoc, onSnapshot, getDoc, collection, addDoc, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { CATEGORY_MAP, ACHIEVEMENTS } from '../utils/constants';
import { LOCALES } from '../utils/locales';

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
  lang,
  userName, userAvatar, roomId, setRoomId, setActiveMode,
  savingStreak, setSavingStreak, setStreakBroken,
  insuranceExpiry, hasZenSofa
) => {

  // 🚀 [即時連線邏輯] 監聽戰區數據 (限時 5 分鐘)
  // 📐 對戰比的是「預算使用比例」，與幣別無關
  useEffect(() => {
    if (!roomId || roomId === "MATCHMAKING_QUEUE") {
      setTeamSpentStates.setEnemySpentDaily(-1);
      setTeamSpentStates.setEnemySpentWeekly(-1);
      setTeamSpentStates.setEnemySpentMonthly(-1);
      return;
    }

    if ((activeMode === 'team5v5' || activeMode === '1v1')) {
      const roomRef = doc(db, "rooms", roomId);
      const unsubscribe = onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const nowTime = Date.now();
          if (data.createdAt && nowTime - data.createdAt > 300000) {
            addLog(`⌛ [System] Room ${roomId} expired.`);
            setRoomId("");
            setActiveMode('selection');
            return;
          }
          const allPlayers = data.players || {};
          const others = Object.values(allPlayers).filter(p => p.uid !== user?.uid);

          if (others.length > 0) {
            // 直接讀對手上傳的 HP 百分比，不再用本地預算換算
            const avg = (key) => others.reduce((s, p) => s + (p[key] ?? 100), 0) / others.length;
            setTeamSpentStates.setEnemySpentDaily(avg('hpSurvival'));
            setTeamSpentStates.setEnemySpentWeekly(avg('hpProgress'));
            setTeamSpentStates.setEnemySpentMonthly((avg('hpDesire') + avg('hpExpedition')) / 2);
          } else {
            // 房間沒別人：-1 代表「尚無對手」
            setTeamSpentStates.setEnemySpentDaily(-1);
            setTeamSpentStates.setEnemySpentWeekly(-1);
            setTeamSpentStates.setEnemySpentMonthly(-1);
          }
        } else {
          setDoc(roomRef, { createdAt: Date.now(), players: {} }, { merge: true });
        }
      });
      return () => unsubscribe();
    }
  }, [activeMode, roomId, user, setRoomId, setActiveMode, addLog, setTeamSpentStates, lang]);

  // 🚀 [數據上傳邏輯]
  useEffect(() => {
    if ((activeMode === 'team5v5' || activeMode === '1v1') && roomId && roomId !== "MATCHMAKING_QUEUE" && user) {
      const todayStr = new Date().toLocaleDateString();
      const nowDate = new Date();

      const dayOfWeek = nowDate.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(nowDate);
      weekStart.setDate(nowDate.getDate() - daysFromMonday);
      weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);

      const limits = {
        survival: (weeklyPools.food?.limit || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit || 0),
        progress: (monthlyPools.education?.limit || 0),
        desire: (weeklyPools.social?.limit || 0),
        expedition: (weeklyPools.shopping?.limit || 0)
      };

      const myDaily = history.filter(h => h.date === todayStr).reduce((s, h) => s + h.amount, 0);
      const myWeekly = history.filter(h => new Date(h.date) >= weekStart).reduce((s, h) => s + h.amount, 0);
      const myMonthly = history.filter(h => new Date(h.date) >= monthStart).reduce((s, h) => s + h.amount, 0);

      // 上傳 HP 百分比，讓對手直接讀比例，幣別不同也能公平對比
      const hpSurvival = Math.max(0, 100 - (myDaily / ((limits.survival * 5) || 1) * 100));
      const hpProgress = Math.max(0, 100 - (myWeekly / ((limits.progress * 5) || 1) * 100));
      const hpDesire   = Math.max(0, 100 - (myMonthly / ((limits.desire * 5) || 1) * 100));
      const hpExpedition = Math.max(0, 100 - (myMonthly / ((limits.expedition * 5) || 1) * 100));

      setDoc(doc(db, "rooms", roomId), {
        [`players.${user.uid}`]: { uid: user.uid, name: userName, hpSurvival, hpProgress, hpDesire, hpExpedition, lastUpdate: Date.now() }
      }, { merge: true });
    }
  }, [history, activeMode, roomId, user, userName]);

  // 🚀 [5v5 隨機匹配與 Bot 補位邏輯]
  useEffect(() => {
    if (roomId === "MATCHMAKING_QUEUE" && user) {
      const t = LOCALES[lang] || LOCALES.zh;
      addLog(`🔍 [System] ${t.searching_warriors}`);
      
      const matchmakingTimer = setTimeout(() => {
        // 超時處理：自動補 Bot
        const botRoomId = "BOT_" + Math.floor(1000 + Math.random() * 9000);
        addLog(`🤖 [System] ${t.bot_joined}`);
        
        const bots = {};
        for (let i = 1; i <= 9; i++) {
          const botId = `bot_${i}`;
          const botName = lang === 'zh' ? `省錢機器人 #${i}` : (lang === 'ja' ? `節約ロボット #${i}` : `Saving Bot #${i}`);
          bots[botId] = { uid: botId, name: botName, hpSurvival: Math.floor(40 + Math.random() * 60), hpProgress: Math.floor(40 + Math.random() * 60), hpDesire: Math.floor(40 + Math.random() * 60), hpExpedition: Math.floor(40 + Math.random() * 60), lastUpdate: Date.now() };
        }
        
        setDoc(doc(db, "rooms", botRoomId), {
          createdAt: Date.now(),
          players: {
            ...bots,
            [user.uid]: { uid: user.uid, name: userName, hpSurvival: 100, hpProgress: 100, hpDesire: 100, hpExpedition: 100, lastUpdate: Date.now() }
          }
        });
        
        setRoomId(botRoomId);
        setActiveMode('team5v5');
      }, 8000); // 8秒超時

      return () => clearTimeout(matchmakingTimer);
    }
  }, [roomId, user, userName, setRoomId, setActiveMode, addLog, lang]);

  const cooldownThreshold = 2000;

  const getDmgPercent = (amount, pillar) => {
    const limits = {
      survival: (weeklyPools.food?.limit || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit || 0),
      progress: (monthlyPools.education?.limit || 0),
      desire: (weeklyPools.social?.limit || 0),
      expedition: (weeklyPools.shopping?.limit || 0)
    };
    const limit = limits[pillar] || 10000;
    return ((amount / limit) * 100).toFixed(1);
  };

  const spendCoins = useCallback((amount, isPenalty = false) => {
    if (coins >= amount) { setCoins(c => c - amount); return true; }
    if (isPenalty) {
      const leftover = amount - coins;
      setCoins(0); setDebt(d => d + leftover);
      addLog(`🧨 [Debt] No coins, added ${leftover} debt.`);
      return true;
    }
    return false;
  }, [coins, setCoins, setDebt, addLog]);

  const addCoinsWithDebtCheck = useCallback((gain) => {
    if (debt > 0) {
      const wasHighDebt = debt >= 500;
      if (gain >= debt) {
        const remaining = gain - debt;
        setDebt(0); setCoins(c => c + remaining);
        addLog(`💰 Debt Cleared!`);
        if (wasHighDebt) unlockAchievement('DEBT_FREE');
      } else {
        setDebt(d => d - gain);
        addLog(`💰 Income used for debt.`);
      }
    } else { setCoins(c => c + gain); }
  }, [debt, setDebt, setCoins, addLog, unlockAchievement]);

  const unlockAchievement = useCallback((id) => {
    if (achievements && achievements[id]?.unlocked) return;
    const medal = ACHIEVEMENTS[id];
    if (!medal) return;
    setAchievements(prev => ({ ...prev, [id]: { unlocked: true, claimed: false, date: new Date().toLocaleDateString() } }));
    setAchievementNotification({ id, name: medal.name, icon: medal.icon });
    addLog(`🏆 [Achievement] ${medal.name}!`);
  }, [achievements, setAchievements, addLog, setAchievementNotification]);

  const handleClaimAchievement = useCallback((id) => {
    const medal = ACHIEVEMENTS[id];
    if (!medal || !achievements || achievements[id]?.claimed) return;
    setAchievements(prev => ({ ...prev, [id]: { ...prev[id], claimed: true } }));
    addCoinsWithDebtCheck(medal.reward || 100);
    addLog(`✨ [Claimed] Reward received!`);
  }, [achievements, setAchievements, addCoinsWithDebtCheck, addLog]);

  const executeTransaction = async (amount, desc, category, source = "manual") => {
    if (isAiProcessing) return;
    const t = LOCALES[lang] || LOCALES.zh;
    
    // 🚀 [成就全量監控]
    const currentCount = history.length + 1;
    const countThresholds = { 1: 'LOGS_1', 10: 'LOGS_10', 30: 'LOGS_30', 50: 'LOGS_50', 80: 'LOGS_80', 100: 'LOGS_100', 200: 'LOGS_200', 500: 'LOGS_500', 1000: 'LOGS_1000', 5000: 'LOGS_5000', 10000: 'LOGS_10000' };
    if (countThresholds[currentCount]) unlockAchievement(countThresholds[currentCount]);

    // 時間監測
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) unlockAchievement('EARLY_BIRD');
    if (hour >= 0 && hour < 4) unlockAchievement('NIGHT_OWL');

    // 大宗支出
    if (amount >= 3000) unlockAchievement('BIG_SPENDER');

    let penaltyHp = 0; let isPreReported = false; let isLying = false;
    const pillar = CATEGORY_MAP[category] || 'expedition';
    const isUnnecessary = ['desire', 'expedition'].includes(pillar);

    if (isSevered) {
      if (isUnnecessary && (persona === 'partner' || persona === 'bestie')) {
        penaltyHp += amount * 2.0;
        setColdWarEndTime(prev => (prev || Date.now()) + 24 * 3600000);
        addLog("💔 [Betrayal] Spending during cold war!");
      } else {
        penaltyHp += amount * 0.5;
        addLog("🧨 [Punished] Logging during severance.");
      }
    }

    const validClaims = claimedAvoidedItems.filter(c => now < c.expiry);
    for (let c of validClaims) {
      if (desc.includes(c.item)) {
        isLying = true;
        setClaimedAvoidedItems(p => p.filter(x => x.item !== c.item));
        break;
      }
    }

    if (isLying) {
      spendCoins(500, true);
      setPersonaStats(p => ({...p, [persona]: {...p[persona], intimacy: 0}}));
      penaltyHp += amount * 2;
      addLog("🤬 [Lying] Fined 500 coins!");
    } else {
      for (let i = 0; i < activeChallenges.length; i++) {
        if (desc.includes(activeChallenges[i].item)) {
          isPreReported = true;
          setActiveChallenges(p => p.filter((_, idx) => idx !== i));
          addLog(`🚩 [Approved] Bought ${desc}.`);
          break;
        }
      }
      if (amount >= cooldownThreshold && !isPreReported) {
        spendCoins(200, true);
        penaltyHp += amount * 0.2;
        addLog("🧨 [Impulsive] Large expense without notice!");
      }
    }

    let totalDamage = amount + penaltyHp;
    
    // 🛡️ [鋼鐵遺囑] 保險邏輯：單筆 > 3000 且保險未過期時戰損 -80%
    const isInsuranceActive = insuranceExpiry && now < insuranceExpiry;
    if (isInsuranceActive && amount >= 3000) {
      totalDamage *= 0.2;
      addLog(`🛡️ [Insurance] Steel Will active! Damage reduced by 80%.`);
    }

    if (shield > 0) {
      totalDamage *= 0.8; 
      setShield(s => Math.max(0, s - 0.1));
      addLog(`🛡️ [Shield] ${lang === 'zh' ? '鐵血護盾啟動！' : 'Shield Active!'}`);
      unlockAchievement('SHIELD_USER');
    }

    const newEntry = { id: Date.now(), amount, desc, category, pillar, damage: totalDamage, isCrit: penaltyHp > 0, source, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString(), shielded: shield > 0 };
    setHistory(prev => [newEntry, ...prev]);
    if (user) {
      setDoc(doc(db, "users", user.uid, "history", newEntry.id.toString()), newEntry).catch(() => {});
    }
    addLog(`${source === 'invoice' ? '🧾' : '⚔️'} ${t.log_damage} ${getDmgPercent(totalDamage, pillar)}%`);
    
    if (totalDamage > 5000) unlockAchievement('SURVIVAL');

    // 🚀 [專精成就監控]
    const historyWithNew = [newEntry, ...history];
    const getCount = (cat) => historyWithNew.filter(h => h.category === cat).length;

    const shieldedCount = historyWithNew.filter(h => h.shielded).length;
    if (shieldedCount >= 5) unlockAchievement('SHIELD_USER');
    if (shieldedCount >= 50) unlockAchievement('SHIELD_50');

    const foodCount = getCount('cat_food');
    if (foodCount >= 10) unlockAchievement('MASTER_FOOD_1');
    if (foodCount >= 50) unlockAchievement('MASTER_FOOD_2');
    if (foodCount >= 150) unlockAchievement('MASTER_FOOD_3');

    const studyCount = getCount('cat_study') + getCount('cat_book');
    if (studyCount >= 5) unlockAchievement('MASTER_STUDY_1');
    if (studyCount >= 20) unlockAchievement('MASTER_STUDY_2');
    if (studyCount >= 50) unlockAchievement('MASTER_STUDY_3');

    if (getCount('cat_drink') >= 10 && desc.includes('咖啡')) unlockAchievement('CAFFEINE_ADDICT');
    if (getCount('cat_fitness') >= 5) unlockAchievement('HEALTH_NUT');

    const convenienceCount = historyWithNew.filter(h => ['cat_drink', 'cat_snack', 'cat_daily'].includes(h.category) && (h.desc.includes('超商') || h.desc.includes('全家') || h.desc.includes('7-11') || h.desc.includes('萊爾富'))).length;
    if (convenienceCount >= 5) unlockAchievement('CONVENIENCE_STORE_FRIEND');

    if (getCount('cat_book') >= 3) unlockAchievement('BOOK_WORM');
    
    const dailyFoodCount = historyWithNew.filter(h => h.date === new Date().toLocaleDateString() && h.category === 'cat_food').length;
    if (dailyFoodCount >= 5) unlockAchievement('GOURMET');
    
    if (hour >= 0 && hour < 4 && category === 'cat_food') unlockAchievement('MIDNIGHT_SNACK');

    const isCombo = savingStreak >= 3;
    const baseCoins = pillar === 'progress' ? 40 : 20;
    const coinGain = isCombo ? baseCoins * 2 : baseCoins;
    addCoinsWithDebtCheck(coinGain);
    if (isCombo) addLog(`💰 +${coinGain} (x2 Combo Bonus! 🔥${savingStreak} Days)`);
    setWillpowerExp(e => {
      const next = e + 15;
      if (next >= 3000) unlockAchievement('WILLPOWER_GOD');
      return Math.min(1000000, next);
    });

    if (!isSevered) setPersonaStats(p => ({...p, [persona]: {...p[persona], intimacy: Math.min(100, p[persona].intimacy + 1)}}));

    if (apiKey) {
      setIsAiProcessing(true);
      try {
        const personaData = personaStats[persona];
        const systemBase = (personaData.prompts && personaData.prompts[lang]) || personaData.prompt;
        const comboInstruction = isCombo ? ` IMPORTANT: The user is on a ${savingStreak}-day saving streak! React with extreme praise, worship, and disbelief — like witnessing a miracle. Go over the top.` : '';
        const prompt = `System: ${systemBase}.${comboInstruction} Goal: ${wishlist}. Action: spent ${amount} on ${desc}. Rules: limit 20 words, must use language: ${lang}.`;
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Spent ${amount} on ${desc}` }] }], systemInstruction: { parts: [{ text: prompt }] } })
        });
        const result = await res.json();
        setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "...");
      } catch { setAiComment("..."); }
      setIsAiProcessing(false);
    }
  };

  const generateMonthlyReview = async (monthStr, filteredHistory) => {
    if (!apiKey || isAiProcessing || filteredHistory.length === 0) return;
    setIsAiProcessing(true);
    try {
      const personaData = personaStats[persona];
      const systemBase = (personaData.prompts && personaData.prompts[lang]) || personaData.prompt;
      const summary = filteredHistory.reduce((acc, h) => { acc[h.pillar] = (acc[h.pillar] || 0) + h.damage; return acc; }, {});
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Monthly Report: ${JSON.stringify(summary)}` }] }], systemInstruction: { parts: [{ text: `${systemBase}. Reply in 30 words using ${lang}.` }] } })
      });
      const result = await res.json();
      setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "...");
    } catch { setAiComment("..."); }
    setIsAiProcessing(false);
  };

  const deleteTransaction = useCallback((id) => {
    setHistory(prev => {
      const target = prev.find(h => h.id === id);
      if (!target) return prev;
      if (target.source === 'invoice') { alert("🛡️ Lock!"); return prev; }
      spendCoins(20, true);
      addLog(`🗑️ [Karma] Record removed, fine 20.`);
      const deleteCount = (parseInt(localStorage.getItem('bb_v4_delete_count')) || 0) + 1;
      localStorage.setItem('bb_v4_delete_count', deleteCount.toString());
      if (deleteCount >= 5) unlockAchievement('KARMA_MASTER');
      if (user) deleteDoc(doc(db, "users", user.uid, "history", id.toString())).catch(() => {});
      return prev.filter(h => h.id !== id);
    });
  }, [setHistory, addLog, spendCoins, unlockAchievement, user]);

  const updateTransaction = useCallback((id, newCategory) => {
    const newPillar = CATEGORY_MAP[newCategory] || 'expedition';
    setHistory(prev => prev.map(h => h.id === id ? { ...h, category: newCategory, pillar: newPillar } : h));
    if (user) updateDoc(doc(db, "users", user.uid, "history", id.toString()), { category: newCategory, pillar: newPillar }).catch(() => {});
    addLog(`🔧 [Fixed] Category updated.`);
  }, [setHistory, addLog, user]);

  const processTransaction = async (input, source = "manual") => {
    if (input.trim() === "" || isAiProcessing) return;
    if (input.includes("我想買") || input.includes("挑戰") || input.includes("buy")) {
      const item = input.replace(/我想買|挑戰|buy/g, '').trim() || "Item";
      if (spendCoins(500)) { setActiveChallenges(p => [...p, { item, startTime: now }]); addLog(`🛡️ [Bet] 500 locked for: ${item}`); }
      else { alert("No coins!"); }
      setNlpInput(""); return;
    }
    setIsAiProcessing(true);
    let amount = parseInt(input.match(/\d+/)?.[0] || 100);
    let desc = input.replace(/\d+/g, '').replace(/買了|花了|塊|元|bought|spent/g, '').trim() || "Expense";
    let category = "cat_food";
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Extract amount, item, category_key: ${input}` }] }] })
        });
        const result = await response.json();
        const match = result.candidates?.[0]?.content?.parts?.[0]?.text?.match(/\{[\s\S]*\}/);
        if (match) { const d = JSON.parse(match[0]); amount = d.amount || amount; desc = d.item || desc; category = d.category || category; }
      } catch (e) { console.error(e); }
    }
    setIsAiProcessing(false);
    setPendingTx({ amount, desc, category, source });
    setNlpInput("");
  };

  const executeRitual = useCallback((reflectionText) => {
    if (persona === 'asian_parent' && reflectionText.length < 50) return;
    if ((persona === 'peer' || persona === 'instructor') && !spendCoins(500, true)) return;
    if ((persona === 'partner' || persona === 'bestie') && coldWarEndTime && now < coldWarEndTime) return;
    setIsSevered(false); setColdWarEndTime(null); addLog("🛡️ [Ritual] Relation restored."); setHistory([]);
    if (user) {
      getDocs(collection(db, "users", user.uid, "history")).then(snap => {
        snap.docs.forEach(d => deleteDoc(d.ref));
      }).catch(() => {});
    }
    const { setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly } = setTeamSpentStates;
    setTeamSpentDaily(0); setTeamSpentWeekly(0); setTeamSpentMonthly(0);
    unlockAchievement('RITUAL_MASTER');
  }, [persona, spendCoins, coldWarEndTime, now, setIsSevered, setColdWarEndTime, addLog, setHistory, setTeamSpentStates, unlockAchievement]);

  const handleClaimChallenge = useCallback((idx) => {
    const challenge = activeChallenges[idx];
    addCoinsWithDebtCheck(500);
    setWillpowerExp(e => e + 200);
    setClaimedAvoidedItems(p => [...p, { item: challenge.item, expiry: now + 86400000 }]);
    setActiveChallenges(p => p.filter((_, i) => i !== idx));
    setAiComment("💰 Deposit refunded.");
    addLog(`🕵️ AI Monitor: ${challenge.item}`);
  }, [activeChallenges, addCoinsWithDebtCheck, setWillpowerExp, setClaimedAvoidedItems, setActiveChallenges, setAiComment, addLog, now]);

  const handleGiveUpChallenge = useCallback((idx) => {
    const challenge = activeChallenges[idx];
    setActiveChallenges(p => p.filter((_, i) => i !== idx));
    executeTransaction(100, `Give up: ${challenge.item}`, "cat_other");
  }, [activeChallenges, setActiveChallenges, executeTransaction]);

  const simulateInvoice = useCallback(() => {
    const items = [{ desc: "御飯糰", amount: 35, category: "cat_food" }, { desc: "拿鐵", amount: 55, category: "cat_drink" }, { desc: "網購", amount: 850, category: "cat_shop" }];
    const item = items[Math.floor(Math.random() * items.length)];
    setPendingTx({ ...item, source: "invoice" });
    addLog(`🧾 Invoice: ${item.desc}`);
  }, [setPendingTx, addLog]);

  // 🤖 鏡像機器人 (僅在單機時啟動)
  useEffect(() => {
    if ((activeMode === 'team5v5' || activeMode === '1v1') && !roomId) {
      const timer = setInterval(() => {
        const userCats = history.length > 0 ? history.map(h => h.category) : ['cat_food'];
        const favCat = userCats[Math.floor(Math.random() * userCats.length)];
        const avgAmt = history.length > 0 ? history.reduce((s, h) => s + h.amount, 0) / history.length : 100;
        const isTeammate = Math.random() > 0.5;
        const botName = isTeammate ? "影之隊友" : "影之宿敵";
        const dmg = avgAmt * (0.8 + Math.random() * 0.4);
        const { setTeamSpentDaily, setTeamSpentMonthly, setEnemySpentDaily, setEnemySpentMonthly } = setTeamSpentStates;
        if (isTeammate) {
          if (CATEGORY_MAP[favCat] === 'survival') setTeamSpentDaily(p => p + dmg); else setTeamSpentMonthly(p => p + dmg);
          addLog(`👥 [Shadow] Bot bought ${favCat}!`);
        } else {
          if (CATEGORY_MAP[favCat] === 'survival') setEnemySpentDaily(p => p + dmg); else setEnemySpentMonthly(p => p + dmg);
          addLog(`⚔️ [Shadow] Bot attack with ${favCat}!`);
        }
      }, 40000); 
      return () => clearInterval(timer);
    }
  }, [activeMode, history, setTeamSpentStates, addLog, roomId]);

  useEffect(() => {
    if (coldWarEndTime && now >= coldWarEndTime && isSevered) {
      unlockAchievement('COLD_WAR_SURVIVOR');
    }
  }, [coldWarEndTime, now, isSevered, unlockAchievement]);

  useEffect(() => {
    if (coins >= 10000) unlockAchievement('WEALTHY_WARRIOR');
    if (coins >= 100000) unlockAchievement('WEALTH_100000');
    if (personaStats[persona]?.intimacy >= 100) unlockAchievement('LOYAL_PARTNER');
    if (personaStats['asian_parent']?.intimacy >= 80) unlockAchievement('MOM_LOVES_ME');
    
    const activePersonas = Object.keys(personaStats).filter(k => personaStats[k]?.intimacy > 0 || k === persona);
    if (activePersonas.length >= 6) unlockAchievement('PERSONA_COLLECTOR');

    if (willpowerExp >= 500) unlockAchievement('EXP_500');
    if (willpowerExp >= 1500) unlockAchievement('EXP_1500');
    if (willpowerExp >= 3000) unlockAchievement('EXP_3000');
    if (willpowerExp >= 5000) unlockAchievement('EXP_5000');

    if (activeChallenges && activeChallenges.length >= 3) unlockAchievement('GAMBLER');

    const defaultWishlists = ['想買台 PS5...', 'I want to buy a PS5...', 'PS5が欲しい...'];
    if (wishlist && !defaultWishlists.includes(wishlist)) unlockAchievement('SET_WISHLIST');

    if (achievements) {
      const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
      if (unlockedCount >= 5) unlockAchievement('COLLECTOR');
      if (unlockedCount >= 10) unlockAchievement('COLLECTOR_10');
      if (unlockedCount >= 30) unlockAchievement('COLLECTOR_30');
    }
    
    if (history.length > 0 && coins === 0 && debt === 0) unlockAchievement('ZERO_HERO');
    if (history.length > 0 && coins === 0 && debt >= 1000) unlockAchievement('BANKRUPT');
  }, [coins, debt, personaStats, persona, achievements, unlockAchievement, history]);

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    if (lastTrackDate && lastTrackDate !== todayStr) {
      const nowTime = new Date();
      const last = new Date(lastTrackDate);
      
      // 🚀 [季度重置] 滿血版邏輯還原
      const currentMonth = nowTime.getMonth() + 1;
      const isNewSeason = [1, 4, 7, 10].includes(currentMonth) && nowTime.getDate() === 1;
      const lastResetSeason = localStorage.getItem('bb_v3_last_reset_season');
      const seasonKey = `${nowTime.getFullYear()}-${Math.ceil(currentMonth / 3)}`;

      if (isNewSeason && lastResetSeason !== seasonKey) {
        addLog("🌪️ [Season Reset] Willpower season settlement!");
        let bonus = 0;
        if (debt >= 500) { addLog("🕊️ [Amnesty] Reset to 2000 coins, start over!"); setDebt(0); }
        else if (coins > 5000) { 
          bonus = Math.floor((coins - 2000) * 0.1); 
          setHomeMaterials(prev => prev + bonus * 10);
          addLog(`🏰 [Wealth] Converted to ${bonus * 10} materials!`);
        }
        setCoins(2000 + bonus);
        localStorage.setItem('bb_v3_last_reset_season', seasonKey);
      }

      if (nowTime.getDate() !== last.getDate()) { 
        addLog("📅 Daily reset."); setTeamSpentStates.setTeamSpentDaily(0); 
        const lastDaySpent = history.filter(h => h.date === last.toLocaleDateString() && h.pillar === 'survival').reduce((s, h) => s + h.amount, 0);
        if (lastDaySpent > 0 && lastDaySpent < 200) {
          unlockAchievement('SAVING_EXPERT');
          if (lastDaySpent < 100) unlockAchievement('SURVIVAL_100');
          if (lastDaySpent < 50) unlockAchievement('SURVIVAL_50');
          
          const newStreak = savingStreak + 1;
          setSavingStreak(newStreak);
          if (newStreak >= 3) unlockAchievement('STREAK_3');
          if (newStreak >= 7) unlockAchievement('STREAK_7');
          if (newStreak >= 30) unlockAchievement('STREAK_30');
          if (newStreak >= 100) unlockAchievement('STREAK_100');
          addLog("🔥 [Combo] Saving streak continues!");
        } else if (lastDaySpent >= 200) {
          if (savingStreak >= 3) setStreakBroken(true);
          setSavingStreak(0);
          addLog("❄️ [Streak Lost] Daily spending exceeded threshold.");
        }

        // 🪑 [禁慾沙發] 每日 Exp 加成
        if (hasZenSofa) {
          setWillpowerExp(e => e + 5);
          addLog("🪑 [Zen Sofa] Relaxing at home, Exp +5.");
        }
      }
      if (nowTime.getDay() === 1 && nowTime.getDate() !== last.getDate()) { 
        addLog("📅 Weekly reset."); 
        setTeamSpentStates.setTeamSpentWeekly(0); 
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const hasExpedition = history.some(h => new Date(h.date) >= oneWeekAgo && h.pillar === 'expedition');
        if (!hasExpedition) unlockAchievement('NO_EXPEDITION_WEEK');

        const weeklySpent = history.filter(h => new Date(h.date) >= oneWeekAgo).reduce((s, h) => s + h.amount, 0);
        const limits = {
          survival: (weeklyPools.food?.limit || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit || 0),
          progress: (monthlyPools.education?.limit || 0),
          desire: (weeklyPools.social?.limit || 0),
          expedition: (weeklyPools.shopping?.limit || 0)
        };
        const totalBudget = limits.survival + limits.progress + limits.desire + limits.expedition;
        if (weeklySpent <= totalBudget * 0.8) unlockAchievement('THRIFTY_WEEK');
      }
      if (nowTime.getDate() === 1 && nowTime.getMonth() !== last.getMonth()) {
        addLog("📅 Monthly reset!"); setTeamSpentStates.setTeamSpentMonthly(0);
        const monthlySpent = history.filter(h => h.date && h.date.startsWith(lastTrackDate.slice(0, 7))).reduce((s, h) => s + h.damage, 0);
        const gain = monthlySpent < 20000 ? 5000 : 2000;
        if (gain > 0) { setHomeMaterials(prev => prev + gain); addLog(`🏛️ Settlement: +${gain} materials!`); }
      }
    }
    setLastTrackDate(todayStr);
  }, [lastTrackDate, setLastTrackDate, addLog, setTeamSpentStates, history, setHomeMaterials, unlockAchievement, coins, debt, setCoins, setDebt]);

  useEffect(() => {
    if (!user || isCloudLoading) return;
    const timeout = setTimeout(() => {
      // history 現在存在 subcollection，不再塞進主 document
      setDoc(doc(db, "users", user.uid), {
        coins, debt, personaStats, persona, exp: willpowerExp, wishlist, lastTrackDate, homeMaterials, currentTier, potions, shield, userTitle, unlockedTitles, achievements, lang, userName, roomId, updatedAt: Date.now()
      }, { merge: true });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user, isCloudLoading, coins, debt, history, personaStats, persona, willpowerExp, wishlist, lastTrackDate, homeMaterials, currentTier, potions, shield, userTitle, unlockedTitles, achievements, lang, userName, roomId]);

  return { executeTransaction, processTransaction, deleteTransaction, updateTransaction, generateMonthlyReview, spendCoins, addCoinsWithDebtCheck, executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, handleClaimAchievement, unlockAchievement };
};
