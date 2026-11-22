// Ember Court — the rules. Turn flow, card resolution, the rival's turn,
// resonance, shields, win/loss. The canvas in render.js only draws this
// state; every decision lives here.

import { CARD_BY_ID, buildDeck } from './cards.js';
import { chooseCard } from './ai.js';
import { sfx } from './audio.js';
import { drawTable, drawTitle, handLayout, CARD_W, CARD_H } from './render.js';

const MAX_HP = 30;
const START_HAND = 5;
const MAX_HAND = 7;

export function newDuelist(random) {
  return {
    hp: MAX_HP,
    maxHp: MAX_HP,
    shield: 0,
    energy: 0,
    maxEnergy: 6,
    deck: buildDeck(random),
    hand: [],
    discard: [],
  };
}

export function createState(random) {
  return {
    screen: 'title',
    turn: 1,
    phase: 'player',
    hint: 'Play a card, then end your turn.',
    player: newDuelist(random),
    rival: newDuelist(random),
    table: [],
    log: [],
    floaters: [],
    stats: { cardsPlayed: 0, damageDealt: 0, turns: 0 },
    playedElements: new Set(),
    hoverCard: null,
    hoverEndTurn: false,
    aiQueue: [],
    aiTimer: 0,
    random,
  };
}

export function energyForTurn(turn) {
  return Math.min(2 + turn, 6);
}

function drawCards(who, count, state, label) {
  let drawn = 0;
  for (let i = 0; i < count && who.hand.length < MAX_HAND; i++) {
    if (who.deck.length === 0) {
      who.deck = who.discard;
      who.discard = [];
      // Reshuffle the discard pile back into the deck.
      for (let j = who.deck.length - 1; j > 0; j--) {
        const k = Math.floor(state.random() * (j + 1));
        [who.deck[j], who.deck[k]] = [who.deck[k], who.deck[j]];
      }
      if (who.deck.length === 0) break;
    }
    who.hand.push(who.deck.pop());
    drawn++;
  }
  if (drawn > 0 && label) addLog(state, `${label} draws ${drawn}.`);
  return drawn;
}

function addLog(state, line) {
  state.log.push(line);
  if (state.log.length > 40) state.log.shift();
}

function floater(state, x, y, text, color) {
  state.floaters.push({ x, y, text, color, born: performance.now() });
  if (state.floaters.length > 12) state.floaters.shift();
}

// Resonance: the second card of an element in one turn hits +2 (draw +1,
// surge +1 energy). Returns the bonus applied.
function resonanceBonus(state, who, card) {
  const played = who === state.player ? state.playedElements : state.rivalPlayedElements;
  return played.has(card.element) ? 2 : 0;
}

export function startGame(state) {
  state.player = newDuelist(state.random);
  state.rival = newDuelist(state.random);
  state.turn = 1;
  state.phase = 'player';
  state.screen = 'table';
  state.table = [];
  state.log = [];
  state.floaters = [];
  state.stats = { cardsPlayed: 0, damageDealt: 0, turns: 1 };
  state.playedElements = new Set();
  state.rivalPlayedElements = new Set();
  state.aiQueue = [];
  drawCards(state.player, START_HAND, state, null);
  drawCards(state.rival, START_HAND, state, null);
  state.player.energy = energyForTurn(1);
  state.rival.energy = energyForTurn(1);
  state.hint = 'Your turn — play a card or end your turn.';
  addLog(state, 'The duel begins. You hold 30 life; so does Vex.');
  sfx.turn();
}

function dealDamage(state, target, amount, fromPlayer) {
  let remaining = amount;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, remaining);
    target.shield -= absorbed;
    remaining -= absorbed;
  }
  target.hp -= remaining;
  if (fromPlayer) state.stats.damageDealt += amount;
  const x = 640;
  const y = target === state.player ? 545 : 252;
  floater(state, x, y, remaining > 0 ? `-${remaining}` : 'BLOCKED', remaining > 0 ? '#fca5a5' : '#7dd3fc');
  return remaining;
}

function checkEnd(state) {
  if (state.rival.hp <= 0) {
    state.screen = 'win';
    state.phase = 'over';
    sfx.win();
    addLog(state, 'Vex falls. You win the court!');
    return true;
  }
  if (state.player.hp <= 0) {
    state.screen = 'loss';
    state.phase = 'over';
    sfx.lose();
    addLog(state, 'Your life reaches 0. Vex takes the court.');
    return true;
  }
  return false;
}

// Resolve one card. `who` plays it against `foe`. Returns false if illegal.
export function playCard(state, who, foe, handIndex, byPlayer) {
  if (state.phase === 'over' || state.screen !== 'table') return false;
  const cardId = who.hand[handIndex];
  if (cardId === undefined) return false;
  const card = CARD_BY_ID[cardId];
  if (card.cost > who.energy) {
    if (byPlayer) {
      state.hint = `Not enough energy for ${card.name} (needs ${card.cost}).`;
      sfx.error();
    }
    return false;
  }
  const bonus = resonanceBonus(state, who, card);
  const resonant = bonus > 0;
  who.energy -= card.cost;
  who.hand.splice(handIndex, 1);
  who.discard.push(cardId);
  const played = who === state.player ? state.playedElements : state.rivalPlayedElements;
  played.add(card.element);
  state.table.push({ cardId, by: byPlayer ? 'player' : 'rival', born: performance.now(), resonance: resonant });
  if (state.table.length > 3) state.table.shift();
  if (byPlayer) state.stats.cardsPlayed++;
  const whoName = byPlayer ? 'You' : 'Vex';

  switch (card.kind) {
    case 'strike': {
      const dmg = card.power + bonus + (card.id === 'inferno-roar' && resonant ? 2 : 0);
      dealDamage(state, foe, dmg, byPlayer);
      addLog(state, `${whoName} play ${card.name} — ${dmg} damage${resonant ? ' (resonance!)' : ''}.`);
      sfx.strike();
      break;
    }
    case 'ward': {
      who.shield += card.power + bonus;
      addLog(state, `${whoName} play ${card.name} — +${card.power + bonus} shield${resonant ? ' (resonance!)' : ''}.`);
      sfx.ward();
      break;
    }
    case 'mend': {
      const healed = Math.min(card.power + bonus, MAX_HP - who.hp);
      who.hp += healed;
      addLog(state, `${whoName} play ${card.name} — restore ${healed} life${resonant ? ' (resonance!)' : ''}.`);
      sfx.heal();
      break;
    }
    case 'draw': {
      const n = card.power + (resonant ? 1 : 0);
      drawCards(who, n, state, whoName);
      addLog(state, `${whoName} play ${card.name} — draw ${n}${resonant ? ' (resonance!)' : ''}.`);
      sfx.draw();
      break;
    }
    case 'surge': {
      who.energy = Math.min(who.maxEnergy, who.energy + card.power + (resonant ? 1 : 0));
      who.hp = Math.min(MAX_HP, who.hp + 5);
      addLog(state, `${whoName} play ${card.name} — +${card.power} energy, heal 5.`);
      sfx.heal();
      break;
    }
    default:
      break;
  }
  // Card-specific riders live on the card text, applied here:
  if (card.id === 'tide-cut' || card.id === 'storm-call' || card.id === 'bloom-mend') {
    drawCards(who, 1, state, null);
  }
  if (card.id === 'deep-crash' || card.id === 'root-snare') {
    who.shield += card.id === 'deep-crash' ? 2 : 4;
  }
  if (card.id === 'still-water') who.hp = Math.min(MAX_HP, who.hp + 2);
  if (card.id === 'overgrowth') who.hp = Math.min(MAX_HP, who.hp + 2);
  state.hint = resonant
    ? `Resonance! ${card.name} struck harder — same element twice.`
    : `${card.name} played. ${who.energy} energy left.`;
  checkEnd(state);
  return true;
}

export function endPlayerTurn(state) {
  if (state.phase !== 'player' || state.screen !== 'table') return;
  state.phase = 'ai';
  state.playedElements = new Set();
  state.rival.energy = energyForTurn(state.turn);
  state.hint = 'Vex is playing…';
  addLog(state, 'You end your turn.');
  state.aiQueue = [];
  state.aiTimer = performance.now() + 650;
}

// One AI step: play its best card, or pass and hand the turn back.
function aiStep(state) {
  const ai = state.rival;
  const idx = chooseCard(ai, state.player);
  if (idx < 0 || ai.energy <= 0) {
    // Rival ends its turn: new round, player draws up and gains energy.
    state.turn++;
    state.stats.turns = state.turn;
    state.rivalPlayedElements = new Set();
    state.player.energy = energyForTurn(state.turn);
    drawCards(state.player, 5 - state.player.hand.length > 0 ? 5 - state.player.hand.length : 0, state, 'You');
    drawCards(state.rival, 5 - state.rival.hand.length > 0 ? 5 - state.rival.hand.length : 0, state, 'Vex');
    state.phase = 'player';
    state.hint = `Turn ${state.turn} — your turn. ${state.player.energy} energy.`;
    addLog(state, `Turn ${state.turn} begins.`);
    sfx.turn();
    return;
  }
  playCard(state, ai, state.player, idx, false);
  state.aiTimer = performance.now() + 750;
}

export function update(state, now) {
  state.floaters = state.floaters.filter((f) => now - f.born < 900);
  if (state.phase === 'ai' && state.screen === 'table' && now >= state.aiTimer) {
    aiStep(state);
  }
}

// --- Input: mouse + keyboard -------------------------------------------

function handHit(state, x, y) {
  const spread = state.player.hand.length <= 5 ? 164 : Math.floor(920 / state.player.hand.length);
  const layout = handLayout(state.player.hand.length, 560, spread);
  for (let i = layout.length - 1; i >= 0; i--) {
    const r = layout[i];
    const raised = state.hoverCard === i;
    const ry = raised ? r.y - 30 : r.y;
    if (x >= r.x && x <= r.x + CARD_W && y >= ry && y <= ry + CARD_H) return i;
  }
  return null;
}

export function onClick(state, x, y) {
  if (state.screen === 'title') {
    startGame(state);
    return;
  }
  if (state.screen === 'win' || state.screen === 'loss') return;
  // End Turn button.
  if (x >= 1060 && x <= 1250 && y >= 36 && y <= 92) {
    endPlayerTurn(state);
    return;
  }
  if (state.phase !== 'player') return;
  const idx = handHit(state, x, y);
  if (idx !== null) playCard(state, state.player, state.rival, idx, true);
}

export function onMove(state, x, y) {
  if (state.screen !== 'table' || state.phase !== 'player') {
    state.hoverCard = null;
    state.hoverEndTurn = false;
    return;
  }
  state.hoverCard = handHit(state, x, y);
  state.hoverEndTurn = x >= 1060 && x <= 1250 && y >= 36 && y <= 92;
}

export function onKey(state, key) {
  if (key === 'Enter' || key === ' ') {
    if (state.screen === 'title') startGame(state);
    else if (state.screen === 'table') endPlayerTurn(state);
    return;
  }
  if ((key === 'r' || key === 'R') && (state.screen === 'win' || state.screen === 'loss')) {
    startGame(state);
    return;
  }
  if (key === 'Escape' && state.screen === 'table') {
    state.screen = 'title';
    return;
  }
  if (state.screen === 'table' && state.phase === 'player' && /^[1-7]$/.test(key)) {
    const idx = Number(key) - 1;
    if (idx < state.player.hand.length) playCard(state, state.player, state.rival, idx, true);
  }
}

export function draw(state, ctx, now) {
  if (state.screen === 'title') drawTitle(ctx, now);
  else drawTable(ctx, state, now);
}
