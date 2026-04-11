import React from 'react';
import { Zap, X, Droplet, Shield } from 'lucide-react';

const ShopModal = ({ 
  show, onClose, coins, setCoins, setUserFrame, potions, setPotions, 
  shield, setShield
}) => {
  if (!show) return null;

  const buyItem = (type, id, price, name) => {
    if (coins >= price) {
      setCoins(c => c - price);
      if (type === 'frame') {
        setUserFrame(id);
        alert(`頭像框「${name}」已裝備！`);
      } else if (type === 'shield') {
        setShield(prev => prev + 1);
        alert("購買成功！已為您掛載鐵血護盾，可抵擋部分傷害。");
      }
    } else {
      alert("金幣不足！多記幾筆生存消費來賺金幣吧！");
    }
  };

  return (
    <div className="fixed inset-0 z-[700] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#F7F4EF] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[80vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-stone-200/50 rounded-full text-stone-500 active:scale-90 transition-all">
          <X size={16} />
        </button>

        <div className="flex justify-between items-center mb-8 pr-10">
          <div>
            <h3 className="text-2xl font-black text-stone-800 tracking-tight text-left">道具屋</h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-left">Willpower Equipment</p>
          </div>
          <div className="bg-stone-800 px-4 py-2 rounded-2xl text-white text-xs font-bold flex items-center gap-2 shadow-lg">
            <Zap size={14} className="text-[#D7C9B1]" />{coins}
          </div>
        </div>

        <div className="space-y-6">
          {/* 消費道具 */}
          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3 text-left">戰鬥物資</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { 
                  if(coins >= 300) { 
                    setCoins(c => c - 300); 
                    setPotions(p => p + 1);
                    alert("購買成功！可在歷史分析頁面修復一筆戰損。");
                  } else {
                    alert("金幣不足！");
                  }
                }} 
                className="bg-white p-4 rounded-3xl border border-stone-100 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Droplet size={20} fill="currentColor" fillOpacity={0.2} /></div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-stone-800">忘憂聖水</p>
                  <p className="text-[9px] font-black text-blue-600 mt-1">300 | 持有: {potions}</p>
                </div>
              </button>

              <button 
                onClick={() => buyItem('shield', 'shield', 200)}
                className="bg-white p-4 rounded-3xl border border-stone-100 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500"><Shield size={20} fill="currentColor" fillOpacity={0.2} /></div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-stone-800">鐵血護盾</p>
                  <p className="text-[9px] font-black text-cyan-600 mt-1">200 | 耐久: {shield.toFixed(1)}</p>
                </div>
              </button>
            </div>
          </div>

          {/* 外觀 */}
          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3 text-left">特效外觀</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'neon', name: '青色電鍍', price: 150, icon: '💎' },
                { id: 'fire', name: '紅蓮業火', price: 400, icon: '🔥' },
                { id: 'gold', name: '黃金裝甲', price: 1000, icon: '🏆' }
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => buyItem('frame', item.id, item.price, item.name)} 
                  className="bg-white p-4 rounded-3xl border border-stone-100 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-stone-800">{item.name}</p>
                    <p className="text-[9px] font-black text-[#BC8F8F] mt-1">{item.price} COINS</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-[9px] text-stone-400 text-center italic">「強化裝備，為了更長久的戰鬥」</p>
      </div>
    </div>
  );
};

export default ShopModal;
