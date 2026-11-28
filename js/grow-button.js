// Grow-button animation for Chhaya Toru.
// Every button (and nav link) grows a small sprout when clicked, then its normal action runs.
// Add this one file to a page and the effect works on every button in it.
// To skip the effect on one button, add the attribute data-no-grow.

const SELECTOR = '.btn, .nav-link, .tab, .ghost-btn, .google-btn, .login-btn, .back-link';
const SPROUT = `<span class="gb-sprout" aria-hidden="true"><svg viewBox="0 0 40 40">
  <path class="gb-stem" pathLength="24" d="M20 36 Q20 22 20 14" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <g class="gb-leaves"><ellipse cx="13" cy="14" rx="7" ry="3.5" fill="currentColor" transform="rotate(-30 13 14)"/>
  <ellipse cx="27" cy="12" rx="7" ry="3.5" fill="currentColor" transform="rotate(30 27 12)"/></g></svg></span>`;

// Styles are injected here, so no change to style.css is needed
const css = `
.gb-sprout{display:inline-block;width:18px;height:18px;margin-right:6px;vertical-align:middle;flex:none}
.gb-sprout svg{width:100%;height:100%;overflow:visible}
.gb-stem{stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset .5s ease}
.gb-leaves{transform-box:fill-box;transform-origin:center;transform:scale(0);transition:transform .45s .35s cubic-bezier(.34,1.56,.64,1)}
.gb-growing .gb-stem{stroke-dashoffset:0}
.gb-growing .gb-leaves{transform:scale(1)}
.gb-growing{pointer-events:none}
`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

// Put a sprout inside each button (also for buttons added later by the page)
function addSprouts(root = document) {
  root.querySelectorAll(SELECTOR).forEach((el) => {
    if (el.dataset.gbReady || el.hasAttribute('data-no-grow') || el.classList.contains('del')) return;
    el.dataset.gbReady = '1';
    el.insertAdjacentHTML('afterbegin', SPROUT);
  });
}
addSprouts();
new MutationObserver((muts) => {
  muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) addSprouts(n); }));
}).observe(document.body, { childList: true, subtree: true });

// Capture the first click, play the growth, then repeat the click so the page's own handler runs
document.addEventListener('click', (e) => {
  const el = e.target.closest(SELECTOR);
  if (!el || el.hasAttribute('data-no-grow') || el.classList.contains('del')) return;
  if (el.dataset.gbReplay) return; // this is the repeated click, let it through

  e.preventDefault();
  e.stopImmediatePropagation();
  if (el.classList.contains('gb-growing')) return;

  el.classList.add('gb-growing');
  setTimeout(() => {
    el.classList.remove('gb-growing');
    el.dataset.gbReplay = '1';
    el.click();
    delete el.dataset.gbReplay;
  }, 800);
}, true);