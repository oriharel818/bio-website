// Snake Game Window
import { createWindow } from '../components/Window.js';
import { SnakeGame } from '../apps/snake.js';
import { showErrorDialog, errorMessages } from '../utils/humor.js';
import { windowManager } from '../utils/windowManager.js';

export function openSnakeGameWindow() {
  const menuBar = `
    <div class="menu-item">
      <span class="menu-label">Game</span>
      <div class="menu-dropdown">
        <div class="menu-option new-game-btn">New Game</div>
        <div class="menu-option pause-btn">Pause</div>
        <div class="menu-divider"></div>
        <div class="menu-option exit-btn">Exit</div>
      </div>
    </div>
    <div class="menu-item">
      <span class="menu-label">Help</span>
      <div class="menu-dropdown">
        <div class="menu-option help-btn">How to Play</div>
      </div>
    </div>
  `;

  const content = `
    <div class="snake-game-content">
      <div class="snake-header">
        <span class="score-display">Score: <span id="snake-score">0</span></span>
        <span class="high-score-display">High Score: <span id="snake-high-score">0</span></span>
      </div>
      <div class="snake-canvas-container">
        <canvas id="snake-canvas" width="400" height="300"></canvas>
        <button class="snake-action-btn" id="snake-start-btn">Start Game</button>
      </div>
      <div class="snake-instructions">
        Arrow keys to move • Space to start/pause
      </div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'snake-game-window',
    title: 'Snake.exe',
    icon: '🐍',
    width: 450,
    height: 420,
    content,
    menuBar,
    className: 'snake-game-window',
    resizable: false
  });

  if (!windowEl) return null;

  const canvas = windowEl.querySelector('#snake-canvas');
  const scoreDisplay = windowEl.querySelector('#snake-score');
  const highScoreDisplay = windowEl.querySelector('#snake-high-score');
  const actionBtn = windowEl.querySelector('#snake-start-btn');

  const updateActionButton = () => {
    if (game.gameOver) {
      actionBtn.textContent = 'Play Again';
      actionBtn.style.display = 'block';
    } else if (!game.gameLoop) {
      actionBtn.textContent = 'Start Game';
      actionBtn.style.display = 'block';
    } else {
      actionBtn.style.display = 'none';
    }
  };

  const game = new SnakeGame(canvas, {
    onScoreChange: (score, highScore) => {
      scoreDisplay.textContent = score;
      highScoreDisplay.textContent = highScore;
    },
    onGameOver: (score, highScore) => {
      showErrorDialog(errorMessages.snakeDeath, 'Game Over');
      highScoreDisplay.textContent = highScore;
      updateActionButton();
    }
  });

  // Initial draw and high score display
  game.draw();
  highScoreDisplay.textContent = game.highScore;
  updateActionButton();

  // Action button click handler
  actionBtn.addEventListener('click', () => {
    if (game.gameOver) {
      game.restart();
    } else {
      game.start();
    }
    updateActionButton();
  });

  // Keyboard controls
  const handleKeydown = (e) => {
    // Only respond if this window is focused
    if (!windowEl.classList.contains('window-active')) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        game.setDirection('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        game.setDirection('down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        game.setDirection('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        game.setDirection('right');
        break;
      case ' ':
        e.preventDefault();
        if (game.gameOver) {
          game.restart();
        } else if (!game.gameLoop) {
          game.start();
        } else {
          game.togglePause();
        }
        updateActionButton();
        break;
    }
  };

  document.addEventListener('keydown', handleKeydown);

  // Menu handlers
  windowEl.querySelector('.new-game-btn').addEventListener('click', () => {
    game.restart();
  });

  windowEl.querySelector('.pause-btn').addEventListener('click', () => {
    if (game.gameLoop && !game.gameOver) {
      game.togglePause();
    }
  });

  windowEl.querySelector('.exit-btn').addEventListener('click', () => {
    windowManager.close('snake-game-window');
  });

  windowEl.querySelector('.help-btn').addEventListener('click', () => {
    showErrorDialog(
      'Use arrow keys to move the snake. Eat the red apples to grow. Don\'t hit the walls or yourself. Good luck!',
      'How to Play'
    );
  });

  // Cleanup when window closes
  const originalClose = windowEl.querySelector('.close-btn').onclick;
  windowEl.querySelector('.close-btn').addEventListener('click', () => {
    document.removeEventListener('keydown', handleKeydown);
    game.stop();
  });

  return windowEl;
}
