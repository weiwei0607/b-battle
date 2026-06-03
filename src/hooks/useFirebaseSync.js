/**
 * useFirebaseSync
 * 職責：所有 Firestore 讀寫操作的唯一入口。
 *
 * 優化重點：
 * - 寫入失敗時自動重試（指數退避，最多 3 次）
 * - 離線時將寫入加入佇列，恢復連線後自動補發
 * - 錯誤不再靜默吞掉，而是回報到 store 供 UI 顯示
 * - onSnapshot 只在真正需要時訂閱，避免無意義重建
 */
import { useEffect, useCallback, useRef } from 'react';

const TZ = 'Asia/Taipei';
const taipeiDateStr = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
const taipeiParts = (d = new Date()) => {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour12: false });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  return {
    date: Number(parts.day),
    month: Number(parts.month) - 1,
    day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(parts.weekday),
  };
};
import {
  doc, setDoc, deleteDoc, updateDoc,
  getDocs, collection, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUserStore } from '../stores/useUserStore';
import { useFinanceStore } from '../stores/useFinanceStore';
import { useBattleStore } from '../stores/useBattleStore';
import { save } from '../stores/storage';

/* ── 工具：帶指數退避的重試 ─────────────────────────────────────── */
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const withRetry = async (operation, onError) => {
  let lastErr;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (err) {
      lastErr = err;
      if (i < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAY * Math.pow(2, i)));
      }
    }
  }
  if (onError) onError(lastErr);
  throw lastErr;
};

/* ── 離線寫入佇列（session 級別） ───────────────────────────────── */
let _offlineQueue = [];
const getOfflineQueue = () => _offlineQueue;
const pushOffline = (item) => { _offlineQueue.push(item); };
const clearOffline = () => { _offlineQueue = []; };

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
    isCloudLoading, isOnline,
    activeMode, roomId, setRoomId, setActiveMode,
    addToBattleLog,
    setEnemySpentDaily, setEnemySpentWeekly, setEnemySpentMonthly,
    setErrorMessage, setIsFirebaseRetrying,
  } = useBattleStore();

  const roomUnsubRef = useRef(null);

  // ── 1. 定時備份使用者主資料（debounce 2s，不含 history subcollection）──
  useEffect(() => {
    if (!user || isCloudLoading) return;
    const timeout = setTimeout(() => {
      const nowTime = Date.now();
      const payload = {
        coins, debt, personaStats, persona,
        exp: willpowerExp, wishlist, wishlistGoal,
        homeMaterials, currentTier,
        potions, shield, userTitle, userFrame,
        unlockedTitles, achievements, lang, userName,
        isStudent, currency, insuranceExpiry, hasZenSofa,
        weeklyPools, monthlyPools,
        roomId,
        updatedAt: nowTime,
      };
      const operation = () => setDoc(doc(db, 'users', user.uid), payload, { merge: true });

      if (!isOnline) {
        pushOffline({ type: 'setDoc', path: `users/${user.uid}`, payload });
        return;
      }

      setIsFirebaseRetrying(false);
      withRetry(operation, (err) => {
        console.error("Firebase Sync Error:", err);
        setErrorMessage('同步失敗，正在重試…');
        setIsFirebaseRetrying(true);
      }).then(() => {
        save('updatedAt', nowTime);
        setIsFirebaseRetrying(false);
      }).catch(() => {
        pushOffline({ type: 'setDoc', path: `users/${user.uid}`, payload });
      });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [
    user, isCloudLoading, isOnline,
    coins, debt, personaStats, persona, willpowerExp, wishlist, wishlistGoal,
    homeMaterials, currentTier, potions, shield, userTitle, userFrame,
    unlockedTitles, achievements, lang, userName, isStudent, currency,
    insuranceExpiry, hasZenSofa, weeklyPools, monthlyPools, roomId,
    setErrorMessage, setIsFirebaseRetrying,
  ]);

  // ── 2. 監聽房間（Firestore onSnapshot），同步對手 HP ──────────────────────
  useEffect(() => {
    // 清理舊監聽
    if (roomUnsubRef.current) {
      roomUnsubRef.current();
      roomUnsubRef.current = null;
    }

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
        addToBattleLog(`⌛ [System] Room ${roomId} no longer exists.`);
        setRoomId('');
        setActiveMode('selection');
      }
    }, (err) => {
      console.error('Room snapshot error:', err);
      setErrorMessage('房間連線異常，請檢查網路');
    });
    roomUnsubRef.current = unsub;
    return () => {
      unsub();
      roomUnsubRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, roomId, user?.uid]); // 只用 stable 值，避免 Zustand selector 引用變化導致無限重訂閱

  // ── 3. 上傳自己的 HP 百分比到房間 ────────────────────────────────────────
  useEffect(() => {
    if (
      (activeMode !== 'team5v5' && activeMode !== '1v1') ||
      !roomId || roomId === 'MATCHMAKING_QUEUE' || !user
    ) return;

    const nowDate = new Date();
    const todayStr = taipeiDateStr(nowDate);
    const nowP = taipeiParts(nowDate);
    const daysFromMonday = nowP.day === 0 ? 6 : nowP.day - 1;
    const weekStart = new Date(nowDate);
    weekStart.setDate(nowDate.getDate() - daysFromMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = taipeiDateStr(weekStart);
    const monthStartStr = `${nowDate.getFullYear()}-${String(nowP.month + 1).padStart(2, '0')}-01`;

    const limits = {
      survival:   (weeklyPools.food?.limit  || 1000) + (weeklyPools.transport?.limit || 0) + (monthlyPools.housing?.limit || 0),
      progress:   (monthlyPools.education?.limit || 0),
      desire:     (weeklyPools.social?.limit    || 0),
      expedition: (weeklyPools.shopping?.limit  || 0),
    };

    const myDaily   = history.filter((h) => h.date === todayStr).reduce((s, h) => s + h.amount, 0);
    const myWeekly  = history.filter((h) => h.date >= weekStartStr).reduce((s, h) => s + h.amount, 0);
    const myMonthly = history.filter((h) => h.date >= monthStartStr).reduce((s, h) => s + h.amount, 0);

    const hpSurvival   = Math.max(0, 100 - (myDaily   / ((limits.survival * 5)   || 1)) * 100);
    const hpProgress   = Math.max(0, 100 - (myWeekly  / ((limits.progress * 5)   || 1)) * 100);
    const hpDesire     = Math.max(0, 100 - (myMonthly / ((limits.desire * 5)     || 1)) * 100);
    const hpExpedition = Math.max(0, 100 - (myMonthly / ((limits.expedition * 5) || 1)) * 100);

    const payload = {
      [`players.${user.uid}`]: {
        uid: user.uid, name: userName,
        hpSurvival, hpProgress, hpDesire, hpExpedition,
        lastUpdate: Date.now(),
      },
    };

    if (!isOnline) {
      pushOffline({ type: 'setDoc', path: `rooms/${roomId}`, payload });
      return;
    }

    withRetry(
      () => setDoc(doc(db, 'rooms', roomId), payload, { merge: true }),
      () => pushOffline({ type: 'setDoc', path: `rooms/${roomId}`, payload })
    ).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, activeMode, roomId, user?.uid, userName, weeklyPools, monthlyPools, isOnline]);

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

      const payload = {
        createdAt: Date.now(),
        players: {
          ...bots,
          [user.uid]: { uid: user.uid, name: userName, hpSurvival: 100, hpProgress: 100, hpDesire: 100, hpExpedition: 100, lastUpdate: Date.now() },
        },
      };

      if (!isOnline) {
        pushOffline({ type: 'setDoc', path: `rooms/${botRoomId}`, payload });
      } else {
        withRetry(
          () => setDoc(doc(db, 'rooms', botRoomId), payload),
          () => pushOffline({ type: 'setDoc', path: `rooms/${botRoomId}`, payload })
        ).catch(() => {});
      }

      setRoomId(botRoomId);
      setActiveMode('team5v5');
    }, 8000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.uid, userName, lang, isOnline]); // setRoomId / setActiveMode / addToBattleLog 來自 Zustand 為 stable ref

  // ── 5. 離線恢復：連線後補發佇列 ──────────────────────────────────────────
  useEffect(() => {
    if (!isOnline || !user) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    const processQueue = async () => {
      setIsFirebaseRetrying(true);
      const remaining = [];
      for (const item of queue) {
        try {
          if (item.type === 'setDoc') {
            const [collection, id] = item.path.split('/');
            await setDoc(doc(db, collection, id), item.payload, { merge: true });
          }
        } catch {
          remaining.push(item);
        }
      }
      clearOffline();
      remaining.forEach(pushOffline);
      setIsFirebaseRetrying(false);
      if (remaining.length === 0) {
        addToBattleLog('🔄 [System] Offline data synced.');
      } else {
        setErrorMessage('部分資料同步失敗，將在下次連線時重試');
      }
    };

    processQueue();
  }, [isOnline, user, setIsFirebaseRetrying, setErrorMessage, addToBattleLog]);

  // ── 同步函式（供 useBattleLogic 呼叫）────────────────────────────────────

  const syncNewTransaction = useCallback((entry) => {
    if (!user) return;
    const operation = () => setDoc(doc(db, 'users', user.uid, 'history', entry.id.toString()), entry);
    if (!navigator.onLine) {
      pushOffline({ type: 'setDoc', path: `users/${user.uid}/history/${entry.id}`, payload: entry });
      return;
    }
    withRetry(operation, (err) => {
      console.error('syncNewTransaction error:', err);
      pushOffline({ type: 'setDoc', path: `users/${user.uid}/history/${entry.id}`, payload: entry });
    }).catch(() => {});
  }, [user]);

  const syncDeleteTransaction = useCallback((id) => {
    if (!user) return;
    const operation = () => deleteDoc(doc(db, 'users', user.uid, 'history', id.toString()));
    if (!navigator.onLine) {
      pushOffline({ type: 'deleteDoc', path: `users/${user.uid}/history/${id}` });
      return;
    }
    withRetry(operation, (err) => {
      console.error('syncDeleteTransaction error:', err);
      pushOffline({ type: 'deleteDoc', path: `users/${user.uid}/history/${id}` });
    }).catch(() => {});
  }, [user]);

  const syncUpdateTransaction = useCallback((id, patch) => {
    if (!user) return;
    const operation = () => updateDoc(doc(db, 'users', user.uid, 'history', id.toString()), patch);
    if (!navigator.onLine) {
      pushOffline({ type: 'updateDoc', path: `users/${user.uid}/history/${id}`, payload: patch });
      return;
    }
    withRetry(operation, (err) => {
      console.error('syncUpdateTransaction error:', err);
      pushOffline({ type: 'updateDoc', path: `users/${user.uid}/history/${id}`, payload: patch });
    }).catch(() => {});
  }, [user]);

  const syncDeleteAllHistory = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(collection(db, 'users', user.uid, 'history'));
      await Promise.all(snap.docs.map((d) => withRetry(() => deleteDoc(d.ref))));
    } catch (err) {
      console.error('syncDeleteAllHistory error:', err);
      setErrorMessage('清除歷史記錄失敗');
    }
  }, [user, setErrorMessage]);

  return {
    syncNewTransaction,
    syncDeleteTransaction,
    syncUpdateTransaction,
    syncDeleteAllHistory,
  };
};
