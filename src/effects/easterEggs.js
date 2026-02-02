// Easter Eggs Controller - Manages all secret triggers
import { toggleSnow, stopSnow } from './snow.js';
import { toggleDisco, stopDisco } from './disco.js';
import { triggerFireworks } from './fireworks.js';
import { showRickroll, hideRickroll } from './rickroll.js';

let inputBuffer = '';
let bufferTimeout = null;
let konamiBuffer = [];
let konamiTimeout = null;

// Reverse Konami code: A B → ← → ← ↓ ↓ ↑ ↑
const reverseKonami = ['a', 'b', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp'];

// Text-based triggers
const textTriggers = {
  'letitsnow': () => toggleSnow(true),
  'stopsnow': () => toggleSnow(false),
  'PARTY': () => toggleDisco(),
};

function handleKeyDown(e) {
  // Escape key stops all effects
  if (e.key === 'Escape') {
    stopSnow();
    stopDisco();
    hideRickroll();
    return;
  }

  // Handle text input for snow and disco
  if (e.key.length === 1) {
    inputBuffer += e.key;
    clearTimeout(bufferTimeout);
    bufferTimeout = setTimeout(() => {
      inputBuffer = '';
    }, 2000);

    // Check all text triggers
    for (const [trigger, fn] of Object.entries(textTriggers)) {
      if (inputBuffer.endsWith(trigger)) {
        fn();
        inputBuffer = '';
        return;
      }
    }
  }

  // Handle reverse Konami code
  // Accept both arrow keys and letter keys
  const key = e.key;
  konamiBuffer.push(key);

  // Keep buffer at reasonable size
  if (konamiBuffer.length > 20) {
    konamiBuffer.shift();
  }

  clearTimeout(konamiTimeout);
  konamiTimeout = setTimeout(() => {
    konamiBuffer = [];
  }, 3000);

  // Check if the last N keys match the reverse Konami code
  if (konamiBuffer.length >= reverseKonami.length) {
    const lastKeys = konamiBuffer.slice(-reverseKonami.length);
    const matches = lastKeys.every((k, i) => k.toLowerCase() === reverseKonami[i].toLowerCase());
    if (matches) {
      showRickroll();
      konamiBuffer = [];
    }
  }
}

// Clock click handler for fireworks (exported for use in Clock.js)
export function handleClockClick() {
  const now = new Date();
  const seconds = now.getSeconds();

  // Trigger fireworks if clicked exactly at :00 seconds
  if (seconds === 0) {
    triggerFireworks();
  }
}

export function initEasterEggs() {
  document.addEventListener('keydown', handleKeyDown);
}

export function cleanupEasterEggs() {
  document.removeEventListener('keydown', handleKeyDown);
  clearTimeout(bufferTimeout);
  clearTimeout(konamiTimeout);
}
