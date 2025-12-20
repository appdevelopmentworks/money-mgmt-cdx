# UIコンポーネント一覧（Next.js 16 / shadcn/ui）
**狙い**: 初心者でも迷わない入力導線 + 透明性（計算根拠の表示）

---

## 1) レイアウト
- `PageContainer`
  - max-width: `max-w-3xl`
  - padding: `p-4 md:p-8`
- `Header`
  - タイトル：建玉と損切りのおすすめ計算
  - サブ：勝率と平均損益から、無理のない1回の取引量を提案します

---

## 2) モード切替
- `Tabs`（shadcn）
  - Tab1: 優待イベント投資（株）
  - Tab2: 先物・FX（Backtesting.py）
- 切替時の挙動
  - LocalStorageに保存があれば復元
  - なければモード別デフォルトに初期化

---

## 3) 入力フォーム（基本）
### 3.1 MoneyInput（円）
- 例: E0（はじめの資金）
- UI:
  - `Input` + suffix `"円"`
  - `Tooltip`（説明）
- Props:
  - `value: number`
  - `onChange: (n:number)=>void`
  - `min?: number`
  - `step?: number`
  - `placeholder?: string`

### 3.2 PercentInput（%）
- 例: L, p, W, D, alpha, f_user_max
- UI:
  - `Input` + suffix `"%"`（またはInput右側にUnit表示）
- Props: MoneyInput同様

### 3.3 SliderWithInput
- 例: 停止ライン L、k、s_loss
- UI:
  - `Slider` + `Input`（同値連動）
  - 範囲例:
    - L: 10〜90（step 1）
    - k: 0.05〜0.50（step 0.01）
    - s_loss: 1.00〜2.00（step 0.05）
- Props:
  - `min/max/step`
  - `value`
  - `onChange`

### 3.4 Field（共通ラッパ）
- ラベル（太字） + 補足（薄い文字） + 入力 + エラーテキスト
- 右上に `Tooltip` アイコン（任意）

---

## 4) 詳細設定（Accordion）
- `Accordion`（「詳細設定」）
  - 想定トレード回数（N）
  - 停止ラインを割る確率の目安（α）
  - 攻めすぎ防止（k）
  - 損切りゆとり（s_loss）
  - 1回の最大損失（f_user_max）
- 初心者向け:
  - デフォルト値を表示し、意味を短文で説明
  - “小さいほど安全寄り” などの一言を添える

---

## 5) 結果表示（Cards）
### 5.1 ResultCards（上から3枚）
- `Card` 3枚
  1) 建玉（投入額）の目安（円）
  2) 損切り幅の目安（%）
  3) 1回で最大いくら負ける？（円）

- 表示要件
  - 数値を大きく（text-2xl〜3xl）
  - 単位を必ず付与
  - 小さく補足文

### 5.2 DetailAccordion（計算の中身）
- `Accordion`（「計算の中身（詳細）」）
  - 資金に対する1回の最大損失（f%）
  - ペイオフ比（b）
  - 想定連敗回数（m）
  - ケリー理論値（f_kelly）
  - 停止ライン上限（f_floor）
  - どの上限が効いたか（Badgeで表示）

---

## 6) バリデーション表示
- `Alert`（destructive / warning）
  - errors: 計算不可（結果カードは—）
  - warnings: 計算はするが注意表示
- エラーメッセージ文言は `ui_copy_beginner.md` 準拠

---

## 7) アクション（任意）
- `Button`:
  - 「入力をリセット」
- 保存は自動（LocalStorage）でも、明示ボタンを置くなら
  - 「この設定を保存」

---

## 8) ファイル構成（例）
- `app/page.tsx`：画面
- `src/lib/calc.ts`：normalize / validate / computeRecommendations / findMinLossStreakM
- `src/lib/defaults.ts`：モード別デフォ
- `src/lib/storage.ts`：LocalStorage読み書き
- `src/components/Field.tsx`
- `src/components/PercentInput.tsx`
- `src/components/MoneyInput.tsx`
- `src/components/SliderWithInput.tsx`
- `src/components/ResultCards.tsx`
- `src/components/DetailAccordion.tsx`
