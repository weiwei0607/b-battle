import React from 'react';
import { Store, Zap, ShieldCheck, AlertTriangle, Swords } from 'lucide-react';
import { getWalletStatus } from '../../utils/constants';

const Header = ({ currentTier, coins, debt, onShopClick, setView, willpowerExp }) => {
  const wallet = getWalletStatus(willpowerExp);
  const isInDebt = debt >= 500;

  return (
    <header className="flex justify-between items-center z-10 py-6 shrink-0">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('battle')}>
        {/* 固定產品 Logo 區區塊 */}
        <div className={`w-10 h-10 ${isInDebt ? 'bg-red-600' : 'bg-stone-800'} rounded-2xl flex items-center justify-center transition-transform group-active:scale-90 shadow-lg shadow-stone-200`}>
          <Swords size={20} className="text-white" />
        </div>
        
        <div className="flex flex-col text-left">
          <span className={`font-black text-lg leading-none tracking-tighter ${isInDebt ? 'text-red-600' : 'text-stone-800'}`}>
            B-BATTLE
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[14px] leading-none">{isInDebt ? '💸' : wallet.icon}</span>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${isInDebt ? 'text-red-400' : wallet.color}`}>
              {isInDebt ? `負債超人 (欠債 NT$${debt})` : wallet.name}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        {currentTier === 'pro' && (
          <div className="bg-[#D7C9B1]/10 px-3 py-1.5 rounded-xl border border-[#D7C9B1]/30 flex items-center gap-1.5">
            <ShieldCheck size={10} className="text-[#D7C9B1]" />
            <span className="text-[8px] font-black text-[#D7C9B1] uppercase tracking-widest">PRO</span>
          </div>
        )}
        <button onClick={onShopClick} className="bg-white/50 backdrop-blur-sm border border-stone-200/50 px-4 py-2 rounded-2xl shadow-sm hover:bg-white transition-colors">
          <Store size={14} className="text-stone-500" />
        </button>
        <div className={`px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-white text-xs font-bold transition-colors ${isInDebt ? 'bg-red-600' : 'bg-stone-800'}`}>
          {isInDebt ? <AlertTriangle size={14} className="text-white" /> : <Zap size={14} className="text-[#D7C9B1]" />}
          {coins}
        </div>
      </div>
    </header>
  );
};

export default Header;
