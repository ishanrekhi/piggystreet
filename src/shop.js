import { $, $$, show, toast, confettiBurst } from './ui.js';
import { CUSTOMS, BOOSTS } from './data.js';
import { state, setCoins, setUnlocks, setSkin, setBoosts } from './state.js';
import { on } from './bus.js';

const wrapC = $('#shop-custom');
const wrapB = $('#shop-boosts');

function renderCustoms(){
  wrapC.innerHTML='';
  CUSTOMS.forEach(item=>{
    const owned = !!state.unlocks[item.id];
    const node = document.createElement('div');
    node.className = 'shop-item' + (owned ? ' owned' : '');
    node.innerHTML = `
      <h4>${item.icon} ${item.name}</h4>
      <div class="muted">${item.desc}</div>
      <div class="row" style="justify-content:space-between">
        <span class="pill">${owned ? 'Owned' : `💰 ${item.price}`}</span>
        <div class="row">
          ${owned ? `<button class="sm" data-equip="${item.id}">${state.skin===item.id?'Equipped':'Equip'}</button>` : `<button class="primary sm" data-buycust="${item.id}">Buy</button>`}
        </div>
      </div>
    `;
    wrapC.appendChild(node);
  });
}

function renderBoosts(){
  wrapB.innerHTML='';
  BOOSTS.forEach(b=>{
    const node = document.createElement('div');
    node.className = 'shop-item';
    node.innerHTML = `
      <h4>${b.icon} ${b.name}</h4>
      <div class="muted">${b.desc}</div>
      <div class="row" style="justify-content:space-between">
        <span class="pill">💰 ${b.price}</span>
        <div class="inv muted">You own: <strong id="own-${b.id}">${state.boosts[b.id]||0}</strong></div>
        <button class="primary sm" data-buyboost="${b.id}">Buy</button>
      </div>
    `;
    wrapB.appendChild(node);
  });
}

export function renderShop(){
  renderCustoms();
  renderBoosts();

  $$('[data-buycust]').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.buycust;
      const it = CUSTOMS.find(x=>x.id===id);
      if(state.coins < it.price){ toast('Not enough coins'); return; }
      setCoins(state.coins - it.price);
      setUnlocks({...state.unlocks, [id]:true});
      setSkin(id);
      renderShop();
      confettiBurst(60);
      toast(`Unlocked ${it.name}!`);
    };
  });
  $$('[data-equip]').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.equip;
      if(!state.unlocks[id]) return;
      setSkin(id);
      renderShop();
      toast('Equipped!');
    };
  });
  $$('[data-buyboost]').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.buyboost;
      const it = BOOSTS.find(x=>x.id===id);
      if(state.coins < it.price){ toast('Not enough coins'); return; }
      setCoins(state.coins - it.price);
      const nb = {...state.boosts, [id]:(state.boosts[id]||0)+1};
      setBoosts(nb);
      const own = document.getElementById('own-'+id); if(own) own.textContent = nb[id];
      toast(`Bought ${it.name}!`);
    };
  });
}

// UI header bindings
const coinsEl = $('#coins');
const invPeek = $('#inv-peek');
const invDouble = $('#inv-double');
const invIns = $('#inv-ins');
const avatar = $('#avatar');

on('coins:change', v => coinsEl.textContent = v);
on('boosts:change', b => { invPeek.textContent=b.peek||0; invDouble.textContent=b.double||0; invIns.textContent=b.ins||0; });
on('skin:change', s => {
  const map = {base:'🐷',shades:'🐷😎',wizard:'🐷🪄',astro:'🐷🚀'};
  avatar.textContent = map[s] || '🐷';
});

// initial paint
coinsEl.textContent = state.coins;
invPeek.textContent = state.boosts.peek||0;
invDouble.textContent = state.boosts.double||0;
invIns.textContent = state.boosts.ins||0;
on('unlocks:change', ()=>renderShop());
