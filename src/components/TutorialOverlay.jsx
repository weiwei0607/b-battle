import React, { useState } from 'react';
import { ChevronRight, X, Shield, Zap, Flame, Globe, Heart } from 'lucide-react';
import { LOCALES } from '../utils/locales';

// ─── 每個人格的戰前簡報台詞 ───────────────────────────────────────────────
const BRIEFINGS = {
  peer: {
    zh: "你他X終於來了。這四根柱子就是你的財務防線，全塌了你就跟我一樣慘。別讓我笑你。",
    en: "Finally showed up? These four pillars are your budget defense. Don't let them all collapse.",
    ja: "やっと来たか。この4本の柱がお前の財務防衛ライン。全部崩れたら終わりだぞ。",
  },
  asian_parent: {
    zh: "孩子啊，這四根柱子代表你每個月的預算。柱子倒了就是破產，媽媽不希望你亂花錢！",
    en: "Child, these pillars are your monthly budget. If they fall, you're broke. Don't waste money!",
    ja: "この4本の柱は毎月の予算を表しています。崩れたら破産です。無駄遣いはやめなさい！",
  },
  bestie: {
    zh: "姐妹！這四根柱柱就是妳的荷包防線！我們要一起守住，然後存旅遊基金💅",
    en: "Bestie! These four pillars guard your wallet! Let's protect them and save for travel 💅",
    ja: "親友！この4本の柱はお財布の防衛ライン！一緒に守って旅行基金を貯めよう💅",
  },
  instructor: {
    zh: "注意！這四條防線代表你的財務紀律。任何一條崩潰，就是違反命令。開始執行！",
    en: "Attention! Four budget lines. Any breach is a failure of discipline. Begin execution!",
    ja: "注目！4本の防衛ライン。どれかが崩れたら規律違反だ。今すぐ実行せよ！",
  },
  partner: {
    zh: "我們一起守護這四個預算好嗎？每一根柱子都代表著我們共同的未來...",
    en: "Can we protect these four budgets together? Each pillar represents our shared future...",
    ja: "一緒にこの4つの予算を守っていけますか？それぞれが私たちの未来を表しています...",
  },
};

// ─── 四神柱說明 ────────────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: <Heart size={20} className="text-blue-400" />,
    colorClass: 'bg-blue-400',
    label:  { zh: '🏥 生存', en: '🏥 Survival',  ja: '🏥 生存' },
    desc:   { zh: '食物・交通・租金。活下去的底線。',
              en: 'Food, transport, rent. The baseline for life.',
              ja: '食事・交通・家賃。生き延びるための最低ライン。' },
  },
  {
    icon: <Zap size={20} className="text-emerald-400" />,
    colorClass: 'bg-emerald-400',
    label:  { zh: '⚡ 進化', en: '⚡ Progress',   ja: '⚡ 進化' },
    desc:   { zh: '學習・健康投資。讓你變得更強的錢。',
              en: 'Education, health. Money that makes you stronger.',
              ja: '学習・健康投資。あなたを強くするお金。' },
  },
  {
    icon: <Flame size={20} className="text-orange-400" />,
    colorClass: 'bg-orange-400',
    label:  { zh: '🍹 慾望', en: '🍹 Desire',     ja: '🍹 欲望' },
    desc:   { zh: '娛樂・社交。享受人生，但有上限。',
              en: 'Entertainment, social. Enjoy life — but with limits.',
              ja: '娯楽・交際。楽しみながらも限度がある。' },
  },
  {
    icon: <Globe size={20} className="text-purple-400" />,
    colorClass: 'bg-purple-400',
    label:  { zh: '🏔️ 遠征', en: '🏔️ Expedition', ja: '🏔️ 遠征' },
    desc:   { zh: '購物・衝動消費。最難守的防線。',
              en: 'Shopping, impulse buys. The hardest line to hold.',
              ja: '買い物・衝動買い。最も守りにくい防衛ライン。' },
  },
];

// ─── 各 step 的標題 ────────────────────────────────────────────────────────
const STEP_TITLES = {
  zh: ['戰前簡報', '防衛陣線', '首次戰損', '戰略部署'],
  en: ['The Briefing', 'Pillar Defense', 'First Strike', 'Strategic Setup'],
  ja: ['作戦説明', '防衛陣形', '初戦損害', '戦略展開'],
};

export const TutorialOverlay = ({
  persona, personaStats, lang,
  onSkip, onComplete, setShowBudgetSetup,
}) => {
  const [step, setStep] = useState(1);       // 1~4
  const [pillarIdx, setPillarIdx] = useState(0);

  const t      = LOCALES[lang] || LOCALES.zh;
  const pData  = personaStats[persona] || {};
  const lx     = lang === 'en' ? 'en' : lang === 'ja' ? 'ja' : 'zh';
  const titles = STEP_TITLES[lx] || STEP_TITLES.zh;

  const handleNextPillar = () => {
    if (pillarIdx < PILLARS.length - 1) {
      setPillarIdx(i => i + 1);
    } else {
      setStep(3);
      setPillarIdx(0);
    }
  };

  const handleFinish = () => {
    setShowBudgetSetup(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[8500] bg-stone-950/85 backdrop-blur-sm flex flex-col items-center justify-end pb-6 px-4 animate-in fade-in duration-500">

      {/* ── 跳過按鈕 ── */}
      <button
        onClick={onSkip}
        className="absolute top-6 right-6 flex items-center gap-1.5 text-stone-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
      >
        <X size={12} /> {lx === 'en' ? 'Skip' : lx === 'ja' ? 'スキップ' : '跳過'}
      </button>

      {/* ── 步驟指示器 ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
        {[1,2,3,4].map(s => (
          <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-white' : s < step ? 'w-3 bg-stone-500' : 'w-3 bg-stone-700'}`} />
        ))}
      </div>

      {/* ══════════════════ STEP 1：戰前簡報 ══════════════════ */}
      {step === 1 && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
          <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.25em] text-center mb-4">
            {lx === 'en' ? `Step 1 — ${titles[0]}` : `Step 1 ‧ ${titles[0]}`}
          </p>
          <div className="bg-[#1C1917] border border-stone-700 rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-inner border border-stone-700">
                {pData.icon || '⚔️'}
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-2">
                  {t[pData.titleKey] || pData.titleKey}
                </p>
                <p className="text-sm font-bold text-stone-100 leading-relaxed">
                  「{BRIEFINGS[persona]?.[lx] || BRIEFINGS.peer[lx]}」
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-white text-stone-900 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              {lx === 'en' ? 'Understood' : lx === 'ja' ? '了解した' : '了解，繼續'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ STEP 2：四神柱介紹 ══════════════════ */}
      {step === 2 && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
          <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.25em] text-center mb-4">
            {lx === 'en' ? `Step 2 — ${titles[1]}` : `Step 2 ‧ ${titles[1]}`}
            <span className="ml-2 text-stone-600">{pillarIdx + 1} / {PILLARS.length}</span>
          </p>

          {/* 四柱預覽列 */}
          <div className="flex justify-center gap-4 mb-5">
            {PILLARS.map((p, i) => (
              <div key={i} className={`flex flex-col items-center gap-1 transition-all duration-300 ${i === pillarIdx ? 'scale-125' : 'opacity-30'}`}>
                <div className={`w-4 h-20 ${p.colorClass} rounded-sm opacity-80`} />
                <div className={`w-6 h-1 ${p.colorClass} rounded-full`} />
              </div>
            ))}
          </div>

          <div className="bg-[#1C1917] border border-stone-700 rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-stone-800 rounded-xl flex items-center justify-center shrink-0 border border-stone-700">
                {PILLARS[pillarIdx].icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-white mb-1">
                  {PILLARS[pillarIdx].label[lx]}
                </h3>
                <p className="text-[11px] text-stone-300 font-bold leading-relaxed">
                  {PILLARS[pillarIdx].desc[lx]}
                </p>
              </div>
            </div>
            <button
              onClick={handleNextPillar}
              className="w-full py-4 bg-white text-stone-900 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              {pillarIdx < PILLARS.length - 1
                ? (lx === 'en' ? 'Next Pillar' : lx === 'ja' ? '次の柱' : '下一根柱子')
                : (lx === 'en' ? 'Got It'     : lx === 'ja' ? '了解した' : '全部了解！')}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ STEP 3：首次戰損 ══════════════════ */}
      {step === 3 && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
          <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.25em] text-center mb-4">
            {lx === 'en' ? `Step 3 — ${titles[2]}` : `Step 3 ‧ ${titles[2]}`}
          </p>
          <div className="bg-[#1C1917] border border-stone-700 rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-red-900/50 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-red-800">
                ⚔️
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-white mb-1">
                  {lx === 'en' ? 'Log Your First Expense' : lx === 'ja' ? '最初の出費を記録' : '記錄第一筆支出'}
                </h3>
                <p className="text-[11px] text-stone-300 font-bold leading-relaxed">
                  {lx === 'en'
                    ? 'Use the input bar at the bottom — type something like "coffee 60" and watch the pillars react.'
                    : lx === 'ja'
                    ? '下の入力バーに「コーヒー 60」のように入力して、柱がどう反応するか見てみよう。'
                    : '在下方輸入框輸入一筆消費，例如「咖啡 60」，觀察柱子的反應。'}
                </p>
              </div>
            </div>

            {/* 模擬輸入框視覺提示 */}
            <div className="bg-stone-800/60 border border-stone-600 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span className="text-stone-500 text-xs font-black italic animate-pulse">
                {lx === 'en' ? 'e.g. coffee 60 ↵' : lx === 'ja' ? '例：コーヒー 60 ↵' : '例：咖啡 60 ↵'}
              </span>
            </div>

            {/* 箭頭指向下方輸入框 */}
            <div className="flex justify-center mb-4">
              <div className="text-stone-500 text-xs font-black animate-bounce">
                {lx === 'en' ? '↓ Input bar is right below' : lx === 'ja' ? '↓ 入力バーはすぐ下にあります' : '↓ 輸入框就在下方'}
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full py-4 bg-white text-stone-900 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              {lx === 'en' ? 'Done, Next Step' : lx === 'ja' ? '完了、次へ' : '已記帳，繼續'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ STEP 4：戰略預算部署 ══════════════════ */}
      {step === 4 && (
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
          <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.25em] text-center mb-4">
            {lx === 'en' ? `Step 4 — ${titles[3]}` : `Step 4 ‧ ${titles[3]}`}
          </p>
          <div className="bg-[#1C1917] border border-amber-800/50 rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-900/40 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-amber-700/50">
                🏛️
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-amber-300 mb-1">
                  {lx === 'en' ? 'Deploy Your Budget' : lx === 'ja' ? '予算を設定せよ' : '部署戰略預算'}
                </h3>
                <p className="text-[11px] text-stone-300 font-bold leading-relaxed">
                  {lx === 'en'
                    ? 'Set your monthly limits for each pillar. Your salary auto-calculates the distribution.'
                    : lx === 'ja'
                    ? '各柱の月次上限を設定しましょう。給与から自動配分できます。'
                    : '為四根柱子設定預算上限。輸入薪資後可自動計算分配比例。'}
                </p>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              <Shield size={14} />
              {lx === 'en' ? 'Open Budget Setup' : lx === 'ja' ? '予算設定を開く' : '開啟預算設定'}
            </button>

            <button
              onClick={onComplete}
              className="w-full mt-3 py-3 text-stone-500 font-black text-[10px] uppercase tracking-widest hover:text-stone-300 transition-colors"
            >
              {lx === 'en' ? 'Skip for now' : lx === 'ja' ? '後でやる' : '稍後再設定'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
