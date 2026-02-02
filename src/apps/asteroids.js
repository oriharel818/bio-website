// Classic Asteroids Game
export class AsteroidsGame {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onScoreChange = options.onScoreChange || (() => {});
    this.onGameOver = options.onGameOver || (() => {});
    this.onLivesChange = options.onLivesChange || (() => {});

    this.reset();
    this.loadHighScore();
  }

  reset() {
    this.ship = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      angle: -Math.PI / 2, // Pointing up
      velocityX: 0,
      velocityY: 0,
      radius: 15,
      invincible: true,
      invincibleTimer: 180 // 3 seconds at 60fps
    };

    this.bullets = [];
    this.asteroids = [];
    this.particles = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = false;
    this.gameLoop = null;
    this.keys = {};

    this.spawnAsteroids(4);
  }

  loadHighScore() {
    this.highScore = parseInt(localStorage.getItem('asteroidsHighScore') || '0', 10);
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('asteroidsHighScore', this.highScore.toString());
    }
  }

  spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
      let x, y;
      // Spawn away from ship
      do {
        x = Math.random() * this.canvas.width;
        y = Math.random() * this.canvas.height;
      } while (this.distance(x, y, this.ship.x, this.ship.y) < 150);

      this.asteroids.push(this.createAsteroid(x, y, 'large'));
    }
  }

  createAsteroid(x, y, size) {
    const sizes = {
      large: { radius: 40, speed: 1, points: 20 },
      medium: { radius: 25, speed: 1.5, points: 50 },
      small: { radius: 12, speed: 2, points: 100 }
    };

    const config = sizes[size];
    const angle = Math.random() * Math.PI * 2;
    const speed = config.speed * (0.5 + Math.random());

    // Generate irregular polygon shape
    const vertices = [];
    const numVertices = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numVertices; i++) {
      const vertexAngle = (i / numVertices) * Math.PI * 2;
      const jitter = 0.7 + Math.random() * 0.3;
      vertices.push({
        x: Math.cos(vertexAngle) * config.radius * jitter,
        y: Math.sin(vertexAngle) * config.radius * jitter
      });
    }

    return {
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      radius: config.radius,
      size,
      points: config.points,
      vertices,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  setKey(key, pressed) {
    this.keys[key] = pressed;
  }

  shoot() {
    if (this.gameOver || this.bullets.length >= 5) return;

    const speed = 8;
    this.bullets.push({
      x: this.ship.x + Math.cos(this.ship.angle) * this.ship.radius,
      y: this.ship.y + Math.sin(this.ship.angle) * this.ship.radius,
      velocityX: Math.cos(this.ship.angle) * speed + this.ship.velocityX * 0.5,
      velocityY: Math.sin(this.ship.angle) * speed + this.ship.velocityY * 0.5,
      life: 60 // Frames until bullet disappears
    });
  }

  createExplosion(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 30 + Math.random() * 30
      });
    }
  }

  update() {
    if (this.gameOver || this.isPaused) return;

    // Ship controls
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      this.ship.angle -= 0.08;
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      this.ship.angle += 0.08;
    }
    if (this.keys['ArrowUp'] || this.keys['w']) {
      this.ship.velocityX += Math.cos(this.ship.angle) * 0.15;
      this.ship.velocityY += Math.sin(this.ship.angle) * 0.15;
    }

    // Ship physics
    this.ship.x += this.ship.velocityX;
    this.ship.y += this.ship.velocityY;

    // Friction
    this.ship.velocityX *= 0.99;
    this.ship.velocityY *= 0.99;

    // Max speed
    const maxSpeed = 6;
    const speed = Math.sqrt(this.ship.velocityX ** 2 + this.ship.velocityY ** 2);
    if (speed > maxSpeed) {
      this.ship.velocityX = (this.ship.velocityX / speed) * maxSpeed;
      this.ship.velocityY = (this.ship.velocityY / speed) * maxSpeed;
    }

    // Wrap ship
    this.wrapPosition(this.ship);

    // Update invincibility
    if (this.ship.invincible) {
      this.ship.invincibleTimer--;
      if (this.ship.invincibleTimer <= 0) {
        this.ship.invincible = false;
      }
    }

    // Update bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.x += bullet.velocityX;
      bullet.y += bullet.velocityY;
      bullet.life--;
      this.wrapPosition(bullet);
      return bullet.life > 0;
    });

    // Update asteroids
    this.asteroids.forEach(asteroid => {
      asteroid.x += asteroid.velocityX;
      asteroid.y += asteroid.velocityY;
      asteroid.rotation += asteroid.rotationSpeed;
      this.wrapPosition(asteroid);
    });

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityX *= 0.98;
      particle.velocityY *= 0.98;
      particle.life--;
      return particle.life > 0;
    });

    // Check bullet-asteroid collisions
    this.bullets.forEach((bullet, bulletIndex) => {
      this.asteroids.forEach((asteroid, asteroidIndex) => {
        if (this.distance(bullet.x, bullet.y, asteroid.x, asteroid.y) < asteroid.radius) {
          // Hit!
          this.bullets.splice(bulletIndex, 1);
          this.score += asteroid.points;
          this.onScoreChange(this.score, this.highScore);
          this.createExplosion(asteroid.x, asteroid.y, asteroid.size === 'large' ? 15 : 8);

          // Split asteroid
          if (asteroid.size === 'large') {
            this.asteroids.push(this.createAsteroid(asteroid.x, asteroid.y, 'medium'));
            this.asteroids.push(this.createAsteroid(asteroid.x, asteroid.y, 'medium'));
          } else if (asteroid.size === 'medium') {
            this.asteroids.push(this.createAsteroid(asteroid.x, asteroid.y, 'small'));
            this.asteroids.push(this.createAsteroid(asteroid.x, asteroid.y, 'small'));
          }

          this.asteroids.splice(asteroidIndex, 1);
        }
      });
    });

    // Check ship-asteroid collision
    if (!this.ship.invincible) {
      for (const asteroid of this.asteroids) {
        if (this.distance(this.ship.x, this.ship.y, asteroid.x, asteroid.y) < asteroid.radius + this.ship.radius - 5) {
          this.loseLife();
          break;
        }
      }
    }

    // Check for level complete
    if (this.asteroids.length === 0) {
      this.level++;
      this.spawnAsteroids(3 + this.level);
    }
  }

  wrapPosition(obj) {
    if (obj.x < 0) obj.x = this.canvas.width;
    if (obj.x > this.canvas.width) obj.x = 0;
    if (obj.y < 0) obj.y = this.canvas.height;
    if (obj.y > this.canvas.height) obj.y = 0;
  }

  loseLife() {
    this.lives--;
    this.createExplosion(this.ship.x, this.ship.y, 20);
    this.onLivesChange(this.lives);

    if (this.lives <= 0) {
      this.endGame();
    } else {
      // Respawn ship
      this.ship.x = this.canvas.width / 2;
      this.ship.y = this.canvas.height / 2;
      this.ship.velocityX = 0;
      this.ship.velocityY = 0;
      this.ship.angle = -Math.PI / 2;
      this.ship.invincible = true;
      this.ship.invincibleTimer = 180;
    }
  }

  endGame() {
    this.gameOver = true;
    this.saveHighScore();
    this.stop();
    this.onGameOver(this.score, this.highScore);
  }

  draw() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw particles
    ctx.fillStyle = '#fff';
    this.particles.forEach(particle => {
      const alpha = particle.life / 60;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw asteroids (vector style)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    this.asteroids.forEach(asteroid => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);
      ctx.beginPath();
      ctx.moveTo(asteroid.vertices[0].x, asteroid.vertices[0].y);
      for (let i = 1; i < asteroid.vertices.length; i++) {
        ctx.lineTo(asteroid.vertices[i].x, asteroid.vertices[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    // Draw bullets
    ctx.fillStyle = '#fff';
    this.bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw ship (if alive)
    if (this.lives > 0) {
      // Blinking when invincible
      if (!this.ship.invincible || Math.floor(this.ship.invincibleTimer / 5) % 2 === 0) {
        ctx.save();
        ctx.translate(this.ship.x, this.ship.y);
        ctx.rotate(this.ship.angle);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Ship triangle
        ctx.moveTo(15, 0); // Nose
        ctx.lineTo(-10, -10); // Left wing
        ctx.lineTo(-5, 0); // Back indent
        ctx.lineTo(-10, 10); // Right wing
        ctx.closePath();
        ctx.stroke();

        // Draw thrust flame when accelerating
        if (this.keys['ArrowUp'] || this.keys['w']) {
          ctx.strokeStyle = '#ff6600';
          ctx.beginPath();
          ctx.moveTo(-5, -5);
          ctx.lineTo(-15 - Math.random() * 5, 0);
          ctx.lineTo(-5, 5);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // Draw game over
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px "Pixelated MS Sans Serif", Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);

      ctx.font = '18px "Pixelated MS Sans Serif", Arial';
      ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
      ctx.fillText(`Level: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2 + 35);
      ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 70);
    }

    // Draw pause overlay
    if (this.isPaused && !this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  start() {
    if (this.gameLoop) return;

    this.gameLoop = setInterval(() => {
      this.update();
      this.draw();
    }, 1000 / 60); // 60 FPS
  }

  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  restart() {
    this.stop();
    this.reset();
    this.onScoreChange(0, this.highScore);
    this.onLivesChange(3);
    this.draw();
    this.start();
  }
}
