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

  // 🛡️ [戰略輔助] 計算預算百分比
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

  // 🏆 觸發成就解鎖
  const unlockAchievement = useCallback((id) => {
    if (achievements && achievements[id]?.unlocked) return;
    const medal = ACHIEVEMENTS[id];
    if (!medal) return;

    setAchievements(prev => ({
      ...prev,
      [id]: { unlocked: true, claimed: false, date: new Date().toLocaleDateString() }
    }));
    
    // 彈出全局通知
    setAchievementNotification({ id, name: medal.name, icon: medal.icon });
    addLog(`🏆 [成就達成] ${medal.name}！`);
  }, [achievements, setAchievements, addLog, setAchievementNotification]);

  const handleClaimAchievement = useCallback((id) => {
    const medal = ACHIEVEMENTS[id];
    // 🛡️ 嚴格防止重複領獎
    if (!medal || !achievements || achievements[id]?.claimed) return;

    setAchievements(prev => ({
      ...prev,
      [id]: { ...prev[id], claimed: true }
    }));
    const gain = medal.reward || 100;
    if (debt > 0) {
      if (gain >= debt) { setCoins(c => c + (gain - debt)); setDebt(0); }
      else { setDebt(d => d - gain); }
    } else { setCoins(c => c + gain); }
    addLog(`✨ [領取] 獲得 ${gain} 金幣！`);
  }, [achievements, setAchievements, debt, setCoins, setDebt, addLog]);

  const executeTransaction = async (amount, desc, category, source = "manual") => {
    if (isAiProcessing) return;
    
    // --- 史詩與常規成就觸發邏輯 ---
    unlockAchievement('FIRST_BLOOD');
    if (amount >= 3000) unlockAchievement('BIG_SPENDER');
    
    const totalCount = history.length + 1;
    if (totalCount >= 100) unlockAchievement('LOGS_100');
    if (totalCount >= 1000) unlockAchievement('LOGS_1000');
    if (totalCount >= 10000) unlockAchievement('LOGS_10000');
    if (totalCount >= 100000) unlockAchievement('LOGS_100000');
    if (totalCount >= 1000000) unlockAchievement('LOGS_1000000');
    
    // 檢查深夜與早鳥
    const hours = new Date().getHours();
    if (hours >= 0 && hours < 4) {
      unlockAchievement('NIGHT_OWL');
      if (category === '餐飲' || category === '飲料') unlockAchievement('MIDNIGHT_SNACK');
    }
    if (hours >= 5 && hours < 7) unlockAchievement('EARLY_BIRD');
    
    // 檢查咖啡與超商
    if (desc.includes("咖啡")) {
      const coffeeCount = history.filter(h => h.desc.includes("咖啡")).length + 1;
      if (coffeeCount >= 10) unlockAchievement('CAFFEINE_ADDICT');
    }
    if (desc.match(/7-11|全家|超商|萊爾富/)) {
      const storeCount = history.filter(h => h.desc.match(/7-11|全家|超商|萊爾富/)).length + 1;
      if (storeCount >= 5) unlockAchievement('CONVENIENCE_STORE_FRIEND');
    }
    if (category === '學習') {
      const bCount = history.filter(x => x.category === '學習').length + 1;
      if (bCount >= 3) unlockAchievement('BOOK_WORM');
    }

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
    
    // 🛡️ [鐵血護盾]
    if (shield > 0) {
      const reduction = totalDamage * 0.2;
      totalDamage -= reduction;
      setShield(s => Math.max(0, s - 0.1));
      addLog("🛡️ [護盾] 鐵血護盾啟動，減少 20% 傷害！");
      // 檢查護盾成就
      const shieldUses = history.filter(h => h.shielded).length + 1;
      if (shieldUses >= 5) unlockAchievement('SHIELD_USER');
    }

    const newEntry = { id: new Date().getTime(), amount, desc, category, pillar, damage: totalDamage, isCrit: penaltyHp > 0, source, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString(), shielded: shield > 0 };
    setHistory(prev => [newEntry, ...prev]);
    
    const dmgPct = getDmgPercent(totalDamage, pillar);
    addLog(`${source === 'invoice' ? '🧾' : '⚔️'} [${category}] 造成該支柱 ${dmgPct}% 戰損`);
    
    // 檢查生存成就
    const hpData_survival = 100 - (totalDamage / 10000 * 100); // 簡化估算
    if (hpData_survival < 5) unlockAchievement('SURVIVOR');

    let coinGain = (currentTier === 'prime' ? 20 : 10);
    if (pillar === 'progress') coinGain *= 2;
    addCoinsWithDebtCheck(coinGain);
    
    setWillpowerExp(e => {
      const next = e + 15;
      if (next >= 500) unlockAchievement('LEVEL_UP_1');
      if (next >= 1500) unlockAchievement('LEVEL_UP_2');
      if (next >= 3000) unlockAchievement('WILLPOWER_GOD');
      return Math.min(5000, next);
    });

    if (!isSevered) setPersonaStats(p => ({...p, [persona]: {...p[persona], intimacy: Math.min(100, p[persona].intimacy + 1)}}));

    if (apiKey) {
      setIsAiProcessing(true);
      try {
        const culturalContext = {
          zh: "你是台灣人，用道地繁體中文吐槽，充滿酸民文化或人情味，多用台灣用語。",
          en: "You are a witty New Yorker, use sharp English slang and local idioms.",
          ja: "あなたは江戸っ子、あるいは厳格な日本人です。日本の節約文化に基づいた言い回しを使ってください。"
        };
        const systemInstruction = `你是：${personaStats[persona].prompt}。文化背景：${culturalContext[lang] || culturalContext.zh}。玩家目標：${wishlist}。剛剛消費：${amount} 元買了「${desc}」（分類：${category}）。
          規則：1.直接進入角色。2.根據金額與目標吐槽。3.限20字內。`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `我買了 ${desc} 花 ${amount}` }] }], systemInstruction: { parts: [{ text: systemInstruction }] } })
        });
        const result = await response.json();
        setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "紀錄成功。");
      } catch { setAiComment("紀錄完成。"); }
      setIsAiProcessing(false);
    }
  };

  const generateMonthlyReview = async (monthStr, filteredHistory) => {
    if (!apiKey || isAiProcessing || filteredHistory.length === 0) return;
    setIsAiProcessing(true);
    try {
      const summary = filteredHistory.reduce((acc, h) => { acc[h.pillar] = (acc[h.pillar] || 0) + h.damage; return acc; }, {});
      const total = Object.values(summary).reduce((a, b) => a + b, 0);
      const systemInstruction = `角色：${personaStats[persona].prompt}。總支出 ${total} 元。目標：${wishlist}。回覆限30字。`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `月報：${JSON.stringify(summary)}` }] }], systemInstruction: { parts: [{ text: systemInstruction }] } })
      });
      const result = await response.json();
      setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "分析完畢。");
    } catch { setAiComment("戰報完畢。"); }
    setIsAiProcessing(false);
  };

  const deleteTransaction = useCallback((id) => {
    setHistory(prev => {
      const target = prev.find(h => h.id === id);
      if (!target) return prev;
      if (target.source === 'invoice') { alert("🛡️ 誠信警告：電子發票禁止抹除！"); return prev; }
      
      // 因果律：扣回金幣獎勵
      const penalty = 20; 
      spendCoins(penalty, true);
      addLog(`🗑️ [修正] 移除紀錄，扣回獎勵 ${penalty} 金幣。`);
      
      // 標記可能作弊
      const deleteCount = (parseInt(localStorage.getItem('bb_delete_count')) || 0) + 1;
      localStorage.setItem('bb_delete_count', deleteCount.toString());
      if (deleteCount >= 5) unlockAchievement('KARMA_MASTER');

      return prev.filter(h => h.id !== id);
    });
  }, [setHistory, addLog, spendCoins, unlockAchievement]);

  const updateTransaction = useCallback((id, newCategory) => {
    const newPillar = CATEGORY_MAP[newCategory] || 'expedition';
    setHistory(prev => prev.map(h => h.id === id ? { ...h, category: newCategory, pillar: newPillar } : h));
    addLog(`🔧 [修正] 調整分類為「${newCategory}」。`);
  }, [setHistory, addLog]);

  const processTransaction = async (input, source = "manual") => {
    if (input.trim() === "" || isAiProcessing) return;
    if (input.includes("我想買") || input.includes("挑戰")) {
      const item = input.replace(/我想買|挑戰/g, '').trim() || "奢侈品";
      if (spendCoins(500)) { setActiveChallenges(p => [...p, { item, startTime: now }]); addLog(`🛡️ [挑戰] 暫扣 500 挑戰：${item}`); }
      else { alert("金幣不足 500！"); }
      setNlpInput(""); return;
    }
    setIsAiProcessing(true);
    let amount = parseInt(input.match(/\d+/)?.[0] || 100);
    let desc = input.replace(/\d+/g, '').replace(/買了|花了|塊|元/g, '').trim() || "消費";
    let category = "餐飲";
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `提取品項、金額、分類(餐飲/房租/醫療/水電/交通/保險/日用品/學習/健身/書籍/軟體/課程/工作工具/飲料/零食/娛樂/遊戲/菸酒/盲盒/社交/購物/旅行/大宗/禮物): ${input}` }] }] })
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
    executeTransaction(100, `認輸: ${challenge.item}`, "其他");
  }, [activeChallenges, setActiveChallenges, executeTransaction]);

  const simulateInvoice = useCallback(() => {
    const items = [{ desc: "7-11 御飯糰", amount: 35, category: "餐飲" }, { desc: "全家 拿鐵咖啡", amount: 55, category: "飲料" }, { desc: "麥當勞 套餐", amount: 149, category: "餐飲" }, { desc: "蝦皮 購物", amount: 850, category: "購物" }];
    const item = items[Math.floor(Math.random() * items.length)];
    setPendingTx({ ...item, source: "invoice" });
    addLog(`🧾 偵測到消費：${item.desc}`);
  }, [setPendingTx, addLog]);

  // 🤖 鏡像機器人系統：模擬用戶行為
  useEffect(() => {
    if (activeMode === 'team5v5') {
      const timer = setInterval(() => {
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
    if (personaStats['asian_parent']?.intimacy >= 80) unlockAchievement('MOM_LOVES_ME');
    if (achievements && Object.values(achievements).filter(a => a.unlocked).length >= 5) unlockAchievement('COLLECTOR');
    if (coins === 0 && debt === 0) unlockAchievement('ZERO_HERO');
  }, [coins, debt, personaStats, persona, achievements, unlockAchievement]);

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    if (lastTrackDate && lastTrackDate !== todayStr) {
      const nowTime = new Date();
      const last = new Date(lastTrackDate);
      if (nowTime.getDate() !== last.getDate()) { 
        addLog("📅 每日重置。"); 
        setTeamSpentStates.setTeamSpentDaily(0); 
        
        const lastDayStr = last.toLocaleDateString();
        const lastDaySpent = history.filter(h => h.date === lastDayStr && h.pillar === 'survival').reduce((s, h) => s + h.amount, 0);
        if (lastDaySpent > 0 && lastDaySpent < 200) {
          unlockAchievement('SAVING_EXPERT');
        }
      }
      if (nowTime.getDay() === 1 && nowTime.getDate() !== last.getDate()) { addLog("📅 週重置。"); setTeamSpentStates.setTeamSpentWeekly(0); }
      if (nowTime.getDate() === 1 && nowTime.getMonth() !== last.getMonth()) {
        addLog("📅 月重置！"); setTeamSpentStates.setTeamSpentMonthly(0);
        const lastMonthStr = lastTrackDate.slice(0, 7);
        const monthlySpent = history.filter(h => h.date && h.date.startsWith(lastMonthStr)).reduce((s, h) => s + h.damage, 0);
        const totalMonthlyBudget = 30000;
        const savingsPercent = totalMonthlyBudget > 0 ? ((totalMonthlyBudget - monthlySpent) / totalMonthlyBudget * 100) : 0;
        let gain = 0;
        if (savingsPercent >= 20) gain = 10000; else if (savingsPercent >= 10) gain = 2000;
        if (gain > 0) { setHomeMaterials(prev => prev + gain); addLog(`🏛️ 月結獲得 ${gain} 建材！`); }
      }
    }
    setLastTrackDate(todayStr);
  }, [lastTrackDate, setLastTrackDate, addLog, setTeamSpentStates, history, setHomeMaterials, unlockAchievement]);

  useEffect(() => {
    if (!user || isCloudLoading) return;
    const timeout = setTimeout(() => {
      setDoc(doc(db, "users", user.uid), { 
        coins, debt, history, personaStats, persona, 
        exp: willpowerExp, wishlist, severed: isSevered, 
        lastTrackDate, coldWarEndTime, homeMaterials, 
        currentTier, potions, shield, userTitle, unlockedTitles,
        achievements, lang
      }, { merge: true });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user, isCloudLoading, coins, debt, history, personaStats, persona, willpowerExp, wishlist, isSevered, lastTrackDate, coldWarEndTime, homeMaterials, currentTier, potions, shield, userTitle, unlockedTitles, achievements, lang]);

  return { executeTransaction, processTransaction, deleteTransaction, updateTransaction, generateMonthlyReview, spendCoins, addCoinsWithDebtCheck, executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, handleClaimAchievement, unlockAchievement };
};
