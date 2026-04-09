import React from 'react';
import { Calculator, ShieldCheck } from 'lucide-react';

const BudgetSetupModal = ({ 
  show, 
  onClose, 
  salaryInput, 
  setSalaryInput, 
  handleAutoCalculate, 
  weeklyPools, 
  setWeeklyPools, 
  monthlyPools, 
  setMonthlyPools,
  isStudent,
  setIsStudent,
  currency,
  setCurrency,
  CURRENCIES,
  currentTier,
  setCurrentTier
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-stone-900/10 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center mb-8">
          <Calculator size={32} className="text-[#D7C9B1] mb-2" />
          <h3 className="text-xl font-bold text-stone-800 tracking-tight">預算戰略部署</h3>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-stone-50 border border-stone-100 p-6 rounded-3xl">
            <label className="text-[10px] font-bold text-stone-400 uppercase mb-3 block px-1 tracking-widest">AI 智能防線試算</label>
            <div className="flex gap-2">
              <input type="number" value={salaryInput} onChange={e => setSalaryInput(e.target.value)} placeholder="支配總額" className="w-full bg-white border border-stone-100 px-4 py-3 rounded-xl text-stone-800 font-bold text-sm outline-none focus:border-[#D7C9B1] transition-all" />
              <button onClick={handleAutoCalculate} className="bg-stone-800 text-white px-5 py-3 rounded-xl font-bold text-xs whitespace-nowrap active:scale-95 shadow-md">試算</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl text-left">
              <label className="text-[9px] font-bold text-stone-400 uppercase block mb-2 px-1">身分設定</label>
              <button onClick={() => setIsStudent(!isStudent)} className={`w-full py-2.5 rounded-xl text-[10px] font-bold transition-all shadow-sm ${isStudent ? 'bg-stone-800 text-white' : 'bg-white text-stone-400 border border-stone-100'}`}>
                {isStudent ? '🎓 在學中' : '💼 社會人士'}
              </button>
            </div>
            <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl text-left">
              <label className="text-[9px] font-bold text-stone-400 uppercase block mb-2 px-1">通用貨幣</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-white border border-stone-100 py-2.5 rounded-xl text-[10px] font-bold text-stone-800 outline-none shadow-sm">
                {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-100 p-4 rounded-3xl">
            <label className="text-[9px] font-bold text-stone-400 uppercase block mb-3 px-1">會員戰術層級</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'free', label: 'FREE', icon: '🛡️' },
                { id: 'pro', label: 'PRO', icon: '⚔️' },
                { id: 'prime', label: 'PRIME', icon: '💎' }
              ].map(tier => (
                <button 
                  key={tier.id} 
                  onClick={() => setCurrentTier(tier.id)}
                  className={`py-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${currentTier === tier.id ? 'bg-stone-800 text-white shadow-md scale-105' : 'bg-white text-stone-400 border border-stone-100'}`}
                >
                  <span className="text-xs">{tier.icon}</span>
                  <span className="text-[8px] font-black">{tier.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase mb-4 px-1 tracking-widest">每週戰鬥預算</p>
            {Object.entries(weeklyPools).map(([k, p]) => (
              <div key={k} className="mb-4 space-y-1">
                <label className="text-[10px] font-bold text-stone-500 px-2 uppercase">{p.label}</label>
                <input type="number" value={p.limit} onChange={e => setWeeklyPools(prev=>({...prev, [k]:{...p, limit:parseInt(e.target.value)||0}}))} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-mono font-bold text-sm outline-none focus:bg-white focus:border-[#D7C9B1] transition-all" />
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase mb-4 px-1 tracking-widest">每月固定支出</p>
            {Object.entries(monthlyPools).map(([k, p]) => (
              <div key={k} className="mb-4 space-y-1">
                <label className="text-[10px] font-bold text-stone-500 px-2 uppercase">{p.label}</label>
                <input type="number" value={p.limit} onChange={e => setMonthlyPools(prev=>({...prev, [k]:{...p, limit:parseInt(e.target.value)||0}}))} className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-mono font-bold text-sm outline-none focus:bg-white focus:border-[#8E9794] transition-all" />
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full py-5 bg-stone-800 text-white rounded-[2rem] font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-stone-200 active:scale-95 transition-all">確認部署</button>
        </div>
      </div>
    </div>
  );
};

export default BudgetSetupModal;
