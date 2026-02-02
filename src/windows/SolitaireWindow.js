// Solitaire Game Window
import { createWindow } from '../components/Window.js';
import { SolitaireGame } from '../apps/solitaire.js';
import { showErrorDialog } from '../utils/humor.js';
import { windowManager } from '../utils/windowManager.js';

export function openSolitaireWindow() {
  const menuBar = `
    <div class="menu-item">
      <span class="menu-label">Game</span>
      <div class="menu-dropdown">
        <div class="menu-option new-game-btn">New Game</div>
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
    <div class="solitaire-content">
      <div class="solitaire-header">
        <span class="moves-display">Moves: <span id="solitaire-moves">0</span></span>
      </div>
      <div class="solitaire-canvas-container">
        <canvas id="solitaire-canvas" width="560" height="450"></canvas>
      </div>
      <div class="solitaire-instructions">
        Drag cards • Double-click to auto-move to foundation • Click stock to draw
      </div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'solitaire-window',
    title: 'Solitaire',
    icon: '🃏',
    width: 600,
    height: 550,
    content,
    menuBar,
    className: 'solitaire-window',
    resizable: false
  });

  if (!windowEl) return null;

  const canvas = windowEl.querySelector('#solitaire-canvas');
  const movesDisplay = windowEl.querySelector('#solitaire-moves');

  const game = new SolitaireGame(canvas, {
    onMoveChange: (moves) => {
      movesDisplay.textContent = moves;
    },
    onWin: (moves) => {
      showErrorDialog(`Congratulations! You won in ${moves} moves. Now get back to work.`, 'You Win!');
    }
  });

  // Menu handlers
  windowEl.querySelector('.new-game-btn').addEventListener('click', () => {
    game.restart();
  });

  windowEl.querySelector('.exit-btn').addEventListener('click', () => {
    windowManager.close('solitaire-window');
  });

  windowEl.querySelector('.help-btn').addEventListener('click', () => {
    showErrorDialog(
      'Build four foundation piles from Ace to King by suit.\n\nTableau: Stack cards in descending order, alternating colors.\n\nClick the stock pile to draw cards.\nDouble-click to auto-move to foundation.',
      'How to Play'
    );
  });

  return windowEl;
}
