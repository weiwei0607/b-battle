export const CURRENCIES = { TWD: 'NT$', USD: '$', JPY: '¥', CNY: '¥', KRW: '₩', EUR: '€' };

export const CATEGORY_MAP = { 
  '餐飲': 'survival', '房租': 'survival', '醫療': 'survival', '水電': 'survival', '交通': 'survival', '保險': 'survival', '日用品': 'survival',
  '學習': 'progress', '健身': 'progress', '書籍': 'progress', '軟體': 'progress', '課程': 'progress', '工作工具': 'progress',
  '飲料': 'desire', '零食': 'desire', '娛樂': 'desire', '遊戲': 'desire', '菸酒': 'desire', '盲盒': 'desire',
  '社交': 'expedition', '購物': 'expedition', '旅行': 'expedition', '大宗': 'expedition', '禮物': 'expedition'
};

export const POOL_COLORS = { 
  survival: 'bg-blue-500', 
  progress: 'bg-emerald-500', 
  desire: 'bg-orange-500', 
  expedition: 'bg-purple-600'
};

export const PERSONA_PERKS = { 
  asian_parent: "【慈母手中錢】", 
  bestie: "【湊免運】", 
  instructor: "【鐵血護盾】", 
  partner: "【愛的魔法】", 
  peer: "【請喝咖啡】" 
};

export const getPoolColorClass = (key) => POOL_COLORS[key] || 'bg-stone-400';

export const getBondLevel = (intimacy) => 
  intimacy >= 81 ? 4 : (intimacy >= 51 ? 3 : (intimacy >= 21 ? 2 : 1));

export const getFrameStyle = (frameName) => {
  if (frameName === 'neon') return 'ring-4 ring-blue-400 ring-offset-2';
  if (frameName === 'fire') return 'ring-4 ring-red-400 ring-offset-2 animate-pulse';
  if (frameName === 'gold') return 'ring-4 ring-amber-400 ring-offset-2';
  return 'border border-stone-100';
};

export const getWalletStatus = (exp) => {
  if (exp >= 3500) return { name: "巔峰金庫", icon: "🏦", color: "text-amber-500", bg: "bg-amber-100" };
  if (exp >= 1500) return { name: "質感長皮夾", icon: "💼", color: "text-orange-500", bg: "bg-orange-100" };
  if (exp >= 500) return { name: "魔鬼氈錢包", icon: "👛", color: "text-blue-500", bg: "bg-blue-100" };
  return { name: "破掉的塑膠袋", icon: "🛍️", color: "text-stone-400", bg: "bg-stone-100" };
};

// 🏛️ 極限領地演化邏輯
export const getHomeStatus = (m) => {
  if (m >= 2000000) return { name: "萬神殿：預算之神", icon: "⛩️", next: "MAX" };
  if (m >= 500000) return { name: "雲端大理石城堡", icon: "🏰", next: 2000000 };
  if (m >= 150000) return { name: "聖地石造莊園", icon: "🏛️", next: 500000 };
  if (m >= 50000) return { name: "奢華雅緻別墅", icon: "🏡", next: 150000 };
  if (m >= 10000) return { name: "都市高級公寓", icon: "🏢", next: 50000 };
  return { name: "荒野中的帳篷", icon: "⛺", next: 10000 };
};
