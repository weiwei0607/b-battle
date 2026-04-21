import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesPath = path.join(__dirname, 'src/utils/locales.js');

let content = fs.readFileSync(localesPath, 'utf8');

const zhAdditions = `
    // Shop
    shop_main_title: '意志補給站',
    shop_subtitle: 'Willpower Equipment & Supplies',
    shop_consumables: '戰鬥物資',
    shop_social: '社交與對抗',
    shop_territory: '領地與榮譽',
    shop_frames: '特效外觀',
    shop_not_enough: '金幣不足！多記幾筆生存消費來賺金幣吧！',
    shop_confirm_buy: '💰 確定要花費 {price} 金幣購買「{name}」嗎？\\n\\n效果：{desc}',
    shop_buy_frame: '✨ 頭像框「{name}」已裝備！',
    shop_buy_shield: '🛡️ 購買成功！已為您掛載鐵血護盾，可抵擋部分傷害。',
    shop_buy_potion: '🧪 購買成功！可在歷史分析頁面修復一筆戰損。',
    shop_buy_insurance: '🛡️ 保險生效！未來 24 小時大額支出戰損減免 80%。',
    shop_buy_sofa: '🪑 購買成功！沙發已放入領地，每日登入 Exp +5。',
    shop_prompt_banner: '請輸入你的戰場標語：',
    shop_default_banner: '意志如鋼，無堅不摧',
    shop_buy_banner: '🚩 旗幟已插上戰場！',
    shop_buy_social: '📦 購買成功！獲得「{name}」，請至好友名單使用。',
    shop_owned: '持有:',
    shop_footer: '「強化裝備，為了更長久的戰鬥」',
    shop_item_potion_name: '忘憂聖水', shop_item_potion_desc: '抹除歷史紀錄中的一筆戰損（HP恢復）。',
    shop_item_shield_name: '鐵血護盾', shop_item_shield_desc: '抵擋下一次 50% 的戰鬥戰損。',
    shop_item_insurance_name: '鋼鐵遺囑', shop_item_insurance_desc: '24小時內，單筆 >3000 的消費戰損減少 80%。',
    shop_item_stinkyEggs_name: '戰術臭雞蛋', shop_item_stinkyEggs_desc: '對隊友使用，若其大幅超支則發布全服通緝並罰款。',
    shop_item_rations_name: '鐵路便當', shop_item_rations_desc: '對隊友使用，幫其恢復 10% 的生存支柱 HP。',
    shop_item_sofa_name: '禁慾沙發', shop_item_sofa_desc: '長期道具。放置在領地，每日登入 Exp +5。',
    shop_item_banner_name: '意志旗幟', shop_item_banner_desc: '在戰場頂部顯示你的個人激勵標語。',
    shop_item_neon_name: '青色電鍍', shop_item_neon_desc: '換上極具未來感的青色電鍍頭像框。',
    shop_item_fire_name: '紅蓮業火', shop_item_fire_desc: '燃燒鬥志，裝備帶有動態感的紅火外框。',
    shop_item_gold_name: '黃金裝甲', shop_item_gold_desc: '意志力頂點的象徵，純金質感的奢華外框。',`;

const enAdditions = `
    // Shop
    shop_main_title: 'Supply Station',
    shop_subtitle: 'Willpower Equipment & Supplies',
    shop_consumables: 'Combat Supplies',
    shop_social: 'Social & PvP',
    shop_territory: 'Territory & Honor',
    shop_frames: 'Frames',
    shop_not_enough: 'Not enough coins! Log more survival expenses to earn coins!',
    shop_confirm_buy: '💰 Spend {price} coins to buy "{name}"?\\n\\nEffect: {desc}',
    shop_buy_frame: '✨ Frame "{name}" equipped!',
    shop_buy_shield: '🛡️ Success! Iron Shield mounted to block partial damage.',
    shop_buy_potion: '🧪 Success! Use it in the Analysis tab to heal a damage record.',
    shop_buy_insurance: '🛡️ Insurance active! Big expenses (>3000) take 80% less damage for 24h.',
    shop_buy_sofa: '🪑 Success! Sofa placed in territory. Daily login Exp +5.',
    shop_prompt_banner: 'Enter your battlefield slogan:',
    shop_default_banner: 'Willpower like steel, unbreakable.',
    shop_buy_banner: '🚩 Banner planted on the battlefield!',
    shop_buy_social: '📦 Success! Got "{name}". Use it from the Friend List.',
    shop_owned: 'Owned:',
    shop_footer: '"Gear up for longer battles."',
    shop_item_potion_name: 'Amnesia Potion', shop_item_potion_desc: 'Erase one battle damage from history (Restore HP).',
    shop_item_shield_name: 'Iron Shield', shop_item_shield_desc: 'Block 50% of the next battle damage.',
    shop_item_insurance_name: 'Steel Will', shop_item_insurance_desc: 'For 24h, reduce damage by 80% for single expenses >3000.',
    shop_item_stinkyEggs_name: 'Tactical Stinky Egg', shop_item_stinkyEggs_desc: 'Use on a teammate. Issues a bounty and fine if they overspend significantly.',
    shop_item_rations_name: 'Railway Bento', shop_item_rations_desc: 'Use on a teammate to restore 10% of their Survival Pillar HP.',
    shop_item_sofa_name: 'Zen Sofa', shop_item_sofa_desc: 'Permanent. Placed in territory for +5 Exp daily login.',
    shop_item_banner_name: 'Willpower Banner', shop_item_banner_desc: 'Display your personal motivational slogan at the top of the battlefield.',
    shop_item_neon_name: 'Cyan Neon', shop_item_neon_desc: 'Equip a futuristic cyan neon frame.',
    shop_item_fire_name: 'Crimson Fire', shop_item_fire_desc: 'Equip a dynamic blazing red frame.',
    shop_item_gold_name: 'Golden Armor', shop_item_gold_desc: 'Symbol of peak willpower, a luxurious pure gold frame.',`;

const jaAdditions = `
    // Shop
    shop_main_title: '補給ステーション',
    shop_subtitle: 'Willpower Equipment & Supplies',
    shop_consumables: '戦闘物資',
    shop_social: 'ソーシャルと対決',
    shop_territory: '領地と名誉',
    shop_frames: 'エフェクト外見',
    shop_not_enough: 'コイン不足！支出を記録してコインを稼ごう！',
    shop_confirm_buy: '💰 {price} コインで「{name}」を購入しますか？\\n\\n効果：{desc}',
    shop_buy_frame: '✨ フレーム「{name}」を装備しました！',
    shop_buy_shield: '🛡️ 購入成功！鉄血の盾がマウントされました。',
    shop_buy_potion: '🧪 購入成功！履歴分析でダメージを修復できます。',
    shop_buy_insurance: '🛡️ 保険有効！24時間、高額支出（>3000）のダメージを80%軽減します。',
    shop_buy_sofa: '🪑 購入成功！ソファを配置しました。毎日のログインExp +5。',
    shop_prompt_banner: '戦場のスローガンを入力：',
    shop_default_banner: '鋼の意志、無堅不摧',
    shop_buy_banner: '🚩 戦場に旗を立てました！',
    shop_buy_social: '📦 購入成功！「{name}」を獲得しました。フレンドリストから使用してください。',
    shop_owned: '所持:',
    shop_footer: '「長く戦うために、装備を強化せよ」',
    shop_item_potion_name: '忘却の聖水', shop_item_potion_desc: '履歴のダメージを1件消去する（HP回復）。',
    shop_item_shield_name: '鉄血の盾', shop_item_shield_desc: '次回の戦闘ダメージを50%ブロックする。',
    shop_item_insurance_name: '鋼鉄の遺言', shop_item_insurance_desc: '24時間以内、3000超の単一消費ダメージを80%減少。',
    shop_item_stinkyEggs_name: '戦術の腐った卵', shop_item_stinkyEggs_desc: 'チームメイトに使用。大幅な予算オーバーなら手配書を発行し罰金。',
    shop_item_rations_name: '鉄道弁当', shop_item_rations_desc: 'チームメイトに使用。生存の柱HPを10%回復。',
    shop_item_sofa_name: '禁欲のソファ', shop_item_sofa_desc: '永続アイテム。領地に配置でログインExp+5。',
    shop_item_banner_name: '意志の旗', shop_item_banner_desc: '戦場の上部に個人の激励スローガンを表示する。',
    shop_item_neon_name: 'シアンネオン', shop_item_neon_desc: '未来感のあるシアンネオンのフレームを装備。',
    shop_item_fire_name: '紅蓮の業火', shop_item_fire_desc: '燃えるようなダイナミックな赤いフレームを装備。',
    shop_item_gold_name: '黄金の鎧', shop_item_gold_desc: '意志の頂点の象徴、豪華な純金フレーム。',`;

content = content.replace(/(zh: \{.*?)(    \/\/ 親密度)/s, '$1' + zhAdditions + '\n$2');
content = content.replace(/(en: \{.*?)(    \/\/ Bond)/s, '$1' + enAdditions + '\n$2');
content = content.replace(/(ja: \{.*?)(    \/\/ Bond)/s, '$1' + jaAdditions + '\n$2');

fs.writeFileSync(localesPath, content, 'utf8');
console.log("Locales updated precisely");
