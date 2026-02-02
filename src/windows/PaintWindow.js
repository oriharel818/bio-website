// MS Paint Clone Window
import { createWindow } from '../components/Window.js';
import { PaintApp } from '../apps/paint.js';
import { showErrorDialog, errorMessages } from '../utils/humor.js';
import { windowManager } from '../utils/windowManager.js';

const colors = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'
];

const tools = [
  { id: 'pencil', icon: '✏️', label: 'Pencil' },
  { id: 'brush', icon: '🖌️', label: 'Brush' },
  { id: 'eraser', icon: '🧽', label: 'Eraser' },
  { id: 'fill', icon: '🪣', label: 'Fill' },
  { id: 'line', icon: '📏', label: 'Line' },
  { id: 'rectangle', icon: '⬜', label: 'Rectangle' },
  { id: 'ellipse', icon: '⭕', label: 'Ellipse' }
];

export function openPaintWindow() {
  const menuBar = `
    <div class="menu-item">
      <span class="menu-label">File</span>
      <div class="menu-dropdown">
        <div class="menu-option new-btn">New</div>
        <div class="menu-option save-btn">Save as PNG</div>
        <div class="menu-divider"></div>
        <div class="menu-option exit-btn">Exit</div>
      </div>
    </div>
    <div class="menu-item">
      <span class="menu-label">Edit</span>
      <div class="menu-dropdown">
        <div class="menu-option undo-btn">Undo</div>
        <div class="menu-option clear-btn">Clear</div>
      </div>
    </div>
    <div class="menu-item">
      <span class="menu-label">Help</span>
      <div class="menu-dropdown">
        <div class="menu-option about-btn">About Paint</div>
      </div>
    </div>
  `;

  const content = `
    <div class="paint-content">
      <div class="paint-toolbar">
        <div class="tool-palette">
          ${tools.map(tool => `
            <button class="tool-btn ${tool.id === 'pencil' ? 'active' : ''}"
                    data-tool="${tool.id}"
                    title="${tool.label}">
              ${tool.icon}
            </button>
          `).join('')}
        </div>
        <div class="brush-size-control">
          <label>Size:</label>
          <input type="range" min="1" max="20" value="2" class="brush-size-slider">
        </div>
      </div>
      <div class="paint-main">
        <div class="color-palette">
          <div class="current-colors">
            <div class="current-color primary" style="background: #000000"></div>
            <div class="current-color secondary" style="background: #ffffff"></div>
          </div>
          <div class="color-grid">
            ${colors.map(color => `
              <div class="color-swatch" data-color="${color}" style="background: ${color}"></div>
            `).join('')}
          </div>
        </div>
        <div class="paint-canvas-container">
          <canvas id="paint-canvas" width="500" height="350"></canvas>
        </div>
      </div>
      <div class="paint-status-bar">
        <span class="status-position">0, 0px</span>
        <span class="status-tool">Pencil</span>
      </div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'paint-window',
    title: 'untitled - Paint',
    icon: '🎨',
    width: 650,
    height: 520,
    content,
    menuBar,
    className: 'paint-window'
  });

  if (!windowEl) return null;

  const canvas = windowEl.querySelector('#paint-canvas');
  const statusPosition = windowEl.querySelector('.status-position');
  const statusTool = windowEl.querySelector('.status-tool');

  const paint = new PaintApp(canvas, {
    onStatusChange: (position, tool) => {
      statusPosition.textContent = position;
      statusTool.textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
    }
  });

  // Tool selection
  let activeTool = windowEl.querySelector('.tool-btn.active');
  windowEl.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (activeTool) activeTool.classList.remove('active');
      btn.classList.add('active');
      activeTool = btn;
      paint.setTool(btn.dataset.tool);
    });
  });

  // Color selection
  let primaryColor = '#000000';
  const primarySwatch = windowEl.querySelector('.current-color.primary');

  windowEl.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      primaryColor = swatch.dataset.color;
      primarySwatch.style.background = primaryColor;
      paint.setColor(primaryColor);
    });
  });

  // Brush size
  windowEl.querySelector('.brush-size-slider').addEventListener('input', (e) => {
    paint.setBrushSize(parseInt(e.target.value, 10));
  });

  // Menu handlers
  windowEl.querySelector('.new-btn').addEventListener('click', () => {
    paint.clear();
    windowEl.querySelector('.title-bar-text').innerHTML = '<span class="window-icon">🎨</span>untitled - Paint';
  });

  windowEl.querySelector('.save-btn').addEventListener('click', () => {
    paint.save();
    showErrorDialog(errorMessages.paintSave, 'Save');
  });

  windowEl.querySelector('.exit-btn').addEventListener('click', () => {
    windowManager.close('paint-window');
  });

  windowEl.querySelector('.undo-btn').addEventListener('click', () => {
    paint.undo();
  });

  windowEl.querySelector('.clear-btn').addEventListener('click', () => {
    paint.clear();
  });

  windowEl.querySelector('.about-btn').addEventListener('click', () => {
    showErrorDialog(
      'Paint v98.0\n\nA faithful recreation of the classic. Now with 100% more nostalgia.',
      'About Paint'
    );
  });

  return windowEl;
}
