// Bio Window - Notepad style
import { createWindow } from '../components/Window.js';
import { showErrorDialog, errorMessages } from '../utils/humor.js';
import { openTimelineWindow } from './TimelineWindow.js';

let hasBeenReadLongEnough = false;
let hasUnsavedChanges = false;

const bioHTML = `<p>I'm Ori.</p>
<p>I spent a decade filming real estate for the people you've seen on TV. Selling Sunset, Million Dollar Listing, Ryan Serhant, The Oppenheim Group. We shot "The One" when it was listed at $500M. Over the years, we covered more than $50B in property value.</p>
<p>That work led to institutional clients. Blackstone, Fortress, Disney, Netflix. Corporate films, investor content, portfolio marketing.</p>
<p>Somewhere along the way, I realized the model was broken. The videos worked, but they required crews, editors, and timelines that didn't scale. Great for a $50M listing. Doesn't work for the agent grinding out 30 deals a year or the operator managing thousands of units.</p>
<p>So I started building.</p>
<p><a href="#" class="company-link" data-company="reele">Reel-E.ai</a> is the result. We own our inference stack and built the whole thing from scratch. No wrappers. It does what my team used to do, but instantly and at a fraction of the cost.</p>
<p>We started with residential agents. Now we're expanding into multifamily, senior living, and institutional operators.</p>
<p class="bio-hint">P.S. If you're the curious type, poke around. This site holds a few secrets.</p>`;

const bioText = bioHTML.replace(/<[^>]+>/g, '').replace(/\n\n/g, '\n');

const newFileMessages = [
  'Starting fresh? Bold move. The previous bio was pretty good though.',
  'New document created.\n\nIt\'s blank. Like your expression when you realized this doesn\'t actually save.',
  'Tabula rasa.\n\nA clean slate. A fresh start. A file that will never exist.',
  'New file: untitled.txt\n\nSpoiler: It will remain untitled forever.'
];

const openFileMessages = [
  'ACCESS DENIED\n\nYou can only read about_me.txt. Nice try though.',
  'File not found: your_bio.txt\n\nBecause this is MY website.',
  'Error: Cannot open files from the 90s.\n\nWait, this whole site is from the 90s.',
  'Open what? Your heart? Your mind?\n\nSorry, this Notepad only does .txt files.'
];

const saveMessages = [
  'Error: Cannot save to server.\n\nYour brilliant edits will be lost forever. This is probably for the best.',
  'Saving... Saving... Just kidding.\n\nThis is a static website. Nothing is being saved.',
  '💾 Save failed.\n\nThe floppy disk is full. (There is no floppy disk.)',
  'Error 418: I\'m a teapot.\n\nAnd teapots can\'t save files.',
  'Your changes are very important to us.\n\nPlease hold while we pretend to save them.'
];

const saveAsMessages = [
  'Nice try. The cloud doesn\'t want your fanfiction version of my bio.',
  'Save As: definitely_not_ori.txt?\n\nDenied. Identity theft is not a joke.',
  'Where would you like to save?\n\n☐ Desktop\n☐ Documents\n☑ The void',
  'Saving to: /dev/null\n\nYour changes have been safely discarded.'
];

const copyMessages = [
  'Clipboard access denied.\n\nWhat were you planning to paste? Your own bio? Bold.',
  'Copied to clipboard!\n\n...of a computer that doesn\'t exist.',
  'Nice try. My bio is not open source.',
  'Ctrl+C noted.\n\nCtrl+V will be ignored.'
];

const fontMessages = [
  'Comic Sans MS has been selected.\n\nJust kidding. I would never do that to you.',
  'Wingdings activated.\n\n✌︎⚐︎◆︎ ♍︎♋︎■︎\'⧫︎ ❒︎♏︎♋︎♎︎ ⧫︎♒︎♓︎⬧︎',
  'Papyrus? Really?\n\nThis isn\'t a spa menu.',
  'Font changed to: Times New Roman\n\nBecause we\'re professionals here. (Not really.)',
  'Selecting fonts...\n\nAll fonts have been replaced with Impact. Sorry.'
];

const helpMessages = [
  'Help Topics:\n\n1. Why can\'t I save? → It\'s a website.\n2. Is this the real Notepad? → No.\n3. Can I delete the bio? → You can try.\n4. Will my changes persist? → Absolutely not.',
  'FAQ:\n\nQ: Is this legal?\nA: Probably.\n\nQ: Why?\nA: Nostalgia.\n\nQ: Can I hire Ori?\nA: Now we\'re talking.',
  'Did you try turning it off and on again?\n\nThat won\'t help here, but it\'s good life advice.',
  'Help is not available.\n\nYou\'re on your own, just like in real life.'
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function handleMenuAction(action, textareaEl) {
  switch (action) {
    case 'new':
      if (textareaEl) {
        textareaEl.innerHTML = '<p>Start typing...</p>';
        hasUnsavedChanges = true;
      }
      showErrorDialog(randomFrom(newFileMessages), 'New');
      break;
    case 'open':
      showErrorDialog(randomFrom(openFileMessages), 'Open');
      break;
    case 'save':
      showErrorDialog(randomFrom(saveMessages), 'Save');
      break;
    case 'saveas':
      showErrorDialog(randomFrom(saveAsMessages), 'Save As');
      break;
    case 'exit':
      const closeBtn = document.querySelector('#bio-window .title-bar-controls button[aria-label="Close"]');
      if (closeBtn) closeBtn.click();
      break;
    case 'undo':
      if (textareaEl) {
        textareaEl.innerHTML = bioHTML;
        hasUnsavedChanges = false;
        showErrorDialog('Bio restored.\n\nYour creative writing has been erased. The original was better anyway.', 'Undo');
      }
      break;
    case 'cut':
    case 'copy':
    case 'paste':
      showErrorDialog(randomFrom(copyMessages), 'Edit');
      break;
    case 'selectall':
      if (textareaEl) {
        const range = document.createRange();
        range.selectNodeContents(textareaEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      break;
    case 'wordwrap':
      if (textareaEl) {
        const isWrapped = textareaEl.style.whiteSpace !== 'nowrap';
        textareaEl.style.whiteSpace = isWrapped ? 'nowrap' : 'normal';
        showErrorDialog(isWrapped ? 'Word wrap disabled.\n\nEnjoy your horizontal scrolling.' : 'Word wrap enabled.\n\nLike a civilized person.', 'Word Wrap');
      }
      break;
    case 'font':
      showErrorDialog(randomFrom(fontMessages), 'Font');
      break;
    case 'about':
      showErrorDialog('Definitely Not Microsoft Notepad™\n\nVersion 98.0.1\n\n© 2026 Ori Harel\nAll rights reserved. No rights reserved. Who knows.\n\nBuilt with mass amounts of caffeine, mass amounts of AI, and mass amounts of mass.', 'About Notepad');
      break;
    case 'help':
      showErrorDialog(randomFrom(helpMessages), 'Help');
      break;
  }
}

export function openBioWindow() {
  hasUnsavedChanges = false;

  const content = `
    <div class="notepad-menu-bar">
      <div class="notepad-menu-item" data-menu="file">
        <span class="menu-label">File</span>
        <div class="notepad-dropdown">
          <div class="dropdown-item" data-action="new"><u>N</u>ew</div>
          <div class="dropdown-item" data-action="open"><u>O</u>pen...</div>
          <div class="dropdown-item" data-action="save"><u>S</u>ave</div>
          <div class="dropdown-item" data-action="saveas">Save <u>A</u>s...</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" data-action="exit">E<u>x</u>it</div>
        </div>
      </div>
      <div class="notepad-menu-item" data-menu="edit">
        <span class="menu-label">Edit</span>
        <div class="notepad-dropdown">
          <div class="dropdown-item" data-action="undo"><u>U</u>ndo</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" data-action="cut">Cu<u>t</u></div>
          <div class="dropdown-item" data-action="copy"><u>C</u>opy</div>
          <div class="dropdown-item" data-action="paste"><u>P</u>aste</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" data-action="selectall">Select <u>A</u>ll</div>
        </div>
      </div>
      <div class="notepad-menu-item" data-menu="format">
        <span class="menu-label">Format</span>
        <div class="notepad-dropdown">
          <div class="dropdown-item" data-action="wordwrap"><u>W</u>ord Wrap</div>
          <div class="dropdown-item" data-action="font"><u>F</u>ont...</div>
        </div>
      </div>
      <div class="notepad-menu-item" data-menu="help">
        <span class="menu-label">Help</span>
        <div class="notepad-dropdown">
          <div class="dropdown-item" data-action="help"><u>H</u>elp Topics</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" data-action="about"><u>A</u>bout Notepad</div>
        </div>
      </div>
    </div>
    <div class="notepad-editor-container">
      <div class="bio-header">
        <div class="bio-headshot">
          <img src="/assets/images/headshot.jpg" alt="Ori" class="headshot-image">
        </div>
        <div class="bio-intro">
          <h2>Who is Ori Harel?</h2>
        </div>
      </div>
      <div class="notepad-textarea" id="bio-textarea" contenteditable="true" spellcheck="false">${bioHTML}</div>
    </div>
  `;

  const windowEl = createWindow({
    id: 'bio-window',
    title: 'About_Me.txt - Notepad',
    icon: '📄',
    width: 650,
    height: 550,
    content,
    className: 'notepad-window',
    onClose: () => {
      if (!hasBeenReadLongEnough) {
        showErrorDialog(errorMessages.bioCloseTooFast);
        return false;
      }
      if (hasUnsavedChanges) {
        showErrorDialog('You have unsaved changes!\n\n...which will be lost forever because this is a website and I can\'t actually save anything. Goodbye!', 'Notepad');
      }
      return true;
    }
  });

  // Set up menu interactions
  const menuBar = windowEl.querySelector('.notepad-menu-bar');
  const textarea = windowEl.querySelector('#bio-textarea');

  // Track changes
  textarea.addEventListener('input', () => {
    hasUnsavedChanges = true;
    // Update window title to show unsaved
    const titleText = windowEl.querySelector('.title-bar-text');
    if (titleText && !titleText.textContent.includes('*')) {
      titleText.innerHTML = titleText.innerHTML.replace('About_Me.txt', '*About_Me.txt');
    }
  });

  // Menu click handling
  menuBar.addEventListener('click', (e) => {
    const menuItem = e.target.closest('.notepad-menu-item');
    const dropdownItem = e.target.closest('.dropdown-item');

    if (dropdownItem) {
      const action = dropdownItem.dataset.action;
      handleMenuAction(action, textarea);
      // Close all dropdowns
      menuBar.querySelectorAll('.notepad-menu-item').forEach(m => m.classList.remove('active'));
    } else if (menuItem) {
      // Toggle this menu, close others
      const wasActive = menuItem.classList.contains('active');
      menuBar.querySelectorAll('.notepad-menu-item').forEach(m => m.classList.remove('active'));
      if (!wasActive) {
        menuItem.classList.add('active');
      }
    }
  });

  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notepad-menu-bar')) {
      menuBar.querySelectorAll('.notepad-menu-item').forEach(m => m.classList.remove('active'));
    }
  });

  // Hover to switch menus when one is open
  menuBar.querySelectorAll('.notepad-menu-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      const anyActive = menuBar.querySelector('.notepad-menu-item.active');
      if (anyActive && anyActive !== item) {
        anyActive.classList.remove('active');
        item.classList.add('active');
      }
    });
  });

  // Company link click handling
  textarea.addEventListener('click', (e) => {
    const link = e.target.closest('.company-link');
    if (link) {
      e.preventDefault();
      const companyId = link.dataset.company;
      openTimelineWindow(companyId);
    }
  });

  // After 5 seconds, allow closing
  setTimeout(() => {
    hasBeenReadLongEnough = true;
  }, 5000);

  return windowEl;
}
