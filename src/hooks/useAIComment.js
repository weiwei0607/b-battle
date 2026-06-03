/**
 * useAIComment
 * 職責：所有 Gemini API 呼叫的唯一入口。
 *
 * 設計決策 — isAiProcessing / aiComment 放在 useBattleStore：
 *   原因：UI 上多個元件（BattleLog、AICommentBubble、NLPInput）
 *   都需要訂閱這兩個值，放在 store 可以避免 prop drilling。
 *   這個 hook 只負責寫入 store，不自己維護 state。
 *
 * 提供三個函式：
 *   generateComment   - 單筆消費後呼叫，產生 persona 評論
 *   generateMonthlyReview - 月報呼叫
 *   parseNLPTransaction  - 解析自然語言輸入，回傳 { amount, desc, category }
 */
import { useCallback } from 'react';
import { useBattleStore } from '../stores/useBattleStore';
import { useUserStore } from '../stores/useUserStore';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const geminiPost = async (apiKey, body) => {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

const extractText = (result) =>
  result.candidates?.[0]?.content?.parts?.[0]?.text ?? '...';

export const useAIComment = (apiKey) => {
  const { setAiComment, setIsAiProcessing } = useBattleStore();
  const { lang, persona, personaStats, wishlist } = useUserStore();

  /**
   * 單筆消費後產生 persona 評論
   * @param {{ amount, desc, isCombo, savingStreak }} params
   */
  const generateComment = useCallback(
    async ({ amount, desc, isCombo, savingStreak, userTitle }) => {
      if (!apiKey) return;
      setIsAiProcessing(true);
      try {
        const personaData = personaStats[persona];
        const systemBase =
          personaData?.prompts?.[lang] ?? personaData?.prompt ?? '';

        const comboInstruction = isCombo
          ? ` IMPORTANT: The user is on a ${savingStreak}-day saving streak! React with extreme praise and disbelief — like witnessing a miracle. Go over the top.`
          : '';

        const titleInstruction = userTitle
          ? ` IMPORTANT: The user's title is "${userTitle}". Use their title as a STANDARD to judge their behavior. Create contrast — mock them if they betray their title, praise them if they live up to it. Example tones: "你這個購物對得起你${userTitle}的稱號嗎？" or "${userTitle}居然這樣花錢？". Keep it punchy.`
          : '';

        const systemPrompt =
          `System: ${systemBase}.${comboInstruction}${titleInstruction} Goal: ${wishlist}. ` +
          `Action: spent ${amount} on ${desc}. Rules: limit 20 words, must use language: ${lang}.`;

        const result = await geminiPost(apiKey, {
          contents: [{ parts: [{ text: `Spent ${amount} on ${desc}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
        });
        setAiComment(extractText(result));
      } catch {
        setAiComment('...');
      } finally {
        setIsAiProcessing(false);
      }
    },
    [apiKey, lang, persona, personaStats, wishlist, setAiComment, setIsAiProcessing]
  );

  /**
   * 月報評論
   * @param {Array} filteredHistory - 該月的消費紀錄
   */
  const generateMonthlyReview = useCallback(
    async (filteredHistory) => {
      if (!apiKey || filteredHistory.length === 0) return;
      setIsAiProcessing(true);
      try {
        const personaData = personaStats[persona];
        const systemBase =
          personaData?.prompts?.[lang] ?? personaData?.prompt ?? '';

        const summary = filteredHistory.reduce((acc, h) => {
          acc[h.pillar] = (acc[h.pillar] || 0) + h.damage;
          return acc;
        }, {});

        const result = await geminiPost(apiKey, {
          contents: [{ parts: [{ text: `Monthly Report: ${JSON.stringify(summary)}` }] }],
          systemInstruction: {
            parts: [{ text: `${systemBase}. Reply in 30 words using ${lang}.` }],
          },
        });
        setAiComment(extractText(result));
      } catch {
        setAiComment('...');
      } finally {
        setIsAiProcessing(false);
      }
    },
    [apiKey, lang, persona, personaStats, setAiComment, setIsAiProcessing]
  );

  /**
   * 解析自然語言輸入（NLP），回傳結構化資料
   * 不寫入 store，純粹回傳結果給呼叫端決定後續行為
   * @param {string} input
   * @returns {{ amount: number, desc: string, category: string }}
   */
  const parseNLPTransaction = useCallback(
    async (input) => {
      // Smart regex fallback (works without API key)
      const numMatch = input.match(/(\d{1,6}(?:\.\d{1,2})?)/);
      const amount = numMatch ? parseInt(numMatch[1], 10) : 100;
      const desc = input
        .replace(/(\d{1,6}(?:\.\d{1,2})?)/g, '')
        .replace(/買了|花了|塊|元|買|杯|碗|個|份|包|瓶|件|本|張|台|支|雙|對|組|set|bought|spent|for|at|\$/g, '')
        .trim() || 'Expense';

      const lower = input.toLowerCase();
      const categoryMap = [
        { keys: ['food', 'lunch', 'dinner', 'breakfast', 'meal', 'rice', 'noodle', 'pizza', 'burger', '餐', '飯', '麵', '拉麵', '便當', '壽司', '食'], cat: 'cat_food' },
        { keys: ['coffee', 'tea', 'bubble', 'drink', 'beer', 'wine', 'boba', '飲料', '咖啡', '茶', '酒', '奶', '汁'], cat: 'cat_drink' },
        { keys: ['transport', 'bus', 'taxi', 'uber', 'metro', 'train', 'gas', 'gasoline', 'mrt', '交通', '捷運', '公車', '計程車', '加油', '高鐵', '火車'], cat: 'cat_transport' },
        { keys: ['rent', 'housing', 'mortgage', '房租', '租金', '房貸', '住'], cat: 'cat_rent' },
        { keys: ['book', 'course', 'class', 'tutorial', '學習', '課程', '課', '書', '學'], cat: 'cat_study' },
        { keys: ['game', 'movie', 'netflix', 'spotify', 'subscription', 'entertainment', '娛樂', '電影', '遊戲', '訂閱', '會員'], cat: 'cat_ent' },
        { keys: ['shopping', 'clothes', 'shoes', 'bag', 'amazon', 'shopee', '淘寶', '購物', '衣服', '鞋', '包'], cat: 'cat_shop' },
        { keys: ['travel', 'hotel', 'flight', 'trip', '旅遊', '旅行', '機票', '住宿', '飯店'], cat: 'cat_travel' },
        { keys: ['fitness', 'gym', 'sport', 'yoga', '健身', '運動', '瑜珈', '游泳'], cat: 'cat_fitness' },
        { keys: ['medical', 'doctor', 'medicine', 'hospital', '醫療', '醫生', '藥', '看病'], cat: 'cat_medical' },
        { keys: ['snack', 'dessert', 'cake', 'ice cream', '零食', '甜點', '蛋糕', '餅乾'], cat: 'cat_snack' },
        { keys: ['gift', 'present', '禮物', '送'], cat: 'cat_gift' },
        { keys: ['social', 'party', 'gathering', 'bar', '社交', '聚餐', '聚會', '酒吧'], cat: 'cat_social' },
      ];
      let category = 'cat_other';
      for (const m of categoryMap) {
        if (m.keys.some(k => lower.includes(k))) { category = m.cat; break; }
      }

      const fallback = { amount, desc, category };
      if (!apiKey) return fallback;

      try {
        const response = await geminiPost(apiKey, {
          contents: [{ parts: [{ text: `Parse this expense: "${input}". Reply ONLY with valid JSON: {"amount": number, "item": "string", "category": "one of cat_food, cat_drink, cat_transport, cat_rent, cat_study, cat_ent, cat_shop, cat_travel, cat_fitness, cat_medical, cat_snack, cat_gift, cat_social, cat_other"}` }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 128 },
        });
        const text = extractText(response);
        const match = text?.match(/\{[\s\S]*?\}/);
        if (match) {
          const d = JSON.parse(match[0]);
          return {
            amount:   typeof d.amount === 'number' ? d.amount : fallback.amount,
            desc:     d.item || fallback.desc,
            category: d.category || fallback.category,
          };
        }
      } catch {
        // fallback on parse failure
      }
      return fallback;
    },
    [apiKey]
  );

  return { generateComment, generateMonthlyReview, parseNLPTransaction };
};
