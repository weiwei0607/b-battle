import React from 'react';
import { Zap, X, Droplet, Shield } from 'lucide-react';
import { LOCALES } from '../utils/locales';

const ShopModal = ({ 
  show, onClose, coins, setCoins, setUserFrame, potions, setPotions, 
  shield, setShield, setInsuranceExpiry, setHasZenSofa, setBannerText, setInventory, inventory,
  lang
}) => {
  if (!show) return null;

  const t = LOCALES[lang] || LOCALES.zh;
  const buyItem = (type, id, price, name, desc) => {
    if (coins < price) {
      alert(t.shop_not_enough);
      return;
    }

    if (!window.confirm(t.shop_confirm_buy.replace("{price}", price).replace("{name}", name).replace("{desc}", desc))) {
      return;
    }

    setCoins(c => c - price);
    if (type === 'frame') {
      setUserFrame(id);
      alert(t.shop_buy_frame.replace("{name}", name));
    } else if (type === 'shield') {
      setShield(prev => prev + 1);
      alert(t.shop_buy_shield);
    } else if (type === 'potion') {
      setPotions(p => p + 1);
      alert(t.shop_buy_potion);
    } else if (type === 'insurance') {
      setInsuranceExpiry(Date.now() + 86400000);
      alert(t.shop_buy_insurance);
    } else if (type === 'sofa') {
      setHasZenSofa(true);
      alert(t.shop_buy_sofa);
    } else if (type === 'banner') {
      const text = window.prompt(t.shop_prompt_banner, t.shop_default_banner);
      if (text) setBannerText(text);
      alert(t.shop_buy_banner);
    } else if (type === 'social') {
      setInventory(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      alert(t.shop_buy_social.replace("{name}", name));
    }
  };

  const ITEMS = {
    consumables: [
      { id: 'potion', type: 'potion', name: t.shop_item_potion_name, price: 300, icon: '🧪', desc: t.shop_item_potion_desc },
      { id: 'shield', type: 'shield', name: t.shop_item_shield_name, price: 200, icon: '🛡️', desc: t.shop_item_shield_desc },
      { id: 'insurance', type: 'insurance', name: t.shop_item_insurance_name, price: 500, icon: '📄', desc: t.shop_item_insurance_desc }
    ],
    social: [
      { id: 'stinkyEggs', type: 'social', name: t.shop_item_stinkyEggs_name, price: 150, icon: '🥚', desc: t.shop_item_stinkyEggs_desc },
      { id: 'rations', type: 'social', name: t.shop_item_rations_name, price: 250, icon: '🍱', desc: t.shop_item_rations_desc }
    ],
    territory: [
      { id: 'sofa', type: 'sofa', name: t.shop_item_sofa_name, price: 800, icon: '🪑', desc: t.shop_item_sofa_desc },
      { id: 'banner', type: 'banner', name: t.shop_item_banner_name, price: 400, icon: '🚩', desc: t.shop_item_banner_desc }
    ],
    frames: [
      { id: 'neon', type: 'frame', name: t.shop_item_neon_name, price: 150, icon: '💎', desc: t.shop_item_neon_desc },
      { id: 'fire', type: 'frame', name: t.shop_item_fire_name, price: 400, icon: '🔥', desc: t.shop_item_fire_desc },
      { id: 'gold', type: 'frame', name: t.shop_item_gold_name, price: 1000, icon: '🏆', desc: t.shop_item_gold_desc }
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
            <h3 className="text-2xl font-black text-stone-800 tracking-tight text-left italic uppercase">{t.shop_main_title}</h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-left">{t.shop_subtitle}</p>
          </div>
          <div className="bg-stone-800 px-4 py-2 rounded-2xl text-white text-xs font-bold flex items-center gap-2 shadow-lg">
            <Zap size={14} className="text-[#D7C9B1]" />{coins.toLocaleString()}
          </div>
        </div>

        <div className="space-y-8">
          {/* 🧪 戰鬥物資 */}
          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 border-amber-400 pl-2">{t.shop_consumables}</h4>
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
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 border-emerald-400 pl-2">{t.shop_social}</h4>
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
                      <span className="text-[8px] font-black bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-md">{t.shop_owned} {inventory[item.id] || 0}</span>
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
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 border-purple-400 pl-2">{t.shop_territory}</h4>
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
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 border-blue-400 pl-2">{t.shop_frames}</h4>
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
        
        <p className="mt-8 text-[9px] text-stone-400 text-center italic">{t.shop_footer}</p>
      </div>
    </div>
  );
};

export default ShopModal;
