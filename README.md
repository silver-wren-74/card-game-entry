# Ember Court

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/silver-wren-74/card-game-entry/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/silver-wren-74/card-game-entry/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

An original turn-based card duel for the [best-card-game-20261122-1826](https://make.fun/bounty/best-card-game-20261122-1826) bounty on make.fun.

You and the rival Vex, the Ash Herald, each hold 30 life. Every turn you draw up to a hand of five, spend energy to play cards, and end your turn — then Vex answers with a hand of its own. Cards come in four elements (Flame ▲, Tide ●, Leaf ◆, Spark ★), each with a cost and a power: strikes deal damage, wards raise shield, mends restore life, draws pull cards, surges refund energy. Play two cards of the same element in one turn and the second lands with **Resonance +2**. First to bring the other to 0 life wins the court.

## Play it

Open `game/index.html` in desktop Chrome (serve the `game/` folder with any static server — no build step, no network requests).

- **Mouse:** click a card to play it, click END TURN to pass.
- **Keyboard:** `1–7` play a card, `Space`/`Enter` ends your turn, `R` restarts after a win or loss, `Esc` returns to the title screen.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/index.html` + `game/src/` — the game itself: `cards.js` (the 24-card deck), `game.js` (turns and rules), `ai.js` (Vex's choices), `render.js` (the table and card faces), `audio.js` (synthesized blips), `rng.js` (seeded shuffle), `shots.js` (screenshot presets), `main.js` (bootstrap).
- `screenshots/` — four real renders of the game: title, mid-duel table, victory, defeat.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
