import React from 'react';
import { Zap, X } from 'lucide-react';

const ShopModal = ({ show, onClose, coins, setCoins, setUserFrame }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[700] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#F7F4EF] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative" onClick={e => e.stopPropagation()}>
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

        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'neon', name: '青色電鍍', price: 500, icon: '💎' },
            { id: 'fire', name: '紅蓮業火', price: 1200, icon: '🔥' },
            { id: 'gold', name: '黃金裝甲', price: 3000, icon: '🏆' }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => { 
                if(coins >= item.price) { 
                  setCoins(c => c - item.price); 
                  setUserFrame(item.id); 
                  onClose(); 
                } else {
                  alert("金幣不足！快去記帳賺錢！");
                }
              }} 
              className="bg-white p-6 rounded-[2.5rem] border border-stone-100 flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="text-center">
                <p className="text-xs font-bold text-stone-800">{item.name}</p>
                <p className="text-[10px] font-black text-[#BC8F8F] mt-1">{item.price} COINS</p>
              </div>
            </button>
          ))}
        </div>
        
        <p className="mt-8 text-[9px] text-stone-400 text-center italic">「裝備頭像框，展現你的意志力等級」</p>
      </div>
    </div>
  );
};

export default ShopModal;
