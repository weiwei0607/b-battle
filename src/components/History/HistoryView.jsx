import React, { useState } from 'react';
import { Skull, TrendingDown, Info, ShieldAlert, Award, AlertCircle, Zap, Heart, Flame, Globe, Calendar } from 'lucide-react';

const RomanPillar = ({ label, percent, colorClass, dmg, icon: Icon }) => {
  // 戰損百分比：如果戰損越高，柱子液面應該越低 (顯示剩餘量)
  const remainingPercent = Math.max(0, 100 - percent);
  
  return (
    <div className="flex-1 flex flex-col items-center group min-w-[60px]">
      <div className="w-12 h-1.5 bg-stone-300 rounded-t-sm shadow-sm" />
      <div className="w-8 h-36 bg-stone-100 border-x border-stone-200 relative flex justify-center shadow-inner overflow-hidden">
        {/* 動態填充液面 (顯示該月剩餘 HP) */}
        <div 
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out ${colorClass} opacity-80`}
          style={{ height: `${remainingPercent}%` }}
        />
        {/* 柱身紋路 */}
        <div className="absolute inset-0 flex justify-evenly">
          <div className="w-px h-full bg-white/30" />
          <div className="w-px h-full bg-white/30" />
        </div>
      </div>
      <div className="w-14 h-2.5 bg-stone-400 rounded-b-sm shadow-md flex items-center justify-center">
        <Icon size={8} className="text-white/50" />
      </div>
      
      <div className="mt-3 flex flex-col items-center">
        <span className="text-[7px] font-black text-stone-400 uppercase tracking-tighter text-center leading-none mb-1 h-4 flex items-center">{label}</span>
        <span className={`text-[9px] font-black leading-none ${dmg > 0 ? 'text-red-500' : 'text-stone-800'}`}>-{dmg.toFixed(0)}</span>
      </div>
    </div>
  );
};

const HistoryView = ({ history, aiComment }) => {
  const generateMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}`);
    }
    return months;
  };

  const availableMonths = generateMonths();
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);

  const getMonthKey = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('/');
    return `${parts[0]}/${(parts[1] || "").padStart(2, '0')}`;
  };

  // 1. 篩選該月份紀錄
  const filteredHistory = history.filter(h => getMonthKey(h.date) === selectedMonth);
  
  // 2. 核心計算：該月各項神柱戰損 (精準連動所選月份)
  const pillarSummary = {
    survival: filteredHistory.filter(h => h.pillar === 'survival').reduce((s, h) => s + h.damage, 0),
    progress: filteredHistory.filter(h => h.pillar === 'progress').reduce((s, h) => s + h.damage, 0),
    desire: filteredHistory.filter(h => h.pillar === 'desire').reduce((s, h) => s + h.damage, 0),
    expedition: filteredHistory.filter(h => h.pillar === 'expedition').reduce((s, h) => s + h.damage, 0),
  };

  const totalDamage = filteredHistory.reduce((s, h) => s + h.damage, 0);
  const critCount = filteredHistory.filter(h => h.isCrit).length;
  
  const topKill = filteredHistory.length > 0 
    ? [...filteredHistory].sort((a, b) => b.damage - a.damage)[0] 
    : null;

  // 假設每月各項神柱的基礎額度 (用於計算百分比)
  const limits = { survival: 10000, progress: 5000, desire: 3000, expedition: 15000 };

  return (
    <div className="space-y-6 pb-48 animate-in fade-in slide-in-from-right duration-700 text-left">
      <div className="px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none">WAR REPORT</h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2 text-left">戰略歷史檔案庫</p>
        </div>
        <div className="text-right flex items-center gap-2">
          <Calendar size={14} className="text-stone-300" />
          <p className="text-sm font-black text-stone-800">{selectedMonth}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 py-1">
        {availableMonths.map(m => (
          <button 
            key={m} 
            onClick={() => setSelectedMonth(m)}
            className={`px-6 py-2.5 rounded-full text-[11px] font-black transition-all whitespace-nowrap border-2 ${selectedMonth === m ? 'bg-stone-800 border-stone-800 text-white shadow-xl scale-105' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300'}`}
          >
            {m.split('/')[0]}年 {m.split('/')[1]}月
          </button>
        ))}
      </div>

      <div className="bg-[#FAF7F2] border border-stone-200/60 p-6 rounded-[3rem] shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 text-stone-900"><TrendingDown size={240} /></div>
        
        <div className="grid grid-cols-2 gap-3 relative z-10 mb-8">
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-stone-100">
            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">月度總戰損</p>
            <h3 className="text-2xl font-black text-stone-800 leading-none">{totalDamage.toFixed(0)} <span className="text-xs font-bold text-stone-400">HP</span></h3>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-stone-100">
            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">暴擊次數</p>
            <h3 className="text-2xl font-black text-red-500 leading-none">{critCount} <span className="text-xs font-bold text-red-300">CRIT</span></h3>
          </div>
        </div>

        {/* 核心修正：羅馬柱百分比現在連動 selectedMonth 的數據 */}
        <div className="flex justify-between items-end gap-2 px-1 h-56 relative z-10 text-left">
          <RomanPillar label="生存戰耗" percent={(pillarSummary.survival / limits.survival * 100)} dmg={pillarSummary.survival} colorClass="bg-blue-400" icon={Heart} />
          <RomanPillar label="進化投資" percent={(pillarSummary.progress / limits.progress * 100)} dmg={pillarSummary.progress} colorClass="bg-emerald-400" icon={Zap} />
          <RomanPillar label="慾望侵蝕" percent={(pillarSummary.desire / limits.desire * 100)} dmg={pillarSummary.desire} colorClass="bg-orange-400" icon={Flame} />
          <RomanPillar label="遠征破防" percent={(pillarSummary.expedition / limits.expedition * 100)} dmg={pillarSummary.expedition} colorClass="bg-purple-500" icon={Globe} />
        </div>
      </div>

      {topKill && (
        <div className="mx-2 p-5 bg-gradient-to-r from-red-500 to-red-700 rounded-[2rem] shadow-lg flex justify-between items-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center rotate-12"><ShieldAlert size={100} /></div>
          <div className="relative z-10 text-left">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-80 text-left">本月恥辱之冠</p>
            <h4 className="text-lg font-black leading-tight text-left">「{topKill.desc}」</h4>
            <p className="text-[10px] font-bold opacity-70 mt-1 text-left">{topKill.date} · 造成 {topKill.damage.toFixed(0)} 傷害</p>
          </div>
          <div className="relative z-10 bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30 text-left">
            <Skull size={24} className="animate-pulse" />
          </div>
        </div>
      )}

      <div className="bg-stone-800 p-7 rounded-[2.5rem] text-white/90 relative overflow-hidden shadow-2xl border-t-4 border-amber-500/50 text-left">
        <div className="flex items-center gap-2 mb-4 text-left">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          <span className="text-amber-400 font-black text-[10px] tracking-widest uppercase text-left">教練月度總結報告</span>
        </div>
        <p className="text-sm leading-relaxed italic font-medium text-left">「{totalDamage > 0 ? aiComment : "這整個月你居然沒讓防線受損？看來你這個月是個理財聖人。"}」</p>
      </div>

      <div className="space-y-4 mt-10 text-left">
        <div className="px-2 flex justify-between items-center text-left">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-left">交戰細節清單</p>
          <Award size={14} className="text-stone-300" />
        </div>
        {filteredHistory.length === 0 ? (
          <div className="bg-white/40 border-2 border-dashed border-stone-100 p-16 rounded-[3rem] text-center">
            <AlertCircle size={32} className="mx-auto text-stone-200 mb-3" />
            <p className="text-stone-400 text-xs font-bold italic tracking-wide text-center">本月份戰線完好無損...</p>
          </div>
        ) : filteredHistory.map(h => (
          <div key={h.id} className={`bg-white border p-6 rounded-3xl flex justify-between items-center shadow-sm transition-all active:scale-[0.98] ${h.isCrit ? 'border-red-200 bg-red-50/10' : 'border-stone-50'}`}>
            <div className="flex gap-5 items-center text-left">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black shadow-inner ${h.isCrit ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                {h.isCrit ? <Skull size={20} /> : h.category.slice(0,1)}
              </div>
              <div className="text-left">
                <p className="text-stone-800 font-black text-sm tracking-tight text-left">{h.desc}</p>
                <div className="flex gap-2 items-center mt-1.5 text-left">
                  <span className="text-[9px] text-stone-400 font-black uppercase tracking-tighter text-left">{h.time}</span>
                  <span className={`text-[7px] px-2 py-0.5 rounded font-black uppercase ${h.pillar==='survival'?'bg-blue-50 text-blue-500':h.pillar==='progress'?'bg-emerald-50 text-emerald-500':h.pillar==='desire'?'bg-orange-50 text-orange-500':'bg-purple-50 text-purple-500'}`}>{h.pillar}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-black text-xl leading-none ${h.isCrit ? 'text-red-600' : 'text-stone-800'}`}>-{h.damage.toFixed(0)}</div>
              <div className="text-[9px] font-bold text-stone-300 mt-1 uppercase tracking-tighter text-right">Damage</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
