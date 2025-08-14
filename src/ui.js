export const $  = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

export function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(()=>t.classList.add('hidden'), 1600);
}

export function confettiBurst(n=80){
  const box = $('#confetti');
  const colors = ['#5ad1ff','#6ea3ff','#9af0ff','#ffd166','#ff6b6b'];
  for(let i=0;i<n;i++){
    const s = document.createElement('div');
    s.className = 'piece';
    s.style.left = Math.random()*100 + 'vw';
    s.style.top = '-20px';
    s.style.background = colors[Math.floor(Math.random()*colors.length)];
    s.style.animationDuration = (900+Math.random()*900)+'ms';
    s.style.transform = `translateY(${Math.random()*-50}px)`;
    box.appendChild(s);
    setTimeout(()=> s.remove(), 2000);
  }
}

export function show(screenId){
  ['screen-menu','screen-shop','screen-tutorial','screen-game','screen-results']
    .forEach(id => $('#'+id).classList.add('hidden'));
  $('#'+screenId).classList.remove('hidden');
}

export function fmtMoney(v){ return v.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}); }
export function fmtPct(v){ return (v*100).toFixed(2)+'%'; }
