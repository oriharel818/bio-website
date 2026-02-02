// oriOS Boot Screen
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
      <div class="boot-tagline">Born in '98. Built in '98.</div>
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

      // Play startup sound and fade out
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

function playStartupSound() {
  // oriOS startup sound - using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create a modern startup chord
    const notes = [
      { freq: 523.25, start: 0, duration: 0.5 },      // C5
      { freq: 659.25, start: 0.1, duration: 0.5 },    // E5
      { freq: 783.99, start: 0.2, duration: 0.5 },    // G5
      { freq: 1046.50, start: 0.3, duration: 0.6 },   // C6
    ];

    notes.forEach(note => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = note.freq;

      gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + note.start + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.start + note.duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + note.start);
      oscillator.stop(audioContext.currentTime + note.start + note.duration);
    });
  } catch (e) {
    // Audio not supported, continue silently
    console.log('Audio not available');
  }
}
