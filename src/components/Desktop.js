// Desktop with icons
import { tooltips } from '../utils/humor.js';
import { openBioWindow } from '../windows/BioWindow.js';
import { openTimelineWindow } from '../windows/TimelineWindow.js';
import { openReadingListWindow } from '../windows/ReadingListWindow.js';
import { openSnakeGameWindow } from '../windows/SnakeGameWindow.js';
import { openAsteroidsGameWindow } from '../windows/AsteroidsGameWindow.js';
import { openSolitaireWindow } from '../windows/SolitaireWindow.js';
import { openPaintWindow } from '../windows/PaintWindow.js';
import { openRecycleBinWindow } from '../windows/RecycleBinWindow.js';
import { openEducationWindow } from '../windows/EducationWindow.js';

const desktopIcons = [
  // All icons - flex column wrap will handle layout
  { id: 'recycle-bin', name: 'Recycle Bin', icon: '🗑️', tooltip: tooltips.recycleBin, action: openRecycleBinWindow },
  { id: 'about-me', name: 'About_Me.txt', icon: '📄', tooltip: tooltips.aboutMe, action: openBioWindow },
  { id: 'ventures', name: 'My_Ventures', icon: '📁', tooltip: tooltips.ventures, action: openTimelineWindow },
  { id: 'education', name: 'My_Education', icon: '🎓', tooltip: tooltips.education, action: openEducationWindow },
  { id: 'snake', name: 'Snake.exe', icon: '🐍', tooltip: tooltips.snake, action: openSnakeGameWindow },
  { id: 'reading-list', name: 'Reading_List', icon: '📚', tooltip: tooltips.readingList, action: openReadingListWindow },
  { id: 'asteroids', name: 'Asteroids.exe', icon: '🚀', tooltip: tooltips.asteroids, action: openAsteroidsGameWindow },
  { id: 'solitaire', name: 'Solitaire', icon: '🃏', tooltip: tooltips.solitaire, action: openSolitaireWindow },
  { id: 'paint', name: 'Paint', icon: '🎨', tooltip: tooltips.paint, action: openPaintWindow },
  { id: 'reele', name: 'Reel-E.ai', icon: '', iconImage: '/assets/images/reele-logo.png', tooltip: 'AI-powered property video', action: () => window.open('https://reel-e.ai', '_blank') },
  { id: 'lumara', name: 'Lumara Media', icon: '', iconImage: '/assets/images/lumara-logo.png', tooltip: 'Corporate video production', action: () => window.open('https://lumaramedia.com', '_blank') }
];

// Track desktop clicks for easter egg
let emptyClickCount = 0;

export function createDesktop() {
  const desktop = document.getElementById('desktop');

  desktop.innerHTML = `
    <div class="desktop-icons">
      ${desktopIcons.map(icon => `
        <div class="desktop-icon" data-id="${icon.id}" title="${icon.tooltip}">
          <div class="icon-image">${icon.iconImage ? `<img src="${icon.iconImage}" alt="${icon.name}" class="icon-img">` : icon.icon}</div>
          <div class="icon-label">${icon.name}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Lasso selection state
  let isSelecting = false;
  let selectionBox = null;
  let startX = 0;
  let startY = 0;
  let selectedIcons = new Set();

  // Create selection box element
  function createSelectionBox() {
    const box = document.createElement('div');
    box.className = 'selection-box';
    return box;
  }

  // Check if two rectangles intersect
  function rectsIntersect(r1, r2) {
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
  }

  // Get desktop-relative coordinates
  function getDesktopCoords(e) {
    const rect = desktop.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // Mouse down - start selection
  desktop.addEventListener('mousedown', (e) => {
    const icon = e.target.closest('.desktop-icon');

    // Only start lasso on empty space (left click)
    if (icon || e.button !== 0) return;

    e.preventDefault();
    isSelecting = true;
    const coords = getDesktopCoords(e);
    startX = coords.x;
    startY = coords.y;

    // Clear previous selection unless shift is held
    if (!e.shiftKey) {
      desktop.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
      selectedIcons.clear();
    }

    // Create and add selection box
    selectionBox = createSelectionBox();
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    desktop.appendChild(selectionBox);
  });

  // Mouse move - update selection box
  document.addEventListener('mousemove', (e) => {
    if (!isSelecting || !selectionBox) return;

    const coords = getDesktopCoords(e);
    const currentX = Math.max(0, Math.min(coords.x, desktop.clientWidth));
    const currentY = Math.max(0, Math.min(coords.y, desktop.clientHeight));

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';

    // Check which icons are within selection
    const selectionRect = {
      left: left,
      top: top,
      right: left + width,
      bottom: top + height
    };

    desktop.querySelectorAll('.desktop-icon').forEach(iconEl => {
      const iconRect = {
        left: iconEl.offsetLeft,
        top: iconEl.offsetTop,
        right: iconEl.offsetLeft + iconEl.offsetWidth,
        bottom: iconEl.offsetTop + iconEl.offsetHeight
      };

      if (rectsIntersect(selectionRect, iconRect)) {
        iconEl.classList.add('selected');
        selectedIcons.add(iconEl.dataset.id);
      } else if (!e.shiftKey) {
        iconEl.classList.remove('selected');
        selectedIcons.delete(iconEl.dataset.id);
      }
    });
  });

  // Mouse up - end selection
  document.addEventListener('mouseup', (e) => {
    if (!isSelecting) return;

    isSelecting = false;
    if (selectionBox) {
      selectionBox.remove();
      selectionBox = null;
    }
  });

  // Handle icon clicks - SINGLE CLICK to open
  desktop.addEventListener('click', (e) => {
    const icon = e.target.closest('.desktop-icon');

    // Clicking empty desktop
    if (!icon) {
      emptyClickCount++;
      if (emptyClickCount >= 10) {
        import('../utils/humor.js').then(({ showErrorDialog }) => {
          showErrorDialog("Stop clicking. There's nothing here.", 'Desktop');
        });
        emptyClickCount = 0;
      }
      // Clear selection on empty click (unless just finished dragging)
      if (!e.shiftKey) {
        desktop.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
        selectedIcons.clear();
      }
      return;
    }

    // Reset empty click counter when clicking icons
    emptyClickCount = 0;

    // Single click - open the window immediately
    const iconId = icon.dataset.id;
    const iconData = desktopIcons.find(i => i.id === iconId);

    // Brief visual feedback
    icon.classList.add('selected');
    setTimeout(() => icon.classList.remove('selected'), 150);

    if (iconData && iconData.action) {
      iconData.action();
    }
  });

  // Prevent text selection on icons
  desktop.addEventListener('selectstart', (e) => {
    if (e.target.closest('.desktop-icon') || isSelecting) {
      e.preventDefault();
    }
  });

  // Set up Konami code easter egg
  setupKonamiCode();
}

// Konami code: ↑↑↓↓←→←→BA
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

function setupKonamiCode() {
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase() === e.key ? e.key : e.key;

    if (key === konamiCode[konamiIndex] || key.toLowerCase() === konamiCode[konamiIndex]) {
      konamiIndex++;

      if (konamiIndex === konamiCode.length) {
        // Konami code completed!
        triggerKonamiEasterEgg();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

function triggerKonamiEasterEgg() {
  import('../utils/humor.js').then(({ showErrorDialog }) => {
    showErrorDialog(
      "🎮 KONAMI CODE ACTIVATED 🎮\n\nYou found the secret!\n\nFun fact: I've never actually beaten Contra without this code.",
      '🕹️ Achievement Unlocked'
    );
  });

  // Add a brief screen flash effect
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    opacity: 0;
    pointer-events: none;
    z-index: 99999;
    animation: konamiFlash 0.5s ease-out;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes konamiFlash {
      0% { opacity: 0.8; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  document.querySelector('.crt-screen').appendChild(flash);
  setTimeout(() => {
    flash.remove();
    style.remove();
  }, 500);
}

// Export for start menu
export { desktopIcons };
