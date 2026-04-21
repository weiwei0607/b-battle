import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shopPath = path.join(__dirname, 'src/modals/ShopModal.jsx');

let content = fs.readFileSync(shopPath, 'utf8');

content = content.replace(
  /alert\("金幣不足！多記幾筆生存消費來賺金幣吧！"\);/g,
  'alert(t.shop_not_enough);'
);

content = content.replace(
  /if \(\!window\.confirm\(`💰 確定要花費 \$\{price\} 金幣購買「\$\{name\}」嗎？\\n\\n效果：\$\{desc\}`\)\) {/g,
  'if (!window.confirm(t.shop_confirm_buy.replace("{price}", price).replace("{name}", name).replace("{desc}", desc))) {'
);

content = content.replace(
  /alert\(`✨ 頭像框「\$\{name\}」已裝備！`\);/g,
  'alert(t.shop_buy_frame.replace("{name}", name));'
);

content = content.replace(
  /alert\("🛡️ 購買成功！已為您掛載鐵血護盾，可抵擋部分傷害。"\);/g,
  'alert(t.shop_buy_shield);'
);

content = content.replace(
  /alert\("🧪 購買成功！可在歷史分析頁面修復一筆戰損。"\);/g,
  'alert(t.shop_buy_potion);'
);

content = content.replace(
  /alert\("🛡️ 保險生效！未來 24 小時大額支出戰損減免 80%。"\);/g,
  'alert(t.shop_buy_insurance);'
);

content = content.replace(
  /alert\("🪑 購買成功！沙發已放入領地，每日登入 Exp \+5。"\);/g,
  'alert(t.shop_buy_sofa);'
);

content = content.replace(
  /const text = window\.prompt\("請輸入你的戰場標語：", "意志如鋼，無堅不摧"\);/g,
  'const text = window.prompt(t.shop_prompt_banner, t.shop_default_banner);'
);

content = content.replace(
  /alert\("🚩 旗幟已插上戰場！"\);/g,
  'alert(t.shop_buy_banner);'
);

content = content.replace(
  /alert\(`📦 購買成功！獲得「\$\{name\}」，請至好友名單使用。`\);/g,
  'alert(t.shop_buy_social.replace("{name}", name));'
);

content = content.replace(
  /name: '忘憂聖水', price: 300, icon: '🧪', desc: '抹除歷史紀錄中的一筆戰損（HP恢復）。'/g,
  'name: t.shop_item_potion_name, price: 300, icon: \'🧪\', desc: t.shop_item_potion_desc'
);

content = content.replace(
  /name: '鐵血護盾', price: 200, icon: '🛡️', desc: '抵擋下一次 50% 的戰鬥戰損。'/g,
  'name: t.shop_item_shield_name, price: 200, icon: \'🛡️\', desc: t.shop_item_shield_desc'
);

content = content.replace(
  /name: '鋼鐵遺囑', price: 500, icon: '📄', desc: '24小時內，單筆 >3000 的消費戰損減少 80%。'/g,
  'name: t.shop_item_insurance_name, price: 500, icon: \'📄\', desc: t.shop_item_insurance_desc'
);

content = content.replace(
  /name: '戰術臭雞蛋', price: 150, icon: '🥚', desc: '對隊友使用，若其大幅超支則發布全服通緝並罰款。'/g,
  'name: t.shop_item_stinkyEggs_name, price: 150, icon: \'🥚\', desc: t.shop_item_stinkyEggs_desc'
);

content = content.replace(
  /name: '鐵路便當', price: 250, icon: '🍱', desc: '對隊友使用，幫其恢復 10% 的生存支柱 HP。'/g,
  'name: t.shop_item_rations_name, price: 250, icon: \'🍱\', desc: t.shop_item_rations_desc'
);

content = content.replace(
  /name: '禁慾沙發', price: 800, icon: '🪑', desc: '長期道具。放置在領地，每日登入 Exp \+5。'/g,
  'name: t.shop_item_sofa_name, price: 800, icon: \'🪑\', desc: t.shop_item_sofa_desc'
);

content = content.replace(
  /name: '意志旗幟', price: 400, icon: '🚩', desc: '在戰場頂部顯示你的個人激勵標語。'/g,
  'name: t.shop_item_banner_name, price: 400, icon: \'🚩\', desc: t.shop_item_banner_desc'
);

content = content.replace(
  /name: '青色電鍍', price: 150, icon: '💎', desc: '換上極具未來感的青色電鍍頭像框。'/g,
  'name: t.shop_item_neon_name, price: 150, icon: \'💎\', desc: t.shop_item_neon_desc'
);

content = content.replace(
  /name: '紅蓮業火', price: 400, icon: '🔥', desc: '燃燒鬥志，裝備帶有動態感的紅火外框。'/g,
  'name: t.shop_item_fire_name, price: 400, icon: \'🔥\', desc: t.shop_item_fire_desc'
);

content = content.replace(
  /name: '黃金裝甲', price: 1000, icon: '🏆', desc: '意志力頂點的象徵，純金質感的奢華外框。'/g,
  'name: t.shop_item_gold_name, price: 1000, icon: \'🏆\', desc: t.shop_item_gold_desc'
);

content = content.replace(/意志補給站/g, '{t.shop_main_title}');
content = content.replace(/Willpower Equipment & Supplies/g, '{t.shop_subtitle}');
content = content.replace(/>戰鬥物資</g, '>{t.shop_consumables}<');
content = content.replace(/>社交與對抗</g, '>{t.shop_social}<');
content = content.replace(/>領地與榮譽</g, '>{t.shop_territory}<');
content = content.replace(/>特效外觀</g, '>{t.shop_frames}<');
content = content.replace(/持有: /g, '{t.shop_owned} ');
content = content.replace(/「強化裝備，為了更長久的戰鬥」/g, '{t.shop_footer}');

fs.writeFileSync(shopPath, content, 'utf8');
console.log("ShopModal.jsx updated successfully");
