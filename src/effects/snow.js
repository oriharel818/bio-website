// Snow Effect - Animated snowflakes falling from top of screen
let snowCanvas = null;
let snowCtx = null;
let snowflakes = [];
let snowAnimationId = null;
let isSnowing = false;

class Snowflake {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight, true);
  }

  reset(canvasWidth, canvasHeight, initial = false) {
    this.x = Math.random() * canvasWidth;
    this.y = initial ? Math.random() * canvasHeight : -10;
    this.size = Math.random() * 3 + 1;
    this.speed = Math.random() * 1 + 0.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = Math.random() * 0.02 + 0.01;
    this.opacity = Math.random() * 0.5 + 0.5;
  }

  update(canvasWidth, canvasHeight) {
    this.y += this.speed;
    this.wobble += this.wobbleSpeed;
    this.x += Math.sin(this.wobble) * 0.5;

    if (this.y > canvasHeight) {
      this.reset(canvasWidth, canvasHeight);
    }
    if (this.x > canvasWidth) this.x = 0;
    if (this.x < 0) this.x = canvasWidth;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();

    // Add a subtle glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 230, 255, ${this.opacity * 0.3})`;
    ctx.fill();
  }
}

function createSnowCanvas() {
  const screen = document.querySelector('.crt-screen');
  if (!screen) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'snow-canvas';
  canvas.width = screen.clientWidth;
  canvas.height = screen.clientHeight;
  screen.appendChild(canvas);

  return canvas;
}

function initSnowflakes(count = 80) {
  snowflakes = [];
  for (let i = 0; i < count; i++) {
    snowflakes.push(new Snowflake(snowCanvas.width, snowCanvas.height));
  }
}

function animateSnow() {
  if (!isSnowing || !snowCtx) return;

  snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

  snowflakes.forEach(flake => {
    flake.update(snowCanvas.width, snowCanvas.height);
    flake.draw(snowCtx);
  });

  snowAnimationId = requestAnimationFrame(animateSnow);
}

export function startSnow() {
  if (isSnowing) return;

  snowCanvas = createSnowCanvas();
  if (!snowCanvas) return;

  snowCtx = snowCanvas.getContext('2d');
  isSnowing = true;
  initSnowflakes();
  animateSnow();

  // Handle resize
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  if (!snowCanvas || !isSnowing) return;
  const screen = document.querySelector('.crt-screen');
  if (screen) {
    snowCanvas.width = screen.clientWidth;
    snowCanvas.height = screen.clientHeight;
  }
}

export function stopSnow() {
  if (!isSnowing) return;

  isSnowing = false;
  if (snowAnimationId) {
    cancelAnimationFrame(snowAnimationId);
    snowAnimationId = null;
  }

  if (snowCanvas) {
    snowCanvas.remove();
    snowCanvas = null;
    snowCtx = null;
  }

  snowflakes = [];
  window.removeEventListener('resize', handleResize);
}

export function toggleSnow(enable) {
  if (enable) {
    startSnow();
  } else {
    stopSnow();
  }
}
