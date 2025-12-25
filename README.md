# 資金管理MVP

Next.js 16（App Router）+ TypeScript で作成した、資金管理のMVPです。入力値から建玉額と損切り幅を計算し、設定はLocalStorageに保存します。

## 特徴
- ブラウザ内で即時に計算
- モード切替（優待イベント投資（株）/ 先物・FX）
- ユーザーマニュアルは `/manual`
- LocalStorage保存対象は資金・停止ライン・詳細設定のみ
- DD入力時は「計算上の最大損失」とDD換算の小さい方を採用
- バリデーションと警告表示

## 技術スタック
- Next.js 16（App Router）
- TypeScript
- Tailwind CSS
- shadcn/ui（Radix UI）

## セットアップ
```bash
npm install
```

## 開発
```bash
npm run dev
```

## テスト
```bash
npm run test
```

## ビルド
```bash
npm run build
npm run start
```
