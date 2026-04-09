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
  setPendingTx, setIsAiProcessing,
  setNlpInput, now,
  homeMaterials, setHomeMaterials
) => {

  const cooldownThreshold = 2000;

  const spendCoins = useCallback((amount, isPenalty = false) => {
    if (coins >= amount) { setCoins(c => c - amount); return true; }
    if (isPenalty) {
      const leftover = amount - coins;
      setCoins(0); setDebt(d => d + leftover);
      addLog(`🧨 [債務產生] 金幣不足，新增 ${leftover} 債務。`);
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
        addLog(`💰 收入中的 ${gain} 金幣已優先償債。`);
      }
    } else { setCoins(c => c + gain); }
  }, [debt, setDebt, setCoins, addLog]);

  const executeTransaction = async (amount, desc, category, source = "manual") => {
    let penaltyHp = 0; let isPreReported = false; let isLying = false;
    
    // 辨識是否為不必要消費 (慾望與遠征)
    const pillar = CATEGORY_MAP[category] || 'expedition';
    const isUnnecessary = ['desire', 'expedition'].includes(pillar);

    if (isSevered) {
      if (isUnnecessary && (persona === 'partner' || persona === 'bestie')) {
        penaltyHp += amount * 2.0;
        setColdWarEndTime(prev => (prev || Date.now()) + 24 * 3600000);
        addLog("💔 [情感背叛] 冷戰期還買享樂品？倒數延長 24 小時！");
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
      setPersonaStats(p => ({...p, [persona]: {...p[persona], intimacy: Math.max(0, p[persona].intimacy - 20)}}));
      penaltyHp += amount * 2;
      addLog("🤬 [說謊] 領了豪賭金還買？重罰 500 金幣！");
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
        addLog("🧨 [大額未報備] 加罰 200 金幣。");
      }
    }

    const totalDamage = amount + penaltyHp;
    if (activeMode === 'team5v5') {
      const { setTeamSpentDaily, setTeamSpentWeekly, setTeamSpentMonthly } = setTeamSpentStates;
      if (pillar === 'survival') setTeamSpentDaily(p => p + totalDamage);
      else if (pillar === 'progress') setTeamSpentWeekly(p => p + totalDamage);
      else setTeamSpentMonthly(p => p + totalDamage); // 慾望與遠征共用月池
    }

    const newEntry = { 
      id: Date.now(), amount, desc, category, 
      pillar, damage: totalDamage, isCrit: penaltyHp > 0, source, 
      time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() 
    };
    setHistory(prev => [newEntry, ...prev]);
    addLog(`${source === 'invoice' ? '🧾' : '⚔️'} [${category}] ${desc} 造成 ${totalDamage.toFixed(0)} 傷害`);
    
    // 不同神柱的獎勵不同
    let coinGain = 10;
    if (pillar === 'progress') { coinGain = 20; addLog("✨ [自我進化] 教練認可這筆消費，金幣獎勵加倍！"); }
    addCoinsWithDebtCheck(coinGain);
    setWillpowerExp(e => Math.min(5000, e + 15));
    
    if (!isSevered) {
      setPersonaStats(p => ({...p, [persona]: {...p[persona], intimacy: Math.min(100, p[persona].intimacy + 1)}}));
    }

    if (apiKey) {
      setIsAiProcessing(true);
      try {
        let promptStr = personaStats[persona].prompt + ` 願望「${wishlist}」。`;
        if (pillar === 'progress') promptStr += " 這是自我進化的投資，請給予肯定。";
        if (isSevered) promptStr += " 目前關係斷絕中，語氣極度冷酷。";
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `買了 ${desc} (${category}) 花 ${amount}` }] }], systemInstruction: { parts: [{ text: promptStr + "\n限20字。" }] } })
        });
        const result = await response.json();
        setAiComment(result.candidates?.[0]?.content?.parts?.[0]?.text || "紀錄成功。");
      } catch { setAiComment("防線紀錄完成。"); }
      setIsAiProcessing(false);
    }
  };

  const processTransaction = async (input, source = "manual") => {
    if (input.trim() === "" || isAiProcessing) return;
    if (input.includes("我想買") || input.includes("挑戰")) {
      const item = input.replace(/我想買|挑戰/g, '').trim() || "奢侈品";
      if (spendCoins(500)) { setActiveChallenges(p => [...p, { item, startTime: now }]); addLog(`🛡️ [挑戰] 扣 500 挑戰：${item}`); }
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
          body: JSON.stringify({ contents: [{ parts: [{ text: `提取品項、金額、分類。分類只能是：餐飲、房租、醫療、水電、交通、保險、日用品、學習、健身、書籍、軟體、課程、工作工具、飲料、零食、娛樂、遊戲、菸酒、盲盒、社交、購物、旅行、大宗、禮物。輸入：${input}` }] }] })
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
  }, [persona, spendCoins, coldWarEndTime, now, setIsSevered, setColdWarEndTime, addLog, setHistory]);

  // 每月結算轉換為建材
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString();
    if (lastTrackDate && lastTrackDate !== todayStr) {
      const nowTime = new Date();
      const last = new Date(lastTrackDate);
      if (nowTime.getDate() === 1 && nowTime.getMonth() !== last.getMonth()) {
        // 月初結算：剩餘 HP 轉建材
        // 這裡簡單計算：總預算 - 總損害 = 建材獲得
        // 假設每月基礎預算 30000
        const monthlySpent = history.filter(h => h.date.startsWith(lastTrackDate.slice(0,7))).reduce((s,h)=>s+h.damage, 0);
        const gain = Math.max(0, 30000 - monthlySpent);
        setHomeMaterials(prev => prev + gain);
        addLog(`🏛️ [月度結算] 本月守住了 ${gain.toFixed(0)} 資源，已轉化為領地建材！`);
      }
    }
    setLastTrackDate(todayStr);
  }, [lastTrackDate, history, setHomeMaterials, addLog, setLastTrackDate]);

  return { executeTransaction, processTransaction, spendCoins, addCoinsWithDebtCheck, executeRitual };
};
