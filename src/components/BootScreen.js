// oriOS Boot Screen
import { initAudio, playStartup } from '../utils/audioManager.js';

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
        <p class="click-to-start">Click anywhere to start</p>
      </div>
    </div>
  `;

  bootScreen.classList.add('active');

  // Wait for click to start boot sequence
  const startBoot = async () => {
    bootScreen.removeEventListener('click', startBoot);

    // Initialize audio on user gesture
    await initAudio();

    // Update text
    const clickText = bootScreen.querySelector('.click-to-start');
    if (clickText) clickText.textContent = 'Starting up...';

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

        // Play startup sound after loading completes
        playStartup();

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
  };

  bootScreen.addEventListener('click', startBoot);
}
