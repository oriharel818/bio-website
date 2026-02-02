// Main entry point
import './styles/main.css';
import { createBootScreen } from './components/BootScreen.js';
import { createDesktop } from './components/Desktop.js';
import { createTaskbar } from './components/Taskbar.js';
import { openBioWindow } from './windows/BioWindow.js';
import { showErrorDialog } from './utils/humor.js';
import { initEasterEggs } from './effects/easterEggs.js';
import { initFly } from './effects/fly.js';
import { playClick } from './utils/audioManager.js';

let isScreenOn = true;

// Initialize the Windows 98 experience
function init() {
  // Show boot screen first
  createBootScreen(() => {
    // After boot completes, show desktop
    createDesktop();
    createTaskbar();

    // Global click sound on mousedown (instant feedback)
    document.addEventListener('mousedown', playClick, true);

    // Auto-open the bio window after a short delay
    setTimeout(() => {
      openBioWindow();
    }, 500);

    // Set up CRT control buttons
    setupCRTControls();

    // Initialize easter eggs
    initEasterEggs();

    // Initialize fly easter egg (appears after 30 minutes)
    initFly();
  });
}

// CRT monitor control buttons
function setupCRTControls() {
  const powerBtn = document.getElementById('power-btn');
  const screen = document.querySelector('.crt-screen');
  const led = document.querySelector('.power-led');
  const easterBtns = document.querySelectorAll('.control-btn[data-easter]');

  // Power button - turn screen on/off
  powerBtn?.addEventListener('click', () => {
    if (isScreenOn) {
      // Turn off
      screen.classList.add('turning-off');
      led.classList.add('off');
      setTimeout(() => {
        screen.classList.remove('turning-off');
        screen.classList.add('off');
        isScreenOn = false;
      }, 500);
    } else {
      // Turn on - keep screen off during animation, show content only after
      screen.classList.add('turning-on');
      led.classList.remove('off');
      setTimeout(() => {
        screen.classList.remove('off');
        screen.classList.remove('turning-on');
        isScreenOn = true;
      }, 600);
    }
  });

  // Hidden button effects
  let btn1Clicks = 0;
  let btn2Clicks = 0;

  easterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const num = parseInt(btn.dataset.easter);

      if (num === 1) {
        btn1Clicks++;
        if (btn1Clicks === 1) {
          showErrorDialog("This button adjusts the brightness.\n\nJust kidding. It does nothing.", "Monitor Settings");
        } else if (btn1Clicks === 3) {
          showErrorDialog("Still clicking? Respect the persistence.", "Monitor Settings");
        } else if (btn1Clicks === 5) {
          showErrorDialog("OK fine. Here's a secret:\n\nI once charged a client $500 to plug in their monitor. It wasn't plugged in. They paid.", "Confession");
          btn1Clicks = 0;
        }
      } else if (num === 2) {
        btn2Clicks++;
        if (btn2Clicks === 1) {
          // Invert colors briefly
          document.body.style.filter = 'invert(1)';
          setTimeout(() => {
            document.body.style.filter = '';
          }, 200);
        } else if (btn2Clicks === 3) {
          // Spin the monitor
          const outer = document.querySelector('.crt-outer');
          outer.style.transition = 'transform 0.5s';
          outer.style.transform = 'rotate(360deg)';
          setTimeout(() => {
            outer.style.transform = '';
            setTimeout(() => outer.style.transition = '', 500);
          }, 500);
        } else if (btn2Clicks >= 5) {
          showErrorDialog('"Get busy living, or get busy dying."\n\n- The Shawshank Redemption', "🎬 Secret Menu");
          btn2Clicks = 0;
        }
      }
    });
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
