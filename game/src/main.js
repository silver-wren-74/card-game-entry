// Ember Court — bootstrap. One canvas, scaled to the window, running the
// duel from game.js. Screenshot presets (?shot=) come from shots.js.

import { createState, draw, onClick, onKey, onMove, update } from './game.js';
import { applyShot } from './shots.js';
import { unlockAudio } from './audio.js';
import { mulberry32 } from './rng.js';
import { VIEW_W, VIEW_H } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let state = createState(mulberry32((Date.now() % 2147483647) | 1));
state = applyShot(state, new URLSearchParams(window.location.search));

function resize() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.style.width = `${Math.floor(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW_H * scale)}px`;
}

function toLogical(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
    y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
  };
}

canvas.addEventListener('click', (event) => {
  unlockAudio();
  const p = toLogical(event);
  onClick(state, p.x, p.y);
});
canvas.addEventListener('mousemove', (event) => {
  const p = toLogical(event);
  onMove(state, p.x, p.y);
});
window.addEventListener('keydown', (event) => {
  unlockAudio();
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  onKey(state, event.key);
});
window.addEventListener('resize', resize);
resize();

function frame(now) {
  update(state, now);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  draw(state, ctx, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
