import { useCallback, useEffect } from 'react';
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
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
  lang,
  userName, roomId, setRoomId, setActiveMode
) => {

  // 🚀 [即時連線邏輯] 監聽戰區數據 (限時 5 分鐘)
  useEffect(() => {
    if ((activeMode === 'team5v5' || activeMode === '1v1') && roomId) {
      const roomRef = doc(db, "rooms", roomId);
      const unsubscribe = onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const nowTime = Date.now();
          if (data.createdAt && nowTime - data.createdAt > 300000) {
            addLog(`⌛ [系統] 戰區 ${roomId} 已過期。`);
            setRoomId("");
            setActiveMode('selection');
            return;
          }
          const allPlayers = data.players || {};
          const othersDaily = Object.values(allPlayers)
            .filter(p => p.uid !== user?.uid)
            .reduce((s, p) => s + (p.daily || 0), 0);
          setTeamSpentStates.setEnemySpentDaily(othersDaily);
        } else {
          setDoc(roomRef, { createdAt: Date.now(), players: {} }, { merge: true });
        }
      });
      return () => unsubscribe();
    }
  }, [activeMode, roomId, user, setRoomId, setActiveMode, addLog, setTeamSpentStates]);

  // 🚀 [數據上傳邏輯]
  useEffect(() => {
    if ((activeMode === 'team5v5' || activeMode === '1v1') && roomId && roomId !== "MATCHMAKING_QUEUE" && user) {
      const todayStr = new Date().toLocaleDateString();
      const myDaily = history.filter(h => h.date === todayStr).reduce((s, h) => s + h.amount, 0);
      setDoc(doc(db, "rooms", roomId), { 
        [`players.${user.uid}`]: { uid: user.uid, name: userName, daily: myDaily, lastUpdate: Date.now() }
      }, { merge: true });
    }
  }, [history, activeMode, roomId, user, userName]);

  // 🚀 [5v5 隨機匹配與 Bot 補位邏輯]
  useEffect(() => {
    if (roomId === "MATCHMAKING_QUEUE" && user) {
      addLog("🔍 [系統] 正在搜尋全球戰友...");
      
      const matchmakingTimer = setTimeout(() => {
        // 超時處理：自動補 Bot
        const botRoomId = "BOT_" + Math.floor(1000 + Math.random() * 9000);
        addLog(`🤖 [系統] 真人玩家不足，已加入虛擬戰友進入戰場！`);
        
        const bots = {};
        for (let i = 1; i <= 9; i++) {
          const botId = `bot_${i}`;
          bots[botId] = { uid: botId, name: `省錢機器人 #${i}`, daily: Math.floor(Math.random() * 500), lastUpdate: Date.now() };
        }
        
        setDoc(doc(db, "rooms", botRoomId), {
          createdAt: Date.now(),
          players: {
            ...bots,
            [user.uid]: { uid: user.uid, name: userName, daily: 0, lastUpdate: Date.now() }
          }
        });
        
        setRoomId(botRoomId);
        setActiveMode('team5v5');
      }, 8000); // 8秒超時

      return () => clearTimeout(matchmakingTimer);
    }
  }, [roomId, user, userName, setRoomId, setActiveMode, addLog]);

  const cooldownThreshold = 2000;

  const getDmgPercent = (amount, pillar) => {
    const limits = { survival: 10000, progress: 5000, desire: 3000, expedition: 15000 };
    const limit = limits[pillar] || 10000;
    return ((amount / limit) * 100).toFixed(1);
  };

  const spendCoins = useCallback((amount, isPenalty = false) => {
    if (coins >= amount) { setCoins(c => c - amount); return true; }
    if (isPenalty) {
      const leftover = amount - coins;
      setCoins(0); setDebt(d => d + leftover);
      addLog(`🧨 [債務產生] 餘額不足，新增 ${leftover} 債務。`);
      return true;
    }
    return false;
  }, [coins, setCoins, setDebt, addLog]);

  const addCoinsWithDebtCheck = useCallback((gain) => {
    if (debt > 0) {
      if (gain >= debt) {
        const remaining = gain - debt;
        setDebt(0); setCoins(c => c + remaining);
        addLog(`💰 還清債務！`);
      } else {
        setDebt(d => d - gain);
        addLog(`💰 收入優先償債。`);
      }
    } else { setCoins(c => c + gain); }
  }, [debt, setDebt, setCoins, addLog]);

  const unlockAchievement = useCallback((id) => {
    if (achievements && achievements[id]?.unlocked) return;
    const medal = ACHIEVEMENTS[id];
    if (!medal) return;
    setAchievements(prev => ({ ...prev, [id]: { unlocked: true, claimed: false, date: new Date().toLocaleDateString() } }));
    setAchievementNotification({ id, name: medal.name, icon: medal.icon });
    addLog(`🏆 [成就達成] ${medal.name}！`);
  }, [achievements, setAchievements, addLog, setAchievementNotification]);

  const handleClaimAchievement = useCallback((id) => {
    const medal = ACHIEVEMENTS[id];
    if (!medal || !achievements || achievements[id]?.claimed) return;
    setAchievements(prev => ({ ...prev, [id]: { ...prev[id], claimed: true } }));
    addCoinsWithDebtCheck(medal.reward || 100);
    addLog(`✨ [領取獎勵] 獲得金幣！`);
  }, [achievements, setAchievements, addCoinsWithDebtCheck, addLog]);

  const executeTransaction = async (amount, desc, category, source = "manual") => {
    if (isAiProcessing) return;
    
    // 檢查成就
    unlockAchievement('FIRST_BLOOD');
    if (amount >= 3000) unlockAchievement('BIG_SPENDER');
    const totalCount = history.length + 1;
    if (totalCount >= 10) unlockAchievement('LOGS_10');
    if (totalCount >= 100) unlockAchievement('LOGS_100');
    if (totalCount >= 1000) unlockAchievement('LOGS_1000');

    let penaltyHp = 0; let isPreReported = false; let isLying = false;
    const pillar = CATEGORY_MAP[category] || 'expedition';
    const isUnnecessary = ['desire', 'expedition'].includes(pillar);

    if (isSevered) {
      if (isUnnecessary && (persona === 'partner' || persona === 'bestie')) {
        penaltyHp += amount * 2.0;
        setColdWarEndTime(prev => (prev || Date.now()) + 24 * 3600000);
        addLog("💔 [情感背叛] 冷戰期還買享樂品！");
      } else {
        penaltyHp += amount * 0.5;
        addLog("🧨 [帶罪記帳] 斷絕期強行記帳。");
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
      addLog("🤬 [說謊] 重罰 500 金幣！");
    } else {
      for (let i = 0; i < activeChallenges.length; i++) {
        if (desc.includes(activeChallenges[i].item)) {
          isPreReported = true;
          setActiveChallenges(p => p.filter((_, idx) => idx !== i));
          addLog(`🚩 [報備通過] 買了 ${desc}。`);
          break;
        }
      }
      if (amount >= cooldownThreshold && !isPreReported) {
        spendCoins(200, true);
        penaltyHp += amount * 0.2;
        addLog("🧨 [衝動懲罰] 未報備大額消費！");
      }
    }

    let totalDamage = amount + penaltyHp;
    if (shield > 0) {
      totalDamage *= 0.8; 
      setShield(s => Math.max(0, s - 0.1));
      addLog("🛡️ [護盾] 鐵血護盾啟動！");
      unlockAchievement('SHIELD_USER');
    }

    const newEntry = { id: Date.now(), amount, desc, category, pillar, damage: totalDamage, isCrit: penaltyHp > 0, source, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString(), shielded: shield > 0 };
    setHistory(prev => [newEntry, ...prev]);
    addLog(`${source === 'invoice' ? '🧾' : '⚔️'} 造成支柱 ${getDmgPercent(totalDamage, pillar)}% 戰損`);
    
    if (totalDamage > 5000) unlockAchievement('SURVIVOR');

    addCoinsWithDebtCheck(pillar === 'progress' ? 40 : 20);
    setWillpowerExp(e => {
      const next = e + 15;
      if (next >= 3000) unlockAchievement('WILLPOWER_GOD');
      return Math.min(1000000, next);
    });

    if (!isSevered) setPersonaStats(p => ({...p, [persona]: {...p[persona], intimacy: Math.min(100, p[persona].intimacy + 1)}}));

    if (apiKey) {
      setIsAiProcessing(true);
      try {
        const prompt = `你是：${personaStats[persona].prompt}。願望：${wishlist}。消費：${amount}元買「${desc}」。規則：限20字內吐槽。`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Bought ${desc}` }] }], systemInstruction: { parts: [{ text: prompt }] } })
        });
        const result = await res.json();
        setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "紀錄完成。");
      } catch { setAiComment("Done."); }
      setIsAiProcessing(false);
    }
  };

  const generateMonthlyReview = async (monthStr, filteredHistory) => {
    if (!apiKey || isAiProcessing || filteredHistory.length === 0) return;
    setIsAiProcessing(true);
    try {
      const summary = filteredHistory.reduce((acc, h) => { acc[h.pillar] = (acc[h.pillar] || 0) + h.damage; return acc; }, {});
      const total = Object.values(summary).reduce((a, b) => a + b, 0);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `月報：${JSON.stringify(summary)}` }] }], systemInstruction: { parts: [{ text: `角色：${personaStats[persona].prompt}。回覆限30字。` }] } })
      });
      const result = await res.json();
      setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "分析完畢。");
    } catch { setAiComment("Done."); }
    setIsAiProcessing(false);
  };

  const deleteTransaction = useCallback((id) => {
    setHistory(prev => {
      const target = prev.find(h => h.id === id);
      if (!target) return prev;
      if (target.source === 'invoice') { alert("🛡️ 禁止抹除！"); return prev; }
      spendCoins(20, true);
      addLog(`🗑️ [業力] 移除紀錄，扣回獎勵 20。`);
      const deleteCount = (parseInt(localStorage.getItem('bb_v3_delete_count')) || 0) + 1;
      localStorage.setItem('bb_v3_delete_count', deleteCount.toString());
      if (deleteCount >= 5) unlockAchievement('KARMA_MASTER');
      return prev.filter(h => h.id !== id);
    });
  }, [setHistory, addLog, spendCoins, unlockAchievement]);

  const updateTransaction = useCallback((id, newCategory) => {
    const newPillar = CATEGORY_MAP[newCategory] || 'expedition';
    setHistory(prev => prev.map(h => h.id === id ? { ...h, category: newCategory, pillar: newPillar } : h));
    addLog(`🔧 [修正] 調整分類。`);
  }, [setHistory, addLog]);

  const processTransaction = async (input, source = "manual") => {
    if (input.trim() === "" || isAiProcessing) return;
    if (input.includes("我想買") || input.includes("挑戰")) {
      const item = input.replace(/我想買|挑戰/g, '').trim() || "奢侈品";
      if (spendCoins(500)) { setActiveChallenges(p => [...p, { item, startTime: now }]); addLog(`🛡️ [挑戰] 暫扣 500：${item}`); }
      else { alert("金幣不足！"); }
      setNlpInput(""); return;
    }
    setIsAiProcessing(true);
    let amount = parseInt(input.match(/\d+/)?.[0] || 100);
    let desc = input.replace(/\d+/g, '').replace(/買了|花了|塊|元/g, '').trim() || "消費";
    let category = "cat_food";
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `提取品項、金額、Key化分類: ${input}` }] }] })
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
    setIsSevered(false); setColdWarEndTime(null); addLog("🛡️ [重生] 關係修復。"); setHistory([]);
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
    setAiComment("💰 押金退還。");
    addLog(`🕵️ AI 偵探監控：${challenge.item}`);
  }, [activeChallenges, addCoinsWithDebtCheck, setWillpowerExp, setClaimedAvoidedItems, setActiveChallenges, setAiComment, addLog, now]);

  const handleGiveUpChallenge = useCallback((idx) => {
    const challenge = activeChallenges[idx];
    setActiveChallenges(p => p.filter((_, i) => i !== idx));
    executeTransaction(100, `認輸: ${challenge.item}`, "cat_other");
  }, [activeChallenges, setActiveChallenges, executeTransaction]);

  const simulateInvoice = useCallback(() => {
    const items = [{ desc: "御飯糰", amount: 35, category: "cat_food" }, { desc: "拿鐵", amount: 55, category: "cat_drink" }, { desc: "網購", amount: 850, category: "cat_shop" }];
    const item = items[Math.floor(Math.random() * items.length)];
    setPendingTx({ ...item, source: "invoice" });
    addLog(`🧾 偵測到消費：${item.desc}`);
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
          addLog(`👥 [鏡像] 『${botName}』模仿你的習慣買了「${favCat}」！`);
        } else {
          if (CATEGORY_MAP[favCat] === 'survival') setEnemySpentDaily(p => p + dmg); else setEnemySpentMonthly(p => p + dmg);
          addLog(`⚔️ [對抗] 『${botName}』也買了「${favCat}」，對方支柱受損！`);
        }
      }, 40000); 
      return () => clearInterval(timer);
    }
  }, [activeMode, history, setTeamSpentStates, addLog, roomId]);

  useEffect(() => {
    if (coins >= 10000) unlockAchievement('WEALTHY_WARRIOR');
    if (personaStats[persona]?.intimacy >= 100) unlockAchievement('LOYAL_PARTNER');
    if (personaStats['asian_parent']?.intimacy >= 80) unlockAchievement('MOM_LOVES_ME');
    if (achievements && Object.values(achievements).filter(a => a.unlocked).length >= 5) unlockAchievement('COLLECTOR');
    if (history.length > 0 && coins === 0 && debt === 0) unlockAchievement('ZERO_HERO');
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
        addLog("🌪️ [季度重置] 意志力賽季結算！");
        let bonus = 0;
        if (debt >= 500) { addLog("🕊️ [債務特赦] 重置為 2000 金幣，努力重新開始！"); setDebt(0); }
        else if (coins > 5000) { 
          bonus = Math.floor((coins - 2000) * 0.1); 
          setHomeMaterials(prev => prev + bonus * 10);
          addLog(`🏰 [財富轉換] 結餘轉換為 ${bonus * 10} 建材，起始金幣 2000+${bonus}！`);
        }
        setCoins(2000 + bonus);
        localStorage.setItem('bb_v3_last_reset_season', seasonKey);
      }

      if (nowTime.getDate() !== last.getDate()) { 
        addLog("📅 每日重置。"); setTeamSpentStates.setTeamSpentDaily(0); 
        const lastDaySpent = history.filter(h => h.date === last.toLocaleDateString() && h.pillar === 'survival').reduce((s, h) => s + h.amount, 0);
        if (lastDaySpent > 0 && lastDaySpent < 200) unlockAchievement('SAVING_EXPERT');
      }
      if (nowTime.getDay() === 1 && nowTime.getDate() !== last.getDate()) { addLog("📅 週重置。"); setTeamSpentStates.setTeamSpentWeekly(0); }
      if (nowTime.getDate() === 1 && nowTime.getMonth() !== last.getMonth()) {
        addLog("📅 月重置！"); setTeamSpentStates.setTeamSpentMonthly(0);
        const monthlySpent = history.filter(h => h.date && h.date.startsWith(lastTrackDate.slice(0, 7))).reduce((s, h) => s + h.damage, 0);
        const gain = monthlySpent < 20000 ? 5000 : 2000;
        if (gain > 0) { setHomeMaterials(prev => prev + gain); addLog(`🏛️ 月結獲得 ${gain} 建材！`); }
      }
    }
    setLastTrackDate(todayStr);
  }, [lastTrackDate, setLastTrackDate, addLog, setTeamSpentStates, history, setHomeMaterials, unlockAchievement, coins, debt, setCoins, setDebt]);

  useEffect(() => {
    if (!user || isCloudLoading) return;
    const timeout = setTimeout(() => {
      setDoc(doc(db, "users", user.uid), { 
        coins, debt, history, personaStats, persona, exp: willpowerExp, wishlist, lastTrackDate, homeMaterials, currentTier, potions, shield, userTitle, unlockedTitles, achievements, lang, userName, roomId 
      }, { merge: true });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user, isCloudLoading, coins, debt, history, personaStats, persona, willpowerExp, wishlist, lastTrackDate, homeMaterials, currentTier, potions, shield, userTitle, unlockedTitles, achievements, lang, userName, roomId]);

  return { executeTransaction, processTransaction, deleteTransaction, updateTransaction, generateMonthlyReview, spendCoins, addCoinsWithDebtCheck, executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, handleClaimAchievement, unlockAchievement };
};
