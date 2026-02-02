// Reading List Window - Tree view style
import { createWindow } from '../components/Window.js';
import { readingList } from '../data/readingList.js';

export function openReadingListWindow() {
  const content = `
    <div class="tree-view-content">
      <div class="tree-view-header">
        <span>📚 Reading List</span>
      </div>
      <div class="tree-view-body">
        <ul class="tree-view" role="tree">
          ${Object.entries(readingList).map(([category, books]) => `
            <li class="tree-category">
              <details open>
                <summary class="tree-category-label">
                  <span class="folder-icon">📂</span>
                  ${category}
                  <span class="book-count">(${books.length})</span>
                </summary>
                <ul class="tree-books">
                  ${books.map(book => `
                    <li class="tree-book">
                      <span class="book-icon">📖</span>
                      <span class="book-title">${book.title}</span>
                      <span class="book-author">- ${book.author}</span>
                    </li>
                  `).join('')}
                </ul>
              </details>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="tree-view-status">
        <span>${Object.values(readingList).flat().length} books total</span>
        <span>Definitely read them all. Definitely.</span>
      </div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'reading-list-window',
    title: 'Reading List',
    icon: '📚',
    width: 500,
    height: 450,
    content,
    className: 'tree-view-window'
  });

  return windowEl;
}
