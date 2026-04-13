import React, { useState } from 'react';
import { X, Swords, Heart, Zap, Flame, Shield, Users, BookOpen } from 'lucide-react';

const ManualModal = ({ show, onClose, lang }) => {
  const [tab, setTab] = useState('pillars');
  const t = LOCALES[lang] || LOCALES.zh;
  
  if (!show) return null;

  const sections = {
    pillars: {
      icon: <Heart size={20} />,
      title: t.manual_pillars_title,
      content: [
        { label: "🏥 生存 (Survival)", desc: "食、住、交通等必要開支。這是你的生命線，超支會導致大理石支柱碎裂。" },
        { label: "⚡ 進化 (Progress)", desc: "學習、健身、自我投資。雖然是支出，但能提升你的意志力經驗值。" },
        { label: "🍹 慾望 (Desire)", desc: "娛樂、手搖飲、遊戲。這是防線的大敵，造成的戰損比例最高。" },
        { label: "🏔️ 遠征 (Expedition)", desc: "購物、旅行、大宗消費。偶爾的冒險，但請確保你的物資足以支撐。" }
      ]
    },
    damage: {
      icon: <Flame size={20} />,
      title: t.manual_damage_title,
      content: [
        { label: "百分比計算", desc: "戰損 = (消費金額 / 該類別預算上限) * 100%。" },
        { label: "公平對抗", desc: "在 5v5 模式中，我們比的是預算使用比例，而非絕對金額。月薪 3 萬與 30 萬的人也能公平對決！" },
        { label: "崩塌效應", desc: "當支柱 HP 低於 30% 時會出現裂痕；低於 15% 時會開始劇烈震動並轉紅。" }
      ]
    },
    persona: {
      icon: <Users size={20} />,
      title: t.manual_persona_title,
      content: [
        { label: "親密度 (Bond)", desc: "良好的記帳習慣能提升 AI 對你的好感度。連勝 3 天以上會觸發『崇拜模式』。" },
        { label: "關係斷絕", desc: "若頻繁超支或長時間不記帳，AI 會與你斷絕關係，UI 轉為地獄灰階。" },
        { label: "重生儀式", desc: "斷絕關係後，必須寫下 50 字反省文或繳納罰金才能重新啟動意志力防線。" }
      ]
    },
    supplies: {
      icon: <Shield size={20} />,
      title: t.manual_supplies_title,
      content: [
        { label: "忘憂聖水", desc: "抹除歷史紀錄中的一筆戰損，恢復對應的 HP。" },
        { label: "鐵血護盾", desc: "裝備後可自動抵擋下一次 50% 的戰損（不限分類）。" },
        { label: "連勝加成", desc: "連續 3 天低消，記帳金幣翻倍，全柱金光加持！" }
      ]
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#F7F4EF] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-stone-200/50 rounded-full text-stone-500 active:scale-90 transition-all">
          <X size={16} />
        </button>

        <div className="text-center mb-8 shrink-0">
          <div className="inline-flex bg-stone-800 p-3 rounded-2xl text-white mb-3 shadow-lg">
            <BookOpen size={24} />
          </div>
          <h3 className="text-2xl font-black text-stone-800 tracking-tight italic uppercase">{t.manual_title}</h3>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Willpower Combat Manual</p>
        </div>

        {/* 📑 分頁切換 */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-6 shrink-0">
          {Object.keys(sections).map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center transition-all ${tab === s ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              {sections[s].icon}
            </button>
          ))}
        </div>

        {/* 📜 內容區域 */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 border-l-4 border-stone-800 pl-2">
              {sections[tab].title}
            </h4>
            <div className="space-y-4">
              {sections[tab].content.map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm">
                  <p className="text-[12px] font-black text-stone-800 mb-1.5">{item.label}</p>
                  <p className="text-[10px] text-stone-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-[9px] text-stone-400 text-center italic border-t border-stone-100 pt-4">「記帳不是為了算帳，是為了在誘惑前多一次拔劍的機會。」</p>
      </div>
    </div>
  );
};

export default ManualModal;
