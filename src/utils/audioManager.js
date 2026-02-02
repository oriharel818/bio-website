// Audio Manager - Synthesized sounds via Web Audio API
let audioContext = null;
let isMuted = false;

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
    return ctx.state === 'running';
  } catch (e) {
    return false;
  }
}

// Realistic mouse click sound - mechanical switch with thunk
export function playClick() {
  if (isMuted) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Component 1: Sharp noise transient (the "click")
    const clickDuration = 0.008; // 8ms
    const clickBuffer = ctx.createBuffer(1, ctx.sampleRate * clickDuration, ctx.sampleRate);
    const clickData = clickBuffer.getChannelData(0);

    for (let i = 0; i < clickData.length; i++) {
      const t = i / clickData.length;
      const envelope = Math.exp(-t * 80); // Very fast decay
      clickData[i] = (Math.random() * 2 - 1) * envelope;
    }

    const clickSource = ctx.createBufferSource();
    clickSource.buffer = clickBuffer;

    const clickHighpass = ctx.createBiquadFilter();
    clickHighpass.type = 'highpass';
    clickHighpass.frequency.value = 2000;

    const clickGain = ctx.createGain();
    clickGain.gain.value = 0.15;

    clickSource.connect(clickHighpass);
    clickHighpass.connect(clickGain);
    clickGain.connect(ctx.destination);

    // Component 2: Low "thunk" (the mechanical body)
    const thunkOsc = ctx.createOscillator();
    thunkOsc.type = 'sine';
    thunkOsc.frequency.setValueAtTime(150, now);
    thunkOsc.frequency.exponentialRampToValueAtTime(80, now + 0.02);

    const thunkGain = ctx.createGain();
    thunkGain.gain.setValueAtTime(0.1, now);
    thunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    thunkOsc.connect(thunkGain);
    thunkGain.connect(ctx.destination);

    // Play both components
    clickSource.start(now);
    thunkOsc.start(now);
    thunkOsc.stop(now + 0.03);
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
