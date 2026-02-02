// Error messages with dry humor
import { playError } from './audioManager.js';
export const errorMessages = {
  bioCloseTooFast: "Error: You haven't even read it yet. Rude.",
  snakeDeath: "Your snake has died. Just like my music career.",
  paintSave: "Masterpiece saved. You're basically Picasso now.",
  recycleBinRestore: "Cannot restore. Some things are gone forever.",
  recycleBinEmpty: "Are you sure? This will delete all your regrets permanently.",
  shutdownMessage: "It's now safe to close this tab. Thanks for stopping by.",
  shutdownAlt: "Goodbye. Don't forget to invest in my company."
};

// Tooltips for desktop icons
export const tooltips = {
  recycleBin: "Failed ventures go here. It's mostly empty. Mostly.",
  snake: "Warning: Highly addictive. Side effects include procrastination.",
  asteroids: "Destroy space rocks. Much easier than destroying deadlines.",
  solitaire: "For when you're too lazy to procrastinate productively.",
  aboutMe: "My entire personality in one file. You're welcome.",
  ventures: "A timeline of my questionable decisions.",
  education: "Very prestigious. Trust me.",
  readingList: "Books I've definitely read and not just bought.",
  paint: "For when you need to procrastinate creatively.",
  companies: "Links to places where I pretend to be professional."
};

// Random quips that can appear
export const quips = [
  "Loading... just kidding, it's already loaded.",
  "Optimizing pixels... done.",
  "Defragmenting hard drive... this might take 3 hours.",
  "Installing updates... please don't turn off your computer.",
  "Searching for meaning... none found."
];

// Get a random quip
export function getRandomQuip() {
  return quips[Math.floor(Math.random() * quips.length)];
}

// Show an error dialog
export function showErrorDialog(message, title = 'Error') {
  playError();
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.innerHTML = `
    <div class="window dialog-window">
      <div class="title-bar">
        <div class="title-bar-text">${title}</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="dialog-close"></button>
        </div>
      </div>
      <div class="window-body dialog-body">
        <div class="dialog-content">
          <span class="dialog-icon">⚠️</span>
          <p>${message}</p>
        </div>
        <div class="dialog-buttons">
          <button class="dialog-ok">OK</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeDialog = () => {
    overlay.remove();
  };

  overlay.querySelector('.dialog-close').addEventListener('click', closeDialog);
  overlay.querySelector('.dialog-ok').addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog();
  });

  return overlay;
}

// Confirmation dialog
export function showConfirmDialog(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <div class="window dialog-window">
        <div class="title-bar">
          <div class="title-bar-text">${title}</div>
          <div class="title-bar-controls">
            <button aria-label="Close" class="dialog-close"></button>
          </div>
        </div>
        <div class="window-body dialog-body">
          <div class="dialog-content">
            <span class="dialog-icon">❓</span>
            <p>${message}</p>
          </div>
          <div class="dialog-buttons">
            <button class="dialog-yes">Yes</button>
            <button class="dialog-no">No</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('.dialog-close').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
    overlay.querySelector('.dialog-yes').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
    overlay.querySelector('.dialog-no').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
  });
}
