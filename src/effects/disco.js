// Disco Mode - Disco ball with colored spotlights
let discoOverlay = null;
let isDiscoActive = false;

function createDiscoOverlay() {
  const screen = document.querySelector('.crt-screen');
  if (!screen) return null;

  const overlay = document.createElement('div');
  overlay.className = 'disco-overlay';
  overlay.innerHTML = `
    <div class="disco-ball">
      <div class="disco-ball-inner"></div>
      <div class="disco-reflection"></div>
    </div>
    <div class="disco-spotlights">
      <div class="spotlight spotlight-1"></div>
      <div class="spotlight spotlight-2"></div>
      <div class="spotlight spotlight-3"></div>
      <div class="spotlight spotlight-4"></div>
    </div>
    <div class="disco-floor-lights"></div>
  `;

  screen.appendChild(overlay);
  return overlay;
}

export function startDisco() {
  if (isDiscoActive) return;

  discoOverlay = createDiscoOverlay();
  if (!discoOverlay) return;

  isDiscoActive = true;

  // Trigger animation
  requestAnimationFrame(() => {
    discoOverlay.classList.add('active');
  });
}

export function stopDisco() {
  if (!isDiscoActive || !discoOverlay) return;

  discoOverlay.classList.remove('active');
  discoOverlay.classList.add('fade-out');

  setTimeout(() => {
    if (discoOverlay) {
      discoOverlay.remove();
      discoOverlay = null;
    }
    isDiscoActive = false;
  }, 500);
}

export function toggleDisco() {
  if (isDiscoActive) {
    stopDisco();
  } else {
    startDisco();
  }
}
