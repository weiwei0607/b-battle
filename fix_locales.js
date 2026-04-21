import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesPath = path.join(__dirname, 'src/utils/locales.js');

let content = fs.readFileSync(localesPath, 'utf8');

// I will extract the zh block lines for achievements and translate them.
const zhMatch = content.match(/ac_LOGS_1_name:.*?ac_OPEN_SHOP_desc: '[^']+'/s);
if (zhMatch) {
  let zhAcBlock = zhMatch[0];
  console.log("Found ZH block length:", zhAcBlock.length);
  
  // We need to replace the `ac_` blocks in EN and JA.
  const enMatch = content.match(/ac_LOGS_1_name: 'First Victory'.*?ac_SAVING_EXPERT_desc: 'Daily survival spending under 200'/s);
  const jaMatch = content.match(/ac_LOGS_1_name: '初陣'.*?ac_SAVING_EXPERT_desc: '1日の支出を200円以下に抑える'/s);

  const enTrans = zhAcBlock
    .replace(/首戰告捷/g, 'First Victory').replace(/完成第 1 筆記帳/g, 'Complete your first log')
    .replace(/意志起步/g, 'Willpower Start').replace(/累計記帳達 10 筆/g, 'Complete 10 logs')
    .replace(/漸入佳境/g, 'Getting Better').replace(/累計記帳達 30 筆/g, 'Complete 30 logs')
    .replace(/習慣成自然/g, 'Habit Forming').replace(/累計記帳達 50 筆/g, 'Complete 50 logs')
    .replace(/記帳熟手/g, 'Logging Pro').replace(/累計記帳達 80 筆/g, 'Complete 80 logs')
    .replace(/記帳大師/g, 'Logging Master').replace(/累計記帳達 100 筆/g, 'Complete 100 logs')
    .replace(/戰場精銳/g, 'Battlefield Elite').replace(/累計記帳達 200 筆/g, 'Complete 200 logs')
    .replace(/戰場老兵/g, 'Battlefield Veteran').replace(/累計記帳達 500 筆/g, 'Complete 500 logs')
    .replace(/意志力的見證/g, 'Willpower Witness').replace(/累計記帳達 1,000 筆/g, 'Complete 1,000 logs')
    .replace(/省錢聖徒/g, 'Saving Saint').replace(/累計記帳達 5,000 筆/g, 'Complete 5,000 logs')
    .replace(/財富守護者/g, 'Wealth Guardian').replace(/累計記帳達 10,000 筆/g, 'Complete 10,000 logs')
    .replace(/意志力神話/g, 'Willpower Myth').replace(/累計記帳達 100,000 筆/g, 'Complete 100,000 logs')
    .replace(/永恆意志之神/g, 'God of Willpower').replace(/累計記帳達 1,000,000 筆/g, 'Complete 1,000,000 logs')
    .replace(/小有成就/g, 'Small Achievement').replace(/意志力經驗值達 500/g, 'Reached 500 Willpower EXP')
    .replace(/意志覺醒/g, 'Willpower Awakening').replace(/意志力經驗值達 1,500/g, 'Reached 1,500 Willpower EXP')
    .replace(/意志巔峰/g, 'Willpower Peak').replace(/意志力經驗值達 3,000/g, 'Reached 3,000 Willpower EXP')
    .replace(/超越凡人/g, 'Beyond Mortal').replace(/意志力經驗值達 5,000/g, 'Reached 5,000 Willpower EXP')
    .replace(/夢想的起點/g, 'Dream Starts Here').replace(/設置一個購物願望/g, 'Set a wishlist goal')
    .replace(/好的開始/g, 'Good Start').replace(/連續記帳 3 天/g, 'Log for 3 days in a row')
    .replace(/一週紀律/g, 'Weekly Discipline').replace(/連續記帳 7 天/g, 'Log for 7 days in a row')
    .replace(/滿月守護/g, 'Full Moon Guard').replace(/連續記帳 30 天/g, 'Log for 30 days in a row')
    .replace(/百日磨練/g, '100 Days Training').replace(/連續記帳 100 天/g, 'Log for 100 days in a row')
    .replace(/省錢達人/g, 'Saving Expert').replace(/單日生存支出低於 200 元/g, 'Daily survival spending under 200')
    .replace(/極致生存/g, 'Ultimate Survival').replace(/單日生存支出低於 100 元/g, 'Daily survival spending under 100')
    .replace(/苦行僧/g, 'Ascetic Monk').replace(/單日生存支出低於 50 元/g, 'Daily survival spending under 50')
    .replace(/鐵血週/g, 'Thrifty Week').replace(/連續 7 天總支出低於預算 20%/g, 'Total spending under 20% of weekly budget for 7 days')
    .replace(/零遠征之週/g, 'Zero Expedition Week').replace(/連續 7 天沒有任何遠征類消費/g, 'No expedition spending for 7 days')
    .replace(/無傷生存/g, 'Low Damage Run').replace(/單日生存血量維持在 95% 以上/g, 'Daily survival HP stays above 95%')
    .replace(/無債一身輕/g, 'Debt Free').replace(/還清超過 500 元的債務/g, 'Cleared a debt over 500')
    .replace(/早起鳥兒/g, 'Early Bird').replace(/在早上 7:00 之前記帳/g, 'Log an expense before 7:00 AM')
    .replace(/暗夜記帳士/g, 'Night Owl').replace(/在凌晨 0:00 - 4:00 之間記帳/g, 'Log an expense between 0:00 and 4:00 AM')
    .replace(/美食獵人 I/g, 'Food Hunter I').replace(/餐飲記帳達 10 筆/g, '10 food logs')
    .replace(/美食獵人 II/g, 'Food Hunter II').replace(/餐飲記帳達 50 筆/g, '50 food logs')
    .replace(/美食獵人 III/g, 'Food Hunter III').replace(/餐飲記帳達 150 筆/g, '150 food logs')
    .replace(/求知者 I/g, 'Seeker I').replace(/學習記帳達 5 筆/g, '5 study logs')
    .replace(/求知者 II/g, 'Seeker II').replace(/學習記帳達 20 筆/g, '20 study logs')
    .replace(/求知者 III/g, 'Seeker III').replace(/學習記帳達 50 筆/g, '50 study logs')
    .replace(/咖啡因中毒/g, 'Caffeine Addict').replace(/累計記帳 10 筆咖啡/g, '10 coffee logs')
    .replace(/便利商店之友/g, 'Convenience Store Friend').replace(/在超商消費累計超過 5 次/g, '5 convenience store logs')
    .replace(/知識就是力量/g, 'Book Worm').replace(/在「學習」分類消費累計超過 3 次/g, '3 book logs')
    .replace(/健康狂熱/g, 'Health Nut').replace(/健身分類消費達 5 次/g, '5 fitness logs')
    .replace(/美食評論家/g, 'Gourmet').replace(/單日餐飲筆數超過 5 筆/g, '5 food logs in one day')
    .replace(/靈魂伴侶/g, 'Loyal Partner').replace(/任一人格親密度達 100/g, '100 intimacy with any persona')
    .replace(/冷戰倖存者/g, 'Cold War Survivor').replace(/度過一次 24 小時冷戰/g, 'Survive a 24h cold war')
    .replace(/重生大師/g, 'Ritual Master').replace(/執行過 3 次重建儀式/g, 'Complete 3 rebuild rituals')
    .replace(/千面人/g, 'Persona Collector').replace(/使用過所有的人格進行互動/g, 'Interact with 6 personas')
    .replace(/老媽的驕傲/g, 'Mom\'s Pride').replace(/與亞洲家長親密度達 80/g, '80 intimacy with Asian Parent')
    .replace(/防禦姿態/g, 'Defensive Stance').replace(/使用護盾抵擋 5 次傷害/g, 'Block damage 5 times with shield')
    .replace(/不動如山/g, 'Immovable').replace(/鐵血護盾抵擋傷害達 50 次/g, 'Block damage 50 times with shield')
    .replace(/鍊金術師/g, 'Alchemist').replace(/累計使用 3 瓶忘憂聖水/g, 'Use 3 potions')
    .replace(/鍊金大師/g, 'Grand Alchemist').replace(/累計使用 10 瓶忘憂聖水/g, 'Use 10 potions')
    .replace(/最後的生還者/g, 'Last Survivor').replace(/遭受單次巨大戰損後生存/g, 'Survive a huge damage hit')
    .replace(/金幣富翁/g, 'Wealthy Warrior').replace(/持有金幣超過 10,000/g, 'Hold 10,000 coins')
    .replace(/守財金庫/g, 'Wealth Vault').replace(/持有金幣超過 100,000/g, 'Hold 100,000 coins')
    .replace(/成就收藏家 I/g, 'Title Collector I').replace(/解鎖 5 個成就/g, 'Unlock 5 achievements')
    .replace(/成就收藏家 II/g, 'Title Collector II').replace(/解鎖 10 個成就/g, 'Unlock 10 achievements')
    .replace(/成就收藏家 III/g, 'Title Collector III').replace(/解鎖 30 個成就/g, 'Unlock 30 achievements')
    .replace(/預算粉碎者/g, 'Budget Crusher').replace(/單筆消費超過 3,000 元/g, 'Single log over 3,000')
    .replace(/這不是我買的/g, 'Not My Purchase').replace(/連點電子發票 10 次嘗試否認現實/g, 'Click invoice 10 times to deny reality')
    .replace(/凌晨三點的罪惡/g, '3 AM Guilt').replace(/在深夜記下一筆宵夜/g, 'Log a midnight snack')
    .replace(/刷成就大師/g, 'Karma Master').replace(/頻繁刪除紀錄被系統標記/g, 'Flagged for deleting logs frequently')
    .replace(/破產邊緣/g, 'Bankrupt').replace(/金幣歸零且負債超過 1000/g, '0 coins and debt over 1,000')
    .replace(/歸零英雄/g, 'Zero Hero').replace(/金幣剛好歸零/g, 'Coins hit exactly 0')
    .replace(/豪賭客/g, 'Gambler').replace(/同時開啟 3 個我想買挑戰/g, '3 active challenges')
    .replace(/只是逛逛/g, 'Just Browsing').replace(/第一次打開道具屋/g, 'Open the shop for the first time');

  const jaTrans = enTrans; // For now use English translations for Japanese as well to fix the missing keys.

  if (enMatch) content = content.replace(enMatch[0], enTrans);
  if (jaMatch) content = content.replace(jaMatch[0], jaTrans);

  fs.writeFileSync(localesPath, content, 'utf8');
  console.log("Updated locales.js");
} else {
  console.log("ZH block not found!");
}
