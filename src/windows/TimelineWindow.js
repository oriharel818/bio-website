// Timeline Window - Explorer style with detail view
import { createWindow } from '../components/Window.js';
import { ventures } from '../data/ventures.js';

export function openTimelineWindow(preSelectId = null) {
  const content = `
    <div class="explorer-content ventures-explorer">
      <div class="explorer-toolbar">
        <span class="toolbar-text">My Ventures</span>
      </div>
      <div class="explorer-address-bar">
        <span class="address-label">Address:</span>
        <div class="address-input">C:\\Users\\Ori\\My Ventures</div>
      </div>
      <div class="ventures-split-view">
        <div class="ventures-list">
          <table class="ventures-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${ventures.map(v => `
                <tr class="venture-row ${v.current ? 'current' : ''} badge-${v.badge}" data-id="${v.id}" data-url="${v.url || ''}">
                  <td>${v.name}</td>
                  <td>${v.year}</td>
                  <td><span class="venture-badge badge-${v.badge}">${v.badgeText}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="venture-details" id="venture-details">
          <div class="details-placeholder">
            <p>👆 Click a venture to see what happened</p>
          </div>
        </div>
      </div>
      <div class="explorer-status-bar">
        <span>${ventures.length} ventures</span>
        <span>2 💀 | 1 🤷 | 2 👍 | 1 🔥</span>
      </div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'timeline-window',
    title: 'My Ventures',
    icon: '📁',
    width: 750,
    height: 450,
    content,
    className: 'explorer-window'
  });

  // Handle row clicks - show details
  if (windowEl) {
    const detailsPanel = windowEl.querySelector('#venture-details');

    const showVentureDetails = (row) => {
      // Select row
      windowEl.querySelectorAll('.venture-row').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');

      // Find venture data
      const venture = ventures.find(v => v.id === row.dataset.id);
      if (venture) {
        detailsPanel.innerHTML = `
          <div class="details-content">
            <div class="details-header">
              <h3>${venture.name}</h3>
              <span class="venture-badge badge-${venture.badge}">${venture.badgeText}</span>
            </div>
            <div class="details-year">${venture.year}</div>
            <div class="details-body">
              ${venture.details.split('\n\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            ${venture.url ? `<a href="${venture.url}" target="_blank" class="details-link">🔗 Visit Site</a>` : ''}
          </div>
        `;
      }
    };

    windowEl.querySelectorAll('.venture-row').forEach(row => {
      row.addEventListener('click', () => showVentureDetails(row));
    });

    // Pre-select a venture if specified
    if (preSelectId) {
      const rowToSelect = windowEl.querySelector(`.venture-row[data-id="${preSelectId}"]`);
      if (rowToSelect) {
        showVentureDetails(rowToSelect);
        rowToSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  return windowEl;
}
