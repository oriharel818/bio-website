// Window factory for creating 98-style windows
import { makeDraggable } from '../utils/draggable.js';
import { windowManager } from '../utils/windowManager.js';
import { playWindowOpen, playWindowClose } from '../utils/audioManager.js';

let windowCounter = 0;

// Detect mobile devices
function isMobile() {
  return window.innerWidth <= 768;
}

export function createWindow(options) {
  const {
    id = `window-${++windowCounter}`,
    title = 'Window',
    icon = '📄',
    width = 400,
    height = 300,
    x = null,
    y = null,
    content = '',
    className = '',
    resizable = true,
    onClose = null,
    menuBar = null
  } = options;

  // Check if already open
  if (windowManager.isOpen(id)) {
    windowManager.focus(id);
    return null;
  }

  const windowElement = document.createElement('div');
  windowElement.className = `window ${className}`;
  windowElement.id = id;
  windowElement.style.width = typeof width === 'number' ? `${width}px` : width;
  windowElement.style.height = typeof height === 'number' ? `${height}px` : height;

  // Position the window
  if (x !== null && y !== null) {
    windowElement.style.left = `${x}px`;
    windowElement.style.top = `${y}px`;
  } else {
    // Center with slight offset based on counter
    const container = document.getElementById('windows-container');
    const containerRect = container ? container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const offsetX = (windowCounter % 5) * 30;
    const offsetY = (windowCounter % 5) * 30;
    const centerX = Math.max(0, (containerRect.width - width) / 2 + offsetX);
    const centerY = Math.max(0, (containerRect.height - height) / 2 + offsetY - 50);
    windowElement.style.left = `${centerX}px`;
    windowElement.style.top = `${centerY}px`;
  }

  // Play window open sound
  playWindowOpen();

  windowElement.innerHTML = `
    <div class="title-bar">
      <div class="title-bar-text">
        <span class="window-icon">${icon}</span>
        ${title}
      </div>
      <div class="title-bar-controls">
        <button aria-label="Minimize" class="minimize-btn"></button>
        <button aria-label="Maximize" class="maximize-btn"></button>
        <button aria-label="Close" class="close-btn"></button>
      </div>
    </div>
    ${menuBar ? `<div class="menu-bar">${menuBar}</div>` : ''}
    <div class="window-body">
      ${content}
    </div>
    ${resizable ? '<div class="resize-handle"></div>' : ''}
  `;

  // Add to DOM
  document.getElementById('windows-container').appendChild(windowElement);

  // Make draggable
  const titleBar = windowElement.querySelector('.title-bar');
  makeDraggable(windowElement, titleBar);

  // Register with window manager
  windowManager.register(id, windowElement, { title, icon });

  // Button handlers
  windowElement.querySelector('.minimize-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    windowManager.minimize(id);
  });

  windowElement.querySelector('.maximize-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    windowManager.maximize(id);
  });

  windowElement.querySelector('.close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (onClose) {
      const shouldClose = onClose();
      if (shouldClose === false) return;
    }
    playWindowClose();
    windowManager.close(id);
  });

  // Handle resize (desktop only)
  if (resizable && !isMobile()) {
    const resizeHandle = windowElement.querySelector('.resize-handle');
    let isResizing = false;
    let startWidth, startHeight, startX, startY;

    function startResize(clientX, clientY) {
      isResizing = true;
      startWidth = windowElement.offsetWidth;
      startHeight = windowElement.offsetHeight;
      startX = clientX;
      startY = clientY;
    }

    function moveResize(clientX, clientY) {
      if (!isResizing) return;

      const newWidth = Math.max(200, startWidth + (clientX - startX));
      const newHeight = Math.max(150, startHeight + (clientY - startY));

      windowElement.style.width = `${newWidth}px`;
      windowElement.style.height = `${newHeight}px`;
    }

    function endResize() {
      isResizing = false;
    }

    // Mouse events
    resizeHandle.addEventListener('mousedown', (e) => {
      startResize(e.clientX, e.clientY);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      moveResize(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', endResize);

    // Touch events for resize
    resizeHandle.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startResize(touch.clientX, touch.clientY);
      e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isResizing) return;
      const touch = e.touches[0];
      moveResize(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchend', endResize);
  }

  return windowElement;
}
