import React from 'react';
import { Zap, X, Droplet, Shield } from 'lucide-react';

const ShopModal = ({ 
  show, onClose, coins, setCoins, setUserFrame, potions, setPotions, 
  shield, setShield, setInsuranceExpiry, setHasZenSofa, setBannerText, setInventory, inventory
}) => {
  if (!show) return null;

  const buyItem = (type, id, price, name, desc) => {
    if (coins < price) {
      alert("金幣不足！多記幾筆生存消費來賺金幣吧！");
      return;
    }

    if (!window.confirm(`💰 確定要花費 ${price} 金幣購買「${name}」嗎？\n\n效果：${desc}`)) {
      return;
    }

    setCoins(c => c - price);
    if (type === 'frame') {
      setUserFrame(id);
      alert(`✨ 頭像框「${name}」已裝備！`);
    } else if (type === 'shield') {
      setShield(prev => prev + 1);
      alert("🛡️ 購買成功！已為您掛載鐵血護盾，可抵擋部分傷害。");
    } else if (type === 'potion') {
      setPotions(p => p + 1);
      alert("🧪 購買成功！可在歷史分析頁面修復一筆戰損。");
    } else if (type === 'insurance') {
      setInsuranceExpiry(Date.now() + 86400000);
      alert("🛡️ 保險生效！未來 24 小時大額支出戰損減免 80%。");
    } else if (type === 'sofa') {
      setHasZenSofa(true);
      alert("🪑 購買成功！沙發已放入領地，每日登入 Exp +5。");
    } else if (type === 'banner') {
      const text = window.prompt("請輸入你的戰場標語：", "意志如鋼，無堅不摧");
      if (text) setBannerText(text);
      alert("🚩 旗幟已插上戰場！");
    } else if (type === 'social') {
      setInventory(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      alert(`📦 購買成功！獲得「${name}」，請至好友名單使用。`);
    }
  };

  const ITEMS = {
    consumables: [
      { id: 'potion', type: 'potion', name: '忘憂聖水', price: 300, icon: '🧪', desc: '抹除歷史紀錄中的一筆戰損（HP恢復）。' },
      { id: 'shield', type: 'shield', name: '鐵血護盾', price: 200, icon: '🛡️', desc: '抵擋下一次 50% 的戰鬥戰損。' },
      { id: 'insurance', type: 'insurance', name: '鋼鐵遺囑', price: 500, icon: '📄', desc: '24小時內，單筆 >3000 的消費戰損減少 80%。' }
    ],
    social: [
      { id: 'stinkyEggs', type: 'social', name: '戰術臭雞蛋', price: 150, icon: '🥚', desc: '對隊友使用，若其大幅超支則發布全服通緝並罰款。' },
      { id: 'rations', type: 'social', name: '鐵路便當', price: 250, icon: '🍱', desc: '對隊友使用，幫其恢復 10% 的生存支柱 HP。' }
    ],
    territory: [
      { id: 'sofa', type: 'sofa', name: '禁慾沙發', price: 800, icon: '🪑', desc: '長期道具。放置在領地，每日登入 Exp +5。' },
      { id: 'banner', type: 'banner', name: '意志旗幟', price: 400, icon: '🚩', desc: '在戰場頂部顯示你的個人激勵標語。' }
    ],
    frames: [
      { id: 'neon', type: 'frame', name: '青色電鍍', price: 150, icon: '💎', desc: '換上極具未來感的青色電鍍頭像框。' },
      { id: 'fire', type: 'frame', name: '紅蓮業火', price: 400, icon: '🔥', desc: '燃燒鬥志，裝備帶有動態感的紅火外框。' },
      { id: 'gold', type: 'frame', name: '黃金裝甲', price: 1000, icon: '🏆', desc: '意志力頂點的象徵，純金質感的奢華外框。' }
    ]
  };

  return (
    <div className="fixed inset-0 z-[700] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#F7F4EF] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[80vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-stone-200/50 rounded-full text-stone-500 active:scale-90 transition-all">
          <X size={16} />
        </button>

        <div className="flex justify-between items-center mb-8 pr-10">
          <div>
            <h3 className="text-2xl font-black text-stone-800 tracking-tight text-left italic uppercase">意志補給站</h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-left">Willpower Equipment & Supplies</p>
          </div>
          <div className="bg-stone-800 px-4 py-2 rounded-2xl text-white text-xs font-bold flex items-center gap-2 shadow-lg">
            <Zap size={14} className="text-[#D7C9B1]" />{coins.toLocaleString()}
          </div>
        </div>

        <div className="space-y-8">
          {/* 🧪 戰鬥物資 */}
          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 border-amber-400 pl-2">戰鬥物資</h4>
            <div className="grid grid-cols-1 gap-2">
              {ITEMS.consumables.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => buyItem(item.type, item.id, item.price, item.name, item.desc)}
                  className="bg-white p-4 rounded-3xl border border-stone-100 flex items-center gap-4 shadow-sm active:scale-95 transition-all hover:border-amber-200 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-2xl shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-stone-800 truncate">{item.name}</p>
                    <p className="text-[9px] text-stone-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-amber-600">{item.price}</p>
                    <p className="text-[8px] font-bold text-stone-300 uppercase">Coins</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 👥 社交/對抗 */}
          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 border-emerald-400 pl-2">社交與對抗</h4>
            <div className="grid grid-cols-1 gap-2">
              {ITEMS.social.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => buyItem(item.type, item.id, item.price, item.name, item.desc)}
                  className="bg-white p-4 rounded-3xl border border-stone-100 flex items-center gap-4 shadow-sm active:scale-95 transition-all hover:border-emerald-200 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-2xl shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-black text-stone-800 truncate">{item.name}</p>
                      <span className="text-[8px] font-black bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-md">持有: {inventory[item.id] || 0}</span>
                    </div>
                    <p className="text-[9px] text-stone-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-emerald-600">{item.price}</p>
                    <p className="text-[8px] font-bold text-stone-300 uppercase">Coins</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 🏡 領地建設 */}
          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 border-purple-400 pl-2">領地與榮譽</h4>
            <div className="grid grid-cols-1 gap-2">
              {ITEMS.territory.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => buyItem(item.type, item.id, item.price, item.name, item.desc)}
                  className="bg-white p-4 rounded-3xl border border-stone-100 flex items-center gap-4 shadow-sm active:scale-95 transition-all hover:border-purple-200 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-2xl shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-black text-stone-800 truncate">{item.name}</p>
                    <p className="text-[9px] text-stone-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-purple-600">{item.price}</p>
                    <p className="text-[8px] font-bold text-stone-300 uppercase">Coins</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 🔥 特效外觀 */}
          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 border-blue-400 pl-2">特效外觀</h4>
            <div className="grid grid-cols-1 gap-3">
              {ITEMS.frames.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => buyItem(item.type, item.id, item.price, item.name, item.desc)}
                  className="bg-white p-4 rounded-3xl border border-stone-100 flex items-center gap-4 shadow-sm active:scale-95 transition-all hover:border-blue-200 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-2xl shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-[12px] font-black text-stone-800">{item.name}</p>
                    <p className="text-[9px] text-stone-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-600">{item.price}</p>
                    <p className="text-[8px] font-bold text-stone-300 uppercase">Coins</p>
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
