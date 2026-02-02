// Audio Manager - Synthesized sounds via Web Audio API
let audioContext = null;
let isMuted = true; // Default to muted
let clickAudio = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export async function initAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx.state === 'running' ? ctx : null;
  } catch (e) {
    return null;
  }
}

// Mouse click sound using MP3 file
export function playClick() {
  if (isMuted) return;

  try {
    if (!clickAudio) {
      clickAudio = new Audio('/assets/sounds/mouse-clicks.mp3');
    }
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {}); // Silent fail if blocked
  } catch (e) {
    // Silent fail
  }
}

// Windows 98-style startup chime
export async function playStartup() {
  if (isMuted) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

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
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + note.start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.start);
      osc.stop(ctx.currentTime + note.start + note.duration);
    });
  } catch (e) {
    // Silent fail
  }
}

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuted() {
  return isMuted;
}

export function isAudioReady() {
  const ctx = getAudioContext();
  return ctx && ctx.state === 'running';
}
