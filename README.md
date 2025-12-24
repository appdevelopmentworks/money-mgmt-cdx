# Money Management MVP

A Next.js 16 (App Router) + TypeScript MVP that calculates position sizing and stop width from user inputs and stores settings in LocalStorage.

## Features
- Instant client-side calculation
- Mode switch (stock / futures-FX)
- User manual at `/manual`
- LocalStorage persistence for capital/stop line/advanced settings only
- DD-based loss display when max drawdown is provided
- Validation and warnings

## Tech
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI)

## Setup
```bash
npm install
```

## Dev
```bash
npm run dev
```

## Test
```bash
npm run test
```

## Build
```bash
npm run build
npm run start
```
