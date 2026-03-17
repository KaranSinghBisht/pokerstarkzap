# PokerStarkZap

Heads-up Texas Hold'em poker on Starknet with a retro pixel UI, bot opponent, and gasless wallet connection via StarkZap + Cartridge Controller.

![PokerStarkZap Screenshot](frontend/public/logo.png)

## Live Demo

[pokerstarkzap.vercel.app](https://pokerstarkzap.vercel.app/)

## StarkZap Modules Used

- **Wallets** — One-click wallet connection via Cartridge Controller
- **Gasless Transactions** — Fee-free gameplay powered by AVNU Paymaster

## Features

- Heads-up (1v1) Texas Hold'em against a bot opponent
- Full game flow: pre-flop, flop, turn, river, showdown
- Retro pixel-art card sprites and neon UI theme
- Background music toggle
- Hand evaluation with proper poker rankings
- Responsive design

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Blockchain**: Starknet (Sepolia), starknet.js v8
- **Wallet**: Cartridge Controller, StarkZap SDK
- **Animations**: Framer Motion
- **Game Engine**: Client-side poker engine with bot AI

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

No environment variables are required — the game runs client-side with a bot opponent. StarkZap wallet integration works on Starknet Sepolia by default.

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js pages (landing + play)
│   ├── components/       # Poker table, cards, betting UI
│   ├── hooks/            # Game state, background music
│   ├── lib/
│   │   ├── engine/       # Poker game logic, hand evaluator, bot AI, deck
│   │   └── starkzap/     # StarkZap SDK adapter
│   └── providers/        # Starknet wallet provider
└── public/
    └── retro/cards/      # Pixel-art card sprites
```

## License

MIT
