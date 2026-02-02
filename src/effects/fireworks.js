// Fireworks & Confetti Effect
let fireworksCanvas = null;
let fireworksCtx = null;
let particles = [];
let confetti = [];
let fireworksAnimationId = null;
let isFireworksActive = false;

const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6eb4', '#a66cff', '#00d4ff'];

class Particle {
  constructor(x, y, color, isExplosion = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.isExplosion = isExplosion;

    if (isExplosion) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.size = Math.random() * 3 + 1;
    } else {
      // Launch particle
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -Math.random() * 8 - 8;
      this.life = 1;
      this.decay = 0;
      this.size = 2;
      this.targetY = Math.random() * 200 + 100;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.isExplosion) {
      this.vy += 0.08; // gravity
      this.life -= this.decay;
      this.vx *= 0.98;
      this.vy *= 0.98;
    } else {
      this.vy += 0.15;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Glow effect
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.life * 0.3;
    ctx.fill();
    ctx.restore();
  }
}

class Confetti {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = Math.random() * -3 - 2;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.width = Math.random() * 8 + 4;
    this.height = Math.random() * 4 + 2;
    this.life = 1;
    this.decay = Math.random() * 0.005 + 0.003;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.12; // gravity
    this.vx *= 0.99;
    this.rotation += this.rotationSpeed;
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

function createFirework(x, y) {
  const color = colors[Math.floor(Math.random() * colors.length)];

  // Create explosion particles
  for (let i = 0; i < 40; i++) {
    particles.push(new Particle(x, y, color, true));
  }

  // Create confetti
  for (let i = 0; i < 20; i++) {
    confetti.push(new Confetti(x, y));
  }
}

function launchFirework(canvasWidth, canvasHeight) {
  const x = Math.random() * canvasWidth * 0.6 + canvasWidth * 0.2;
  const startY = canvasHeight;
  const targetY = Math.random() * canvasHeight * 0.4 + canvasHeight * 0.1;
  const color = colors[Math.floor(Math.random() * colors.length)];

  const particle = new Particle(x, startY, color, false);
  particle.targetY = targetY;
  particles.push(particle);
}

function animateFireworks() {
  if (!isFireworksActive || !fireworksCtx) return;

  fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  // Update and draw particles
  particles = particles.filter(p => {
    p.update();
    p.draw(fireworksCtx);

    // Check if launch particle should explode
    if (!p.isExplosion && p.vy >= 0) {
      createFirework(p.x, p.y);
      return false;
    }

    return p.life > 0;
  });

  // Update and draw confetti
  confetti = confetti.filter(c => {
    c.update();
    c.draw(fireworksCtx);
    return c.life > 0 && c.y < fireworksCanvas.height;
  });

  if (particles.length > 0 || confetti.length > 0) {
    fireworksAnimationId = requestAnimationFrame(animateFireworks);
  } else {
    cleanup();
  }
}

function cleanup() {
  isFireworksActive = false;
  if (fireworksCanvas) {
    fireworksCanvas.remove();
    fireworksCanvas = null;
    fireworksCtx = null;
  }
}

export function triggerFireworks() {
  if (isFireworksActive) return;

  const screen = document.querySelector('.crt-screen');
  if (!screen) return;

  fireworksCanvas = document.createElement('canvas');
  fireworksCanvas.className = 'fireworks-canvas';
  fireworksCanvas.width = screen.clientWidth;
  fireworksCanvas.height = screen.clientHeight;
  screen.appendChild(fireworksCanvas);

  fireworksCtx = fireworksCanvas.getContext('2d');
  isFireworksActive = true;
  particles = [];
  confetti = [];

  // Launch multiple fireworks over 4 seconds
  const launchCount = 8;
  for (let i = 0; i < launchCount; i++) {
    setTimeout(() => {
      if (isFireworksActive) {
        launchFirework(fireworksCanvas.width, fireworksCanvas.height);
      }
    }, i * 500);
  }

  animateFireworks();

  // Stop after 5 seconds
  setTimeout(() => {
    isFireworksActive = false;
  }, 5000);
}
