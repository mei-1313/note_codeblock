// ==========================================
// Note CodeBlock Visualizer - Content Script
// ==========================================

const DEFAULT_SETTINGS = {
  theme: 'one-dark',
  font: 'jetbrains-mono',
  fontSize: 14,
  showLineNumbers: true,
  lineHeight: 1.6
};

let currentSettings = { ...DEFAULT_SETTINGS };
const wrapperMap = new WeakMap();

// Observe text changes in the original pre to keep the clone synced
const preContentObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const originalPre = mutation.target.closest('pre');
    if (originalPre && originalPre.classList.contains('note-visual-hidden')) {
      const wrapper = wrapperMap.get(originalPre) || originalPre.nextElementSibling;
      if (wrapper && wrapper.classList.contains('note-code-wrapper')) {
        const clonedPre = wrapper.querySelector('.note-cloned-pre');
        const originalCode = originalPre.querySelector('code');
        const clonedCode = clonedPre ? clonedPre.querySelector('.note-code-block') : null;
        
        if (originalCode && clonedCode) {
          // Sync HTML content
          clonedCode.innerHTML = originalCode.innerHTML;
          
          // Recalculate line numbers if enabled
          const lineNumbers = wrapper.querySelector('.note-code-line-numbers');
          if (lineNumbers) {
            updateLineNumbersDOM(lineNumbers, originalCode.textContent);
          }
        }
      }
    }
  }
});

// Helper to generate line number spans
function updateLineNumbersDOM(container, text) {
  container.innerHTML = '';
  let lines = text.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  const count = Math.max(1, lines.length);
  for (let i = 1; i <= count; i++) {
    const s = document.createElement('span');
    s.textContent = i;
    container.appendChild(s);
  }
}

// Enhance a single pre block
function enhanceCodeBlock(pre) {
  // Guard clause against double enhancement
  if (pre.classList.contains('note-visual-hidden') || pre.classList.contains('note-cloned-pre')) {
    return;
  }
  
  // Guard against editor containers
  if (pre.closest('[contenteditable="true"]') || window.location.pathname.includes('/edit')) {
    return;
  }

  const codeEl = pre.querySelector('code');
  if (!codeEl) return;

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'note-code-wrapper';
  wrapper.setAttribute('data-theme', currentSettings.theme || 'one-dark');
  wrapper.setAttribute('data-font', currentSettings.font || 'jetbrains-mono');
  wrapper.style.setProperty('--font-size', (currentSettings.fontSize || 14) + 'px');
  wrapper.style.setProperty('--line-height', currentSettings.lineHeight || 1.6);

  // Extract language from class (e.g. "hljs java")
  let langName = '';
  const classes = Array.from(codeEl.classList);
  const hljsClass = classes.find(c => c.startsWith('hljs') && c !== 'hljs');
  if (hljsClass) {
    langName = hljsClass.replace('hljs-', '');
  } else {
    const langClass = classes.find(c => c !== 'hljs' && c !== 'code');
    if (langClass) langName = langClass;
  }
  if (!langName) langName = 'code';
  
  // Clean language display names
  const friendlyNames = {
    js: 'JavaScript',
    ts: 'TypeScript',
    py: 'Python',
    cpp: 'C++',
    cs: 'C#',
    java: 'Java',
    html: 'HTML',
    css: 'CSS',
    rs: 'Rust',
    sh: 'Bash',
    bash: 'Bash',
    yml: 'YAML',
    yaml: 'YAML',
    md: 'Markdown',
    sql: 'SQL'
  };
  const displayName = friendlyNames[langName.toLowerCase()] || langName;

  // Create header
  const header = document.createElement('div');
  header.className = 'note-code-header';

  const langBadge = document.createElement('span');
  langBadge.className = 'note-code-lang';
  langBadge.textContent = displayName;
  header.appendChild(langBadge);

  // Create Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'note-code-copy-btn';
  copyBtn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
    <span>Copy</span>
  `;
  
  copyBtn.addEventListener('click', () => {
    // Read text directly from the original code element to ensure we get raw characters
    const text = codeEl.textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.classList.add('copied');
      copyBtn.querySelector('span').textContent = 'Copied!';
      copyBtn.querySelector('svg').innerHTML = `
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      `;
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.querySelector('span').textContent = 'Copy';
        copyBtn.querySelector('svg').innerHTML = `
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        `;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });

  header.appendChild(copyBtn);
  wrapper.appendChild(header);

  // Create Body
  const body = document.createElement('div');
  body.className = 'note-code-body';

  // Create custom pre and code using div elements to insulate from note.com CSS
  const clonedPre = document.createElement('div');
  clonedPre.className = 'note-cloned-pre';

  const clonedCode = document.createElement('div');
  const originalClasses = Array.from(codeEl.classList);
  const classesToKeep = originalClasses.filter(c => c !== 'hljs');
  clonedCode.className = 'note-code-block ' + classesToKeep.join(' ');
  clonedCode.innerHTML = codeEl.innerHTML;
  clonedPre.appendChild(clonedCode);

  // Insert Line Numbers sidebar if configured
  if (currentSettings.showLineNumbers) {
    wrapper.classList.add('with-line-numbers');
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'note-code-line-numbers';
    updateLineNumbersDOM(lineNumbers, codeEl.textContent);
    body.appendChild(lineNumbers);
  }

  body.appendChild(clonedPre);
  wrapper.appendChild(body);

  // Map original pre to the wrapper
  wrapperMap.set(pre, wrapper);

  // Hide the original pre element to prevent rendering clashes
  pre.style.setProperty('display', 'none', 'important');
  pre.classList.add('note-visual-hidden');

  // Insert wrapper right after the hidden original pre
  pre.parentNode.insertBefore(wrapper, pre.nextSibling);

  // Observe the original pre content for future updates
  preContentObserver.observe(pre, {
    childList: true,
    characterData: true,
    subtree: true
  });
}

// Enhance all eligible code blocks on the page
function enhanceAllCodeBlocks() {
  const originalPres = document.querySelectorAll('pre[data-name="preCode"]:not(.note-cloned-pre):not(.note-visual-hidden)');
  originalPres.forEach(pre => {
    enhanceCodeBlock(pre);
  });
  
  // Clean up any dangling wrappers
  document.querySelectorAll('.note-code-wrapper').forEach(wrapper => {
    const prev = wrapper.previousElementSibling;
    if (!prev || !prev.classList.contains('note-visual-hidden')) {
      wrapper.remove();
    }
  });
}

// Update settings and styles of all enhanced code wrappers in real-time
function updateAllWrappers(settings) {
  if (!settings) return;
  currentSettings = { ...DEFAULT_SETTINGS, ...settings };
  
  const wrappers = document.querySelectorAll('.note-code-wrapper');
  wrappers.forEach(wrapper => {
    wrapper.setAttribute('data-theme', currentSettings.theme);
    wrapper.setAttribute('data-font', currentSettings.font);
    wrapper.style.setProperty('--font-size', currentSettings.fontSize + 'px');
    wrapper.style.setProperty('--line-height', currentSettings.lineHeight);

    const lineNumbers = wrapper.querySelector('.note-code-line-numbers');
    if (currentSettings.showLineNumbers) {
      wrapper.classList.add('with-line-numbers');
      if (!lineNumbers) {
        // Create sidebar if missing
        const body = wrapper.querySelector('.note-code-body');
        const clonedPre = wrapper.querySelector('.note-cloned-pre');
        const clonedCode = clonedPre ? clonedPre.querySelector('.note-code-block') : null;
        
        if (clonedCode) {
          const newLineNumbers = document.createElement('div');
          newLineNumbers.className = 'note-code-line-numbers';
          updateLineNumbersDOM(newLineNumbers, clonedCode.textContent);
          body.insertBefore(newLineNumbers, body.firstChild);
        }
      }
    } else {
      wrapper.classList.remove('with-line-numbers');
      if (lineNumbers) {
        lineNumbers.remove();
      }
    }
  });
}

// Main page mutation observer to catch dynamically rendered content
const observer = new MutationObserver((mutations) => {
  let needsScan = false;
  for (const mutation of mutations) {
    // Detect added node changes
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      needsScan = true;
      break;
    }
    
    // Detect if original pre style has been changed/reset by note.com's SPA router
    if (
      mutation.type === 'attributes' &&
      mutation.target.tagName === 'PRE' &&
      mutation.attributeName === 'style'
    ) {
      const pre = mutation.target;
      if (pre.getAttribute('data-name') === 'preCode' && !pre.classList.contains('note-cloned-pre')) {
        if (pre.style.display !== 'none') {
          pre.style.setProperty('display', 'none', 'important');
          pre.classList.add('note-visual-hidden');
        }
      }
    }
  }

  if (needsScan) {
    enhanceAllCodeBlocks();
  }
});

// Safe Chrome Storage API initialization
const init = () => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
      currentSettings = { ...DEFAULT_SETTINGS, ...settings };
      enhanceAllCodeBlocks();

      // Begin observing DOM mutations on the body
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    });

    // Listen for settings modifications from popup
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
          updateAllWrappers(settings);
        });
      }
    });
  } else {
    // Local fallback for static test page environment
    enhanceAllCodeBlocks();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
};

init();
