// Recycle Bin Window - Easter egg with dry humor
import { createWindow } from '../components/Window.js';
import { recycleBinItems } from '../data/recycleBin.js';
import { showErrorDialog, showConfirmDialog, errorMessages } from '../utils/humor.js';

export function openRecycleBinWindow() {
  const content = `
    <div class="recycle-bin-content">
      <div class="explorer-toolbar">
        <button class="toolbar-btn empty-btn">🗑️ Empty Recycle Bin</button>
        <button class="toolbar-btn restore-btn">♻️ Restore</button>
      </div>
      <div class="recycle-bin-list">
        <table class="recycle-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date Deleted</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            ${recycleBinItems.map((item, index) => `
              <tr class="recycle-item" data-index="${index}">
                <td>
                  <span class="recycle-icon">${item.icon}</span>
                  ${item.name}
                </td>
                <td>${item.date}</td>
                <td>${item.size}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="explorer-status-bar">
        <span>${recycleBinItems.length} items</span>
        <span>Total size: Immeasurable regret</span>
      </div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'recycle-bin-window',
    title: 'Recycle Bin',
    icon: '🗑️',
    width: 550,
    height: 350,
    content,
    className: 'explorer-window recycle-bin-window'
  });

  if (windowEl) {
    let selectedItem = null;

    // Handle row selection
    windowEl.querySelectorAll('.recycle-item').forEach(row => {
      row.addEventListener('click', () => {
        if (selectedItem) {
          selectedItem.classList.remove('selected');
        }
        row.classList.add('selected');
        selectedItem = row;
      });

      // Right-click context menu simulation
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (selectedItem) {
          selectedItem.classList.remove('selected');
        }
        row.classList.add('selected');
        selectedItem = row;
        showErrorDialog(errorMessages.recycleBinRestore, 'Restore Failed');
      });
    });

    // Restore button
    windowEl.querySelector('.restore-btn').addEventListener('click', () => {
      if (selectedItem) {
        showErrorDialog(errorMessages.recycleBinRestore, 'Restore Failed');
      } else {
        showErrorDialog('No item selected. Select something to not restore.', 'Restore');
      }
    });

    // Empty Recycle Bin button
    windowEl.querySelector('.empty-btn').addEventListener('click', async () => {
      const confirmed = await showConfirmDialog(errorMessages.recycleBinEmpty, 'Confirm Delete');
      if (confirmed) {
        showErrorDialog('Just kidding. These regrets are permanent.', 'Empty Recycle Bin');
      }
    });
  }

  return windowEl;
}
