// ==========================================
// Note CodeBlock Visualizer - Popup Script
// ==========================================

const DEFAULT_SETTINGS = {
  theme: 'one-dark',
  font: 'jetbrains-mono',
  fontSize: 14,
  showLineNumbers: true,
  lineHeight: 1.6
};

// Safe API Fallback: Use chrome.storage.local if available, otherwise fallback to localStorage (for local file preview)
const storage = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome.storage.local : {
  get: (defaults, callback) => {
    const data = {};
    for (const key in defaults) {
      const val = localStorage.getItem('note_codeblock_' + key);
      if (val !== null) {
        if (typeof defaults[key] === 'boolean') {
          data[key] = (val === 'true');
        } else if (typeof defaults[key] === 'number') {
          data[key] = parseInt(val, 10);
        } else {
          data[key] = val;
        }
      } else {
        data[key] = defaults[key];
      }
    }
    setTimeout(() => callback(data), 0);
  },
  set: (obj, callback) => {
    for (const key in obj) {
      localStorage.setItem('note_codeblock_' + key, obj[key]);
    }
    if (callback) setTimeout(callback, 0);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme');
  const fontSelect = document.getElementById('font');
  const fontSizeSlider = document.getElementById('fontSize');
  const fontSizeVal = document.getElementById('fontSizeVal');
  const showLineNumbersCheckbox = document.getElementById('showLineNumbers');

  // 1. Retrieve saved preferences and set initial states
  storage.get(DEFAULT_SETTINGS, (settings) => {
    themeSelect.value = settings.theme;
    fontSelect.value = settings.font;
    fontSizeSlider.value = settings.fontSize;
    fontSizeVal.textContent = `${settings.fontSize}px`;
    showLineNumbersCheckbox.checked = settings.showLineNumbers;
  });

  // 2. Event listeners to save choices instantly (Auto-Save)
  themeSelect.addEventListener('change', (e) => {
    storage.set({ theme: e.target.value });
  });

  fontSelect.addEventListener('change', (e) => {
    storage.set({ font: e.target.value });
  });

  fontSizeSlider.addEventListener('input', (e) => {
    const size = parseInt(e.target.value, 10);
    fontSizeVal.textContent = `${size}px`;
    storage.set({ fontSize: size });
  });

  showLineNumbersCheckbox.addEventListener('change', (e) => {
    storage.set({ showLineNumbers: e.target.checked });
  });
});
