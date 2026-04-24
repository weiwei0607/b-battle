/**
 * useFirebaseSync
 * 職責：所有 Firestore 讀寫操作的唯一入口。
 *
 * 設計原則：
 * - 直接從 Zustand stores 讀取需要備份的資料，不靠外部傳參
 * - 提供 sync* 函式供 useBattleLogic 在執行業務邏輯後呼叫
 * - 所有 setDoc / deleteDoc / updateDoc 的 .catch(() => {}) 封在這裡，
 *   呼叫端不需要自己 try/catch
 */
import { useEffect, useCallback } from 'react';
import {
  doc, setDoc, deleteDoc, updateDoc,
  getDocs, collection, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUserStore } from '../stores/useUserStore';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useBattleStore } from '../stores/useBattleStore';
import { save } from '../stores/storage';

export const useFirebaseSync = () => {
  // ── 從 Zustand 取需要的資料 ────────────────────────────────────────────
  const {
    user, lang, userName,
    persona, personaStats, achievements,
    unlockedTitles, userTitle, userFrame,
    currentTier, isStudent, currency,
    wishlist, wishlistGoal, homeMaterials,
  } = useUserStore();

  const {
    coins, debt, willpowerExp,
    shield, potions,
    weeklyPools, monthlyPools,
    insuranceExpiry, hasZenSofa,
    history,
  } = useFinanceStore();

  const {
    isCloudLoading,
    activeMode, roomId, setRoomId, setActiveMode,
    addToBattleLog,
    setEnemySpentDaily, setEnemySpentWeekly, setEnemySpentMonthly,
  } = useBattleStore();

  // ── 1. 定時備份使用者主資料（debounce 2s，不含 history subcollection）──
  useEffect(() => {
    if (!user || isCloudLoading) return;
    const timeout = setTimeout(() => {
      const nowTime = Date.now();
      setDoc(
        doc(db, 'users', user.uid),
        {
          coins, debt, personaStats, persona,
          exp: willpowerExp, wishlist, wishlistGoal,
          homeMaterials, currentTier,
          potions, shield, userTitle, userFrame,
          unlockedTitles, achievements, lang, userName, 
          isStudent, currency, insuranceExpiry, hasZenSofa,
          roomId,
          updatedAt: nowTime,
        },
        { merge: true }
      ).then(() => {
        save('updatedAt', nowTime);
      }).catch((err) => console.error("Firebase Sync Error:", err));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [
    user, isCloudLoading,
    coins, debt, personaStats, persona, willpowerExp, wishlist, wishlistGoal,
    homeMaterials, currentTier, potions, shield, userTitle, userFrame,
    unlockedTitles, achievements, lang, userName, isStudent, currency,
    insuranceExpiry, hasZenSofa, roomId,
  ]);

  // ── 2. 監聽房間（Firestore onSnapshot），同步對手 HP ──────────────────────
  useEffect(() => {
    if (!roomId || roomId === 'MATCHMAKING_QUEUE') {
      setEnemySpentDaily(-1);
      setEnemySpentWeekly(-1);
      setEnemySpentMonthly(-1);
      return;
    }
    if (activeMode !== 'team5v5' && activeMode !== '1v1') return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsub = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.createdAt && Date.now() - data.createdAt > 300_000) {
          addToBattleLog(`⌛ [System] Room ${roomId} expired.`);
          setRoomId('');
          setActiveMode('selection');
          return;
        }
        const others = Object.values(data.players || {}).filter(
          (p) => p.uid !== user?.uid
        );
        if (others.length > 0) {
          const avg = (key) =>
            others.reduce((s, p) => s + (p[key] ?? 100), 0) / others.length;
          setEnemySpentDaily(avg('hpSurvival'));
          setEnemySpentWeekly(avg('hpProgress'));
          setEnemySpentMonthly((avg('hpDesire') + avg('hpExpedition')) / 2);
        } else {
          setEnemySpentDaily(-1);
          setEnemySpentWeekly(-1);
          setEnemySpentMonthly(-1);
        }
      } else {
        setDoc(roomRef, { createdAt: Date.now(), players: {} }, { merge: true }).catch(() => {});
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, roomId, user?.uid]); // 只用 stable 值，避免 Zustand selector 引用變化導致無限重訂閱

  // ── 3. 上傳自己的 HP 百分比到房間 ────────────────────────────────────────
  useEffect(() => {
    if (
      (activeMode !== 'team5v5' && activeMode !== '1v1') ||
      !roomId || roomId === 'MATCHMAKING_QUEUE' || !user
    ) return;

    const nowDate = new Date();
    const todayStr = nowDate.toLocaleDateString();
    const dayOfWeek = nowDate.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(nowDate);
    weekStart.setDate(nowDate.getDate() - daysFromMonday);
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);

    const limits = {
      survival:   (weeklyPools.food?.limit  || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit || 0),
      progress:   (monthlyPools.education?.limit || 0),
      desire:     (weeklyPools.social?.limit    || 0),
      expedition: (weeklyPools.shopping?.limit  || 0),
    };

    const myDaily   = history.filter((h) => h.date === todayStr).reduce((s, h) => s + h.amount, 0);
    const myWeekly  = history.filter((h) => new Date(h.date) >= weekStart).reduce((s, h) => s + h.amount, 0);
    const myMonthly = history.filter((h) => new Date(h.date) >= monthStart).reduce((s, h) => s + h.amount, 0);

    const hpSurvival   = Math.max(0, 100 - (myDaily   / ((limits.survival * 5)   || 1)) * 100);
    const hpProgress   = Math.max(0, 100 - (myWeekly  / ((limits.progress * 5)   || 1)) * 100);
    const hpDesire     = Math.max(0, 100 - (myMonthly / ((limits.desire * 5)     || 1)) * 100);
    const hpExpedition = Math.max(0, 100 - (myMonthly / ((limits.expedition * 5) || 1)) * 100);

    setDoc(
      doc(db, 'rooms', roomId),
      {
        [`players.${user.uid}`]: {
          uid: user.uid, name: userName,
          hpSurvival, hpProgress, hpDesire, hpExpedition,
          lastUpdate: Date.now(),
        },
      },
      { merge: true }
    ).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, activeMode, roomId, user?.uid, userName, weeklyPools, monthlyPools]);

  // ── 4. 隨機匹配與 Bot 補位 ────────────────────────────────────────────────
  useEffect(() => {
    if (roomId !== 'MATCHMAKING_QUEUE' || !user) return;
    addToBattleLog('🔍 [System] Searching for warriors...');

    const timer = setTimeout(() => {
      const botRoomId = 'BOT_' + Math.floor(1000 + Math.random() * 9000);
      addToBattleLog('🤖 [System] Bots joined the battle!');

      const bots = Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => {
          const id = `bot_${i + 1}`;
          const name = lang === 'zh' ? `省錢機器人 #${i + 1}` : lang === 'ja' ? `節約ロボット #${i + 1}` : `Saving Bot #${i + 1}`;
          return [id, {
            uid: id, name,
            hpSurvival:   Math.floor(40 + Math.random() * 60),
            hpProgress:   Math.floor(40 + Math.random() * 60),
            hpDesire:     Math.floor(40 + Math.random() * 60),
            hpExpedition: Math.floor(40 + Math.random() * 60),
            lastUpdate: Date.now(),
          }];
        })
      );

      setDoc(doc(db, 'rooms', botRoomId), {
        createdAt: Date.now(),
        players: {
          ...bots,
          [user.uid]: { uid: user.uid, name: userName, hpSurvival: 100, hpProgress: 100, hpDesire: 100, hpExpedition: 100, lastUpdate: Date.now() },
        },
      }).catch(() => {});

      setRoomId(botRoomId);
      setActiveMode('team5v5');
    }, 8000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.uid, userName, lang]); // setRoomId / setActiveMode / addToBattleLog 來自 Zustand 為 stable ref

  // ── 同步函式（供 useBattleLogic 呼叫）────────────────────────────────────

  const syncNewTransaction = useCallback((entry) => {
    if (!user) return;
    setDoc(doc(db, 'users', user.uid, 'history', entry.id.toString()), entry).catch(() => {});
  }, [user]);

  const syncDeleteTransaction = useCallback((id) => {
    if (!user) return;
    deleteDoc(doc(db, 'users', user.uid, 'history', id.toString())).catch(() => {});
  }, [user]);

  const syncUpdateTransaction = useCallback((id, patch) => {
    if (!user) return;
    updateDoc(doc(db, 'users', user.uid, 'history', id.toString()), patch).catch(() => {});
  }, [user]);

  const syncDeleteAllHistory = useCallback(async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, 'users', user.uid, 'history'));
    snap.docs.forEach((d) => deleteDoc(d.ref).catch(() => {}));
  }, [user]);

  return {
    syncNewTransaction,
    syncDeleteTransaction,
    syncUpdateTransaction,
    syncDeleteAllHistory,
  };
};
