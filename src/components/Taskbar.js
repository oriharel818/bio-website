// oriOS Taskbar
import { windowManager } from '../utils/windowManager.js';
import { createClock } from './Clock.js';
import { showShutdownScreen } from './ShutdownScreen.js';
import { desktopIcons } from './Desktop.js';
import { playClick, toggleMute, getMuted, isAudioReady } from '../utils/audioManager.js';

export function createTaskbar() {
  const taskbar = document.getElementById('taskbar');

  taskbar.innerHTML = `
    <button class="start-button">
      <span class="start-logo">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="0" y="0" width="7" height="7" rx="1" fill="#ff6b6b"/>
          <rect x="9" y="0" width="7" height="7" rx="1" fill="#51cf66"/>
          <rect x="0" y="9" width="7" height="7" rx="1" fill="#339af0"/>
          <rect x="9" y="9" width="7" height="7" rx="1" fill="#ffd43b"/>
        </svg>
      </span>
      <span class="start-text">Start</span>
    </button>
    <div class="taskbar-divider"></div>
    <div class="taskbar-windows"></div>
    <div class="system-tray">
      <div class="tray-icons">
        <span class="tray-icon volume-icon" title="Volume">🔊</span>
      </div>
      <div class="tray-divider"></div>
    </div>
  `;

  const startButton = taskbar.querySelector('.start-button');
  const taskbarWindows = taskbar.querySelector('.taskbar-windows');
  const systemTray = taskbar.querySelector('.system-tray');
  const volumeIcon = taskbar.querySelector('.volume-icon');

  // Add clock
  createClock(systemTray);

  // Volume icon click handler
  volumeIcon.addEventListener('click', () => {
    const muted = toggleMute();
    volumeIcon.textContent = muted ? '🔇' : '🔊';
    volumeIcon.title = muted ? 'Sound Off' : 'Volume';
    if (!muted) {
      playClick(); // Play a click to confirm sound is on
    }
  });

  // Create start menu - append to CRT screen so it's clipped by overflow:hidden
  const startMenu = createStartMenu();
  document.querySelector('.crt-screen').appendChild(startMenu);

  // Start button toggle
  let startMenuOpen = false;

  startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    playClick();
    startMenuOpen = !startMenuOpen;
    startMenu.classList.toggle('active', startMenuOpen);
    startButton.classList.toggle('active', startMenuOpen);
  });

  // Close start menu when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (startMenuOpen && !startMenu.contains(e.target) && !startButton.contains(e.target)) {
      startMenuOpen = false;
      startMenu.classList.remove('active');
      startButton.classList.remove('active');
    }
  });

  // Update taskbar windows
  windowManager.onWindowChange = (windows) => {
    taskbarWindows.innerHTML = windows.map(win => `
      <button class="taskbar-window-btn ${win.isActive ? 'active' : ''}" data-id="${win.id}">
        <span class="taskbar-window-icon">${win.icon}</span>
        <span class="taskbar-window-title">${win.title}</span>
      </button>
    `).join('');

    // Add click handlers
    taskbarWindows.querySelectorAll('.taskbar-window-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        windowManager.toggleMinimize(btn.dataset.id);
      });
    });
  };
}

function createStartMenu() {
  const menu = document.createElement('div');
  menu.className = 'start-menu';

  menu.innerHTML = `
    <div class="start-menu-sidebar">
      <span class="sidebar-text">ori<span class="sidebar-os">OS</span></span>
    </div>
    <div class="start-menu-content">
      <div class="start-menu-items">
        ${desktopIcons.map(icon => `
          <div class="start-menu-item" data-id="${icon.id}">
            <span class="menu-item-icon">${icon.icon}</span>
            <span class="menu-item-text">${icon.name}</span>
          </div>
        `).join('')}
        <div class="start-menu-divider"></div>
        <div class="start-menu-item shutdown" data-action="shutdown">
          <span class="menu-item-icon">⏻</span>
          <span class="menu-item-text">Shut Down...</span>
        </div>
      </div>
    </div>
  `;

  // Handle menu item clicks
  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.start-menu-item');
    if (!item) return;

    playClick();

    const action = item.dataset.action;
    const id = item.dataset.id;

    if (action === 'shutdown') {
      showShutdownScreen();
    } else if (id) {
      const iconData = desktopIcons.find(i => i.id === id);
      if (iconData && iconData.action) {
        iconData.action();
      }
    }

    // Close start menu
    menu.classList.remove('active');
    document.querySelector('.start-button').classList.remove('active');
  });

  return menu;
}
