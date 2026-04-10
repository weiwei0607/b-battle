import { useCallback, useEffect } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../firebase';
import { CATEGORY_MAP } from '../utils/constants';

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
  currentTier
) => {

  const cooldownThreshold = 2000;

  const spendCoins = useCallback((amount, isPenalty = false) => {
    if (coins >= amount) { setCoins(c => c - amount); return true; }
    if (isPenalty) {
      const leftover = amount - coins;
      setCoins(0); setDebt(d => d + leftover);
      addLog(`🧨 [債務產生] 餘額不足，新增 ${leftover} 債務。稱號鎖定：負債超人！`);
      return true;
    }
    return false;
  }, [coins, setCoins, setDebt, addLog]);

  const addCoinsWithDebtCheck = useCallback((gain) => {
    if (debt > 0) {
      if (gain >= debt) {
        const remaining = gain - debt;
        setDebt(0); setCoins(c => c + remaining);
        addLog(`💰 還清債務！脫離『負債超人』的詛咒。`);
      } else {
        setDebt(d => d - gain);
        addLog(`💰 收入中的 ${gain} 金幣已優先償債。`);
      }
    } else { setCoins(c => c + gain); }
  }, [debt, setDebt, setCoins, addLog]);

  const executeTransaction = async (amount, desc, category, source = "manual") => {
    if (isAiProcessing) return;
    let penaltyHp = 0; let isPreReported = false; let isLying = false;
    const pillar = CATEGORY_MAP[category] || 'expedition';
    const isUnnecessary = ['desire', 'expedition'].includes(pillar);

    if (isSevered) {
      if (isUnnecessary && (persona === 'partner' || persona === 'bestie')) {
        penaltyHp += amount * 2.0;
        setColdWarEndTime(prev => (prev || Date.now()) + 24 * 3600000);
        addLog("💔 [情感背叛] 冷戰期還買享樂品？延長 24 小時！");
      } else {
        penaltyHp += amount * 0.5;
        addLog("🧨 [帶罪記帳] 斷絕期強行記帳造成額外傷害。");
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
      addLog("🤬 [說謊] 領了豪賭金還買？重罰 500 金幣並清空好感度！");
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
        addLog("🧨 [衝動懲罰] 未報備大額消費！加罰 200 金幣。");
      }
    }

    const totalDamage = amount + penaltyHp;
    if (activeMode === 'team5v5') {
      const { setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly } = setTeamSpentStates;
      if (pillar === 'survival') setTeamSpentDaily(p => p + totalDamage);
      else if (pillar === 'progress') setTeamSpentWeekly(p => p + totalDamage);
      else setTeamSpentMonthly(p => p + totalDamage);
    }

    const newEntry = { 
      id: new Date().getTime(), amount, desc, category, pillar, 
      damage: totalDamage, isCrit: penaltyHp > 0, source, 
      time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() 
    };
    setHistory(prev => [newEntry, ...prev]);
    addLog(`${source === 'invoice' ? '🧾' : '⚔️'} [${category}] ${desc} 造成 ${totalDamage.toFixed(0)} 傷害`);
    
    let coinGain = (currentTier === 'prime' ? 20 : 10);
    if (pillar === 'progress') { coinGain *= 2; addLog("✨ [自我進化] 獎勵翻倍！"); }
    addCoinsWithDebtCheck(coinGain);
    setWillpowerExp(e => Math.min(5000, e + 15));
    if (!isSevered) setPersonaStats(p => ({...p, [persona]: {...p[persona], intimacy: Math.min(100, p[persona].intimacy + 1)}}));

    if (apiKey) {
      setIsAiProcessing(true);
      try {
        let promptStr = personaStats[persona].prompt + ` 願望「${wishlist}」。`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `買了 ${desc} (${category}) 花 ${amount}` }] }], systemInstruction: { parts: [{ text: promptStr + "\n限20字。" }] } })
        });
        const result = await response.json();
        setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "紀錄成功。");
      } catch { setAiComment("紀錄完成。"); }
      setIsAiProcessing(false);
    }
  };

  // 🛡️ [戰損修正接口 - 雙重鎖定] 刪除紀錄
  const deleteTransaction = useCallback((id) => {
    setHistory(prev => {
      const target = prev.find(h => h.id === id);
      // 🚨 如果是發票，禁止刪除 (即使前端按鈕失效，Hook 層也要擋住)
      if (target && target.source === 'invoice') {
        alert("🛡️ 誠信警告：電子發票為系統同步之既定事實，禁止抹除！");
        return prev;
      }
      return prev.filter(h => h.id !== id);
    });
    addLog("🗑️ [修正] 移除了一筆手動錯誤紀錄。");
  }, [setHistory, addLog]);

  const updateTransaction = useCallback((id, newCategory) => {
    const newPillar = CATEGORY_MAP[newCategory] || 'expedition';
    setHistory(prev => prev.map(h => {
      if (h.id === id) { return { ...h, category: newCategory, pillar: newPillar }; }
      return h;
    }));
    addLog(`🔧 [修正] 調整紀錄分類為「${newCategory}」。`);
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
      } catch {}
    }
    setIsAiProcessing(false);
    setPendingTx({ amount, desc, category, source });
    setNlpInput("");
  };

  const executeRitual = useCallback((reflectionText) => {
    if (persona === 'asian_parent' && reflectionText.length < 50) return;
    if ((persona === 'peer' || persona === 'instructor') && !spendCoins(500, true)) return;
    if ((persona === 'partner' || persona === 'bestie') && coldWarEndTime && now < coldWarEndTime) return;
    setIsSevered(false); setColdWarEndTime(null); addLog("🛡️ [重生] 關係已修復。"); setHistory([]);
    const { setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly } = setTeamSpentStates;
    setTeamSpentDaily(0); setTeamSpentWeekly(0); setTeamSpentMonthly(0);
  }, [persona, spendCoins, coldWarEndTime, now, setIsSevered, setColdWarEndTime, addLog, setHistory, setTeamSpentStates]);

  const handleClaimChallenge = useCallback((idx) => {
    const challenge = activeChallenges[idx];
    addCoinsWithDebtCheck(500);
    setWillpowerExp(e => e + 200);
    setClaimedAvoidedItems(p => [...p, { item: challenge.item, expiry: now + 86400000 }]);
    setActiveChallenges(p => p.filter((_, i) => i !== idx));
    setAiComment("💰 押金退還。24小時內我會盯著你。");
    addLog(`🕵️ [監控] AI 偵探監控：${challenge.item}`);
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
    addLog(`🧾 [發票同步] 偵測到消費：${item.desc}`);
  }, [setPendingTx, addLog]);

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    if (lastTrackDate && lastTrackDate !== todayStr) {
      const nowTime = new Date();
      const last = new Date(lastTrackDate);
      if (nowTime.getDate() !== last.getDate()) { addLog("📅 每日重置完成。"); setTeamSpentStates.setTeamSpentDaily(0); }
      if (nowTime.getDay() === 1 && nowTime.getDate() !== last.getDate()) { addLog("📅 週一重置完成。"); setTeamSpentStates.setTeamSpentWeekly(0); }
      if (nowTime.getDate() === 1 && nowTime.getMonth() !== last.getMonth()) {
        addLog("📅 每月 1 號重置！"); setTeamSpentStates.setTeamSpentMonthly(0);
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
  }, [lastTrackDate, setLastTrackDate, addLog, setTeamSpentStates, history, setHomeMaterials]);

  useEffect(() => {
    if (activeMode === 'team5v5') {
      const timer = setInterval(() => {
        const events = [{name: "小明", item: "PS5", amount: 15000, cat: "其他", team: 'teammate'}, {name: "敵方A", item: "星巴克", amount: 165, cat: "飲料", team: 'enemy'}, {name: "敵方B", item: "牛排", amount: 1500, cat: "餐飲", team: 'enemy'}];
        const event = events[Math.floor(Math.random() * events.length)];
        const dmg = event.amount;
        const { setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly, setEnemySpentDaily, setEnemySpentWeekly, setEnemySpentMonthly } = setTeamSpentStates;
        if (event.team === 'teammate') { if (event.cat === '餐飲') setTeamSpentDaily(p => p + dmg); else setTeamSpentMonthly(p => p + dmg); addLog(`💩 [戰犯] 隊友『${event.name}』買了 ${event.item}！`); } 
        else if (event.team === 'enemy') { if (event.cat === '餐飲') setEnemySpentDaily(p => p + dmg / 10); else setEnemySpentMonthly(p => p + dmg / 10); addLog(`🔥 [快報] 敵方『${event.name}』防線受損！`); }
      }, 45000);
      return () => clearInterval(timer);
    }
  }, [activeMode, addLog, setTeamSpentStates]);

  useEffect(() => {
    if (!user || isCloudLoading) return;
    const timeout = setTimeout(() => {
      setDoc(doc(db, "users", user.uid), { coins, debt, history, personaStats, persona, exp: willpowerExp, wishlist, severed: isSevered, lastTrackDate, coldWarEndTime, homeMaterials, currentTier }, { merge: true });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [user, isCloudLoading, coins, debt, history, personaStats, persona, willpowerExp, wishlist, isSevered, lastTrackDate, coldWarEndTime, homeMaterials, currentTier]);

  return { executeTransaction, processTransaction, deleteTransaction, updateTransaction, spendCoins, addCoinsWithDebtCheck, executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice };
};
