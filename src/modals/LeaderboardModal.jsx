import React, { useState, useEffect } from 'react';
import { Trophy, X, Crown, Medal, User, Loader2, RefreshCw } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import EmptyState from '../components/UI/EmptyState';

const CACHE_KEY = 'bb_v4_leaderboard_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const LeaderboardModal = ({ show, onClose, currentUserId }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;

    const fetchLeaders = async () => {
      setLoading(true);
      setError(null);

      // Try cache first
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setLeaders(data);
            setLoading(false);
            // Background refresh
            refreshFromNetwork();
            return;
          }
        }
      } catch {
        // ignore cache parse errors
      }

      await refreshFromNetwork();
    };

    const refreshFromNetwork = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("exp", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setLeaders(list);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() }));
        } catch {
          // ignore quota errors
        }
      } catch (err) {
        console.error("Leaderboard Error:", err);
        setError('無法載入排行榜，請檢查網路連線');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-stone-100 rounded-full text-stone-500 active:scale-90 transition-all">
          <X size={16} />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex bg-amber-100 p-3 rounded-2xl text-amber-600 mb-3 shadow-sm">
            <Crown size={24} />
          </div>
          <h3 className="text-2xl font-black text-stone-800 tracking-tight italic uppercase">全球意志力排行</h3>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Global Willpower Elite</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 px-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 size={24} className="animate-spin text-stone-300" />
              <span className="text-stone-400 font-black text-xs tracking-widest uppercase">情報收集中...</span>
            </div>
          ) : error ? (
            <EmptyState
              icon="search"
              title="載入失敗"
              description={error}
              action={
                <button
                  onClick={() => { setLoading(true); setError(null); window.location.reload(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-black active:scale-95 transition-all"
                >
                  <RefreshCw size={12} /> 重試
                </button>
              }
            />
          ) : leaders.length === 0 ? (
            <EmptyState
              icon="users"
              title="尚無排行資料"
              description="成為第一個登上排行榜的戰士吧！"
            />
          ) : (
            leaders.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center gap-4 p-4 rounded-3xl border transition-all ${player.id === currentUserId ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-100' : 'bg-stone-50 border-stone-100'}`}
              >
                <div className="w-8 flex justify-center shrink-0">
                  {index === 0 && <Crown size={20} className="text-yellow-500" />}
                  {index === 1 && <Medal size={20} className="text-stone-400" />}
                  {index === 2 && <Medal size={20} className="text-amber-700" />}
                  {index > 2 && <span className="text-xs font-black text-stone-300">#0{index + 1}</span>}
                </div>
                
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-xl shadow-sm">
                  {player.userAvatar || '👤'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-stone-800 truncate">{player.userName || '未知戰士'}</p>
                  <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">ID: {player.id?.slice(0,6) || '------'}</p>
                </div>

                <div className="text-right">
                  <p className="text-[12px] font-black text-stone-800">{player.exp || 0}</p>
                  <p className="text-[7px] font-black text-stone-400 uppercase">Willpower</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 p-4 bg-stone-50 rounded-2xl text-center border border-stone-100">
          <p className="text-[9px] font-black text-stone-400 italic">「唯有最強的意志，才能登頂。」</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
