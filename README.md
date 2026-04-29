# ⚔️ B-Battle — 把記帳變成 RPG 對戰

> 不是無聊的記帳 App，是和 AI 隊友一起「打敗衝動消費魔」的戰鬥遊戲

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase" />
  <img src="https://img.shields.io/badge/Zustand-5.x-443E38?logo=react" />
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?logo=google" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss" />
</p>

<p align="center">
  <b>「載具已就緒，準備面對你的帳單了嗎？」</b><br/>
  <b>用遊戲化設計讓控制預算變得有趣，AI 隊友隨時給你戰場評論</b>
</p>

---

## 🎯 為什麼做這個？

傳統記帳 App 的問題：
- ❌ 只是告訴你「花了多少」，沒有情感連結
- ❌ 看到超支紅字只會焦慮，沒有動力改善
- ❌ 一個人用，沒有陪伴感

**B-Battle 的解法**：
- ✅ 把預算變成 **HP 血條** — 花錢 = 扣血，視覺化衝擊
- ✅ AI 隊友即時評論 — 「這筆支出讓你的日預算掉了 30% HP」
- ✅ **人格系統** — 選一個角色陪你戰鬥（好友/導師/宿敵）
- ✅ **成就 + 裝備 + 願望清單** — 遊戲化反饋讓省錢有成就感

---

## ✨ 核心玩法

### ⚔️ 戰鬥介面

```
┌─────────────────────────────────────────┐
│  💰 B-Battle 預算戰場                    │
│                                         │
│  📊 預算 HP                              │
│  日預算 ████████░░  80%  (400/500)      │
│  週預算 ██████░░░░  60%  (600/1000)     │
│  月預算 █████████░  90%  (4500/5000)    │
│                                         │
│  🤖 AI 隊友評論：                        │
│  「這筆 2000 元支出讓日預算直接瀕死，     │
│    建議啟動冷靜模式。」                   │
│                                         │
│  [ 記錄支出 ] [ 查看成就 ] [ 願望清單 ]   │
└─────────────────────────────────────────┘
```

### 🎭 人格系統

| 角色 | 風格 | 台詞範例 |
|------|------|---------|
| **好友 (Peer)** | 輕鬆鼓勵 | 「哇這筆有點大，但沒關係，下週補回來就好！」 |
| **導師 (Mentor)** | 理性分析 | 「這筆支出佔日預算 40%，建議評估必要性。」 |
| **宿敵 (Nemesis)** | 挑釁激勵 | 「這麼快就投降了？你的願望清單不想要了？」 |

### 🏆 成就與裝備

- 連續 7 天不超支 → 解鎖「意志力鋼鐵人」稱號
- 月預算達成率 > 90% → 獲得「黃金節約者」裝備
- 完成願望清單（存到目標金額）→ 史詠級成就

### 🎮 戰鬥模式

- **單挑模式**：記錄一筆支出，看 AI 怎麼評論
- **隨機 1v1**：和 AI 隨機生成的「衝動消費怪」對戰
- **團隊 5v5**：一週五天的預算挑戰
- **間諜雷達**：AI 預測你下筆可能的花費並提前警告

---

## 🏗️ 技術架構

```
React 19 + Vite
├── Firebase
│   ├── Auth          # 用戶登入
│   ├── Firestore     # 支出紀錄、成就、裝備
│   └── Sync          # 多裝置同步
│
├── Zustand Stores
│   ├── useUserStore      # 人格、稱號、經驗值
│   ├── useFinanceStore   # 預算、支出、歷史
│   └── useBattleStore    # 戰鬥狀態、AI 對話
│
├── AI 層
│   └── useAIComment      # Gemini API 即時評論
│
└── UI 層
    ├── BattleArena       # 戰鬥主畫面
    ├── HeroHall          # 人格/稱號展示
    ├── Friends           # 好友對戰
    └── History           # 戰鬥紀錄
```

---

## 🛠️ 技術棧

| 技術 | 用途 |
|------|------|
| React 19 + Vite | 前端框架 |
| Tailwind CSS v4 | 樣式 |
| Firebase v12 | Auth + Firestore |
| Zustand | 狀態管理 |
| Google Gemini API | AI 戰場評論 |
| Lucide React | 圖標 |

---

## 🚀 快速開始

```bash
cd b-battle
npm install

# 設定環境變數
cp .env.example .env
# 填入 VITE_GEMINI_API_KEY 和 Firebase 配置

npm run dev
```

---

## 🗺️ 產品路線圖

- [x] **核心戰鬥系統**
  - [x] 三層預算池 + HP 視覺化
  - [x] AI 即時評論（Gemini）
  - [x] 人格系統（好友/導師/宿敵）

- [ ] **社交對戰**
  - [ ] 好友排行榜
  - [ ] 雙人預算對戰
  - [ ] 公會/團隊挑戰

- [ ] **AI 增強**
  - [ ] 消費預測（「你今晚很可能會點外賣」）
  - [ ] 個人化建議（根據歷史行為調整語氣）

---

## 📝 License

MIT License © 2026
