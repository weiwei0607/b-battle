import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesPath = path.join(__dirname, 'src/utils/locales.js');

let content = fs.readFileSync(localesPath, 'utf8');

const achievements = [
  { id: 'LOGS_1', zhName: '首戰告捷', zhDesc: '完成第 1 筆記帳', enName: 'First Victory', enDesc: 'Complete your first log' },
  { id: 'LOGS_10', zhName: '意志起步', zhDesc: '累計記帳達 10 筆', enName: 'Willpower Start', enDesc: 'Complete 10 logs' },
  { id: 'LOGS_30', zhName: '漸入佳境', zhDesc: '累計記帳達 30 筆', enName: 'Getting Better', enDesc: 'Complete 30 logs' },
  { id: 'LOGS_50', zhName: '習慣成自然', zhDesc: '累計記帳達 50 筆', enName: 'Habit Forming', enDesc: 'Complete 50 logs' },
  { id: 'LOGS_80', zhName: '記帳熟手', zhDesc: '累計記帳達 80 筆', enName: 'Logging Pro', enDesc: 'Complete 80 logs' },
  { id: 'LOGS_100', zhName: '記帳大師', zhDesc: '累計記帳達 100 筆', enName: 'Logging Master', enDesc: 'Complete 100 logs' },
  { id: 'LOGS_200', zhName: '戰場精銳', zhDesc: '累計記帳達 200 筆', enName: 'Battlefield Elite', enDesc: 'Complete 200 logs' },
  { id: 'LOGS_500', zhName: '戰場老兵', zhDesc: '累計記帳達 500 筆', enName: 'Battlefield Veteran', enDesc: 'Complete 500 logs' },
  { id: 'LOGS_1000', zhName: '意志力的見證', zhDesc: '累計記帳達 1,000 筆', enName: 'Willpower Witness', enDesc: 'Complete 1,000 logs' },
  { id: 'LOGS_5000', zhName: '省錢聖徒', zhDesc: '累計記帳達 5,000 筆', enName: 'Saving Saint', enDesc: 'Complete 5,000 logs' },
  { id: 'LOGS_10000', zhName: '財富守護者', zhDesc: '累計記帳達 10,000 筆', enName: 'Wealth Guardian', enDesc: 'Complete 10,000 logs' },
  { id: 'LOGS_100000', zhName: '意志力神話', zhDesc: '累計記帳達 100,000 筆', enName: 'Willpower Myth', enDesc: 'Complete 100,000 logs' },
  { id: 'LOGS_1000000', zhName: '永恆意志之神', zhDesc: '累計記帳達 1,000,000 筆', enName: 'God of Willpower', enDesc: 'Complete 1,000,000 logs' },
  { id: 'EXP_500', zhName: '小有成就', zhDesc: '意志力經驗值達 500', enName: 'Small Achievement', enDesc: 'Reached 500 Willpower EXP' },
  { id: 'EXP_1500', zhName: '意志覺醒', zhDesc: '意志力經驗值達 1,500', enName: 'Willpower Awakening', enDesc: 'Reached 1,500 Willpower EXP' },
  { id: 'EXP_3000', zhName: '意志巔峰', zhDesc: '意志力經驗值達 3,000', enName: 'Willpower Peak', enDesc: 'Reached 3,000 Willpower EXP' },
  { id: 'EXP_5000', zhName: '超越凡人', zhDesc: '意志力經驗值達 5,000', enName: 'Beyond Mortal', enDesc: 'Reached 5,000 Willpower EXP' },
  { id: 'STREAK_3', zhName: '好的開始', zhDesc: '連續記帳 3 天', enName: 'Good Start', enDesc: 'Log for 3 days in a row' },
  { id: 'STREAK_7', zhName: '一週紀律', zhDesc: '連續記帳 7 天', enName: 'Weekly Discipline', enDesc: 'Log for 7 days in a row' },
  { id: 'STREAK_30', zhName: '滿月守護', zhDesc: '連續記帳 30 天', enName: 'Full Moon Guard', enDesc: 'Log for 30 days in a row' },
  { id: 'STREAK_100', zhName: '百日磨練', zhDesc: '連續記帳 100 天', enName: '100 Days Training', enDesc: 'Log for 100 days in a row' },
  { id: 'SAVING_EXPERT', zhName: '省錢達人', zhDesc: '單日生存支出低於 200 元', enName: 'Saving Expert', enDesc: 'Daily survival spending under 200' },
  { id: 'SURVIVAL_100', zhName: '極致生存', zhDesc: '單日生存支出低於 100 元', enName: 'Ultimate Survival', enDesc: 'Daily survival spending under 100' },
  { id: 'SURVIVAL_50', zhName: '苦行僧', zhDesc: '單日生存支出低於 50 元', enName: 'Ascetic Monk', enDesc: 'Daily survival spending under 50' },
  { id: 'THRIFTY_WEEK', zhName: '鐵血週', zhDesc: '連續 7 天總支出低於預算 20%', enName: 'Thrifty Week', enDesc: 'Total spending under 20% budget for 7 days' },
  { id: 'DEBT_FREE', zhName: '無債一身輕', zhDesc: '還清超過 500 元的債務', enName: 'Debt Free', enDesc: 'Cleared a debt over 500' },
  { id: 'NO_EXPEDITION_WEEK', zhName: '零遠征之週', zhDesc: '連續 7 天沒有任何遠征類消費', enName: 'Zero Expedition Week', enDesc: 'No expedition spending for 7 days' },
  { id: 'LOW_DMG_RUN', zhName: '無傷生存', zhDesc: '單日生存血量維持在 95% 以上', enName: 'Low Damage Run', enDesc: 'Daily survival HP stays above 95%' },
  { id: 'EARLY_BIRD', zhName: '早起鳥兒', zhDesc: '在早上 7:00 之前記帳', enName: 'Early Bird', enDesc: 'Log an expense before 7:00 AM' },
  { id: 'NIGHT_OWL', zhName: '暗夜記帳士', zhDesc: '在凌晨 0:00 - 4:00 之間記帳', enName: 'Night Owl', enDesc: 'Log an expense between 0:00 and 4:00 AM' },
  { id: 'MASTER_FOOD_1', zhName: '美食獵人 I', zhDesc: '餐飲記帳達 10 筆', enName: 'Food Hunter I', enDesc: '10 food logs' },
  { id: 'MASTER_FOOD_2', zhName: '美食獵人 II', zhDesc: '餐飲記帳達 50 筆', enName: 'Food Hunter II', enDesc: '50 food logs' },
  { id: 'MASTER_FOOD_3', zhName: '美食獵人 III', zhDesc: '餐飲記帳達 150 筆', enName: 'Food Hunter III', enDesc: '150 food logs' },
  { id: 'MASTER_STUDY_1', zhName: '求知者 I', zhDesc: '學習記帳達 5 筆', enName: 'Seeker I', enDesc: '5 study logs' },
  { id: 'MASTER_STUDY_2', zhName: '求知者 II', zhDesc: '學習記帳達 20 筆', enName: 'Seeker II', enDesc: '20 study logs' },
  { id: 'MASTER_STUDY_3', zhName: '求知者 III', zhDesc: '學習記帳達 50 筆', enName: 'Seeker III', enDesc: '50 study logs' },
  { id: 'CAFFEINE_ADDICT', zhName: '咖啡因中毒', zhDesc: '累計記帳 10 筆咖啡', enName: 'Caffeine Addict', enDesc: '10 coffee logs' },
  { id: 'CONVENIENCE_STORE_FRIEND', zhName: '便利商店之友', zhDesc: '在超商消費累計超過 5 次', enName: 'Convenience Store Friend', enDesc: '5 convenience store logs' },
  { id: 'BOOK_WORM', zhName: '知識就是力量', zhDesc: '在「學習」分類消費累計超過 3 次', enName: 'Book Worm', enDesc: '3 book logs' },
  { id: 'HEALTH_NUT', zhName: '健康狂熱', zhDesc: '健身分類消費達 5 次', enName: 'Health Nut', enDesc: '5 fitness logs' },
  { id: 'GOURMET', zhName: '美食評論家', zhDesc: '單日餐飲筆數超過 5 筆', enName: 'Gourmet', enDesc: '5 food logs in one day' },
  { id: 'LOYAL_PARTNER', zhName: '靈魂伴侶', zhDesc: '任一人格親密度達 100', enName: 'Loyal Partner', enDesc: '100 intimacy with any persona' },
  { id: 'COLD_WAR_SURVIVOR', zhName: '冷戰倖存者', zhDesc: '度過一次 24 小時冷戰', enName: 'Cold War Survivor', enDesc: 'Survive a 24h cold war' },
  { id: 'RITUAL_MASTER', zhName: '重生大師', zhDesc: '執行過 3 次重建儀式', enName: 'Ritual Master', enDesc: 'Complete 3 rebuild rituals' },
  { id: 'PERSONA_COLLECTOR', zhName: '千面人', zhDesc: '使用過所有的人格進行互動', enName: 'Persona Collector', enDesc: 'Interact with 6 personas' },
  { id: 'MOM_LOVES_ME', zhName: '老媽的驕傲', zhDesc: '與亞洲家長親密度達 80', enName: 'Mom\\\'s Pride', enDesc: '80 intimacy with Asian Parent' },
  { id: 'SHIELD_USER', zhName: '防禦姿態', zhDesc: '使用護盾抵擋 5 次傷害', enName: 'Defensive Stance', enDesc: 'Block damage 5 times with shield' },
  { id: 'SHIELD_50', zhName: '不動如山', zhDesc: '鐵血護盾抵擋傷害達 50 次', enName: 'Immovable', enDesc: 'Block damage 50 times with shield' },
  { id: 'POTION_MASTER', zhName: '鍊金術師', zhDesc: '累計使用 3 瓶忘憂聖水', enName: 'Alchemist', enDesc: 'Use 3 potions' },
  { id: 'POTION_10', zhName: '鍊金大師', zhDesc: '累計使用 10 瓶忘憂聖水', enName: 'Grand Alchemist', enDesc: 'Use 10 potions' },
  { id: 'SURVIVAL', zhName: '最後的生還者', zhDesc: '遭受單次巨大戰損後生存', enName: 'Last Survivor', enDesc: 'Survive a huge damage hit' },
  { id: 'WEALTHY_WARRIOR', zhName: '金幣富翁', zhDesc: '持有金幣超過 10,000', enName: 'Wealthy Warrior', enDesc: 'Hold 10,000 coins' },
  { id: 'WEALTH_100000', zhName: '守財金庫', zhDesc: '持有金幣超過 100,000', enName: 'Wealth Vault', enDesc: 'Hold 100,000 coins' },
  { id: 'COLLECTOR', zhName: '成就收藏家 I', zhDesc: '解鎖 5 個成就', enName: 'Title Collector I', enDesc: 'Unlock 5 achievements' },
  { id: 'COLLECTOR_10', zhName: '成就收藏家 II', zhDesc: '解鎖 10 個成就', enName: 'Title Collector II', enDesc: 'Unlock 10 achievements' },
  { id: 'COLLECTOR_30', zhName: '成就收藏家 III', zhDesc: '解鎖 30 個成就', enName: 'Title Collector III', enDesc: 'Unlock 30 achievements' },
  { id: 'BIG_SPENDER', zhName: '預算粉碎者', zhDesc: '單筆消費超過 3,000 元', enName: 'Budget Crusher', enDesc: 'Single log over 3,000' },
  { id: 'DENIAL_OF_REALITY', zhName: '這不是我買的', zhDesc: '連點電子發票 10 次嘗試否認現實', enName: 'Not My Purchase', enDesc: 'Click invoice 10 times to deny reality' },
  { id: 'MIDNIGHT_SNACK', zhName: '凌晨三點的罪惡', zhDesc: '在深夜記下一筆宵夜', enName: '3 AM Guilt', enDesc: 'Log a midnight snack' },
  { id: 'KARMA_MASTER', zhName: '刷成就大師', zhDesc: '頻繁刪除紀錄被系統標記', enName: 'Karma Master', enDesc: 'Flagged for deleting logs frequently' },
  { id: 'BANKRUPT', zhName: '破產邊緣', zhDesc: '金幣歸零且負債超過 1000', enName: 'Bankrupt', enDesc: '0 coins and debt over 1,000' },
  { id: 'ZERO_HERO', zhName: '歸零英雄', zhDesc: '金幣剛好歸零', enName: 'Zero Hero', enDesc: 'Coins hit exactly 0' },
  { id: 'GAMBLER', zhName: '豪賭客', zhDesc: '同時開啟 3 個我想買挑戰', enName: 'Gambler', enDesc: '3 active challenges' },
  { id: 'SET_WISHLIST', zhName: '夢想的起點', zhDesc: '設置一個購物願望', enName: 'Dream Starts Here', enDesc: 'Set a wishlist goal' },
  { id: 'OPEN_SHOP', zhName: '只是逛逛', zhDesc: '第一次打開道具屋', enName: 'Just Browsing', enDesc: 'Open the shop for the first time' }
];

const zhLines = achievements.map(a => `    ac_${a.id}_name: '${a.zhName}', ac_${a.id}_desc: '${a.zhDesc}',`).join('\n');
const enLines = achievements.map(a => `    ac_${a.id}_name: '${a.enName}', ac_${a.id}_desc: '${a.enDesc}',`).join('\n');

const jaLines = enLines; // Fallback to EN for JA achievements for now.

// 1. Update ZH block
content = content.replace(/\/\/ --- 征途系列 ---.*?ac_OPEN_SHOP_desc: '[^']+',/s, '// --- Achievements ---\n' + zhLines);

// 2. Update EN block
content = content.replace(/achievement_forbidden: 'Forbidden: Secret',.*?ac_SAVING_EXPERT_desc: 'Daily survival spending under 200'/s, "achievement_forbidden: 'Forbidden: Secret',\n" + enLines);

// 3. Update JA block
content = content.replace(/achievement_forbidden: '禁忌：秘密',.*?ac_SAVING_EXPERT_desc: '1日の支出を200円以下に抑える'/s, "achievement_forbidden: '禁忌：秘密',\n" + jaLines);

fs.writeFileSync(localesPath, content, 'utf8');
console.log("Locales fully rebuilt with all achievement keys.");
