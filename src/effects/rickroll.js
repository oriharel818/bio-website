// Rick Roll Effect - Desktop backdrop surprise
let rickrollBackdrop = null;
let rickrollCloseBtn = null;
let isRickrollActive = false;

export function showRickroll() {
  if (isRickrollActive) return;

  const desktop = document.getElementById('desktop');
  const screen = document.querySelector('.crt-screen');
  if (!desktop || !screen) return;

  // Create backdrop container
  rickrollBackdrop = document.createElement('div');
  rickrollBackdrop.className = 'rickroll-backdrop';
  rickrollBackdrop.innerHTML = `
    <video autoplay loop muted playsinline class="rickroll-video">
      <source src="https://media.tenor.com/x8v1oNUOmg4AAAPo/rickroll-roll.mp4" type="video/mp4">
    </video>
    <div class="rickroll-fallback"></div>
  `;

  // Create close button separately (outside desktop for proper z-index)
  rickrollCloseBtn = document.createElement('button');
  rickrollCloseBtn.className = 'rickroll-close';
  rickrollCloseBtn.innerHTML = '&times;';
  rickrollCloseBtn.title = 'Close';

  // Insert backdrop at the beginning of desktop (behind icons)
  desktop.insertBefore(rickrollBackdrop, desktop.firstChild);
  // Insert close button in crt-screen (above everything)
  screen.appendChild(rickrollCloseBtn);

  isRickrollActive = true;

  // Hide the oriOS watermark
  desktop.classList.add('rickrolled');

  // Trigger animation
  requestAnimationFrame(() => {
    rickrollBackdrop.classList.add('active');
    rickrollCloseBtn.classList.add('active');
  });

  // Try to play audio version in an iframe (hidden)
  const audioFrame = document.createElement('iframe');
  audioFrame.className = 'rickroll-audio';
  audioFrame.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=0&loop=1';
  audioFrame.allow = 'autoplay';
  audioFrame.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
  rickrollBackdrop.appendChild(audioFrame);

  // Close button handler
  rickrollCloseBtn.addEventListener('click', hideRickroll);

  // Also close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      hideRickroll();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

export function hideRickroll() {
  if (!isRickrollActive) return;

  const desktop = document.getElementById('desktop');

  if (rickrollBackdrop) {
    rickrollBackdrop.classList.remove('active');
    rickrollBackdrop.classList.add('fade-out');
  }
  if (rickrollCloseBtn) {
    rickrollCloseBtn.classList.remove('active');
    rickrollCloseBtn.classList.add('fade-out');
  }

  setTimeout(() => {
    if (rickrollBackdrop) {
      rickrollBackdrop.remove();
      rickrollBackdrop = null;
    }
    if (rickrollCloseBtn) {
      rickrollCloseBtn.remove();
      rickrollCloseBtn = null;
    }
    if (desktop) {
      desktop.classList.remove('rickrolled');
    }
    isRickrollActive = false;
  }, 500);
}

export function toggleRickroll() {
  if (isRickrollActive) {
    hideRickroll();
  } else {
    showRickroll();
  }
}
