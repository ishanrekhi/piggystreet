// game.js — Shares-based trading with deeper learning overlays & more variety
// - Adds Concept of the Day and macro learning bites
// - Uses expanded sectors, companies, headlines, events from data.js

import { $, $$, show, toast, confettiBurst, fmtMoney, fmtPct } from './ui.js';
import { state, setCoins, setBoosts } from './state.js';
import { emit } from './bus.js';
import {
  STOCKS, HEADLINES, HEADLINES_SECTOR,
  SENTIMENT, START_CASH, DAYS, COMPANY,
  SECTORS, STOCK_META, EVENTS, EVENT_RULES, CONCEPTS
} from './data.js';

// ---------- helpers ----------
function gaussian(mu=0, sigma=1){
  let u = 1 - Math.random(), v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2*Math.PI*v);
  return mu + sigma * z;
}
function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function sampleTickersDistinctSectors(n=3){
  const pool = [...STOCKS];
  const chosen = [];
  const used = new Set();
  while (pool.length && chosen.length < n){
    const t = pool.splice(Math.floor(Math.random()*pool.length),1)[0];
    const s = STOCK_META[t]?.sector;
    if (!used.has(s)){ used.add(s); chosen.push(t); }
  }
  while (pool.length && chosen.length < n){
    chosen.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  }
  return chosen;
}
function effectiveMuSigma(sentiment, ticker){
  const base = SENTIMENT[sentiment];
  const sector = STOCK_META[ticker]?.sector || 'Tech';
  const nudge = (state.event && EVENT_RULES[state.event.id]?.[sector]) || 0;
  const sigmaK = { Staples:0.9, Utilities:0.9, Tech:1.2, Energy:1.15 }[sector] || 1.0;
  return { mu: base.mu + nudge, sigma: base.sigma * sigmaK };
}
function portfolioMarketValue(){
  let v = state.cash || 0;
  for (const [t, sh] of Object.entries(state.holdings || {})){
    const px = state.prices[t] || 0;
    v += sh * px;
  }
  return v;
}
// deterministic per-ticker starting price (so reloads feel consistent)
function hashStr(s){
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function seededFloat(seed){
  let x = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return x / 2**32;
}
function startingPriceFor(ticker){
  const h = hashStr(ticker);
  const r = seededFloat(h);
  const base = 60 + Math.floor(r * 80);       // 60..140
  const wiggle = Math.max(0.92, Math.min(1.15, 0.92 + seededFloat(h ^ 0x9e3779b9) * 0.23));
  return Math.max(5, +(base * wiggle).toFixed(2));
}
function clamp2(n){ return +(Math.round(n*100)/100).toFixed(2); }

// ---------- elements ----------
const el = {
  day: $('#day'), day2: $('#day2'),
  value: $('#value'), ret: $('#ret'),
  pnlTotal: $('#pnl-total'),
  progress: $('#progress-bar'),
  stocksWrap: $('#stocks'),
  finalValue: $('#final-value'), finalRet: $('#final-ret'), earned: $('#earned'),
  roundNote: $('#round-note'),
  cash: $('#cash-value'),
  holdingsList: $('#holdings-list'),
  positionsValue: $('#positions-value')
};

// ---------- company/sector popover ----------
const infoHost = document.createElement('div');
infoHost.id = 'company-popover';
infoHost.className = 'popover hidden';
infoHost.innerHTML = `
  <div class="card">
    <button class="close" aria-label="Close">✕</button>
    <div class="title"></div>
    <div class="blurb"></div>
    <ul class="examples"></ul>
  </div>`;
(document.body ? Promise.resolve() : new Promise(r=>window.addEventListener('DOMContentLoaded', r, {once:true})))
  .then(()=>document.body.appendChild(infoHost));

function positionPopover(anchorEl){
  const r = anchorEl.getBoundingClientRect();
  infoHost.style.top  = Math.max(12, window.scrollY + r.bottom + 8) + 'px';
  infoHost.style.left = Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - 320) + 'px';
  infoHost.classList.remove('hidden');
  const onKey = (e)=>{ if(e.key==='Escape') hideInfo(); };
  document.addEventListener('keydown', onKey, {once:true});
}
function hideInfo(){ infoHost.classList.add('hidden'); }
infoHost.querySelector('.close').onclick = hideInfo;

function showCompanyInfo(ticker, anchorEl){
  const data = COMPANY[ticker] || {name:ticker, blurb:'Company info coming soon.', examples:[], icon:'🏢'};
  infoHost.querySelector('.title').textContent = `${data.icon||''} ${data.name} (${ticker})`;
  infoHost.querySelector('.blurb').textContent = data.blurb;
  infoHost.querySelector('.examples').innerHTML = (data.examples||[]).map(x=>`<li>${x}</li>`).join('') || '';
  positionPopover(anchorEl);
}
function showSectorInfo(sector, anchorEl){
  const meta = SECTORS[sector] || {icon:'🏢', blurb:'Sector info coming soon.'};
  infoHost.querySelector('.title').textContent = `${meta.icon||''} ${sector}`;
  const detail = meta.blurb +
    (meta.drivers ? ` Drivers: ${meta.drivers.join(", ")}.` : "") +
    (meta.risks ? ` Risks: ${meta.risks.join(", ")}.` : "") +
    (meta.metrics ? ` Watch: ${meta.metrics.join(", ")}.` : "");
  infoHost.querySelector('.blurb').textContent = detail;
  infoHost.querySelector('.examples').innerHTML = '';
  positionPopover(anchorEl);
}
document.addEventListener('click', (e)=>{
  if(!infoHost.classList.contains('hidden') && !infoHost.contains(e.target) &&
     !e.target.closest('.ticker-btn') && !e.target.closest('.sector-chip')){
    hideInfo();
  }
  const tbtn = e.target.closest('.ticker-btn');
  if (tbtn) { showCompanyInfo(tbtn.dataset.ticker, tbtn); return; }
  const schip = e.target.closest('.sector-chip');
  if (schip) { showSectorInfo(schip.dataset.sector, schip); return; }
});
document.addEventListener('keydown', (e)=>{
  const tbtn = e.target.closest?.('.ticker-btn');
  if (tbtn && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); showCompanyInfo(tbtn.dataset.ticker, tbtn); }
  const schip = e.target.closest?.('.sector-chip');
  if (schip && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); showSectorInfo(schip.dataset.sector, schip); }
});

// ---------- overlay creator ----------
function ensureOverlay(){
  let overlay = document.querySelector('.market-close');
  if (!overlay){
    overlay = document.createElement('div');
    overlay.className = 'market-close';
    overlay.innerHTML = `
      <div class="curtain">
        <div class="bell">🔔</div>
        <div class="txt">Market Closed</div>
        <div class="mini"></div>
        <div class="learn"></div>
        <button class="primary continue-btn">Next Day →</button>
      </div>`;
    document.body.appendChild(overlay);
  }
  return overlay;
}

// ---------- lifecycle ----------
export function resetGame(){
  state.day   = 0;
  state.event = null;

  // portfolio state
  state.cash = START_CASH;
  state.holdings = {};             // { TICKER: shares }
  state.basis = {};                // { TICKER: {shares, cost} } for avg cost calc
  state.prices = {};               // { TICKER: price }
  for (const t of STOCKS) state.prices[t] = startingPriceFor(t);

  // history & day context
  state.dayResults = [];           // [{day, moves:{TICKER:r}, mktValue}]
  state.today = null;              // { cards:[{ticker, sentiment, sector, news}], cardSet:Set(tickers) }

  // paint
  state.value = portfolioMarketValue();
  if (el.value) el.value.textContent = fmtMoney(state.value);
  if (el.ret)   el.ret.textContent   = fmtPct(0);
  if (el.pnlTotal) el.pnlTotal.textContent = fmtMoney(state.value - START_CASH);
  if (el.cash) el.cash.textContent = fmtMoney(state.cash);
  if (el.positionsValue) el.positionsValue.textContent = fmtMoney(state.value - state.cash);
  if (el.day) el.day.textContent = '0';
  if (el.day2) el.day2.textContent = '1';
  if (el.progress) el.progress.style.width = '0%';
  renderHoldings();
}

export function nextDay(first=false){
  if(state.day>=DAYS){ return endGame(); }
  state.day++;
  if (el.day) el.day.textContent  = String(state.day);
  if (el.day2) el.day2.textContent = String(state.day);
  if (el.progress) el.progress.style.width = (state.day-1)/DAYS*100+'%';

  state.event = randChoice(EVENTS);
  emit('day:start', state.day);
  renderChoices();
  if(!first) confettiBurst(30);
}

function renderChoices(){
  if (!el.stocksWrap) return;
  el.stocksWrap.innerHTML = '';

  // macro banner
  if (state.event){
    const banner = document.createElement('div');
    banner.className = 'macro-banner';
    banner.innerHTML = `<strong>${state.event.icon} ${state.event.title}</strong> — <span class="muted">${state.event.note}</span>`;
    el.stocksWrap.appendChild(banner);
  }

  const tickers = sampleTickersDistinctSectors(3);
  const sentiments = ['good','neutral','bad'].sort(()=>Math.random()-0.5);

  const todaysCards = [];
  const cardSentMap = {}; // ticker -> sentiment
  const cardsMeta = [];   // store news for the explainer

  tickers.forEach((ticker, idx)=>{
    const sector = STOCK_META[ticker]?.sector || 'Tech';
    const sent = sentiments[idx];
    const pool = (HEADLINES_SECTOR[sector] && HEADLINES_SECTOR[sector][sent]) || HEADLINES[sent];
    const news = randChoice(pool);
    const px = state.prices[ticker];
    const sh = state.holdings[ticker] || 0;

    cardSentMap[ticker] = sent;
    cardsMeta.push({ ticker, sentiment: sent, sector, news });

    const card = document.createElement('div');
    card.className = 'stock';
    card.dataset.ticker = ticker;
    card.dataset.sent   = sent;
    card.dataset.double='0';
    card.dataset.ins   ='0';
    card.dataset.peek  ='0';

    card.innerHTML = `
      <div class="row" style="justify-content:space-between;gap:8px;align-items:center">
        <button class="ticker-btn" data-ticker="${ticker}">${ticker}</button>
        <span class="sector-chip" data-sector="${sector}">${SECTORS[sector]?.icon || ''} ${sector}</span>
      </div>
      <div class="news">${news}</div>
      <div class="muted hidden odds" aria-live="polite" style="margin-top:6px"></div>

      <div class="row" style="margin-top:8px;justify-content:space-between">
        <div>Price: <strong class="price">$${px.toFixed(2)}</strong></div>
        <div>Owned: <strong class="owned">${sh}</strong> sh</div>
      </div>

      <div class="boosts" style="margin-top:6px">
        <button class="sm btn-peek">🔍 Use Peek (${state.boosts.peek||0})</button>
        <button class="sm btn-double">✨ Use Double (${state.boosts.double||0})</button>
        <button class="sm btn-ins">🛡️ Use Insurance (${state.boosts.ins||0})</button>
      </div>

      <div class="trade" style="margin-top:8px;display:flex;gap:8px;align-items:center">
        <button class="buy1">Buy 1</button>
        <button class="sell1">Sell 1</button>
      </div>
    `;
    el.stocksWrap.appendChild(card);
    todaysCards.push(card);
  });

  // remember today's context for the end-of-day explainer
  state.today = { cards: cardsMeta, cardSet: new Set(cardsMeta.map(c=>c.ticker)) };

  // footer with end-day lock
  const footer = document.createElement('div');
  footer.className='alloc-footer';
  footer.innerHTML = `
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="muted">
        Trade at today's price. When you're ready, end the day to see prices move.
      </div>
      <button class="primary lock-btn">End Day ${state.day}</button>
    </div>
  `;
  el.stocksWrap.appendChild(footer);

  wireBoostButtons();
  wireTradeButtons(todaysCards);

  // lock
  footer.querySelector('.lock-btn').onclick = ()=> lockInDay(todaysCards, cardSentMap);
}

// ------ transactions (shared) ------
function sellShares(ticker, qty){
  qty = Math.max(0, Math.min(qty, state.holdings[ticker] || 0));
  if (qty === 0) return false;

  const px = state.prices[ticker] || 0;

  // position & cash
  state.holdings[ticker] -= qty;
  state.cash = clamp2(state.cash + px * qty);

  // average-cost basis reduction
  const b = state.basis[ticker] || {shares:0, cost:0};
  if (b.shares > 0){
    const avg = b.cost / b.shares;
    b.shares -= qty;
    b.cost = clamp2(Math.max(0, b.cost - avg * qty));
    if (b.shares === 0) b.cost = 0;
    state.basis[ticker] = b;
  }

  // refresh any visible card for this ticker
  refreshCardOwned(ticker);

  // refresh portfolio
  renderHoldings(true);
  paintPortfolioHeader();
  return true;
}
function refreshCardOwned(ticker){
  if (!el.stocksWrap) return;
  const card = el.stocksWrap.querySelector(`.stock[data-ticker="${ticker}"]`);
  if (!card) return;
  const ownedEl = card.querySelector('.owned');
  if (ownedEl) ownedEl.textContent = String(state.holdings[ticker] || 0);
}

// ------ wire buttons on today’s cards ------
function wireTradeButtons(cards){
  cards.forEach(card=>{
    const t = card.dataset.ticker;
    const ownedEl = card.querySelector('.owned');
    const priceEl = card.querySelector('.price');

    const refreshRow = ()=>{
      if (ownedEl) ownedEl.textContent = String(state.holdings[t] || 0);
      if (priceEl) priceEl.textContent = `$${(state.prices[t]||0).toFixed(2)}`;
      renderHoldings(true);
      paintPortfolioHeader();
    };

    const buy1 = card.querySelector('.buy1');
    if (buy1) buy1.onclick = ()=>{
      const px = state.prices[t];
      if (state.cash < px){ toast('Not enough cash'); return; }
      state.holdings[t] = (state.holdings[t]||0) + 1;
      state.cash = clamp2(state.cash - px);
      const b = state.basis[t] || {shares:0, cost:0};
      b.shares += 1; b.cost = clamp2(b.cost + px);
      state.basis[t] = b;
      refreshRow();
    };

    const sell1 = card.querySelector('.sell1');
    if (sell1) sell1.onclick = ()=>{
      if ((state.holdings[t]||0) <= 0){ toast('No shares to sell'); return; }
      sellShares(t, 1);
    };
  });
}

function wireBoostButtons(){
  $$('.btn-peek').forEach(btn=>{
    btn.onclick = (e)=>{
      const card = e.target.closest('.stock');
      if((state.boosts.peek||0)<=0){ toast('No peeks left'); emit('boost:used',{type:'peek', none:true}); return; }
      setBoosts({...state.boosts, peek: state.boosts.peek-1});
      card.dataset.peek = '1';
      const sent = card.dataset.sent, ticker = card.dataset.ticker;
      const {mu, sigma} = effectiveMuSigma(sent, ticker);
      const txt = card.querySelector('.odds');
      if (txt){
        txt.textContent = `Odds hint → mean: ${fmtPct(mu)} • typical move (σ): ${fmtPct(sigma)}`;
        txt.classList.remove('hidden');
      }
      e.target.textContent = '🔍 Peek used';
      e.target.disabled = true;
      emit('boost:used', {type:'peek'});
    };
  });
  $$('.btn-double').forEach(btn=>{
    btn.onclick = (e)=>{
      const card = e.target.closest('.stock');
      if(card.dataset.double==='1'){ toast('Already applied'); return; }
      if((state.boosts.double||0)<=0){ toast('No doubles left'); emit('boost:used',{type:'double', none:true}); return; }
      setBoosts({...state.boosts, double: state.boosts.double-1});
      card.dataset.double = '1';
      e.target.textContent = '✨ Double armed';
      e.target.disabled = true;
      emit('boost:used', {type:'double'});
    };
  });
  $$('.btn-ins').forEach(btn=>{
    btn.onclick = (e)=>{
      const card = e.target.closest('.stock');
      if(card.dataset.ins==='1'){ toast('Already applied'); return; }
      if((state.boosts.ins||0)<=0){ toast('No insurance left'); emit('boost:used',{type:'ins', none:true}); return; }
      setBoosts({...state.boosts, ins: state.boosts.ins-1});
      card.dataset.ins = '1';
      e.target.textContent = '🛡️ Insurance armed';
      e.target.disabled = true;
      emit('boost:used', {type:'ins'});
    };
  });
}

function lockInDay(cards, sentMap){
  const lockBtn = document.querySelector('.lock-btn');
  if (lockBtn) lockBtn.disabled = true;

  // Build map of boosts per ticker (today's cards only)
  const boostMap = {};
  cards.forEach(c=>{
    const t = c.dataset.ticker;
    boostMap[t] = { double: c.dataset.double === '1', ins: c.dataset.ins === '1' };
  });

  // Compute daily return for EVERY ticker
  const moves = {}; // ticker -> r
  for (const t of STOCKS){
    const sentiment = sentMap[t] || 'neutral';
    let {mu, sigma} = effectiveMuSigma(sentiment, t);
    let r = gaussian(mu, sigma);

    const b = boostMap[t];
    if (b?.double){ r = r >= 0 ? r*2 : r/2; }
    if (b?.ins && r < 0){ r = 0; }

    moves[t] = r;
  }

  // Apply price changes, capture before/after for explainer
  const before = {};
  for (const t of STOCKS) before[t] = state.prices[t];
  for (const [t, r] of Object.entries(moves)){
    const oldPx = state.prices[t];
    const newPx = Math.max(0.01, oldPx * (1 + r));
    state.prices[t] = clamp2(newPx);
  }

  // Update portfolio value
  const prevValue = state.value;
  state.value = portfolioMarketValue();
  state.dayResults.push({ day: state.day, moves, mktValue: state.value });

  // UI header refresh
  paintPortfolioHeader();

  // ensure overlay
  ensureOverlay();

  // reflection + learning
  const featured = (state.today?.cards || []).map(c => {
    const t = c.ticker;
    return {
      ticker: t,
      sentiment: c.sentiment,
      sector: c.sector,
      news: c.news,
      px0: before[t],
      px1: state.prices[t],
      r: moves[t]
    };
  });

  showReflection(cards.map(c => {
    const t = c.dataset.ticker;
    const w = (state.holdings[t]||0) * (state.prices[t]||0) / Math.max(1, state.value);
    return { ticker:t, w, r: moves[t] };
  }), (state.value/prevValue - 1) || 0);

  showLearning(featured);

  // continue
  marketClose(true, () => {
    if (state.day >= DAYS) endGame();
    else nextDay(false);
  });
}

function marketClose(on, onContinue){
  const overlay = ensureOverlay();
  overlay.classList.toggle('show', !!on);

  // Lock/unlock background scroll while modal is open
  if (on) {
    document.body.classList.add('modal-open');
    const btn = overlay.querySelector('.continue-btn');
    if (btn) btn.onclick = ()=>{
      overlay.classList.remove('show');
      document.body.classList.remove('modal-open');
      if (onContinue) onContinue();
    };
  } else {
    document.body.classList.remove('modal-open');
  }
}

function showReflection(breakdown, dayRet){
  ensureOverlay();
  const mini = document.querySelector('.market-close .mini');
  if(!mini) return;
  const lines = breakdown.map(b => {
    const pct = Math.round((b.w||0)*100);
    return `<div class="mini-row"><span>${b.ticker} • ~${pct}% of port</span><span>${fmtPct(b.r)}</span></div>`;
  }).join('');
  const tip = dayRet >= 0
    ? 'Nice! Your holdings gained today.'
    : 'Tough day. Selling a bit or keeping cash can cushion drops.';
  mini.innerHTML = `
    <div class="mini-head">Day return: <strong>${fmtPct(dayRet)}</strong></div>
    ${lines}
    <div class="mini-tip">${tip}</div>
  `;
}

// ----- concept detection -----
function detectConceptKeys(textLower){
  const keys = [];
  const map = [
    ["earnings","earnings","profit","beats","beat","miss"],
    ["guidance","guidance","forecast","outlook"],
    ["regulation","regulat","fine","approval","approve","fda"],
    ["supply","supply","chip","shortage","factory","port"],
    ["demand","demand","traffic","users","subscr","watch time","viewers","same-store"],
    ["pricing","price","pricing","promo","promotion"],
    ["merger","merger","acquisition","acquire","combine","deal"],
    ["rates","rate","fed","hike","cut","interest"],
    ["oil","oil","fuel","gas","barrel"],
    ["currency","dollar","fx","currency"],
    ["cyber","cyber","breach","hack","outage"],
    ["labor","labor","strike","union","wage"]
  ];
  for (const [key, ...needles] of map){
    if (needles.some(n => textLower.includes(n))) keys.push(key);
  }
  return keys.slice(0,3); // keep it short
}

function explainMove(sentiment, news, changePct){
  const direction = changePct > 0 ? 'rose' : changePct < 0 ? 'fell' : 'was flat';
  const absPct = fmtPct(changePct);
  const n = news.toLowerCase();
  let why = '';
  if (n.includes('earnings') || n.includes('profit') || n.includes('beats') || n.includes('beat')){
    why = 'Earnings changed what people expected about profits.';
  } else if (n.includes('guidance') || n.includes('forecast')){
    why = 'Guidance updated the road ahead for the business.';
  } else if (n.includes('regulat') || n.includes('fda') || n.includes('fine') || n.includes('investigat')){
    why = 'Rules or approvals changed risk and timing.';
  } else if (n.includes('supply') || n.includes('chip') || n.includes('shortage') || n.includes('factory')){
    why = 'Supply issues altered costs or timing for sales.';
  } else if (n.includes('demand') || n.includes('sales') || n.includes('traffic') || n.includes('users')){
    why = 'Changes in shoppers or users affected revenue hopes.';
  } else if (n.includes('price') || n.includes('pricing') || n.includes('promo')){
    why = 'Pricing power shifted margins.';
  } else if (n.includes('merger') || n.includes('acquisition')){
    why = 'M&A can bring growth or risk from combining companies.';
  } else if (n.includes('strike') || n.includes('labor')){
    why = 'Labor issues can pause production and add costs.';
  } else if (n.includes('breach') || n.includes('hack') || n.includes('outage')){
    why = 'Cyber issues can impact trust and service reliability.';
  } else {
    why = 'News updated investor expectations.';
  }
  const tilt = sentiment==='good' ? 'Today’s headline tilted odds up.' :
               sentiment==='bad'  ? 'Today’s headline tilted odds down.' :
                                    'Today’s headline was mixed, so moves were smaller.';
  return { text: `${direction} ${absPct} — ${why} ${tilt}`, concepts: detectConceptKeys(n) };
}

function unique(arr){ return [...new Set(arr)]; }

function conceptPanel(keys){
  if (!keys.length) return '';
  const rows = keys.map(k=>{
    const c = CONCEPTS[k];
    if (!c) return '';
    return `
      <div class="panel" style="margin-top:8px">
        <strong>Concept: ${c.title}</strong>
        <div class="muted" style="margin-top:4px">${c.what}</div>
        <div class="muted" style="margin-top:4px"><em>Why it matters:</em> ${c.why}</div>
        <div class="muted" style="margin-top:4px"><em>Try this next time:</em> ${c.try}</div>
      </div>`;
  }).join('');
  return `<div class="mini-head" style="margin-top:8px">Concept of the Day</div>${rows}`;
}

function macroPanel(){
  if (!state?.event) return '';
  const e = state.event;
  const teach = e.teach ? `<div class="muted" style="margin-top:4px">${e.teach}</div>` : '';
  return `
    <div class="panel" style="margin-top:10px">
      <div class="row" style="justify-content:space-between">
        <strong>${e.icon} ${e.title}</strong>
        <span class="muted">${e.note}</span>
      </div>
      ${teach}
    </div>`;
}

function showLearning(featured){
  ensureOverlay();
  const box = document.querySelector('.market-close .learn');
  if(!box) return;

  // Per-card learning rows
  let allConceptKeys = [];
  const rows = featured.map(f=>{
    const chgPct = (f.px1 / f.px0) - 1;
    const { text, concepts } = explainMove(f.sentiment, f.news, f.r);
    allConceptKeys = allConceptKeys.concat(concepts);
    const pct = fmtPct(chgPct);
    const sign = f.px1 - f.px0;
    const chg = sign >= 0 ? `+${fmtMoney(Math.abs(sign))}` : `-${fmtMoney(Math.abs(sign))}`;
    const sectorInfo = SECTORS[f.sector];
    const sectorLine = sectorInfo ? ` • ${sectorInfo.icon||''} ${f.sector}: ${sectorInfo.blurb}` : '';
    return `
      <div class="panel" style="margin-top:8px">
        <div class="row" style="justify-content:space-between">
          <strong>${f.ticker}</strong>
          <span class="muted">${f.news}</span>
        </div>
        <div class="row" style="justify-content:space-between;margin-top:6px">
          <span>Price: $${f.px0.toFixed(2)} → <strong>$${f.px1.toFixed(2)}</strong> (${pct}, ${chg})</span>
        </div>
        <div class="muted" style="margin-top:6px">Why? ${text}${sectorLine ? `<br/>${sectorLine}`:''}</div>
      </div>`;
  }).join('') || '';

  // Concepts (deduped) + Macro lesson for the day
  const conceptKeys = unique(allConceptKeys).slice(0,3);
  const concepts = conceptPanel(conceptKeys);
  const macro = macroPanel();

  box.innerHTML = `
    <div class="mini-head">What changed & why (learning):</div>
    ${rows}
    ${concepts}
    ${macro}
  `;
}

// ------ portfolio panel (global sell controls) ------
function renderHoldings(skipHeader=false){
  if (!el.holdingsList) return;

  const rows = Object.entries(state.holdings)
    .filter(([,sh])=>sh>0)
    .sort((a,b)=> (b[1]*(state.prices[b[0]]||0)) - (a[1]*(state.prices[a[0]]||0)))
    .map(([t, sh])=>{
      const px = state.prices[t]||0;
      const b = state.basis[t] || {shares:0, cost:0};
      const avg = b.shares>0 ? b.cost / b.shares : 0;
      const pnlPerShare = px - avg;
      const pnlTotal = pnlPerShare * sh;
      const pnlPct = avg>0 ? (px/avg - 1) : 0;
      return `<div class="row" data-holding="${t}" style="justify-content:space-between;align-items:center">
        <div class="col" style="gap:4px;min-width:220px">
          <strong>${t}</strong>
          <span class="muted">${sh} sh × $${px.toFixed(2)} • Avg $${avg ? avg.toFixed(2):'0.00'}</span>
        </div>
        <div class="col" style="gap:4px; text-align:right">
          <strong>${fmtMoney(pnlTotal)} <span class="muted">(${fmtPct(pnlPct)})</span></strong>
          <div class="row" style="gap:8px;justify-content:flex-end">
            <button class="sm sell1-port">Sell 1</button>
            <button class="sm sellall-port">Sell All</button>
          </div>
        </div>
      </div>`;
    }).join('') || `<div class="muted">No shares yet. Try buying 1 on a card!</div>`;

  el.holdingsList.innerHTML = rows;

  // wire the portfolio sell buttons
  el.holdingsList.querySelectorAll('.sell1-port').forEach(btn=>{
    btn.onclick = (e)=>{
      const row = e.currentTarget.closest('[data-holding]');
      const t = row?.dataset.holding;
      if (!t) return;
      if ((state.holdings[t]||0) <= 0){ toast('No shares to sell'); return; }
      sellShares(t, 1);
    };
  });
  el.holdingsList.querySelectorAll('.sellall-port').forEach(btn=>{
    btn.onclick = (e)=>{
      const row = e.currentTarget.closest('[data-holding]');
      const t = row?.dataset.holding;
      if (!t) return;
      const qty = state.holdings[t]||0;
      if (qty <= 0){ toast('No shares to sell'); return; }
      sellShares(t, qty);
    };
  });

  if (!skipHeader) paintPortfolioHeader();
}

function paintPortfolioHeader(){
  const mv = portfolioMarketValue();
  const totalRet = (mv / START_CASH - 1);
  state.value = mv;
  if (el.value) el.value.textContent = fmtMoney(mv);
  if (el.ret)   el.ret.textContent   = fmtPct(totalRet);
  if (el.pnlTotal) el.pnlTotal.textContent = fmtMoney(mv - START_CASH);
  if (el.cash)  el.cash.textContent  = fmtMoney(state.cash);
  if (el.positionsValue) el.positionsValue.textContent = fmtMoney(mv - state.cash);
  emit('pick:made', { dayRet: 0 });
}

function endGame(){
  const totalRet = (state.value/START_CASH - 1);
  const baseCoins = Math.max(0, Math.round(20 + totalRet*200));
  const earned = Math.max(0, baseCoins);
  setCoins(state.coins + earned);

  if (el.finalValue) el.finalValue.textContent = fmtMoney(state.value);
  if (el.finalRet) el.finalRet.textContent   = fmtPct(totalRet);
  if (el.earned) el.earned.textContent     = String(earned);

  if (el.roundNote){
    el.roundNote.textContent =
      `You finished with ${fmtMoney(state.value)}. Headlines tilt odds — not guarantees.`;
  }

  emit('game:end', {earned, totalRet});
  confettiBurst(160);
  show('screen-results');
}

export function wireGameButtons(){
  // Optional buttons — guard if missing
  const endEarly = $('#btn-end-early');
  if (endEarly) endEarly.onclick = ()=> endGame();

  const retry = $('#btn-retry');
  if (retry) retry.onclick = ()=>{ resetGame(); show('screen-game'); nextDay(true); };

  // Static toolbar fallbacks (top of Stocks panel)
  const endBtn = $('#btn-end');
  if (endBtn) endBtn.onclick = ()=>{
    const lock = document.querySelector('.lock-btn');
    if (lock) lock.click();
    else toast('No trades yet — press Start Game first.');
  };

  const sellAllBtn = $('#btn-sell-all');
  if (sellAllBtn) sellAllBtn.onclick = ()=>{
    const toSell = Object.keys(state.holdings||{});
    toSell.forEach(t => sellShares(t, state.holdings[t]||0));
  };
}
