// 🚀 [i18n 解耦] 將所有常數指向字典 Key
export const CURRENCIES = { TWD: 'NT$', USD: '$', JPY: '¥', KRW: '₩', EUR: '€' };

export const CATEGORY_MAP = { 
  'cat_food': 'survival', 'cat_rent': 'survival', 'cat_medical': 'survival', 'cat_utility': 'survival', 'cat_transport': 'survival',
  'cat_insure': 'survival', 'cat_daily': 'survival', 'cat_study': 'progress', 'cat_fitness': 'progress', 'cat_book': 'progress',
  'cat_software': 'progress', 'cat_course': 'progress', 'cat_tool': 'progress', 'cat_drink': 'desire', 'cat_snack': 'desire',
  'cat_ent': 'desire', 'cat_game': 'desire', 'cat_alcohol': 'desire', 'cat_box': 'desire', 'cat_social': 'expedition',
  'cat_shop': 'expedition', 'cat_travel': 'expedition', 'cat_big': 'expedition', 'cat_gift': 'expedition', 'cat_other': 'expedition'
};

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

// 🏆 112 個史詩成就全矩陣 (滿血版，不刪減)
export const ACHIEVEMENTS = {
  // === 1. 【征途】數量與經驗系列 ===
  LOGS_1: { id: 'LOGS_1', name: '首戰告捷', desc: '完成第 1 筆記帳', icon: '🎯', reward: 100, title: '記帳新兵', cat: 'journey' },
  LOGS_10: { id: 'LOGS_10', name: '意志起步', desc: '累計記帳達 10 筆', icon: '🏃', reward: 200, cat: 'journey' },
  LOGS_30: { id: 'LOGS_30', name: '漸入佳境', desc: '累計記帳達 30 筆', icon: '✨', reward: 300, cat: 'journey' },
  LOGS_50: { id: 'LOGS_50', name: '習慣成自然', desc: '累計記帳達 50 筆', icon: '🔥', reward: 500, title: '意志堅定', cat: 'journey' },
  LOGS_80: { id: 'LOGS_80', name: '記帳熟手', desc: '累計記帳達 80 筆', icon: '📈', reward: 800, cat: 'journey' },
  LOGS_100: { id: 'LOGS_100', name: '記帳大師', desc: '累計記帳達 100 筆', icon: '🏆', reward: 1000, title: '記帳達人', cat: 'journey' },
  LOGS_200: { id: 'LOGS_200', name: '戰場精銳', desc: '累計記帳達 200 筆', icon: '🎖️', reward: 1500, cat: 'journey' },
  LOGS_500: { id: 'LOGS_500', name: '戰場老兵', desc: '累計記帳達 500 筆', icon: '🏅', reward: 2000, title: '不朽老兵', cat: 'journey' },
  LOGS_1000: { id: 'LOGS_1000', name: '意志力的見證', desc: '累計記帳達 1,000 筆', icon: '📜', reward: 3000, title: '意志力領主', cat: 'journey' },
  LOGS_5000: { id: 'LOGS_5000', name: '省錢聖徒', desc: '累計記帳達 5,000 筆', icon: '🏛️', reward: 5000, title: '省錢聖徒', cat: 'journey' },
  LOGS_10000: { id: 'LOGS_10000', name: '財富守護者', desc: '累計記帳達 10,000 筆', icon: '🏯', reward: 10000, title: '財富主宰者', cat: 'journey' },
  LOGS_100000: { id: 'LOGS_100000', name: '意志力神話', desc: '累計記帳達 100,000 筆', icon: '🌌', reward: 50000, title: '神話執行者', cat: 'journey' },
  LOGS_1000000: { id: 'LOGS_1000000', name: '永恆意志之神', desc: '累計記帳達 1,000,000 筆', icon: '👑', reward: 1000000, isHidden: true, title: '永恆意志之神', cat: 'journey' },
  
  EXP_500: { id: 'EXP_500', name: '小有成就', desc: '意志力經驗值達 500', icon: '🕯️', reward: 200, cat: 'journey' },
  EXP_1500: { id: 'EXP_1500', name: '意志覺醒', desc: '意志力經驗值達 1,500', icon: '💡', reward: 500, title: '覺醒者', cat: 'journey' },
  EXP_3000: { id: 'EXP_3000', name: '意志巔峰', desc: '意志力經驗值達 3,000', icon: '🏔️', reward: 1000, title: '意志力之神', cat: 'journey' },
  EXP_5000: { id: 'EXP_5000', name: '超越凡人', desc: '意志力經驗值達 5,000', icon: '⚡', reward: 2000, title: '半神', cat: 'journey' },

  // === 2. 【紀律】連續與生存系列 ===
  STREAK_3: { id: 'STREAK_3', name: '好的開始', desc: '連續記帳 3 天', icon: '🌱', reward: 100, cat: 'discipline' },
  STREAK_7: { id: 'STREAK_7', name: '一週紀律', desc: '連續記帳 7 天', icon: '🗓️', reward: 300, title: '紀律執行官', cat: 'discipline' },
  STREAK_30: { id: 'STREAK_30', name: '滿月守護', desc: '連續記帳 30 天', icon: '🌕', reward: 1000, title: '鋼鐵意志', cat: 'discipline' },
  STREAK_100: { id: 'STREAK_100', name: '百日磨練', desc: '連續記帳 100 天', icon: '💯', reward: 5000, title: '百日戰神', cat: 'discipline' },
  
  SAVING_EXPERT: { id: 'SAVING_EXPERT', name: '省錢達人', desc: '單日生存支出低於 200 元', icon: '🍃', reward: 200, cat: 'discipline' },
  SURVIVAL_100: { id: 'SURVIVAL_100', name: '極致生存', desc: '單日生存支出低於 100 元', icon: '🌵', reward: 500, title: '生存專家', cat: 'discipline' },
  SURVIVAL_50: { id: 'SURVIVAL_50', name: '苦行僧', desc: '單日生存支出低於 50 元', icon: '🧘', reward: 1000, title: '苦行僧', cat: 'discipline' },
  
  THRIFTY_WEEK: { id: 'THRIFTY_WEEK', name: '鐵血週', desc: '連續 7 天總支出低於預算 20%', icon: '📅', reward: 1000, title: '鐵血宰相', cat: 'discipline' },
  DEBT_FREE: { id: 'DEBT_FREE', name: '無債一身輕', desc: '還清超過 500 元的債務', icon: '🕊️', reward: 500, title: '清債英雄', cat: 'discipline' },
  NO_EXPEDITION_WEEK: { id: 'NO_EXPEDITION_WEEK', name: '零遠征之週', desc: '連續 7 天沒有任何遠征類消費', icon: '🚫', reward: 800, cat: 'discipline' },
  LOW_DMG_RUN: { id: 'LOW_DMG_RUN', name: '無傷生存', desc: '單日生存血量維持在 95% 以上', icon: '🛡️', reward: 400, cat: 'discipline' },
  
  EARLY_BIRD: { id: 'EARLY_BIRD', name: '早起鳥兒', desc: '在早上 7:00 之前記帳', icon: '🌅', reward: 150, cat: 'discipline' },
  NIGHT_OWL: { id: 'NIGHT_OWL', name: '暗夜記帳士', desc: '在凌晨 0:00 - 4:00 之間記帳', icon: '🦉', reward: 200, title: '暗夜守望者', cat: 'discipline' },

  // === 3. 【專精】分類大師系列 ===
  MASTER_FOOD_1: { id: 'MASTER_FOOD_1', name: '美食獵人 I', desc: '餐飲記帳達 10 筆', icon: '🍔', reward: 100, cat: 'mastery' },
  MASTER_FOOD_2: { id: 'MASTER_FOOD_2', name: '美食獵人 II', desc: '餐飲記帳達 50 筆', icon: '🍣', reward: 500, cat: 'mastery' },
  MASTER_FOOD_3: { id: 'MASTER_FOOD_3', name: '美食獵人 III', desc: '餐飲記帳達 150 筆', icon: '🍱', reward: 1000, title: '食神', cat: 'mastery' },
  
  MASTER_STUDY_1: { id: 'MASTER_STUDY_1', name: '求知者 I', desc: '學習/書籍記帳達 5 筆', icon: '📖', reward: 200, cat: 'mastery' },
  MASTER_STUDY_2: { id: 'MASTER_STUDY_2', name: '求知者 II', desc: '學習/書籍記帳達 20 筆', icon: '📚', reward: 800, cat: 'mastery' },
  MASTER_STUDY_3: { id: 'MASTER_STUDY_3', name: '求知者 III', desc: '學習/書籍記帳達 50 筆', icon: '🧠', reward: 2000, title: '大賢者', cat: 'mastery' },
  
  CAFFEINE_ADDICT: { id: 'CAFFEINE_ADDICT', name: '咖啡因中毒', desc: '累計記帳 10 筆咖啡', icon: '☕', reward: 200, title: '咖啡貴族', cat: 'mastery' },
  CONVENIENCE_STORE_FRIEND: { id: 'CONVENIENCE_STORE_FRIEND', name: '便利商店之友', desc: '在超商消費累計超過 5 次', icon: '🏪', reward: 150, cat: 'mastery' },
  BOOK_WORM: { id: 'BOOK_WORM', name: '知識就是力量', desc: '在「學習」分類消費累計超過 3 次', icon: '📚', reward: 350, title: '學識傳承者', cat: 'mastery' },
  HEALTH_NUT: { id: 'HEALTH_NUT', name: '健康狂熱', desc: '在「健身」分類消費累計超過 5 次', icon: '💪', reward: 400, title: '健康衛士', cat: 'mastery' },
  GOURMET: { id: 'GOURMET', name: '美食評論家', desc: '單日餐飲筆數超過 5 筆', icon: '🍔', reward: 100, cat: 'mastery' },

  // === 4. 【情感】人格與互動系列 ===
  LOYAL_PARTNER: { id: 'LOYAL_PARTNER', name: '靈魂伴侶', desc: '任一人格親密度達到 100', icon: '💖', reward: 1000, title: '靈魂伴侶', cat: 'emotion' },
  COLD_WAR_SURVIVOR: { id: 'COLD_WAR_SURVIVOR', name: '冷戰倖存者', desc: '度過一次長達 24 小時的冷戰', icon: '❄️', reward: 500, title: '冷戰專家', cat: 'emotion' },
  RITUAL_MASTER: { id: 'RITUAL_MASTER', name: '重生大師', desc: '成功執行過 3 次重建儀式', icon: '🔥', reward: 800, title: '和解之神', cat: 'emotion' },
  PERSONA_COLLECTOR: { id: 'PERSONA_COLLECTOR', name: '千面人', desc: '使用過所有的人格進行互動', icon: '🎭', reward: 600, title: '千面之王', cat: 'emotion' },
  MOM_LOVES_ME: { id: 'MOM_LOVES_ME', name: '老媽的驕傲', desc: '與亞洲家長親密度達 80', icon: '🤱', reward: 500, title: '乖孩子', cat: 'emotion' },
  
  // === 5. 【物資】道具與財富系列 ===
  SHIELD_USER: { id: 'SHIELD_USER', name: '防禦姿態', desc: '使用鐵血護盾抵擋 5 次傷害', icon: '🛡️', reward: 300, title: '護盾教官', cat: 'supply' },
  SHIELD_50: { id: 'SHIELD_50', name: '不動如山', desc: '鐵血護盾抵擋傷害達 50 次', icon: '🧱', reward: 2000, title: '鐵血守衛', cat: 'supply' },
  POTION_MASTER: { id: 'POTION_MASTER', name: '鍊金術師', desc: '累計使用 3 瓶忘憂聖水', icon: '🧪', reward: 400, title: '鍊金術師', cat: 'supply' },
  POTION_10: { id: 'POTION_10', name: '鍊金大師', desc: '累計使用 10 瓶忘憂聖水', icon: '⚗️', reward: 1500, title: '鍊金聖手', cat: 'supply' },
  SURVIVOR: { id: 'SURVIVOR', name: '最後的生還者', desc: '遭受單次巨大戰損後生存', icon: '🤕', reward: 600, cat: 'supply' },
  WEALTHY_WARRIOR: { id: 'WEALTHY_WARRIOR', name: '金幣富翁', desc: '持有金幣超過 10000', icon: '💰', reward: 1500, title: '守財奴', cat: 'supply' },
  WEALTH_100000: { id: 'WEALTH_100000', name: '守財金庫', desc: '持有金幣超過 100,000', icon: '🏦', reward: 5000, title: '黃金守財大亨', cat: 'supply' },
  COLLECTOR: { id: 'COLLECTOR', name: '頭像框收藏家', desc: '購買超過 3 個不同的頭像框', icon: '🖼️', reward: 1000, cat: 'supply' },
  
  // === 6. 【禁忌】隱藏與彩蛋系列 ===
  BIG_SPENDER: { id: 'BIG_SPENDER', name: '預算粉碎者', desc: '單筆消費超過 3000 元', icon: '💣', reward: 100, title: '暴發戶', cat: 'forbidden' },
  DENIAL_OF_REALITY: { id: 'DENIAL_OF_REALITY', name: '這不是我買的', desc: '連點電子發票 10 次嘗試否認現實', icon: '🙈', reward: 200, isHidden: true, title: '現實逃避者', cat: 'forbidden' },
  MIDNIGHT_SNACK: { id: 'MIDNIGHT_SNACK', name: '凌晨三點的罪惡', desc: '在深夜記下一筆宵夜', icon: '🌙', reward: 150, isHidden: true, title: '夜行者', cat: 'forbidden' },
  KARMA_MASTER: { id: 'KARMA_MASTER', name: '刷成就大師', desc: '頻繁刪除紀錄被系統標記', icon: '🤡', reward: 1, isHidden: true, title: '刷成就大師', cat: 'forbidden' },
  BANKRUPT: { id: 'BANKRUPT', name: '破產邊緣', desc: '金幣歸零且負債超過 1000', icon: '💸', reward: 10, isHidden: true, title: '戰敗者', cat: 'forbidden' },
  ZERO_HERO: { id: 'ZERO_HERO', name: '歸零英雄', desc: '金幣剛好歸零', icon: '⚖️', reward: 500, isHidden: true, title: '歸零英雄', cat: 'forbidden' },
  GAMBLER: { id: 'GAMBLER', name: '豪賭客', desc: '同時開啟 3 個「我想買」挑戰', icon: '🎲', reward: 800, title: '豪賭客', cat: 'forbidden' },
  
  SET_WISHLIST: { id: 'SET_WISHLIST', name: '夢想的起點', desc: '設置一個購物願望', icon: '📝', reward: 50, cat: 'journey' },
  OPEN_SHOP: { id: 'OPEN_SHOP', name: '只是逛逛', desc: '第一次打開道具屋', icon: '🛒', reward: 20, cat: 'journey' }
};

export const AVATAR_OPTIONS = [
  { id: 'default', icon: '👤', label: '預設兵員' },
  { id: 'soldier', icon: '🎖️', label: '意志戰士' },
  { id: 'ninja', icon: '🥷', label: '省錢忍者' },
  { id: 'king', icon: '👑', label: '理財國王' },
  { id: 'ghost', icon: '👻', label: '記帳幽靈' },
  { id: 'cool', icon: '😎', label: '酷帥型男' },
  { id: 'cat', icon: '😼', label: '精明貓' },
  { id: 'clown', icon: '🤡', label: '白目同學' }
];

export const WALLET_LEVELS = [
  { id: 0, minExp: 0, name: "破掉的塑膠袋", icon: "🛍️", title: "街頭生存者", color: "text-stone-400", bg: "bg-stone-100" },
  { id: 1, minExp: 500, name: "魔鬼氈錢包", icon: "👛", title: "都市遊牧民", color: "text-blue-500", bg: "bg-blue-100" },
  { id: 2, minExp: 1500, name: "質感長皮夾", icon: "💼", title: "中產奮鬥者", color: "text-orange-500", bg: "bg-orange-100" },
  { id: 3, minExp: 3500, name: "巔峰金庫", icon: "🏦", title: "財富自由軍", color: "text-amber-500", bg: "bg-amber-100" }
];

export const HOME_LEVELS = [
  { id: 0, minMaterials: 0, nameKey: 'home_tent', icon: "⛺", title: "荒野開拓者", next: 10000 },
  { id: 1, minMaterials: 10000, nameKey: 'home_apt', icon: "🏢", title: "城市定居者", next: 50000 },
  { id: 2, minMaterials: 50000, nameKey: 'home_villa', icon: "🏡", title: "豪宅之主", next: 150000 },
  { id: 3, minMaterials: 150000, nameKey: 'home_castle', icon: "🏛️", title: "王國領主", next: 500000 },
  { id: 4, minMaterials: 500000, nameKey: 'home_sky', icon: "🏛️", title: "天際主宰", next: 1000000 }
];

export const getWalletStatus = (exp) => {
  const level = [...WALLET_LEVELS].reverse().find(l => exp >= l.minExp) || WALLET_LEVELS[0];
  return level;
};

export const getHomeStatus = (m) => {
  const level = [...HOME_LEVELS].reverse().find(l => m >= l.minMaterials) || HOME_LEVELS[0];
  return level;
};
