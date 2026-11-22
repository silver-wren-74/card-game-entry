// Ember Court — tiny synthesized sounds. No audio files: every blip is a
// WebAudio oscillator, so the game still loads nothing over the network.

let context = null;

function ensureContext() {
  if (!context) {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

export function unlockAudio() {
  ensureContext();
}

function tone(freq, durMs, type = 'sine', gain = 0.08, whenMs = 0) {
  const ctx = ensureContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ctx.currentTime + whenMs / 1000);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (whenMs + durMs) / 1000);
  osc.connect(amp).connect(ctx.destination);
  osc.start(ctx.currentTime + whenMs / 1000);
  osc.stop(ctx.currentTime + (whenMs + durMs) / 1000);
}

export const sfx = {
  playCard() { tone(520, 90, 'triangle', 0.07); tone(780, 120, 'triangle', 0.05, 60); },
  strike() { tone(180, 160, 'sawtooth', 0.09); tone(90, 200, 'square', 0.06, 40); },
  ward() { tone(340, 140, 'sine', 0.07); tone(510, 180, 'sine', 0.05, 80); },
  heal() { tone(660, 120, 'sine', 0.06); tone(880, 200, 'sine', 0.05, 90); },
  draw() { tone(440, 70, 'triangle', 0.05); tone(590, 70, 'triangle', 0.05, 70); },
  turn() { tone(392, 100, 'triangle', 0.05); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 220, 'triangle', 0.08, i * 130)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 240, 'sine', 0.07, i * 150)); },
  error() { tone(140, 120, 'square', 0.05); },
};
