// Asteroids Game Window
import { createWindow } from '../components/Window.js';
import { AsteroidsGame } from '../apps/asteroids.js';
import { showErrorDialog } from '../utils/humor.js';
import { windowManager } from '../utils/windowManager.js';

export function openAsteroidsGameWindow() {
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
    <div class="asteroids-game-content">
      <div class="asteroids-header">
        <span class="score-display">Score: <span id="asteroids-score">0</span></span>
        <span class="lives-display">Lives: <span id="asteroids-lives">3</span></span>
        <span class="high-score-display">High: <span id="asteroids-high-score">0</span></span>
      </div>
      <div class="asteroids-canvas-container">
        <canvas id="asteroids-canvas" width="500" height="400"></canvas>
        <button class="asteroids-action-btn" id="asteroids-start-btn">Start Game</button>
      </div>
      <div class="asteroids-instructions desktop-only">
        ← → Rotate • ↑ Thrust • SPACE Fire • P Pause
      </div>
      <div class="mobile-controls mobile-only asteroids-controls">
        <div class="mobile-controls-row">
          <button class="mobile-btn thrust-btn" data-key="ArrowUp">▲<br><small>THRUST</small></button>
        </div>
        <div class="mobile-controls-row">
          <button class="mobile-btn" data-key="ArrowLeft">◀</button>
          <button class="mobile-btn fire-btn" data-action="fire">FIRE</button>
          <button class="mobile-btn" data-key="ArrowRight">▶</button>
        </div>
      </div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'asteroids-game-window',
    title: 'Asteroids.exe',
    icon: '🚀',
    width: 550,
    height: 520,
    content,
    menuBar,
    className: 'asteroids-game-window',
    resizable: false
  });

  if (!windowEl) return null;

  const canvas = windowEl.querySelector('#asteroids-canvas');
  const scoreDisplay = windowEl.querySelector('#asteroids-score');
  const livesDisplay = windowEl.querySelector('#asteroids-lives');
  const highScoreDisplay = windowEl.querySelector('#asteroids-high-score');
  const actionBtn = windowEl.querySelector('#asteroids-start-btn');

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

  const game = new AsteroidsGame(canvas, {
    onScoreChange: (score, highScore) => {
      scoreDisplay.textContent = score;
      highScoreDisplay.textContent = highScore;
    },
    onLivesChange: (lives) => {
      livesDisplay.textContent = lives;
    },
    onGameOver: (score, highScore) => {
      showErrorDialog("Your ship has been destroyed. Space is unforgiving.", 'Game Over');
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
    if (!windowEl.classList.contains('window-active')) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'w':
      case 'a':
      case 'd':
        e.preventDefault();
        game.setKey(e.key, true);
        break;
      case ' ':
        e.preventDefault();
        if (game.gameOver) {
          game.restart();
          updateActionButton();
        } else if (!game.gameLoop) {
          game.start();
          updateActionButton();
        } else {
          game.shoot();
        }
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        if (game.gameLoop && !game.gameOver) {
          game.togglePause();
        }
        break;
    }
  };

  const handleKeyup = (e) => {
    if (!windowEl.classList.contains('window-active')) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'w':
      case 'a':
      case 'd':
        e.preventDefault();
        game.setKey(e.key, false);
        break;
    }
  };

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('keyup', handleKeyup);

  // Mobile touch controls
  windowEl.querySelectorAll('.mobile-btn[data-key]').forEach(btn => {
    const key = btn.dataset.key;

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!game.gameLoop && !game.gameOver) {
        game.start();
        updateActionButton();
      }
      game.setKey(key, true);
    });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      game.setKey(key, false);
    });

    btn.addEventListener('touchcancel', (e) => {
      game.setKey(key, false);
    });
  });

  // Fire button
  const fireBtn = windowEl.querySelector('.fire-btn');
  if (fireBtn) {
    fireBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.gameOver) {
        game.restart();
        updateActionButton();
      } else if (!game.gameLoop) {
        game.start();
        updateActionButton();
      } else {
        game.shoot();
      }
    });
  }

  // Menu handlers
  windowEl.querySelector('.new-game-btn').addEventListener('click', () => {
    game.restart();
    updateActionButton();
  });

  windowEl.querySelector('.pause-btn').addEventListener('click', () => {
    if (game.gameLoop && !game.gameOver) {
      game.togglePause();
    }
  });

  windowEl.querySelector('.exit-btn').addEventListener('click', () => {
    windowManager.close('asteroids-game-window');
  });

  windowEl.querySelector('.help-btn').addEventListener('click', () => {
    showErrorDialog(
      'Arrow keys to rotate and thrust. Space bar to fire.\nDestroy all asteroids to advance levels.\nLarge asteroids split into smaller ones.\nDon\'t get hit!',
      'How to Play'
    );
  });

  // Cleanup when window closes
  windowEl.querySelector('.close-btn').addEventListener('click', () => {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keyup', handleKeyup);
    game.stop();
  });

  return windowEl;
}
