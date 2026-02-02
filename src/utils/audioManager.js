// Audio Manager - Synthesized sounds via Web Audio API
let audioContext = null;
let isMuted = false;
let isReady = false;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Must be called from a user gesture (click)
export async function initAudio() {
  if (isReady) return true;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    isReady = ctx.state === 'running';
    console.log('Audio initialized:', isReady, ctx.state);
    return isReady;
  } catch (e) {
    console.error('Audio init failed:', e);
    return false;
  }
}

// Mouse click sound - short tick/snap
export function playClick() {
  if (isMuted || !isReady) return;

  try {
    const ctx = getAudioContext();

    // Create a short noise burst for click sound
    const bufferSize = ctx.sampleRate * 0.015; // 15ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate click sound - sharp attack, quick decay
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Quick exponential decay with some noise
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.5;
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    source.buffer = buffer;
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);

    // Add a subtle low-frequency thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    source.start(ctx.currentTime);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  } catch (e) {
    console.error('Click sound error:', e);
  }
}

// Windows 98-style startup chime
export function playStartup() {
  if (isMuted || !isReady) {
    console.log('Startup blocked - muted:', isMuted, 'ready:', isReady);
    return;
  }

  try {
    const ctx = getAudioContext();
    console.log('Playing startup sound');

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
    console.error('Startup sound error:', e);
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
  return isReady;
}
