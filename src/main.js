import { $, show } from './ui.js';
import { state, setCoins } from './state.js';
import { renderShop } from './shop.js';
import { resetGame, nextDay, wireGameButtons } from './game.js';
import './coach.js'; // registers listeners

// Menu buttons
$('#btn-shop').onclick = ()=>{ renderShop(); show('screen-shop'); };
$('#btn-shop-back').onclick = ()=>{ show('screen-menu'); };

$('#btn-tutorial').onclick = ()=>{ show('screen-tutorial'); };
$('#btn-tutorial-skip').onclick = ()=>{ show('screen-menu'); };

document.querySelectorAll('#screen-tutorial .choice').forEach(b=>{
  b.onclick = ()=>{
    const correct = b.dataset.quiz==='good';
    const fb = $('#quiz-feedback');
    if(correct){ fb.textContent = 'Correct! Positive surprise → odds tilt up (not guaranteed).'; $('#btn-tutorial-finish').disabled=false; }
    else { fb.textContent = 'Nice try! Beating & raising usually tilts odds upward.'; }
  }
});
$('#btn-tutorial-finish').onclick = ()=>{
  setCoins(state.coins + 50);
  show('screen-menu');
};

$('#btn-start').onclick = ()=>{ resetGame(); show('screen-game'); nextDay(true); };
$('#btn-menu').onclick = ()=>{ show('screen-menu'); };

wireGameButtons();

// Initial paint of avatar (based on skin)
(function initAvatar(){
  const map = {base:'🐷',shades:'🐷😎',wizard:'🐷🪄',astro:'🐷🚀'};
  $('#avatar').textContent = map[state.skin] || '🐷';
})();

// Start on menu
show('screen-menu');
