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
      // 先用 regex 給出保底值（無 API key 時也能使用）
      const fallback = {
        amount: parseInt(input.match(/\d+/)?.[0] || '100', 10),
        desc: input.replace(/\d+/g, '').replace(/買了|花了|塊|元|bought|spent/g, '').trim() || 'Expense',
        category: 'cat_food',
      };
      if (!apiKey) return fallback;

      try {
        const response = await geminiPost(apiKey, {
          contents: [{ parts: [{ text: `Extract amount, item, category_key: ${input}` }] }],
        });
        const text = extractText(response);
        const match = text?.match(/\{[\s\S]*\}/);
        if (match) {
          const d = JSON.parse(match[0]);
          return {
            amount:   d.amount   || fallback.amount,
            desc:     d.item     || fallback.desc,
            category: d.category || fallback.category,
          };
        }
      } catch {
        // 解析失敗回退到 regex 結果
      }
      return fallback;
    },
    [apiKey]
  );

  return { generateComment, generateMonthlyReview, parseNLPTransaction };
};
