import React, { useState } from 'react';
import { Zap, X, Check } from 'lucide-react';
import { LOCALES } from '../utils/locales';
import LoadingButton from '../components/UI/LoadingButton';
import ErrorMessage from '../components/UI/ErrorMessage';

const ShopModal = ({
  show, onClose, coins, setCoins, setUserFrame,
  setPotions, setShield, setInsuranceExpiry, setHasZenSofa, setBannerText, setInventory, inventory,
  lang
}) => {
  const t = LOCALES[lang] || LOCALES.zh;
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState(null);

  if (!show) return null;

  const buyItem = async (type, id, price, name, desc) => {
    if (coins < price) {
      setError(t.shop_not_enough);
      return;
    }

    if (!window.confirm(t.shop_confirm_buy.replace("{price}", price).replace("{name}", name).replace("{desc}", desc))) {
      return;
    }

    setLoadingId(id);
    setError('');

    // 模擬短暫延遲讓使用者感受到操作反饋
    await new Promise(resolve => setTimeout(resolve, 300));

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
      // eslint-disable-next-line react-hooks/purity
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

    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 1500);
    setLoadingId(null);
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

  const sectionColors = {
    consumables: { border: 'border-amber-400', price: 'text-amber-600' },
    social: { border: 'border-emerald-400', price: 'text-emerald-600' },
    territory: { border: 'border-purple-400', price: 'text-purple-600' },
    frames: { border: 'border-blue-400', price: 'text-blue-600' },
  };

  return (
    <div
      className="fixed inset-0 z-[700] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-title"
    >
      <div
        className="bg-[#F7F4EF] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[80vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-stone-200/50 rounded-full text-stone-500 active:scale-90 transition-all hover:bg-stone-300/50"
          aria-label="關閉商店"
        >
          <X size={16} />
        </button>

        <div className="flex justify-between items-center mb-8 pr-10">
          <div>
            <h3 id="shop-title" className="text-2xl font-black text-stone-800 tracking-tight text-left italic uppercase">
              {t.shop_main_title}
            </h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-left">
              {t.shop_subtitle}
            </p>
          </div>
          <div className="bg-stone-800 px-4 py-2 rounded-2xl text-white text-xs font-bold flex items-center gap-2 shadow-lg">
            <Zap size={14} className="text-[#D7C9B1]" />{coins.toLocaleString()}
          </div>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <div className="space-y-8">
          {Object.entries(ITEMS).map(([section, items]) => (
            <div key={section}>
              <h4 className={`text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 text-left border-l-4 ${sectionColors[section].border} pl-2`}>
                {t[`shop_${section}`] || section}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {items.map(item => {
                  const isLoading = loadingId === item.id;
                  const isSuccess = successId === item.id;
                  const canAfford = coins >= item.price;

                  return (
                    <button
                      key={item.id}
                      onClick={() => buyItem(item.type, item.id, item.price, item.name, item.desc)}
                      disabled={isLoading}
                      className={`
                        bg-white p-4 rounded-3xl border flex items-center gap-4 shadow-sm
                        active:scale-95 transition-all text-left
                        disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed
                        ${isSuccess ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-stone-200'}
                      `}
                      aria-label={`購買 ${item.name}，價格 ${item.price} 金幣`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-2xl shrink-0">
                        {isSuccess ? <Check size={24} className="text-emerald-500" /> : item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-black text-stone-800 truncate">{item.name}</p>
                          {section === 'social' && (
                            <span className="text-[8px] font-black bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-md">
                              {t.shop_owned} {inventory[item.id] || 0}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-stone-400 font-medium leading-tight mt-0.5">{item.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-[10px] font-black ${canAfford ? sectionColors[section].price : 'text-stone-300'}`}>
                          {item.price}
                        </p>
                        <p className="text-[8px] font-bold text-stone-300 uppercase">Coins</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[9px] text-stone-400 text-center italic">{t.shop_footer}</p>
      </div>
    </div>
  );
};

export default ShopModal;
