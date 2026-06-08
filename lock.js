// =============================================================
// Passcode lock for dashboard homepage.
// Default PIN: 1234. Change via Supabase: set app_state.data.pin
// =============================================================
(function () {
  'use strict';

  // Hide everything immediately
  document.documentElement.style.visibility = 'hidden';

  function getStoredPin() {
    try {
      const s = JSON.parse(localStorage.getItem('app_state'));
      if (s && typeof s.pin === 'string') return s.pin;
    } catch (e) {}
    return localStorage.getItem('pin') || '1234';
  }

  function showLock() {
    const wrap = document.createElement('div');
    wrap.id = 'lock-screen';
    wrap.style.cssText = `
      position: fixed; inset: 0; z-index: 1000;
      background: #050506;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
    `;

    const title = document.createElement('div');
    title.textContent = '🔒';
    title.style.cssText = 'font-size: 48px; margin-bottom: 24px;';
    wrap.appendChild(title);

    const input = document.createElement('input');
    input.type = 'password';
    input.inputMode = 'numeric';
    input.maxLength = 6;
    input.placeholder = 'Enter PIN';
    input.autocomplete = 'one-time-code';
    input.style.cssText = `
      width: 160px; padding: 14px; border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(0,0,0,0.4); color: #FAFAFA;
      font-size: 24px; text-align: center; letter-spacing: 12px;
      outline: none; font-family: inherit;
    `;
    wrap.appendChild(input);

    const status = document.createElement('div');
    status.textContent = 'Enter PIN to continue';
    status.style.cssText = 'margin-top: 16px; font-size: 12px; color: #76746E;';
    wrap.appendChild(status);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (input.value.length >= 4 && input.value === getStoredPin()) {
          wrap.remove();
          document.documentElement.style.visibility = 'visible';
        } else {
          status.textContent = 'Incorrect PIN.';
          status.style.color = '#FF6B6B';
          input.value = '';
        }
      }
    });

    document.body.appendChild(wrap);
    input.focus();
    // Show the lock while keeping page hidden
    document.documentElement.style.visibility = 'visible';
  }

  // Lock only the bento hub (index.html)
  const p = (window.location.pathname || '').toLowerCase();
  const isIndex = p.endsWith('index.html') || p === '/' || p.endsWith('/');

  if (isIndex) {
    document.addEventListener('DOMContentLoaded', showLock);
  }
})();