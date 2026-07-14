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

document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme');
  const fontSelect = document.getElementById('font');
  const fontSizeSlider = document.getElementById('fontSize');
  const fontSizeVal = document.getElementById('fontSizeVal');
  const showLineNumbersCheckbox = document.getElementById('showLineNumbers');

  // 1. Retrieve saved preferences and set initial states
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    themeSelect.value = settings.theme;
    fontSelect.value = settings.font;
    fontSizeSlider.value = settings.fontSize;
    fontSizeVal.textContent = `${settings.fontSize}px`;
    showLineNumbersCheckbox.checked = settings.showLineNumbers;
  });

  // 2. Event listeners to save choices instantly
  themeSelect.addEventListener('change', (e) => {
    chrome.storage.sync.set({ theme: e.target.value });
  });

  fontSelect.addEventListener('change', (e) => {
    chrome.storage.sync.set({ font: e.target.value });
  });

  fontSizeSlider.addEventListener('input', (e) => {
    const size = parseInt(e.target.value, 10);
    fontSizeVal.textContent = `${size}px`;
    chrome.storage.sync.set({ fontSize: size });
  });

  showLineNumbersCheckbox.addEventListener('change', (e) => {
    chrome.storage.sync.set({ showLineNumbers: e.target.checked });
  });
});
