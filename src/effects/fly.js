// Fly Easter Egg - Appears after patience
import { showRickroll } from './rickroll.js';

let flyElement = null;
let flyTimer = null;
let isActive = false;

const FLY_DELAY = 30 * 60 * 1000; // 30 minutes in milliseconds

function createFly() {
  const screen = document.querySelector('.crt-screen');
  if (!screen || flyElement) return;

  flyElement = document.createElement('div');
  flyElement.className = 'fly-easter-egg';
  flyElement.innerHTML = '🪰';
  flyElement.title = 'What\'s this?';

  // Random position within screen bounds
  const screenRect = screen.getBoundingClientRect();
  const maxX = screenRect.width - 30;
  const maxY = screenRect.height - 60; // Account for taskbar

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  flyElement.style.left = `${x}px`;
  flyElement.style.top = `${y}px`;

  // Click handler
  flyElement.addEventListener('click', handleFlyClick);

  screen.appendChild(flyElement);
  isActive = true;

  // Trigger landing animation
  requestAnimationFrame(() => {
    flyElement.classList.add('landed');
  });
}

function handleFlyClick() {
  if (!flyElement) return;

  // Remove the fly
  flyElement.classList.add('squished');

  setTimeout(() => {
    removeFly();
    // Trigger rickroll
    showRickroll();
  }, 200);
}

function removeFly() {
  if (flyElement) {
    flyElement.remove();
    flyElement = null;
  }
  isActive = false;
}

export function initFly(customDelay = null) {
  // Clear any existing timer
  if (flyTimer) {
    clearTimeout(flyTimer);
  }

  const delay = customDelay !== null ? customDelay : FLY_DELAY;

  flyTimer = setTimeout(() => {
    createFly();
  }, delay);
}

export function stopFly() {
  if (flyTimer) {
    clearTimeout(flyTimer);
    flyTimer = null;
  }
  removeFly();
}

export function isFlyActive() {
  return isActive;
}
