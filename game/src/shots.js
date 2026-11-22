// Ember Court — screenshot presets. ?shot=start|play|win|loss puts the game
// in a fixed, deterministic state so the screenshots are real renders of
// this code in a browser. Only active when the query is present.

import { CARD_BY_ID } from './cards.js';
import { createState, startGame, energyForTurn } from './game.js';
import { mulberry32 } from './rng.js';

function handOf(state, who, ids) {
  who.hand = [...ids];
  who.deck = [];
  who.discard = [];
}

function presetPlay(state) {
  startGame(state);
  const p = state.player;
  const r = state.rival;
  p.hp = 24;
  p.shield = 4;
  p.energy = 4;
  r.hp = 27;
  r.shield = 0;
  r.energy = 3;
  state.turn = 3;
  handOf(state, p, ['ember-slash', 'flame-wall', 'maelstrom', 'bloom-mend', 'static-jab']);
  handOf(state, r, ['tide-cut', 'thorn-whip', 'bark-shield', 'arc-search', 'wildfire']);
  state.table = [
    { cardId: 'inferno-roar', by: 'player', born: performance.now() - 120, resonance: true },
    { cardId: 'deep-crash', by: 'rival', born: performance.now() - 400, resonance: false },
  ];
  state.log = [
    'The duel begins. You hold 30 life; so does Vex.',
    'Vex plays Deep Crash — 7 damage.',
    'You play Inferno Roar — 8 damage (resonance!).',
    'Resonance! Same element twice in a turn hits +2.',
  ];
  state.hint = 'Turn 3 — your turn. 4 energy. Chain Flame again for Resonance +2.';
  state.playedElements = new Set(['flame']);
  state.floaters = [{ x: 920, y: 260, text: '-8', color: '#fca5a5', born: performance.now() - 200 }];
}

// Apply ?shot=... to a fresh state. Returns the state to render.
export function applyShot(state, params) {
  const shot = params.get('shot');
  if (!shot) return state;
  const seed = Number(params.get('seed') ?? '1');
  const seeded = createState(mulberry32(seed));
  if (shot === 'start') {
    seeded.screen = 'title';
    return seeded;
  }
  if (shot === 'play') {
    presetPlay(seeded);
    return seeded;
  }
  if (shot === 'win' || shot === 'loss') {
    startGame(seeded);
    seeded.player.hp = shot === 'win' ? 18 : 0;
    seeded.rival.hp = shot === 'win' ? 0 : 21;
    seeded.player.energy = 2;
    seeded.rival.energy = 1;
    seeded.turn = 7;
    seeded.stats = { cardsPlayed: 14, damageDealt: 47, turns: 7 };
    seeded.screen = shot;
    seeded.phase = 'over';
    seeded.log = [
      'The duel begins. You hold 30 life; so does Vex.',
      'Turn 7 — the court decides.',
      shot === 'win' ? 'Vex falls. You win the court!' : 'Your life reaches 0. Vex takes the court.',
    ];
    seeded.hint = '';
    return seeded;
  }
  return state;
}

export { CARD_BY_ID };
