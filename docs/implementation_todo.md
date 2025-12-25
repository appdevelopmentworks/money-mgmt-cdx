# 実装タスク分解（Next.js 16 / MVP）
**目的**: `E0, L, p, W%, D%`（+詳細設定）から `stop% / position_notional / risk_amount / f` を即時計算して表示。  
**想定**: Next.js 16 App Router / TypeScript / Tailwind / shadcn/ui / LocalStorage保存（モード別）

---

## 0) リポジトリ準備
- [x] Next.js 16（App Router）プロジェクト作成
- [x] TypeScript有効化
- [x] Tailwind設定
- [x] shadcn/ui導入（Input / Slider / Accordion / Tooltip / Card / Alert / Tabs）
- [x] ESLint / Prettier（任意）
- [x] `src/` 配下構成に統一（任意）

---

## 1) 画面・ルーティング
- [x] `/`（トップ）: モード選択 + 計算フォーム + 結果表示
  - Tabsで **優待（株）** / **先物・FX（Backtesting.py）**
  - モードごとにデフォルト値が切り替わる

---

## 2) データモデル（フォーム状態）
- [x] 入力状態（必須 + 詳細設定）を `CalculationInputs` として定義
- [x] モードごとのデフォルト値（`DEFAULTS_STOCK`, `DEFAULTS_FX`）を定義
- [x] LocalStorage保存用スキーマ（`SavedState`）を定義

---

## 3) 計算ロジック（純関数）
- [x] `computeRecommendations(inputs) -> CalculationOutputs` を実装
- [x] DD入力時は `risk_amount = min(f × E0, DD% × E0)` を適用
- [x] `findMinLossStreakM(p, N, alpha)`（m探索）を実装
- [x] バリデーション＆警告生成 `validate(inputs) -> {errors, warnings}`
- [x] 表示用の丸め（円/％）ユーティリティ

---

## 4) UI（入力）
- [x] モードタブの長文折り返しとスマホ時のカード重なり対策
- [x] **基本入力**コンポーネント
  - はじめの資金（円）`E0`
  - 停止ライン（%）`L_percent`
  - 勝率（%）`p_percent`
  - 平均利益（%）`W_percent`
  - 平均損失（%）`D_percent`
- [x] **詳細設定（Accordion）**
  - 想定トレード回数 `N`
  - 停止ラインを割る確率の目安（%）`alpha_percent`
  - 攻めすぎ防止 `k`（Slider）
  - 損切りゆとり `s_loss`（Slider）
  - 1回の最大損失（資金に対して%）`f_user_max_percent`
- [x] すべてのInputに「単位」「ツールチップ」「プレースホルダ」を付与（`ui_copy_beginner.md`準拠）

---

## 5) UI（結果表示）
- [x] 結果カード（上から3つ）
  1. おすすめ建玉（円）`position_notional`
  2. おすすめ損切り幅（%）`stop_percent`
  3. 1回で最大いくら負ける？（円）`risk_amount`
- [x] 詳細（Accordion）
  - `f_percent`, `b`, `m`, `f_kelly`, `f_floor`, 制約のうち何が効いたか
- [x] 注意文（固定表示）
- [x] エラー時は計算結果カードを無効化 or “—” 表示

---

## 6) 永続化（LocalStorage）
- [x] モード別に保存キーを分ける（例：`mm_mvp_stock`, `mm_mvp_fx`）
- [x] 初回ロード時：保存があれば復元、なければモードデフォルト
- [x] 入力変更時：デバウンス（任意）で保存

---

## 7) テスト（最小）
- [x] 計算関数の単体テスト（Vitest/Jestどちらでも）
  - 正常系：基本入力で結果が数値になる
  - 境界：pが低い/高い、W/Dが極端、Lが高い/低い
  - m探索：p=0.5,N=200,alpha=0.005でmが妥当範囲に入る
- [x] 重要: `position_notional` が stop% に反比例すること（基本整合チェック）

---

## 8) 受け入れチェック（手動）
- [x] 入力→即時反映（useMemo）
- [x] モード切替でデフォルトが切り替わる（保存があれば復元）
- [x] 1回の最大損失（%）上限で確実にクリップされる
- [x] エラーメッセージ/警告が日本語で分かりやすい


