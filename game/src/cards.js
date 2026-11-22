// Ember Court — card definitions and deck building.
// Four elements (suits), six cards each. Every card has a cost in energy,
// a kind, and a power number the rules in game.js apply. Resonance: playing
// a second card of the same element in one turn adds +2 to its power.

export const ELEMENTS = {
  flame: { name: 'Flame', glyph: '▲', color: '#e2483d', dark: '#8f1d16', light: '#ffd9d4' },
  tide: { name: 'Tide', glyph: '●', color: '#2f7fd0', dark: '#144a7d', light: '#d4e8ff' },
  leaf: { name: 'Leaf', glyph: '◆', color: '#3d9e4d', dark: '#1c5c27', light: '#d8f2d5' },
  spark: { name: 'Spark', glyph: '★', color: '#d9930d', dark: '#7d5503', light: '#ffeec2' },
};

// kind: strike (damage), ward (shield), mend (heal), draw (cards), surge (energy)
export const CARDS = [
  { id: 'ember-slash', name: 'Ember Slash', element: 'flame', cost: 1, kind: 'strike', power: 4, text: 'Deal 4 damage.' },
  { id: 'wildfire', name: 'Wildfire', element: 'flame', cost: 3, kind: 'strike', power: 7, text: 'Deal 7 damage.' },
  { id: 'flame-wall', name: 'Flame Wall', element: 'flame', cost: 2, kind: 'ward', power: 6, text: 'Gain 6 shield.' },
  { id: 'phoenix-ash', name: 'Phoenix Ash', element: 'flame', cost: 2, kind: 'mend', power: 6, text: 'Restore 6 life.' },
  { id: 'cinder-spy', name: 'Cinder Spy', element: 'flame', cost: 1, kind: 'draw', power: 2, text: 'Draw 2 cards.' },
  { id: 'inferno-roar', name: 'Inferno Roar', element: 'flame', cost: 3, kind: 'strike', power: 6, text: 'Deal 6 damage. +4 on resonance.' },
  { id: 'tide-cut', name: 'Tide Cut', element: 'tide', cost: 1, kind: 'strike', power: 3, text: 'Deal 3 damage. Draw 1 card.' },
  { id: 'deep-crash', name: 'Deep Crash', element: 'tide', cost: 3, kind: 'strike', power: 7, text: 'Deal 7 damage. Gain 2 shield.' },
  { id: 'still-water', name: 'Still Water', element: 'tide', cost: 2, kind: 'ward', power: 5, text: 'Gain 5 shield. Heal 2.' },
  { id: 'spring-mend', name: 'Spring Mend', element: 'tide', cost: 2, kind: 'mend', power: 7, text: 'Restore 7 life.' },
  { id: 'current-pull', name: 'Current Pull', element: 'tide', cost: 1, kind: 'draw', power: 2, text: 'Draw 2 cards.' },
  { id: 'maelstrom', name: 'Maelstrom', element: 'tide', cost: 3, kind: 'strike', power: 8, text: 'Deal 8 damage.' },
  { id: 'thorn-whip', name: 'Thorn Whip', element: 'leaf', cost: 1, kind: 'strike', power: 4, text: 'Deal 4 damage.' },
  { id: 'root-snare', name: 'Root Snare', element: 'leaf', cost: 2, kind: 'strike', power: 3, text: 'Deal 3 damage. Gain 4 shield.' },
  { id: 'bark-shield', name: 'Bark Shield', element: 'leaf', cost: 2, kind: 'ward', power: 7, text: 'Gain 7 shield.' },
  { id: 'bloom-mend', name: 'Bloom Mend', element: 'leaf', cost: 2, kind: 'mend', power: 6, text: 'Restore 6 life. Draw 1 card.' },
  { id: 'spore-drift', name: 'Spore Drift', element: 'leaf', cost: 1, kind: 'draw', power: 2, text: 'Draw 2 cards.' },
  { id: 'overgrowth', name: 'Overgrowth', element: 'leaf', cost: 3, kind: 'strike', power: 7, text: 'Deal 7 damage. Heal 2.' },
  { id: 'static-jab', name: 'Static Jab', element: 'spark', cost: 1, kind: 'strike', power: 5, text: 'Deal 5 damage.' },
  { id: 'storm-call', name: 'Storm Call', element: 'spark', cost: 3, kind: 'strike', power: 6, text: 'Deal 6 damage. Draw 1 card.' },
  { id: 'galvanic-ward', name: 'Galvanic Ward', element: 'spark', cost: 2, kind: 'ward', power: 6, text: 'Gain 6 shield.' },
  { id: 'recharge', name: 'Recharge', element: 'spark', cost: 2, kind: 'surge', power: 2, text: 'Gain 2 energy. Heal 5.' },
  { id: 'arc-search', name: 'Arc Search', element: 'spark', cost: 1, kind: 'draw', power: 2, text: 'Draw 2 cards.' },
  { id: 'lightning-rod', name: 'Lightning Rod', element: 'spark', cost: 3, kind: 'strike', power: 8, text: 'Deal 8 damage.' },
];

export const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));

// One copy of each card, shuffled. The deck is the same 24 cards for both
// duelists; the shuffle decides who draws what.
export function buildDeck(random) {
  const deck = CARDS.map((c) => c.id);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function kindLabel(kind) {
  return { strike: 'STRIKE', ward: 'WARD', mend: 'MEND', draw: 'DRAW', surge: 'SURGE' }[kind] ?? kind.toUpperCase();
}
