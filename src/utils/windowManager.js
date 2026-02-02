// Window manager for handling z-index, focus, and window state
class WindowManager {
  constructor() {
    this.windows = new Map();
    this.baseZIndex = 100;
    this.topZIndex = 100;
    this.onWindowChange = null; // Callback for taskbar updates
  }

  register(id, windowElement, options = {}) {
    this.windows.set(id, {
      element: windowElement,
      title: options.title || id,
      icon: options.icon || '📄',
      isMinimized: false,
      isMaximized: false,
      originalPosition: null,
      originalSize: null
    });

    // Add click handler to focus window
    windowElement.addEventListener('mousedown', () => {
      this.focus(id);
    });

    this.focus(id);
    this.notifyChange();
  }

  unregister(id) {
    this.windows.delete(id);
    this.notifyChange();
  }

  focus(id) {
    const windowData = this.windows.get(id);
    if (!windowData) return;

    // Remove active class from all windows
    this.windows.forEach((data) => {
      data.element.classList.remove('window-active');
    });

    // Bring to front and mark as active
    this.topZIndex++;
    windowData.element.style.zIndex = this.topZIndex;
    windowData.element.classList.add('window-active');

    // Unminimize if needed
    if (windowData.isMinimized) {
      windowData.element.style.display = '';
      windowData.isMinimized = false;
    }

    // Bring window back into view if off-screen
    const el = windowData.element;
    const container = el.parentElement;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      // Check if window is mostly off-screen
      const visibleX = Math.max(0, Math.min(elRect.right, containerRect.right) - Math.max(elRect.left, containerRect.left));
      const visibleY = Math.max(0, Math.min(elRect.bottom, containerRect.bottom) - Math.max(elRect.top, containerRect.top));

      if (visibleX < 50 || visibleY < 30) {
        // Recenter the window
        el.style.left = '50px';
        el.style.top = '50px';
      }
    }

    this.notifyChange();
  }

  minimize(id) {
    const windowData = this.windows.get(id);
    if (!windowData) return;

    windowData.element.style.display = 'none';
    windowData.isMinimized = true;
    this.notifyChange();
  }

  toggleMinimize(id) {
    const windowData = this.windows.get(id);
    if (!windowData) return;

    if (windowData.isMinimized) {
      this.focus(id);
    } else {
      // Check if this window is currently on top
      const isOnTop = windowData.element.style.zIndex == this.topZIndex;
      if (isOnTop) {
        this.minimize(id);
      } else {
        this.focus(id);
      }
    }
  }

  maximize(id) {
    const windowData = this.windows.get(id);
    if (!windowData) return;

    const element = windowData.element;

    if (windowData.isMaximized) {
      // Restore
      if (windowData.originalPosition) {
        element.style.left = windowData.originalPosition.left;
        element.style.top = windowData.originalPosition.top;
        element.style.width = windowData.originalSize.width;
        element.style.height = windowData.originalSize.height;
      }
      windowData.isMaximized = false;
      element.classList.remove('window-maximized');
    } else {
      // Save current position/size
      const rect = element.getBoundingClientRect();
      windowData.originalPosition = {
        left: element.style.left || rect.left + 'px',
        top: element.style.top || rect.top + 'px'
      };
      windowData.originalSize = {
        width: element.style.width || rect.width + 'px',
        height: element.style.height || rect.height + 'px'
      };

      // Maximize
      element.style.left = '0';
      element.style.top = '0';
      element.style.width = '100%';
      element.style.height = `calc(100vh - 28px)`;
      windowData.isMaximized = true;
      element.classList.add('window-maximized');
    }

    this.notifyChange();
  }

  close(id) {
    const windowData = this.windows.get(id);
    if (!windowData) return;

    windowData.element.remove();
    this.unregister(id);
  }

  isOpen(id) {
    return this.windows.has(id);
  }

  getOpenWindows() {
    const result = [];
    this.windows.forEach((data, id) => {
      result.push({
        id,
        title: data.title,
        icon: data.icon,
        isMinimized: data.isMinimized,
        isActive: data.element.style.zIndex == this.topZIndex && !data.isMinimized
      });
    });
    return result;
  }

  notifyChange() {
    if (this.onWindowChange) {
      this.onWindowChange(this.getOpenWindows());
    }
  }
}

export const windowManager = new WindowManager();
