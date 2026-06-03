# B-Battle 省錢戰鬥遊戲

React + Vite + Firebase 多人省錢對戰 app。

## 架構
- `src/hooks/useBattleLogic.js` — 核心遊戲邏輯（消費記錄、成就、重置）**主要 hook**
- `src/hooks/useFirebaseSync.js` — Firebase 多人同步、HP 計算
- `src/hooks/useAIComment.js` — Gemini AI 評語
- `src/hooks/useBattleCore.js` — **廢棄**，不要修這個
- `src/App.jsx` — 主入口，組裝所有 hook
- `src/modals/` — 各功能 Modal（BudgetSetup、Shop、Achievement、Leaderboard 等）
- `src/components/` — Layout、History、Friends、HeroHall、UI

## 時區
- 統一用 `taipeiDateStr()` / `taipeiParts()` helper（定義在 useBattleLogic.js 和 useFirebaseSync.js 頂部）
- 不要用 `new Date().toLocaleDateString()` 或 `.getDay()` 等本地時區方法

## Firebase
- `src/firebase.js` — Firebase 設定（client-side key，正常公開）
- Firestore 用於多人房間、排行榜

## 常用指令
```bash
cd ~/development/b-battle
npm run dev
npm run build
```
