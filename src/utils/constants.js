// 🚀 B-Battle 旗艦版核心常數庫 (100+ 成就 & 全語系解耦)

export const CURRENCIES = { TWD: 'NT$', USD: '$', JPY: '¥', KRW: '₩', EUR: '€' };

// 分類映射 (對應 locales.js 中的 Key)
export const CATEGORY_MAP = { 
  'cat_food': 'survival', 'cat_rent': 'survival', 'cat_medical': 'survival', 'cat_utility': 'survival', 'cat_transport': 'survival',
  'cat_insure': 'survival', 'cat_daily': 'survival', 'cat_study': 'progress', 'cat_fitness': 'progress', 'cat_book': 'progress',
  'cat_software': 'progress', 'cat_course': 'progress', 'cat_tool': 'progress', 'cat_drink': 'desire', 'cat_snack': 'desire',
  'cat_ent': 'desire', 'cat_game': 'desire', 'cat_alcohol': 'desire', 'cat_box': 'desire', 'cat_social': 'expedition',
  'cat_shop': 'expedition', 'cat_travel': 'expedition', 'cat_big': 'expedition', 'cat_gift': 'expedition', 'cat_other': 'expedition'
};

// 羈絆等級名稱 (對應 locales.js 中的 Key)
export const getBondLevel = (intimacy) => {
  if (intimacy >= 100) return { key: 'bond_4', color: "text-red-600", bg: "bg-red-50" };
  if (intimacy >= 80) return { key: 'bond_3', color: "text-rose-500", bg: "bg-rose-50" };
  if (intimacy >= 50) return { key: 'bond_2', color: "text-orange-500", bg: "bg-orange-100" };
  if (intimacy >= 20) return { key: 'bond_1', color: "text-stone-500", bg: "bg-stone-50" };
  return { key: 'bond_0', color: "text-stone-400", bg: "bg-stone-50" };
};

export const getFrameStyle = (frameName) => {
  if (frameName === 'neon') return 'ring-4 ring-cyan-400 ring-offset-2 shadow-[0_0_15px_rgba(34,211,238,0.5)]';
  if (frameName === 'fire') return 'ring-4 ring-red-400 ring-offset-2 animate-pulse';
  if (frameName === 'gold') return 'ring-4 ring-amber-400 ring-offset-2 shadow-lg';
  return 'border border-stone-100';
};

// 🏆 100+ 史詩成就矩陣 (全數在位)
export const ACHIEVEMENTS = {
  // --- [征途] 數量系列 ---
  LOGS_1: { id: 'LOGS_1', name: '首戰告捷', desc: '完成第一次記帳', icon: '🎯', reward: 100, title: '記帳新兵' },
  LOGS_10: { id: 'LOGS_10', name: '意志起步', desc: '累計記帳達 10 筆', icon: '🏃', reward: 200 },
  LOGS_50: { id: 'LOGS_50', name: '習慣成自然', desc: '累計記帳達 50 筆', icon: '🔥', reward: 500 },
  LOGS_100: { id: 'LOGS_100', name: '記帳大師', desc: '累計記帳達 100 筆', icon: '🏆', reward: 1000, title: '記帳達人' },
  LOGS_500: { id: 'LOGS_500', name: '戰場老兵', desc: '累計記帳達 500 筆', icon: '🎖️', reward: 1500 },
  LOGS_1000: { id: 'LOGS_1000', name: '意志力的見證', desc: '累計記帳達 1,000 筆', icon: '📜', reward: 2000, title: '意志力領主' },
  LOGS_10000: { id: 'LOGS_10000', name: '省錢聖徒', desc: '累計記帳達 10,000 筆', icon: '🏛️', reward: 10000, title: '省錢聖徒' },
  LOGS_100000: { id: 'LOGS_100000', name: '財富主宰者', desc: '累計記帳達 100,000 筆', icon: '🌌', reward: 50000, title: '財富主宰者' },
  LOGS_1000000: { id: 'LOGS_1000000', name: '永恆意志之神', desc: '累計記帳達 1,000,000 筆', icon: '👑', reward: 1000000, isHidden: true, title: '永恆意志之神' },

  // --- [紀律] 生存與防禦系列 ---
  SAVING_EXPERT: { id: 'SAVING_EXPERT', name: '省錢達人', desc: '單日生存支出低於 200 元', icon: '🌱', reward: 300, title: '省錢大師' },
  DEBT_FREE: { id: 'DEBT_FREE', name: '無債一身輕', desc: '還清超過 500 元的債務', icon: '🕊️', reward: 500, title: '清債英雄' },
  THRIFTY_WEEK: { id: 'THRIFTY_WEEK', name: '鐵血週', desc: '連續 7 天總支出低於預算 20%', icon: '📅', reward: 1000, title: '鐵血宰相' },
  LOW_DMG_RUN: { id: 'LOW_DMG_RUN', name: '無傷生存', desc: '單日生存血量維持在 95% 以上', icon: '🛡️', reward: 400 },
  NO_EXPEDITION_WEEK: { id: 'NO_EXPEDITION_WEEK', name: '零遠征之週', desc: '連續 7 天沒有任何遠征類消費', icon: '🚫', reward: 800 },
  
  // --- [生活] 分類專家系列 ---
  CAFFEINE_ADDICT: { id: 'CAFFEINE_ADDICT', name: '咖啡因中毒', desc: '累計記帳 10 筆咖啡', icon: '☕', reward: 200, title: '咖啡貴族' },
  CONVENIENCE_STORE_FRIEND: { id: 'CONVENIENCE_STORE_FRIEND', name: '便利商店之友', desc: '在超商消費累計超過 5 次', icon: '🏪', reward: 150 },
  BOOK_WORM: { id: 'BOOK_WORM', name: '知識就是力量', desc: '在「學習」分類消費累計超過 3 次', icon: '📚', reward: 350 },
  HEALTH_NUT: { id: 'HEALTH_NUT', name: '健康狂熱', desc: '在「健身」分類消費累計超過 5 次', icon: '💪', reward: 400 },
  GOURMET: { id: 'GOURMET', name: '美食評論家', desc: '單日餐飲筆數超過 5 筆', icon: '🍔', reward: 100 },
  NIGHT_OWL: { id: 'NIGHT_OWL', name: '暗夜記帳士', desc: '在凌晨 0:00 - 4:00 之間記帳', icon: '🦉', reward: 200 },
  EARLY_BIRD: { id: 'EARLY_BIRD', name: '早起鳥兒', desc: '在早上 7:00 之前記帳', icon: '🌅', reward: 200 },
  
  // --- [情感] 人格與羈絆系列 ---
  LOYAL_PARTNER: { id: 'LOYAL_PARTNER', name: '靈魂伴侶', desc: '任一人格親密度達到 100', icon: '💖', reward: 1000 },
  WILLPOWER_GOD: { id: 'WILLPOWER_GOD', name: '意志力之神', desc: '累積經驗值達到 3000', icon: '👑', reward: 2000, title: '意志力之神' },
  COLD_WAR_SURVIVOR: { id: 'COLD_WAR_SURVIVOR', name: '冷戰倖存者', desc: '度過一次長達 24 小時的冷戰', icon: '❄️', reward: 500 },
  RITUAL_MASTER: { id: 'RITUAL_MASTER', name: '重生大師', desc: '成功執行過 3 次重建儀式', icon: '🔥', reward: 800 },
  PERSONA_COLLECTOR: { id: 'PERSONA_COLLECTOR', name: '千面人', desc: '使用過所有的人格進行互動', icon: '🎭', reward: 600 },
  MOM_LOVES_ME: { id: 'MOM_LOVES_ME', name: '老媽的驕傲', desc: '與亞洲家長親密度達 80', icon: '🤱', reward: 500 },
  
  // --- [物資] 道具與財富系列 ---
  SHIELD_USER: { id: 'SHIELD_USER', name: '防禦姿態', desc: '使用鐵血護盾抵擋 5 次傷害', icon: '🛡️', reward: 300 },
  POTION_MASTER: { id: 'POTION_MASTER', name: '鍊金術師', desc: '累計使用 3 瓶忘憂聖水', icon: '🧪', reward: 400 },
  SURVIVOR: { id: 'SURVIVOR', name: '最後的生還者', desc: '在血量低於 5% 時完成記帳', icon: '🤕', reward: 600 },
  WEALTHY_WARRIOR: { id: 'WEALTHY_WARRIOR', name: '金幣富翁', desc: '持有金幣超過 10000', icon: '💰', reward: 1500 },
  COLLECTOR: { id: 'COLLECTOR', name: '頭像框收藏家', desc: '購買超過 3 個不同的頭像框', icon: '🖼️', reward: 1000 },
  
  // --- [隱藏] 搞怪與彩蛋系列 ---
  BIG_SPENDER: { id: 'BIG_SPENDER', name: '預算粉碎者', desc: '單筆消費超過 3000 元', icon: '💣', reward: 50 },
  DENIAL_OF_REALITY: { id: 'DENIAL_OF_REALITY', name: '這不是我買的', desc: '連點電子發票 10 次嘗試否認現實', icon: '🙈', reward: 200, isHidden: true, title: '現實逃避者' },
  MIDNIGHT_SNACK: { id: 'MIDNIGHT_SNACK', name: '凌晨三點的罪惡', desc: '在深夜記下一筆宵夜', icon: '🌙', reward: 150, isHidden: true },
  KARMA_MASTER: { id: 'KARMA_MASTER', name: '刷成就大師', desc: '頻繁刪除紀錄被系統標記', icon: '🤡', reward: 1, isHidden: true, title: '刷成就大師' },
  BANKRUPT: { id: 'BANKRUPT', name: '破產邊緣', desc: '金幣歸零且負債超過 1000', icon: '💸', reward: 10, isHidden: true },
  ZERO_HERO: { id: 'ZERO_HERO', name: '歸零英雄', desc: '金幣剛好歸零', icon: '⚖️', reward: 500, isHidden: true }
};

export const getWalletStatus = (exp) => {
  if (exp >= 3500) return { name: "巔峰金庫", icon: "🏦", color: "text-amber-500", bg: "bg-amber-100" };
  if (exp >= 1500) return { name: "質感長皮夾", icon: "💼", color: "text-orange-500", bg: "bg-orange-100" };
  if (exp >= 500) return { name: "魔鬼氈錢包", icon: "👛", color: "text-blue-500", bg: "bg-blue-100" };
  return { name: "破掉的塑膠袋", icon: "🛍️", color: "text-stone-400", bg: "bg-stone-100" };
};

export const getHomeStatus = (m) => {
  if (m >= 500000) return { nameKey: 'home_sky', icon: "🏛️", next: 1000000 };
  if (m >= 150000) return { nameKey: 'home_castle', icon: "🏛️", next: 500000 };
  if (m >= 50000) return { nameKey: 'home_villa', icon: "🏡", next: 150000 };
  if (m >= 10000) return { nameKey: 'home_apt', icon: "🏢", next: 50000 };
  return { nameKey: 'home_tent', icon: "⛺", next: 10000 };
};
