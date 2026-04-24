import React, { useState, useEffect, memo } from 'react';
import {
  Skull, TrendingDown, Calendar, Trash2, Edit3, Check, X, LifeBuoy,
  AlertCircle, Heart, Zap, Flame, Globe, MessageSquare, Loader2, ChevronDown
} from 'lucide-react';
import { CATEGORY_MAP } from '../../utils/constants';
import { LOCALES } from '../../utils/locales';
import EmptyState from '../UI/EmptyState';

/* ── 子元件：羅馬柱 ───────────────────────────────────────── */
const RomanPillar = memo(({ label, percent, colorClass, dmg, icon: Icon }) => {
  const remainingPercent = Math.max(0, 100 - percent);
  return (
    <div className="flex-1 flex flex-col items-center group min-w-[60px]">
      <div className="w-12 h-1.5 bg-stone-300 rounded-t-sm shadow-sm" />
      <div className="w-8 h-36 bg-stone-100 border-x border-stone-200 relative flex justify-center shadow-inner overflow-hidden">
        <div
          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out ${colorClass} opacity-80`}
          style={{ height: `${remainingPercent}%` }}
        />
        <div className="absolute inset-0 flex justify-evenly">
          <div className="w-px h-full bg-white/30" />
          <div className="w-px h-full bg-white/30" />
        </div>
      </div>
      <div className="w-14 h-2.5 bg-stone-400 rounded-b-sm shadow-md flex items-center justify-center">
        <Icon size={8} className="text-white/50" aria-hidden="true" />
      </div>
      <div className="mt-3 flex flex-col items-center">
        <span className="text-[7px] font-black text-stone-400 uppercase tracking-tighter text-center leading-none mb-1 h-4 flex items-center">
          {label}
        </span>
        <span className={`text-[9px] font-black leading-none ${dmg > 0 ? 'text-red-500' : 'text-stone-800'}`}>
          -{dmg.toFixed(0)}
        </span>
      </div>
    </div>
  );
});
RomanPillar.displayName = 'RomanPillar';

/* ── 子元件：歷史項目 ─────────────────────────────────────── */
const HistoryItem = memo(({
  item,
  isEditing,
  tempCategory,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onHeal,
  onDenialClick,
  canHeal,
  showDenialEffect,
  isDenialUnlocked,
  currentClicks,
  categoryKeys,
  t,
}) => {
  const isInvoice = item.source === 'invoice';

  return (
    <div
      className={`bg-white border p-6 rounded-3xl shadow-sm transition-all ${isEditing ? 'ring-2 ring-stone-800' : ''} ${showDenialEffect ? 'animate-bounce' : ''}`}
      style={{ transform: showDenialEffect ? `translateX(${Math.sin(currentClicks * 2) * 2}px)` : 'none' }}
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-5 items-center">
          <button
            onClick={() => isInvoice && onDenialClick(item.id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black shadow-inner cursor-pointer transition-transform active:scale-90 ${item.isCrit ? 'bg-red-100 text-red-600' : isInvoice ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-stone-100 text-stone-500'}`}
            aria-label={isInvoice ? '點擊觸發否認現實效果' : '類別圖示'}
          >
            {item.isCrit ? <Skull size={20} aria-hidden="true" /> : (t[item.category] || item.category).slice(0, 1)}
          </button>
          <div>
            <p className={`text-stone-800 font-black text-sm tracking-tight ${!isDenialUnlocked && currentClicks >= 8 ? 'text-red-500 font-black italic' : ''}`}>
              {(!isDenialUnlocked && currentClicks >= 8) ? t.denial_text : item.desc}
            </p>
            <div className="flex gap-2 items-center mt-1.5 text-[9px] text-stone-400 font-black uppercase">
              <span>{item.time}</span>
              {isEditing ? (
                <select
                  value={tempCategory}
                  onChange={(e) => onEdit(item.id, e.target.value)}
                  className="bg-stone-800 text-white rounded px-1 outline-none border-none"
                  aria-label="選擇類別"
                >
                  {categoryKeys.map(k => (
                    <option key={k} value={k}>{t[k]}</option>
                  ))}
                </select>
              ) : (
                <span className="bg-stone-50 px-2 py-0.5 rounded text-stone-600 border border-stone-100">
                  {t[item.category] || item.category}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-right">
            <div className={`font-black text-xl leading-none ${item.damage === 0 ? 'text-emerald-500 line-through opacity-30' : (item.isCrit ? 'text-red-600' : 'text-stone-800')}`}>
              -{item.damage.toFixed(0)}
            </div>
            <div className="text-[9px] font-bold text-stone-300 mt-1 uppercase tracking-tighter">{t.damage_label}</div>
          </div>
          <div className="flex flex-col gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => onSave(item.id)}
                  className="p-2 bg-emerald-500 text-white rounded-lg active:scale-90 hover:bg-emerald-400 transition-colors"
                  aria-label="確認修改"
                >
                  <Check size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={onCancel}
                  className="p-2 bg-stone-200 text-stone-500 rounded-lg active:scale-90 hover:bg-stone-300 transition-colors"
                  aria-label="取消修改"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                {canHeal && (
                  <button
                    onClick={() => { if (window.confirm(t.confirm_heal)) onHeal(item.id); }}
                    className="p-2 bg-blue-500 text-white rounded-lg active:scale-90 shadow-lg animate-bounce hover:bg-blue-400 transition-colors"
                    aria-label="治療"
                  >
                    <LifeBuoy size={14} aria-hidden="true" />
                  </button>
                )}
                <button
                  onClick={() => onEdit(item.id, item.category)}
                  className="p-2 text-stone-300 hover:text-stone-800 transition-colors rounded-lg hover:bg-stone-100"
                  aria-label="編輯類別"
                >
                  <Edit3 size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={() => {
                    if (isInvoice) onDenialClick(item.id);
                    else if (window.confirm(t.confirm_delete)) onDelete(item.id);
                  }}
                  className={`p-2 transition-colors rounded-lg hover:bg-stone-100 ${isInvoice ? 'text-stone-100' : 'text-stone-300 hover:text-red-500'}`}
                  aria-label={isInvoice ? '否認現實' : '刪除紀錄'}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
HistoryItem.displayName = 'HistoryItem';

/* ── 主元件：歷史紀錄 ─────────────────────────────────────── */
const HistoryView = ({
  history, aiComment, isAiProcessing, deleteTransaction, updateTransaction,
  potions, healTransaction, personaStats, persona, generateMonthlyReview,
  unlockAchievement, achievements, lang
}) => {
  const t = LOCALES[lang] || LOCALES.zh;

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
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempCategory, setTempCategory] = useState('');
  const [clickCounts, setClickCounts] = useState({});

  const isDenialUnlocked = achievements?.DENIAL_OF_REALITY?.unlocked;

  const getMonthKey = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    return `${parts[0]}/${(parts[1] || '').padStart(2, '0')}`;
  };

  const filteredHistory = history.filter(h => getMonthKey(h.date) === selectedMonth);
  const totalDamage = filteredHistory.reduce((s, h) => s + h.damage, 0);
  const critCount = filteredHistory.filter(h => h.isCrit).length;
  const limits = { survival: 10000, progress: 5000, desire: 3000, expedition: 15000 };
  const categoryKeys = Object.keys(CATEGORY_MAP);

  useEffect(() => {
    if (filteredHistory.length > 0) {
      generateMonthlyReview(selectedMonth, filteredHistory);
    }
  }, [selectedMonth, persona]);

  const handleDenialClick = (id) => {
    if (isDenialUnlocked) { alert(t.denial_unlocked); return; }
    const newCount = (clickCounts[id] || 0) + 1;
    setClickCounts(prev => ({ ...prev, [id]: newCount }));
    if (newCount === 10) {
      unlockAchievement('DENIAL_OF_REALITY');
      setClickCounts(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const handleEditStart = (id, category) => {
    setEditingId(id);
    setTempCategory(category);
  };

  const handleEditSave = (id) => {
    updateTransaction(id, tempCategory);
    setEditingId(null);
  };

  const currentPersona = personaStats?.[persona] || { icon: '🙄', title: 'Coach', titleKey: 'persona_peer' };

  return (
    <div className="space-y-6 pb-48 animate-in fade-in slide-in-from-right duration-700 text-left">
      <div className="px-2 flex justify-between items-center text-left">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tighter italic leading-none uppercase">
            {t.war_report_title}
          </h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
            {t.war_report_subtitle}
          </p>
        </div>

        {/* 月份選擇下拉選單 */}
        <div className="relative">
          <button
            onClick={() => setShowMonthMenu(!showMonthMenu)}
            className="bg-white border-2 border-stone-100 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm active:scale-95 transition-all text-stone-800 font-black text-xs"
            aria-expanded={showMonthMenu}
            aria-haspopup="listbox"
          >
            <Calendar size={14} className="text-stone-400" aria-hidden="true" />
            {selectedMonth.split('/')[0]}{t.year_unit} {selectedMonth.split('/')[1]}{t.month_unit}
            <ChevronDown size={12} className={`transition-transform duration-300 ${showMonthMenu ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {showMonthMenu && (
            <>
              <div className="fixed inset-0 z-[210]" onClick={() => setShowMonthMenu(false)} />
              <div
                className="absolute top-full mt-2 right-0 w-40 bg-white rounded-2xl shadow-2xl border border-stone-100 py-2 z-[220] animate-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto no-scrollbar"
                role="listbox"
              >
                {availableMonths.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMonth(m); setShowMonthMenu(false); }}
                    className={`w-full text-left px-4 py-3 text-[11px] font-black transition-colors ${selectedMonth === m ? 'text-amber-600 bg-amber-50' : 'text-stone-500 hover:bg-stone-50'}`}
                    role="option"
                    aria-selected={selectedMonth === m}
                  >
                    {m.split('/')[0]}{t.year_unit} {m.split('/')[1]}{t.month_unit}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="bg-[#FAF7F2] border border-stone-200/60 p-6 rounded-[3rem] shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-stone-100 shadow-sm">
            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1 text-left">{t.monthly_damage}</p>
            <h3 className="text-2xl font-black leading-none text-left">
              {totalDamage.toFixed(0)} <span className="text-xs font-bold text-stone-400">HP</span>
            </h3>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-stone-100 shadow-sm">
            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1 text-left">{t.crit_count}</p>
            <h3 className="text-2xl font-black text-red-500 leading-none text-left">
              {critCount} <span className="text-xs font-bold text-red-300">CRIT</span>
            </h3>
          </div>
        </div>
        <div className="flex justify-between items-end gap-2 px-1 h-56">
          <RomanPillar
            label={t.pillar_survival}
            percent={(filteredHistory.filter(h=>h.pillar==='survival').reduce((s,h)=>s+h.damage,0) / limits.survival * 100)}
            dmg={filteredHistory.filter(h=>h.pillar==='survival').reduce((s,h)=>s+h.damage,0)}
            colorClass="bg-blue-400"
            icon={Heart}
          />
          <RomanPillar
            label={t.pillar_progress}
            percent={(filteredHistory.filter(h=>h.pillar==='progress').reduce((s,h)=>s+h.damage,0) / limits.progress * 100)}
            dmg={filteredHistory.filter(h=>h.pillar==='progress').reduce((s,h)=>s+h.damage,0)}
            colorClass="bg-emerald-400"
            icon={Zap}
          />
          <RomanPillar
            label={t.pillar_desire}
            percent={(filteredHistory.filter(h=>h.pillar==='desire').reduce((s,h)=>s+h.damage,0) / limits.desire * 100)}
            dmg={filteredHistory.filter(h=>h.pillar==='desire').reduce((s,h)=>s+h.damage,0)}
            colorClass="bg-orange-400"
            icon={Flame}
          />
          <RomanPillar
            label={t.pillar_expedition}
            percent={(filteredHistory.filter(h=>h.pillar==='expedition').reduce((s,h)=>s+h.damage,0) / limits.expedition * 100)}
            dmg={filteredHistory.filter(h=>h.pillar==='expedition').reduce((s,h)=>s+h.damage,0)}
            colorClass="bg-purple-500"
            icon={Globe}
          />
        </div>
      </div>

      {/* AI 評論 */}
      <div className="px-2 py-4 flex items-start gap-4">
        <div className="w-16 h-16 bg-white border border-stone-200 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm rotate-2 shrink-0">
          {currentPersona.icon}
        </div>
        <div className="bg-white border border-stone-200 rounded-[2rem] rounded-tl-none p-5 shadow-sm relative flex-1 min-h-[80px] flex flex-col justify-center">
          <div className="absolute -top-[1px] left-0 w-4 h-4 bg-white border-l border-t border-stone-200 -translate-y-1/2 -rotate-45" />
          <p className="text-[10px] font-black text-[#BC8F8F] uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
            <MessageSquare size={10} fill="#BC8F8F" fillOpacity={0.2} aria-hidden="true" />
            {t[currentPersona.titleKey] || currentPersona.title} {t.persona_review}
          </p>
          {isAiProcessing ? (
            <div className="flex items-center gap-2 text-stone-400 text-[10px] italic font-medium">
              <Loader2 size={12} className="animate-spin text-stone-300" aria-hidden="true" />...
            </div>
          ) : (
            <p className="text-xs text-stone-600 leading-relaxed font-bold">「{aiComment}」</p>
          )}
        </div>
      </div>

      {/* 詳細列表 */}
      <div className="space-y-4">
        <p className="px-2 text-[10px] font-black text-stone-400 uppercase tracking-widest flex justify-between items-center">
          <span>{t.detail_list}</span>
          {potions > 0 && (
            <span className="text-blue-600 animate-pulse flex items-center gap-1">
              <LifeBuoy size={10} aria-hidden="true" /> {t.has_potions} x{potions}
            </span>
          )}
        </p>

        {filteredHistory.length === 0 ? (
          <EmptyState
            icon="inbox"
            title={t.no_data}
            description={t.no_data_hint || '選擇其他月份或開始記帳'}
          />
        ) : (
          filteredHistory.map(h => (
            <HistoryItem
              key={h.id}
              item={h}
              isEditing={editingId === h.id}
              tempCategory={tempCategory}
              onEdit={handleEditStart}
              onSave={handleEditSave}
              onCancel={() => setEditingId(null)}
              onDelete={deleteTransaction}
              onHeal={healTransaction}
              onDenialClick={handleDenialClick}
              canHeal={h.damage > 0 && potions > 0}
              showDenialEffect={!isDenialUnlocked && (clickCounts[h.id] || 0) >= 5}
              isDenialUnlocked={isDenialUnlocked}
              currentClicks={clickCounts[h.id] || 0}
              categoryKeys={categoryKeys}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default memo(HistoryView);
