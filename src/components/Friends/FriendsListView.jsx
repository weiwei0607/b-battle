import React, { useState } from 'react';
import { User, TrendingUp, TrendingDown, Minus, ArrowLeft, UserPlus, Search, X, Swords, Users } from 'lucide-react';
import { LOCALES } from '../../utils/locales';

const FriendsListView = ({ onClose, friends = [], userId, lang, setRoomId, setActiveMode }) => {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const t = LOCALES[lang] || LOCALES.zh;

  const handleAddFriend = () => {
    if (!friendIdInput.trim()) return;
    alert(`Request sent to: ${friendIdInput}\n(Firebase integration in progress)`);
    setFriendIdInput("");
    setShowAddFriend(false);
  };

  const handleInvite = (friend, mode) => {
    const inviteId = userId + "_" + Math.floor(Math.random() * 1000);
    if (window.confirm(`⚔️ 確定要邀請「${friend.name}」進行${mode === '1v1' ? ' 1v1 對決' : ' 5v5 團戰'}嗎？`)) {
      setRoomId(inviteId);
      setActiveMode(mode);
      onClose();
      alert(`已建立戰場房間：${inviteId}\n邀請連結已產生，請通知好友進入！`);
    }
    setSelectedFriend(null);
  };

  // Localized Mock data if empty
  const displayFriends = friends.length > 0 ? friends : [
    { id: '1', name: t.mock_friend_1, userAvatar: '🥷', thisWeekSaved: 1200, lastWeekSaved: 1000, createdAt: Date.now() - 400000000 },
    { id: '2', name: t.mock_friend_2, userAvatar: '😎', thisWeekSaved: 500, lastWeekSaved: 800, createdAt: Date.now() - 1000000000 },
    { id: '3', name: t.mock_friend_3, userAvatar: '👤', thisWeekSaved: 200, lastWeekSaved: 0, createdAt: Date.now() - 100000 }
  ];

  const calculateRatio = (curr, prev) => {
    if (prev <= 0) return null;
    return ((curr - prev) / prev * 100).toFixed(1);
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-[#F7F4EF] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="w-full max-w-md mx-auto h-screen flex flex-col pt-16 p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 bg-white border border-stone-200 rounded-xl active:scale-90 transition-all"><ArrowLeft size={20}/></button>
            <div className="text-left">
              <h2 className="text-2xl font-black text-stone-800 tracking-tighter italic uppercase leading-none">{t.friends_title}</h2>
              <p className="text-[9px] font-black text-stone-400 mt-1 uppercase tracking-widest">My ID: {userId || "------"}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddFriend(true)}
            className="p-2 bg-stone-800 text-white rounded-xl active:scale-90 transition-all shadow-lg shadow-stone-200"
          >
            <UserPlus size={20}/>
          </button>
        </div>

        {/* 🎭 好友互動選單 */}
        {selectedFriend && (
          <div className="fixed inset-0 z-[6005] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelectedFriend(null)}>
            <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center" onClick={e => e.stopPropagation()}>
              <div className="w-20 h-20 bg-stone-50 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-inner">{selectedFriend.userAvatar}</div>
              <h3 className="text-xl font-black text-stone-800 mb-1">{selectedFriend.name}</h3>
              <p className="text-[10px] text-stone-400 font-bold mb-8 uppercase tracking-widest italic">戰友特派邀請</p>
              
              <div className="space-y-3">
                <button onClick={() => handleInvite(selectedFriend, '1v1')} className="w-full py-4 bg-stone-800 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                  <Swords size={16} /> 邀請 1v1 對決
                </button>
                <button onClick={() => handleInvite(selectedFriend, 'team5v5')} className="w-full py-4 bg-white border-2 border-stone-100 text-stone-800 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Users size={16} /> 邀請加入 5v5 隊伍
                </button>
                <button onClick={() => setSelectedFriend(null)} className="w-full py-4 text-stone-400 font-black text-xs">取消</button>
              </div>
            </div>
          </div>
        )}

        {/* ➕ 新增好友彈窗 */}
        {showAddFriend && (
          <div className="fixed inset-0 z-[6001] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-black text-stone-800 mb-2 text-center">{t.add_friend_title}</h3>
              <p className="text-[10px] text-stone-400 font-bold mb-6 text-center uppercase tracking-widest">{t.add_friend_desc}</p>
              <div className="relative mb-6">
                <input 
                  value={friendIdInput}
                  onChange={(e) => setFriendIdInput(e.target.value)}
                  placeholder={t.placeholder_id} 
                  className="w-full bg-stone-50 border-2 border-stone-100 p-4 rounded-2xl text-sm font-black focus:border-stone-800 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddFriend(false)} className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black text-xs">Cancel</button>
                <button onClick={handleAddFriend} className="flex-1 py-4 bg-stone-800 text-white rounded-2xl font-black text-xs shadow-lg">{t.send_request}</button>
              </div>
            </div>
          </div>
        )}

        {/* 📜 滾動區域 */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-32">
          {displayFriends.map(friend => {
            const ratio = calculateRatio(friend.thisWeekSaved, friend.lastWeekSaved);
            const isNewbie = (Date.now() - friend.createdAt) < 7 * 24 * 3600000;
            
            return (
              <div 
                key={friend.id} 
                onClick={() => setSelectedFriend(friend)}
                className="bg-white border border-stone-100 p-5 rounded-3xl flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-stone-200"
              >
                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner">
                  {friend.userAvatar || '👤'}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-black text-stone-800 mb-0.5">{friend.name}</h4>
                  <div className="flex items-center gap-2">
                    {isNewbie ? (
                      <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">{t.is_newbie}</span>
                    ) : ratio !== null ? (
                      <div className="flex items-center gap-1">
                        {parseFloat(ratio) > 0 ? <TrendingUp size={10} className="text-emerald-500" /> : <TrendingDown size={10} className="text-rose-500" />}
                        <span className={`text-[9px] font-black ${parseFloat(ratio) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {parseFloat(ratio) > 0 ? '+' : ''}{ratio}%
                        </span>
                        <span className="text-[8px] font-bold text-stone-400 uppercase ml-1">{t.vs_last_week}</span>
                      </div>
                    ) : (
                      <span className="text-[8px] font-bold text-stone-300 uppercase">{t.no_last_week}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FriendsListView;
