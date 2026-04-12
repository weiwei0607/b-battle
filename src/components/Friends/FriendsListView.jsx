import React, { useState } from 'react';
import { User, TrendingUp, TrendingDown, Minus, ArrowLeft, UserPlus, Search, X } from 'lucide-react';

const FriendsListView = ({ onClose, friends = [] }) => {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState("");

  const handleAddFriend = () => {
    if (!friendIdInput.trim()) return;
    alert(`已送出好友請求給: ${friendIdInput}\n(實作串接 Firebase 請求中)`);
    setFriendIdInput("");
    setShowAddFriend(false);
  };

  // Mock data if empty
  const displayFriends = friends.length > 0 ? friends : [
    { id: '1', name: '阿明', userAvatar: '🥷', thisWeekSaved: 1200, lastWeekSaved: 1000, createdAt: Date.now() - 400000000 },
    { id: '2', name: '小華', userAvatar: '😎', thisWeekSaved: 500, lastWeekSaved: 800, createdAt: Date.now() - 1000000000 },
    { id: '3', name: '新人王', userAvatar: '👤', thisWeekSaved: 200, lastWeekSaved: 0, createdAt: Date.now() - 100000 }
  ];

  const calculateRatio = (curr, prev) => {
    if (prev <= 0) return null;
    return ((curr - prev) / prev * 100).toFixed(1);
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-[#F7F4EF] flex flex-col p-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 bg-white border border-stone-200 rounded-xl active:scale-90 transition-all"><ArrowLeft size={20}/></button>
          <h2 className="text-2xl font-black text-stone-800 tracking-tighter italic uppercase">戰友名單</h2>
        </div>
        <button 
          onClick={() => setShowAddFriend(true)}
          className="p-2 bg-stone-800 text-white rounded-xl active:scale-90 transition-all shadow-lg shadow-stone-200"
        >
          <UserPlus size={20}/>
        </button>
      </div>

      {/* ➕ 新增好友彈窗 */}
      {showAddFriend && (
        <div className="fixed inset-0 z-[6001] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-stone-800 mb-2 text-center">尋找新戰友</h3>
            <p className="text-[10px] text-stone-400 font-bold mb-6 text-center uppercase tracking-widest">輸入好友 ID 進行連線</p>
            <div className="relative mb-6">
              <input 
                value={friendIdInput}
                onChange={(e) => setFriendIdInput(e.target.value)}
                placeholder="輸入房號或 ID..." 
                className="w-full bg-stone-50 border-2 border-stone-100 p-4 rounded-2xl text-sm font-black focus:border-stone-800 outline-none transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddFriend(false)} className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black text-xs">取消</button>
              <button onClick={handleAddFriend} className="flex-1 py-4 bg-stone-800 text-white rounded-2xl font-black text-xs shadow-lg">確認請求</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 overflow-y-auto no-scrollbar pb-24">
        {displayFriends.map(friend => {
          const ratio = calculateRatio(friend.thisWeekSaved, friend.lastWeekSaved);
          const isNewbie = (Date.now() - friend.createdAt) < 7 * 24 * 3600000;
          
          return (
            <div key={friend.id} className="bg-white border border-stone-100 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {friend.userAvatar || '👤'}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-stone-800 mb-0.5">{friend.name}</h4>
                <div className="flex items-center gap-2">
                  {isNewbie ? (
                    <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">還是新兵喔</span>
                  ) : ratio !== null ? (
                    <div className="flex items-center gap-1">
                      {ratio > 0 ? <TrendingUp size={10} className="text-emerald-500" /> : <TrendingDown size={10} className="text-rose-500" />}
                      <span className={`text-[9px] font-black ${ratio > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {ratio > 0 ? '+' : ''}{ratio}%
                      </span>
                      <span className="text-[8px] font-bold text-stone-400 uppercase ml-1">vs Last Week</span>
                    </div>
                  ) : (
                    <span className="text-[8px] font-bold text-stone-300 uppercase">無上週資料</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendsListView;
