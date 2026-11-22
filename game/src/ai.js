// Ember Court — the rival's brain. A readable heuristic: it scores every
// card it can afford, plays the best one, and repeats until it is out of
// energy or out of useful cards. Its choices are meant to be countered:
// it guards when hurt, heals when low, and goes for lethal when it sees it.

import { CARD_BY_ID } from './cards.js';

// Score one card for the AI. Higher is better; below 0.5 the AI holds it.
export function scoreCard(cardId, ai, foe) {
  const card = CARD_BY_ID[cardId];
  const power = card.power;
  if (card.kind === 'strike') {
    let value = Math.min(power, foe.hp + foe.shield) * 1.0;
    if (power >= foe.hp + foe.shield) value += 100; // lethal
    if (foe.hp <= 8) value += 3; // smell the finish
    return value / card.cost;
  }
  if (card.kind === 'ward') {
    if (ai.hp >= 28) return 0.2;
    return (power * (ai.hp < 14 ? 1.4 : 0.8)) / card.cost;
  }
  if (card.kind === 'mend') {
    const missing = 30 - ai.hp;
    if (missing <= 0) return 0;
    return (Math.min(power, missing) * (ai.hp < 12 ? 1.5 : 0.9)) / card.cost;
  }
  if (card.kind === 'draw') return 1.6;
  if (card.kind === 'surge') return ai.energy <= 1 ? 2.2 : 1.2;
  return 1;
}

// Pick the best affordable card index in the AI hand, or -1 to pass.
export function chooseCard(ai, foe) {
  let best = -1;
  let bestScore = 0.5;
  ai.hand.forEach((cardId, index) => {
    const card = CARD_BY_ID[cardId];
    if (card.cost > ai.energy) return;
    const score = scoreCard(cardId, ai, foe);
    if (score > bestScore) {
      bestScore = score;
      best = index;
    }
  });
  return best;
}
