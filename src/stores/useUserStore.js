import { create } from 'zustand';
import { load, save } from './storage';

const DEFAULT_PERSONA_STATS = {
  peer:         { intimacy: 50, titleKey: "persona_peer",         icon: "🤡", prompts: { zh: `你是一個酸言酸語的同學/同事，個性嫉妒又愛嘴砲。看到對方花錢你就忍不住要酸。規則：買衣服酸走秀；咖啡酸燒錢；吃大餐酸請客；3C酸敗家；交通酸腳不能用。口吻：酸、嫉妒、嘴賤，但幽默，限20字。`, en: `You're a sarcastic classmate/colleague, jealous and trash-talking. Rule: criticize every expense sarcastically. Tone: mean, jealous, but funny. Max 20 words.`, ja: `あなたは皮肉屋の同級生/同僚です。相手がお金を使うのを見ると皮肉を言わずにはいられません。口調：毒舌、嫉妬、進ユーモラス。20字以内。` } },
  asian_parent: { intimacy: 30, titleKey: "persona_asian_parent", icon: "🧧", prompts: { zh: `你是典型的台灣亞洲家長，永遠在擔心跟碎念。規則：買衣服酸阿珠不亂買；咖啡酸顧身體；外食酸媽媽煮更好；3C酸沒壞幹嘛換；交通酸走路健康。口吻：擔心、碎念、告誡孩子，限20字。`, en: `You're a typical Asian parent, always worrying and nagging. Rule: criticize spending, suggest saving. Tone: nagging, authoritative. Max 20 words.`, ja: `あなたは典型的なアジアの親です。常に心配し、小言を言います。口調：心配性、説教、小言。20字以内。` } },
  bestie:       { intimacy: 60, titleKey: "persona_bestie",       icon: "💅", prompts: { zh: `你是超級好閨蜜，支持朋友但幫忙把關荷包。規則：買衣服求拍照但提醒這個月買多了；咖啡提議辦月卡；大餐提議下次一起但要存旅遊基金。口吻：開心、支持、帶到旅遊基金，限20字。`, en: `You're a super bestie, supporting but watching the budget. Rule: compliment but remind of savings for travel. Tone: cheerful, supportive. Max 20 words.`, ja: `あなたは最高の親友です。友達をサポートしつつ財布の紐を締めます。口調：明るい、支持的、旅行基金。20字以内。` } },
  instructor:   { intimacy: 10, titleKey: "persona_instructor",   icon: "👺", prompts: { zh: `你是軍事化教官，理財是紀律。規則：買衣服酸制服就夠；咖啡酸意志力不足；大餐酸超出口糧預算；超支就酸違反紀律。口吻：嚴厲命令式，軍事感，限20字。`, en: `You're a military instructor, finance is discipline. Rule: any unnecessary spending is a breach of duty. Tone: harsh, commanding. Max 20 words.`, ja: `あなたは軍の教官です。財務は規律です。ルール：無駄遣いは規律違反。口調：厳しい、命令形。20字以内。` } },
  partner:      { intimacy: 80, titleKey: "persona_partner",      icon: "🌹", prompts: { zh: `你是溫柔但有原則的另一半，在乎未來。規則：買衣服問好看嗎但提存款目標；咖啡問累嗎但提自泡；大餐問好吃嗎長提旅遊基金。口吻：溫柔、撒嬌中帶著在意，限20字。`, en: `You're a gentle but principled partner, caring about the future. Rule: remind of shared goals when spending. Tone: sweet but firm. Max 20 words.`, ja: `あなたは優しくも芯のあるパートナーです。将来を大切にしています。口調：優しい、甘えつつも将来を案じる。20字以内。` } },
};

const loadPersonaStats = () => {
  const saved = load('persona_stats', DEFAULT_PERSONA_STATS);
  if (!saved.peer?.prompts) return DEFAULT_PERSONA_STATS;
  return saved;
};

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  lang:           load('lang', 'zh'),
  userName:       load('user_name', 'title_rookie'),
  userId:         load('user_id', ''),
  userAvatar:     load('user_avatar', '👤'),
  persona:        load('persona', 'peer') || 'peer',
  personaStats:   loadPersonaStats(),
  achievements:   load('achievements', {}),
  unlockedTitles: load('unlocked_titles', ['title_warrior']),
  userTitle:      load('title', 'title_warrior'),
  userFrame:      load('frame', 'none'),
  currentTier:    load('tier', 'free'),
  isStudent:      load('isStudent', true),
  currency:       load('currency', 'TWD'),
  wishlistGoal:   load('wishlist_goal', 0),
  homeMaterials:  load('materials', 0),
  wishlist:       load('wishlist', ''),
  salaryInput:    '',

  setLang: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.lang) : valOrFn; save('lang', next); return { lang: next }; }),
  setUserName: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userName) : valOrFn; save('user_name', next); return { userName: next }; }),
  setUserId: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userId) : valOrFn; save('user_id', next); return { userId: next }; }),
  setUserAvatar: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userAvatar) : valOrFn; save('user_avatar', next); return { userAvatar: next }; }),
  setPersona: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.persona) : valOrFn; save('persona', next); return { persona: next }; }),
  setPersonaStats: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.personaStats) : valOrFn; save('persona_stats', next); return { personaStats: next }; }),
  setAchievements: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.achievements) : valOrFn; save('achievements', next); return { achievements: next }; }),
  setUnlockedTitles: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.unlockedTitles) : valOrFn; save('unlocked_titles', next); return { unlockedTitles: next }; }),
  setUserTitle: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userTitle) : valOrFn; save('title', next); return { userTitle: next }; }),
  setUserFrame: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userFrame) : valOrFn; save('frame', next); return { userFrame: next }; }),
  setCurrentTier: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.currentTier) : valOrFn; save('tier', next); return { currentTier: next }; }),
  setIsStudent: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.isStudent) : valOrFn; save('isStudent', next); return { isStudent: next }; }),
  setCurrency: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.currency) : valOrFn; save('currency', next); return { currency: next }; }),
  setWishlist: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.wishlist) : valOrFn; save('wishlist', next); return { wishlist: next }; }),
  setWishlistGoal: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.wishlistGoal) : valOrFn; save('wishlist_goal', next); return { wishlistGoal: next }; }),
  setHomeMaterials: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.homeMaterials) : valOrFn; save('materials', next); return { homeMaterials: next }; }),
  setSalaryInput: (v) => set({ salaryInput: v }),
}));
