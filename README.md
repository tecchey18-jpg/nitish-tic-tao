# Neon Nexus

Neon Nexus is a production-minded futuristic multiplayer Tic Tac Toe arena built with React, TypeScript, Tailwind CSS, Framer Motion, and Zustand.

## Features

- 2-4 players with custom names, symbols, colors, and avatars
- Dynamic board sizes from 3x3 to 7x7
- Dynamic win conditions
- AI mode with win/block/center/random move strategy
- AI difficulty levels: Easy, Normal, Hard, and Nexus
- Multiple rounds, animated scoreboard, target score, round history
- Winner celebration scene with confetti, fireworks, camera shake, and avatar reactions
- Cyberpunk glass UI with neon glows, particle field, ripple waves, and GPU-friendly transforms
- Mobile responsive layout and modular folder structure

## Setup

```bash
npm install
npm run dev
```

Vite will print the local URL, usually:

```txt
http://127.0.0.1:5173
```

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

### Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

### Netlify

1. Push this project to GitHub.
2. Create a new Netlify site from the repository.
3. Set:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy.

## Beginner Editing Guide

### Change Game Title

Open:

```txt
src/pages/HomePage.tsx
```

Find `Neon Nexus` and replace it with your title.

### Change Player Symbols

Open:

```txt
src/config/gameConfig.ts
```

Edit:

```ts
symbols: ['X', 'O', '△', '◇']
```

### Change Player Colors

Open:

```txt
src/config/themeConfig.ts
```

Edit `playerColors`.

### Change Board Rules

Open:

```txt
src/config/gameConfig.ts
```

Adjust `minBoardSize`, `maxBoardSize`, or `defaultBoardSizeByPlayers`.

### Change AI Difficulty Options

Open:

```txt
src/config/gameConfig.ts
```

Edit `aiDifficulties`. The strategy implementation lives in:

```txt
src/utils/aiStrategy.ts
```

### Change Button Design

Open:

```txt
src/components/ui/NeonButton.tsx
```

Edit the Tailwind classes in the `variants` object.

### Change Particle Effects

Open:

```txt
src/components/effects/ParticleField.tsx
```

Adjust the particle count in `particleSeed(...)`. Keep it modest for stable 60 FPS.

### Change Win Animation

Open:

```txt
src/components/celebration/VictoryScene.tsx
```

The celebration combines:

- `ConfettiBlast.tsx`
- `FireworksEffect.tsx`
- `WinnerAvatar.tsx`

## Architecture

```txt
src/
  components/    Reusable UI, board, player, score, effect, celebration modules
  pages/         App-level route screens
  hooks/         Game orchestration, animation, audio, board effect hooks
  store/         Zustand stores for UI, settings, players, and match state
  utils/         Winner calculation, board generation, score helpers, sound helpers
  types/         Shared TypeScript interfaces
  config/        Game, animation, and theme constants
  styles/        Tailwind globals and animation/theme CSS
```

## Performance Notes

- Board cells and particle fields are memoized.
- Animations use transform, opacity, and scale where practical.
- Particle count is intentionally capped.
- Heavy blur is limited to large static surfaces.
- Game state updates are centralized to avoid duplicated logic.
