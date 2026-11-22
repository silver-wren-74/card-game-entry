// Ember Court — every pixel the player sees. One canvas, 1280x800 logical
// units, scaled to the window. Felt table, gold trim, fanned hands, card
// faces with big readable values, suit glyphs in colour and shape.

import { CARD_BY_ID, ELEMENTS, kindLabel } from './cards.js';

export const VIEW_W = 1280;
export const VIEW_H = 800;

export const CARD_W = 150;
export const CARD_H = 210;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function felt(ctx) {
  const g = ctx.createRadialGradient(640, 380, 120, 640, 400, 900);
  g.addColorStop(0, '#2c6b4f');
  g.addColorStop(0.6, '#1f5138');
  g.addColorStop(1, '#123524');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 6;
  roundRect(ctx, 14, 14, VIEW_W - 28, VIEW_H - 28, 26);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(201,162,39,0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, 26, 26, VIEW_W - 52, VIEW_H - 52, 20);
  ctx.stroke();
}

function bar(ctx, x, y, w, h, frac, fill, empty) {
  ctx.fillStyle = empty;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = fill;
    roundRect(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.stroke();
}

function energyPips(ctx, x, y, energy, maxEnergy, size = 15) {
  for (let i = 0; i < maxEnergy; i++) {
    ctx.beginPath();
    ctx.arc(x + i * (size * 2 + 6) + size, y + size, size, 0, Math.PI * 2);
    ctx.fillStyle = i < energy ? '#39c0ff' : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Layout of a fanned hand. Returns rects in the same order as the hand.
export function handLayout(count, y, spread = 164) {
  const rects = [];
  const total = count * spread - (spread - CARD_W);
  const startX = (VIEW_W - total) / 2;
  for (let i = 0; i < count; i++) {
    const cx = startX + i * spread + CARD_W / 2;
    const lift = Math.abs(i - (count - 1) / 2);
    rects.push({
      x: startX + i * spread,
      y: y + lift * 7,
      w: CARD_W,
      h: CARD_H,
      cx,
    });
  }
  return rects;
}

export function drawCard(ctx, cardId, x, y, w = CARD_W, h = CARD_H, opts = {}) {
  const card = CARD_BY_ID[cardId];
  const el = ELEMENTS[card.element];
  const scale = w / CARD_W;
  ctx.save();
  ctx.translate(x, y);
  if (opts.dim) ctx.globalAlpha = 0.45;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#fdf6e3';
  roundRect(ctx, 0, 0, w, h, 12 * scale);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = el.dark;
  ctx.lineWidth = 3 * scale;
  roundRect(ctx, 1.5, 1.5, w - 3, h - 3, 12 * scale);
  ctx.stroke();
  // Element band.
  ctx.fillStyle = el.color;
  roundRect(ctx, 0, 0, w, 44 * scale, 12 * scale);
  ctx.fill();
  ctx.fillRect(0, 30 * scale, w, 14 * scale);
  // Cost gem.
  ctx.beginPath();
  ctx.arc(24 * scale, 24 * scale, 17 * scale, 0, Math.PI * 2);
  ctx.fillStyle = '#1d4ed8';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${22 * scale}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(card.cost), 24 * scale, 25 * scale);
  // Element name on the band.
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${15 * scale}px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.fillText(el.name.toUpperCase(), 48 * scale, 25 * scale);
  // Big suit glyph.
  ctx.fillStyle = el.color;
  ctx.font = `${58 * scale}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(el.glyph, w / 2, 108 * scale);
  // Power number.
  ctx.fillStyle = '#1f2937';
  ctx.font = `bold ${34 * scale}px Georgia, serif`;
  ctx.fillText(String(card.power), w / 2, 148 * scale);
  // Name + kind.
  ctx.font = `bold ${15 * scale}px Georgia, serif`;
  ctx.fillText(card.name, w / 2, 170 * scale);
  ctx.fillStyle = el.dark;
  ctx.font = `${12 * scale}px Georgia, serif`;
  ctx.fillText(kindLabel(card.kind), w / 2, 187 * scale);
  if (opts.resonance) {
    ctx.fillStyle = '#b45309';
    ctx.font = `bold ${12 * scale}px Georgia, serif`;
    ctx.fillText('RESONANCE +2', w / 2, 202 * scale);
  }
  ctx.restore();
}

export function drawCardBack(ctx, x, y, w = CARD_W, h = CARD_H, small = false) {
  const scale = w / CARD_W;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#7c2d12';
  roundRect(ctx, x, y, w, h, 12 * scale);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3 * scale;
  roundRect(ctx, x + 5, y + 5, w - 10, h - 10, 9 * scale);
  ctx.stroke();
  ctx.fillStyle = '#fbbf24';
  ctx.font = `bold ${34 * scale}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♛', x + w / 2, y + h / 2 - 12 * scale);
  if (!small) {
    ctx.font = `${11 * scale}px Georgia, serif`;
    ctx.fillText('EMBER COURT', x + w / 2, y + h / 2 + 26 * scale);
  }
  ctx.restore();
}

// Compact left-column readout: name, life bar, life text, energy pips.
// The hand is centred, so the strip x=60..220 stays clear of the cards.
function drawDuelist(ctx, who, x, y) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(who.name.toUpperCase(), x, y);
  bar(ctx, x, y + 10, 150, 14, who.hp / who.maxHp, '#e2483d', 'rgba(0,0,0,0.5)');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia, serif';
  let hpText = `${Math.max(0, who.hp)} / ${who.maxHp} ♥`;
  if (who.shield > 0) hpText += `   🛡 ${who.shield}`;
  ctx.fillText(hpText, x, y + 52);
  ctx.fillStyle = '#bae6fd';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('ENERGY', x, y + 82);
  energyPips(ctx, x, y + 90, who.energy, who.maxEnergy, 11);
}

export function drawEndTurnButton(ctx, enabled, hover) {
  const x = 1060;
  const y = 36;
  const w = 190;
  const h = 56;
  ctx.save();
  ctx.fillStyle = enabled ? (hover ? '#f59e0b' : '#d97706') : '#4b5563';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('END TURN ⏎', x + w / 2, y + h / 2 + 1);
  ctx.restore();
  return { x, y, w, h };
}

export function drawTitle(ctx, time) {
  felt(ctx);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const glow = 0.5 + 0.5 * Math.sin(time / 500);
  ctx.fillStyle = `rgba(251,191,36,${0.55 + 0.35 * glow})`;
  ctx.font = 'bold 96px Georgia, serif';
  ctx.fillText('EMBER COURT', 640, 240);
  ctx.fillStyle = '#fde68a';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillText('A duel of sigils, flame and spark', 640, 310);
  ctx.fillStyle = '#fff';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('You and the rival Vex each hold 30 life. Play cards, spend energy,', 640, 420);
  ctx.fillText('and chain the same element twice in a turn for Resonance +2.', 640, 452);
  ctx.fillText('First to bring the other to 0 life wins the court.', 640, 484);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('CLICK OR PRESS ENTER TO PLAY', 640, 580);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Mouse: click a card to play it · Keys 1–5 play a card · Space ends your turn · R restarts', 640, 640);
  // Four sample suits across the bottom.
  const glyphs = ['▲', '●', '◆', '★'];
  const colors = ['#e2483d', '#2f7fd0', '#3d9e4d', '#d9930d'];
  glyphs.forEach((g, i) => {
    ctx.fillStyle = colors[i];
    ctx.font = '54px Georgia, serif';
    ctx.fillText(g, 520 + i * 80, 700);
  });
  ctx.restore();
}

function drawEndScreen(ctx, won, stats) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = won ? '#fef3c7' : '#1f2937';
  roundRect(ctx, 340, 180, 600, 440, 24);
  ctx.fill();
  ctx.strokeStyle = won ? '#f59e0b' : '#9ca3af';
  ctx.lineWidth = 4;
  roundRect(ctx, 340, 180, 600, 440, 24);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = won ? '#b45309' : '#e5e7eb';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText(won ? 'VICTORY' : 'DEFEAT', 640, 280);
  ctx.fillStyle = won ? '#92400e' : '#d1d5db';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText(won ? 'The court is yours. Vex bows out.' : 'Vex takes the court this time.', 640, 350);
  ctx.fillStyle = won ? '#78350f' : '#e5e7eb';
  ctx.font = '22px Georgia, serif';
  ctx.fillText(`Turns played: ${stats.turns}`, 640, 420);
  ctx.fillText(`Cards played: ${stats.cardsPlayed}`, 640, 456);
  ctx.fillText(`Damage dealt: ${stats.damageDealt}`, 640, 492);
  ctx.fillStyle = won ? '#b45309' : '#fca5a5';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('PRESS R TO PLAY AGAIN', 640, 560);
  ctx.restore();
}

export function drawTable(ctx, state, now) {
  felt(ctx);
  const { player, rival } = state;
  // Rival zone (top-left readout, face-down hand across the top).
  drawDuelist(ctx, { ...rival, name: 'Vex, the Ash Herald' }, 60, 56);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Turn ${state.turn} — ${state.phase === 'player' ? 'YOUR TURN' : state.phase === 'over' ? 'DUEL OVER' : 'VEX IS PLAYING…'}`, 640, 66);
  // Rival hand: face-down backs.
  const rivalBacks = handLayout(rival.hand.length, 96, 92);
  rivalBacks.forEach((r) => drawCardBack(ctx, r.x, r.y, 84, 118, true));
  // Table centre: cards played this turn.
  state.table.forEach((entry, i) => {
    const x = 480 + i * 170;
    const y = 330;
    const age = now - entry.born;
    const slide = Math.min(1, age / 260);
    const yy = y - (1 - slide) * 60;
    ctx.globalAlpha = slide;
    drawCard(ctx, entry.cardId, x, yy, 132, 185, { resonance: entry.resonance });
    ctx.globalAlpha = 1;
    ctx.fillStyle = entry.by === 'player' ? '#fde68a' : '#fca5a5';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(entry.by === 'player' ? 'YOU' : 'VEX', x + 66, yy + 205);
  });
  // Battle log, left of centre.
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = '15px Georgia, serif';
  state.log.slice(-6).forEach((line, i) => {
    ctx.fillStyle = `rgba(255,255,255,${0.45 + 0.1 * i})`;
    ctx.fillText(line, 60, 380 + i * 22);
  });
  ctx.restore();
  // Hint line.
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.hint, 640, 300);
  // Player zone (bottom-left readout, fanned hand across the bottom).
  drawDuelist(ctx, { ...player, name: 'You' }, 60, 580);
  const spread = player.hand.length <= 5 ? 164 : Math.floor(920 / player.hand.length);
  const layout = handLayout(player.hand.length, 560, spread);
  layout.forEach((rect, i) => {
    const hovered = state.hoverCard === i;
    const y = hovered ? rect.y - 30 : rect.y;
    const affordable = CARD_BY_ID[player.hand[i]].cost <= player.energy && state.phase === 'player';
    drawCard(ctx, player.hand[i], rect.x, y, CARD_W, CARD_H, {
      dim: !affordable,
      resonance: state.playedElements.has(CARD_BY_ID[player.hand[i]].element),
    });
    if (hovered) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      roundRect(ctx, rect.x - 3, y - 3, CARD_W + 6, CARD_H + 6, 14);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), rect.x + CARD_W / 2, y + CARD_H + 18);
  });
  drawEndTurnButton(ctx, state.phase === 'player', state.hoverEndTurn);
  // Floating damage / heal numbers.
  state.floaters.forEach((f) => {
    const age = (now - f.born) / 900;
    if (age >= 1) return;
    ctx.save();
    ctx.globalAlpha = 1 - age;
    ctx.fillStyle = f.color;
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y - age * 46);
    ctx.restore();
  });
  if (state.screen === 'win') drawEndScreen(ctx, true, state.stats);
  if (state.screen === 'loss') drawEndScreen(ctx, false, state.stats);
}
