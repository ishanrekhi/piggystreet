import { $, show, toast } from './ui.js';
import { state, setCoins, markTutorialDone } from './state.js';
import { renderShop } from './shop.js';
import { resetGame, nextDay, wireGameButtons } from './game.js';
import './coach.js'; // registers listeners

// ------- Helpers (tutorial UI text) -------
function paintTutorialButtons(){
  const btn = $('#btn-tutorial');
  const finish = $('#btn-tutorial-finish');
  if (state.tutorialDone){
    if (btn) btn.textContent = '🎓 Review Tutorial';
    if (finish) finish.textContent = 'Finish';
  } else {
    if (btn) btn.textContent = '🎓 Start Tutorial (+50 one-time)';
    if (finish) finish.textContent = 'Finish (+50)';
  }
}

// ------- Shop wiring -------
const btnShop = $('#btn-shop');
if (btnShop) btnShop.onclick = ()=>{
  renderShop();
  show('screen-shop');
};
const btnShopBack = $('#btn-shop-back');
if (btnShopBack) btnShopBack.onclick = ()=> show('screen-menu');

// ------- Tutorial wiring -------
const btnTut = $('#btn-tutorial');
if (btnTut) btnTut.onclick = ()=> show('screen-tutorial');

document.querySelectorAll('.choice').forEach(b=>{
  b.onclick = ()=>{
    const q = b.dataset.q;
    const a = b.dataset.a;

    // mark selection
    b.parentElement?.querySelectorAll('.choice').forEach(x=> x.classList.remove('primary'));
    b.classList.add('primary');

    if (q === '1'){
      const fb = $('#quiz-fb-1');
      if (fb) fb.textContent = (a === 'good')
        ? 'Correct! Positive surprise → odds tilt up (not guaranteed).'
        : 'Hint: “beat + raised guidance” usually tilts odds upward.';
    } else if (q === '2'){
      const fb = $('#quiz-fb-2');
      if (fb) fb.textContent = (a === 'Energy')
        ? 'Correct! Higher oil often helps energy producers.'
        : 'Hint: Oil spikes typically help energy companies the most.';
    }
  };
});

const btnTutFinish = $('#btn-tutorial-finish');
if (btnTutFinish) btnTutFinish.onclick = ()=>{
  // Award coins only once
  if (!state.tutorialDone){
    setCoins(state.coins + 50);
    markTutorialDone();
  }
  show('screen-menu');
  paintTutorialButtons();
};

// ------- Class Code Gate -------
const ALLOWED_CODES = [
  'PS-ALPHA-73QK',
  'PS-BETA-98MV',
  'CLASS-7DAY-1KX',
  'FNLIT-25-4PY',
  'PIGGY-TEST-9R2'
];

const LS_CODE = 'ps_class_code';

// normalize: uppercase, remove non-alphanum except digits, keep letters+digits
function normCode(s){
  return (s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
}
function hasValidStoredCode(){
  const saved = localStorage.getItem(LS_CODE);
  if(!saved) return false;
  const ok = ALLOWED_CODES.map(normCode).includes(normCode(saved));
  if (!ok) localStorage.removeItem(LS_CODE);
  return ok;
}

function openClassCodeModal(opts={}){
  const modal = $('#classcode-modal');
  const input = $('#cc-input');
  const err   = $('#cc-error');
  const btnOk = $('#cc-submit');
  const btnX  = $('#cc-cancel');

  err.classList.add('hidden');
  input.value = localStorage.getItem(LS_CODE) || '';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  input.focus();
  input.select();

  function close(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    btnOk.onclick = null;
    btnX.onclick = null;
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e){
    if(e.key === 'Escape'){ close(); if(opts.onCancel) opts.onCancel(); }
    if(e.key === 'Enter'){ submit(); }
  }
  function submit(){
    const raw = input.value.trim();
    if(!ALLOWED_CODES.map(normCode).includes(normCode(raw))){
      err.classList.remove('hidden');
      return;
    }
    localStorage.setItem(LS_CODE, raw.toUpperCase());
    close();
    if (opts.onSuccess) opts.onSuccess(raw.toUpperCase());
  }

  btnOk.onclick = submit;
  btnX.onclick  = ()=>{ close(); if(opts.onCancel) opts.onCancel(); };
  document.addEventListener('keydown', onKey);
}

function ensureClassCodeThen(fn){
  if (hasValidStoredCode()){ fn(); return; }
  openClassCodeModal({ onSuccess: fn, onCancel: ()=>{} });
}

// ------- Game buttons -------
const btnStart = $('#btn-start');
if (btnStart) btnStart.onclick = ()=>{
  ensureClassCodeThen(()=>{ resetGame(); show('screen-game'); nextDay(true); });
};

const btnMenu = $('#btn-menu');
if (btnMenu) btnMenu.onclick = ()=>{ show('screen-menu'); };

// Wire game-specific buttons (null-safe inside)
wireGameButtons();

// “Change class code” (menu)
const btnChangeClass = $('#btn-change-class');
if (btnChangeClass) btnChangeClass.onclick = ()=> openClassCodeModal({ onSuccess: ()=> toast('Class code updated!') });

// Initial paint of avatar (based on skin)
(function initAvatar(){
  const map = { base:'🐷', shades:'🐷😎', wizard:'🐷🪄', astro:'🐷🚀' };
  const el = document.getElementById('avatar');
  if (el) el.textContent = map[state.skin] || '🐷';
})();

// Reflect tutorial state on first load
paintTutorialButtons();

// Start on menu
show('screen-menu');
