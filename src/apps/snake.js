// Classic Snake Game
export class SnakeGame {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = options.gridSize || 20;
    this.onScoreChange = options.onScoreChange || (() => {});
    this.onGameOver = options.onGameOver || (() => {});

    this.reset();
    this.loadHighScore();
  }

  reset() {
    this.snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = this.spawnFood();
    this.score = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.gameLoop = null;
  }

  loadHighScore() {
    this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
  }

  get cols() {
    return Math.floor(this.canvas.width / this.gridSize);
  }

  get rows() {
    return Math.floor(this.canvas.height / this.gridSize);
  }

  spawnFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows)
      };
    } while (this.snake.some(seg => seg.x === food.x && seg.y === food.y));
    return food;
  }

  setDirection(direction) {
    // Prevent 180-degree turns
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };

    const currentDir = this.getDirectionName(this.direction);
    if (opposites[direction] === currentDir) return;

    switch (direction) {
      case 'up':
        this.nextDirection = { x: 0, y: -1 };
        break;
      case 'down':
        this.nextDirection = { x: 0, y: 1 };
        break;
      case 'left':
        this.nextDirection = { x: -1, y: 0 };
        break;
      case 'right':
        this.nextDirection = { x: 1, y: 0 };
        break;
    }
  }

  getDirectionName(dir) {
    if (dir.x === 1) return 'right';
    if (dir.x === -1) return 'left';
    if (dir.y === 1) return 'down';
    if (dir.y === -1) return 'up';
    return 'right';
  }

  update() {
    if (this.gameOver || this.isPaused) return;

    this.direction = { ...this.nextDirection };

    // Calculate new head position
    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    // Wrap around edges instead of dying
    if (head.x < 0) head.x = this.cols - 1;
    if (head.x >= this.cols) head.x = 0;
    if (head.y < 0) head.y = this.rows - 1;
    if (head.y >= this.rows) head.y = 0;

    // Check self collision
    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      this.endGame();
      return;
    }

    // Add new head
    this.snake.unshift(head);

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.onScoreChange(this.score, this.highScore);
      this.food = this.spawnFood();
    } else {
      // Remove tail if no food eaten
      this.snake.pop();
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
    const size = this.gridSize;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    // Draw food (red apple)
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(
      this.food.x * size + size / 2,
      this.food.y * size + size / 2,
      size / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    this.snake.forEach((segment, index) => {
      // Head is brighter
      ctx.fillStyle = index === 0 ? '#0f0' : '#0a0';
      ctx.fillRect(
        segment.x * size + 1,
        segment.y * size + 1,
        size - 2,
        size - 2
      );
    });

    // Draw game over text
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px "Pixelated MS Sans Serif", Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);

      ctx.font = '16px "Pixelated MS Sans Serif", Arial';
      ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
      ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    // Draw pause overlay
    if (this.isPaused && !this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  start() {
    if (this.gameLoop) return;

    this.gameLoop = setInterval(() => {
      this.update();
      this.draw();
    }, 100); // ~10 FPS for retro feel
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
    this.draw();
    this.start();
    this.onScoreChange(0, this.highScore);
  }
}
