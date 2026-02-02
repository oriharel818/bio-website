// oriOS Boot Screen
import { initAudio } from '../utils/audioManager.js';

// Startup chime - 4-note ascending chord
function playStartupSound(ctx) {
  const notes = [
    { freq: 523.25, start: 0, duration: 0.5 },     // C5
    { freq: 659.25, start: 0.1, duration: 0.5 },   // E5
    { freq: 783.99, start: 0.2, duration: 0.5 },   // G5
    { freq: 1046.50, start: 0.3, duration: 0.6 },  // C6
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
}

export function createBootScreen(onComplete) {
  const bootScreen = document.getElementById('boot-screen');

  // Start boot immediately - no click required
  bootScreen.innerHTML = `
    <div class="boot-container">
      <div class="boot-logo">
        <div class="ori-flag">
          <div class="flag-square red"></div>
          <div class="flag-square green"></div>
          <div class="flag-square blue"></div>
          <div class="flag-square yellow"></div>
        </div>
        <div class="ori-text">
          <span class="ori-name">ori</span>
          <span class="ori-os">OS</span>
        </div>
      </div>
      <div class="boot-tagline">Brought online 1998.</div>
      <div class="boot-progress">
        <div class="progress-track">
          <div class="progress-blocks"></div>
        </div>
      </div>
      <div class="boot-copyright">
        <p>Starting up...</p>
      </div>
    </div>
  `;

  bootScreen.classList.add('active');

  // Try to play startup sound immediately
  initAudio().then(ctx => {
    if (ctx && ctx.state === 'running') {
      playStartupSound(ctx);
    } else {
      // Browser blocked autoplay - play on first user interaction
      const playOnInteraction = async () => {
        document.removeEventListener('click', playOnInteraction);
        const ctx = await initAudio();
        if (ctx) playStartupSound(ctx);
      };
      document.addEventListener('click', playOnInteraction, { once: true });
    }
  });

  // Animate progress blocks
  const progressBlocks = bootScreen.querySelector('.progress-blocks');
  let blockCount = 0;
  const maxBlocks = 20;

  const progressInterval = setInterval(() => {
    if (blockCount < maxBlocks) {
      const block = document.createElement('div');
      block.className = 'progress-block';
      progressBlocks.appendChild(block);
      blockCount++;
    } else {
      clearInterval(progressInterval);

      setTimeout(() => {
        bootScreen.classList.remove('active');
        bootScreen.classList.add('fade-out');

        setTimeout(() => {
          bootScreen.style.display = 'none';
          if (onComplete) onComplete();
        }, 500);
      }, 800);
    }
  }, 100);
}
