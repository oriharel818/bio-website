// MS Paint Clone
export class PaintApp {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onStatusChange = options.onStatusChange || (() => {});

    // State
    this.currentTool = 'pencil';
    this.currentColor = '#000000';
    this.brushSize = 2;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    // For undo
    this.history = [];
    this.maxHistory = 20;

    // For shapes
    this.shapeStart = null;
    this.tempCanvas = null;

    this.init();
  }

  init() {
    // Fill with white background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();

    // Set up mouse event listeners
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Set up touch event listeners
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY)
    };
  }

  getTouchPos(e) {
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: Math.floor((touch.clientX - rect.left) * scaleX),
      y: Math.floor((touch.clientY - rect.top) * scaleY)
    };
  }

  handleTouchStart(e) {
    e.preventDefault();
    const pos = this.getTouchPos(e);
    this.isDrawing = true;
    this.lastX = pos.x;
    this.lastY = pos.y;

    if (['rectangle', 'ellipse', 'line'].includes(this.currentTool)) {
      this.shapeStart = { x: pos.x, y: pos.y };
      this.tempCanvas = document.createElement('canvas');
      this.tempCanvas.width = this.canvas.width;
      this.tempCanvas.height = this.canvas.height;
      this.tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
    } else if (this.currentTool === 'fill') {
      this.floodFill(pos.x, pos.y, this.currentColor);
      this.saveState();
    } else if (this.currentTool === 'pencil' || this.currentTool === 'brush' || this.currentTool === 'eraser') {
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, this.getToolSize() / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = this.currentTool === 'eraser' ? '#ffffff' : this.currentColor;
      this.ctx.fill();
    }

    this.updateStatus(pos);
  }

  handleTouchMove(e) {
    e.preventDefault();
    const pos = this.getTouchPos(e);
    this.updateStatus(pos);

    if (!this.isDrawing) return;

    if (['rectangle', 'ellipse', 'line'].includes(this.currentTool)) {
      this.ctx.drawImage(this.tempCanvas, 0, 0);
      this.drawShape(this.shapeStart.x, this.shapeStart.y, pos.x, pos.y, true);
    } else if (this.currentTool === 'pencil' || this.currentTool === 'brush' || this.currentTool === 'eraser') {
      this.drawLine(this.lastX, this.lastY, pos.x, pos.y);
      this.lastX = pos.x;
      this.lastY = pos.y;
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (['rectangle', 'ellipse', 'line'].includes(this.currentTool) && this.shapeStart) {
      const pos = this.getTouchPos(e);
      this.ctx.drawImage(this.tempCanvas, 0, 0);
      this.drawShape(this.shapeStart.x, this.shapeStart.y, pos.x, pos.y, false);
      this.shapeStart = null;
      this.tempCanvas = null;
    }

    this.saveState();
  }

  handleMouseDown(e) {
    const pos = this.getMousePos(e);
    this.isDrawing = true;
    this.lastX = pos.x;
    this.lastY = pos.y;

    if (['rectangle', 'ellipse', 'line'].includes(this.currentTool)) {
      this.shapeStart = { x: pos.x, y: pos.y };
      // Create temp canvas for preview
      this.tempCanvas = document.createElement('canvas');
      this.tempCanvas.width = this.canvas.width;
      this.tempCanvas.height = this.canvas.height;
      this.tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
    } else if (this.currentTool === 'fill') {
      this.floodFill(pos.x, pos.y, this.currentColor);
      this.saveState();
    } else if (this.currentTool === 'pencil' || this.currentTool === 'brush' || this.currentTool === 'eraser') {
      // Start drawing a dot
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, this.getToolSize() / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = this.currentTool === 'eraser' ? '#ffffff' : this.currentColor;
      this.ctx.fill();
    }

    this.updateStatus(pos);
  }

  handleMouseMove(e) {
    const pos = this.getMousePos(e);
    this.updateStatus(pos);

    if (!this.isDrawing) return;

    if (['rectangle', 'ellipse', 'line'].includes(this.currentTool)) {
      // Restore from temp canvas and draw preview
      this.ctx.drawImage(this.tempCanvas, 0, 0);
      this.drawShape(this.shapeStart.x, this.shapeStart.y, pos.x, pos.y, true);
    } else if (this.currentTool === 'pencil' || this.currentTool === 'brush' || this.currentTool === 'eraser') {
      this.drawLine(this.lastX, this.lastY, pos.x, pos.y);
      this.lastX = pos.x;
      this.lastY = pos.y;
    }
  }

  handleMouseUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (['rectangle', 'ellipse', 'line'].includes(this.currentTool) && this.shapeStart) {
      const pos = this.getMousePos(e);
      this.ctx.drawImage(this.tempCanvas, 0, 0);
      this.drawShape(this.shapeStart.x, this.shapeStart.y, pos.x, pos.y, false);
      this.shapeStart = null;
      this.tempCanvas = null;
    }

    this.saveState();
  }

  getToolSize() {
    if (this.currentTool === 'brush') {
      return this.brushSize * 3;
    }
    return this.brushSize;
  }

  drawLine(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = this.currentTool === 'eraser' ? '#ffffff' : this.currentColor;
    this.ctx.lineWidth = this.getToolSize();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
  }

  drawShape(x1, y1, x2, y2, preview) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.brushSize;

    switch (this.currentTool) {
      case 'rectangle':
        this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        break;
      case 'ellipse':
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        break;
      case 'line':
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        break;
    }
  }

  floodFill(startX, startY, fillColor) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Convert hex color to RGB
    const fillRGB = this.hexToRgb(fillColor);

    // Get the color at the starting position
    const startIdx = (startY * width + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];

    // Don't fill if already the same color
    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b) {
      return;
    }

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const idx = (y * width + x) * 4;
      if (data[idx] !== startR || data[idx + 1] !== startG || data[idx + 2] !== startB) {
        continue;
      }

      // Fill the pixel
      data[idx] = fillRGB.r;
      data[idx + 1] = fillRGB.g;
      data[idx + 2] = fillRGB.b;
      data[idx + 3] = 255;

      // Add neighbors
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  saveState() {
    if (this.history.length >= this.maxHistory) {
      this.history.shift();
    }
    this.history.push(this.canvas.toDataURL());
  }

  undo() {
    if (this.history.length <= 1) return;

    this.history.pop(); // Remove current state
    const previousState = this.history[this.history.length - 1];

    const img = new Image();
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = previousState;
  }

  clear() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  setTool(tool) {
    this.currentTool = tool;
    this.updateCursor();
  }

  setColor(color) {
    this.currentColor = color;
  }

  setBrushSize(size) {
    this.brushSize = size;
  }

  updateCursor() {
    switch (this.currentTool) {
      case 'pencil':
      case 'brush':
        this.canvas.style.cursor = 'crosshair';
        break;
      case 'eraser':
        this.canvas.style.cursor = 'cell';
        break;
      case 'fill':
        this.canvas.style.cursor = 'cell';
        break;
      default:
        this.canvas.style.cursor = 'crosshair';
    }
  }

  updateStatus(pos) {
    this.onStatusChange(`${pos.x}, ${pos.y}px`, this.currentTool);
  }

  save() {
    const link = document.createElement('a');
    link.download = 'masterpiece.png';
    link.href = this.canvas.toDataURL();
    link.click();
  }
}
