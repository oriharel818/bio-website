// oriOS Boot Screen

// Self-contained startup sound - creates fresh AudioContext
function playStartupSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

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
  } catch (e) {
    // Silent fail - browser may block audio
  }
}

export function createBootScreen(onComplete) {
  const bootScreen = document.getElementById('boot-screen');

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

      // Play startup chime
      playStartupSound();

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
