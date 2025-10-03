import { emit } from './bus.js';

const LS = {
  coins: 'ps_coins',
  unlocks: 'ps_unlocks',
  skin: 'ps_skin',
  boosts: 'ps_boosts',
  tutorial: 'ps_tutorial_done'   // NEW: one-time tutorial reward flag
};

function readJSON(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export const state = {
  coins: +localStorage.getItem(LS.coins) || 0,
  day: 0,
  value: 10000,
  picks: [],
  boosts: readJSON(LS.boosts, {peek:0,double:0,ins:0}),
  unlocks: readJSON(LS.unlocks, {base:true,shades:false,wizard:false,astro:false}),
  skin: localStorage.getItem(LS.skin) || 'base',
  tutorialDone: localStorage.getItem(LS.tutorial) === '1'  // NEW
};

export function setCoins(v){
  state.coins = v;
  localStorage.setItem(LS.coins, String(v));
  emit('coins:change', v);
}

export function setBoosts(b){
  state.boosts = b;
  localStorage.setItem(LS.boosts, JSON.stringify(b));
  emit('boosts:change', b);
}

export function setUnlocks(u){
  state.unlocks = u;
  localStorage.setItem(LS.unlocks, JSON.stringify(u));
  emit('unlocks:change', u);
}

export function setSkin(s){
  state.skin = s;
  localStorage.setItem(LS.skin, s);
  emit('skin:change', s);
}

// NEW: mark tutorial reward claimed
export function markTutorialDone(){
  state.tutorialDone = true;
  localStorage.setItem(LS.tutorial, '1');
  emit('tutorial:done', true);
}
