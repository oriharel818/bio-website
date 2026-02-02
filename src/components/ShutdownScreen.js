// oriOS Shutdown Screen
import { errorMessages } from '../utils/humor.js';

export function showShutdownScreen() {
  const shutdownScreen = document.getElementById('shutdown-screen');

  // Randomly choose between the two messages
  const message = Math.random() > 0.5
    ? errorMessages.shutdownMessage
    : errorMessages.shutdownAlt;

  shutdownScreen.innerHTML = `
    <div class="shutdown-container">
      <div class="shutdown-box">
        <div class="shutdown-logo">
          <div class="ori-flag small">
            <div class="flag-square red"></div>
            <div class="flag-square green"></div>
            <div class="flag-square blue"></div>
            <div class="flag-square yellow"></div>
          </div>
        </div>
        <div class="shutdown-text">
          <p class="shutdown-safe">${message}</p>
        </div>
        <button class="shutdown-restart" onclick="location.reload()">
          Restart oriOS
        </button>
      </div>
    </div>
  `;

  shutdownScreen.classList.add('active');

  // Hide other elements
  document.getElementById('desktop').style.display = 'none';
  document.getElementById('windows-container').style.display = 'none';
  document.getElementById('taskbar').style.display = 'none';
}
