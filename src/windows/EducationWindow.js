// Education Window - The street taught me
import { createWindow } from '../components/Window.js';

export function openEducationWindow() {
  const content = `
    <div class="education-content">
      <div class="education-image">
        <svg viewBox="0 0 400 250" class="road-svg">
          <!-- Sky gradient with sunset -->
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#1a0a2e"/>
              <stop offset="30%" style="stop-color:#4a1942"/>
              <stop offset="50%" style="stop-color:#ff6b35"/>
              <stop offset="70%" style="stop-color:#f7931e"/>
              <stop offset="100%" style="stop-color:#ffcc00"/>
            </linearGradient>
            <radialGradient id="sunGrad" cx="50%" cy="85%" r="30%">
              <stop offset="0%" style="stop-color:#fff;stop-opacity:1"/>
              <stop offset="30%" style="stop-color:#ffcc00;stop-opacity:0.8"/>
              <stop offset="100%" style="stop-color:#ff6b35;stop-opacity:0"/>
            </radialGradient>
          </defs>

          <!-- Sky -->
          <rect x="0" y="0" width="400" height="170" fill="url(#skyGrad)"/>

          <!-- Sun -->
          <circle cx="200" cy="145" r="35" fill="url(#sunGrad)"/>

          <!-- Ground/Desert -->
          <rect x="0" y="145" width="400" height="105" fill="#2d1f0f"/>

          <!-- Road - perspective trapezoid -->
          <polygon points="185,145 215,145 350,250 50,250" fill="#333"/>

          <!-- Road shoulder lines -->
          <polygon points="185,145 188,145 80,250 50,250" fill="#fff" opacity="0.3"/>
          <polygon points="212,145 215,145 350,250 320,250" fill="#fff" opacity="0.3"/>

          <!-- Center dashed lines - getting smaller toward horizon -->
          <rect x="198" y="240" width="4" height="10" fill="#f7931e"/>
          <rect x="199" y="220" width="3" height="12" fill="#f7931e"/>
          <rect x="199" y="198" width="2.5" height="14" fill="#f7931e"/>
          <rect x="199.5" y="178" width="2" height="12" fill="#f7931e"/>
          <rect x="199.5" y="162" width="1.5" height="10" fill="#f7931e"/>
          <rect x="199.7" y="150" width="1" height="8" fill="#f7931e"/>

          <!-- Distant mountains/hills silhouette -->
          <polygon points="0,145 50,130 100,142 150,125 200,140 250,128 300,138 350,122 400,140 400,145" fill="#1a0a0f" opacity="0.6"/>
        </svg>
      </div>
      <div class="education-quote">
        <p class="quote-text">"The streets taught me"</p>
        <p class="quote-author">- Albert Einstein</p>
      </div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'education-window',
    title: 'My Education',
    icon: '🎓',
    width: 450,
    height: 380,
    content,
    className: 'education-window'
  });

  return windowEl;
}
