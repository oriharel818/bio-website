// Audio Manager - Synthesized sounds via Web Audio API
let audioContext = null;
let isMuted = false;
let startupPlayed = false;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

async function ensureAudioReady() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

export async function playClick() {
  if (isMuted) return;

  try {
    const ctx = await ensureAudioReady();

    // Play startup sound on first interaction
    if (!startupPlayed) {
      startupPlayed = true;
      doPlayStartup(ctx);
      return; // Skip click sound, startup is enough
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.06);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function doPlayStartup(ctx) {
  // Windows 98-style startup chime
  const notes = [
    { freq: 523.25, start: 0, duration: 0.5 },
    { freq: 659.25, start: 0.1, duration: 0.5 },
    { freq: 783.99, start: 0.2, duration: 0.5 },
    { freq: 1046.50, start: 0.3, duration: 0.6 },
  ];

  notes.forEach(note => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start);

    gain.gain.setValueAtTime(0, ctx.currentTime + note.start);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + note.start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.start + note.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + note.start);
    osc.stop(ctx.currentTime + note.start + note.duration);
  });
}

export async function playStartup() {
  if (isMuted || startupPlayed) return;

  try {
    const ctx = await ensureAudioReady();
    startupPlayed = true;
    doPlayStartup(ctx);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuted() {
  return isMuted;
}

export function setMuted(muted) {
  isMuted = muted;
}
