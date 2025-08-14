import { $, $$, show, toast, confettiBurst, fmtMoney, fmtPct } from './ui.js';
import { STOCKS, HEADLINES, SENTIMENT, START_CASH, DAYS } from './data.js';
import { state, setCoins, setBoosts } from './state.js';
import { emit } from './bus.js';

const el = {
  day: $('#day'), day2: $('#day2'),
  value: $('#value'), ret: $('#ret'),
  progress: $('#progress-bar'),
  stocksWrap: $('#stocks'),
  finalValue: $('#final-value'), finalRet: $('#final-ret'), earned: $('#earned'),
  roundNote: $('#round-note'),
};

function gaussian(mu=0, sigma=1){
  let u = 1 - Math.random(), v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2*Math.PI*v);
  return mu + sigma * z;
}
function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

export function resetGame(){
  state.day=0; state.value=START_CASH; state.picks=[];
  el.value.textContent = fmtMoney(state.value);
  el.ret.textContent = fmtPct(0);
  el.day.textContent='0';
  el.day2.textContent='1';
  el.progress.style.width='0%';
}

export function nextDay(first=false){
  if(state.day>=DAYS){ return endGame(); }
  state.day++;
  el.day.textContent = String(state.day);
  el.day2.textContent = String(state.day);
  el.progress.style.width = (state.day-1)/DAYS*100+'%';
  emit('day:start', state.day);
  renderChoices();
  if(!first) confettiBurst(30);
}

function renderChoices(){
  el.stocksWrap.innerHTML='';
  const picks = new Set();
  while(picks.size<3) picks.add(randChoice(STOCKS));
  const sentiments = ['good','neutral','bad'].sort(()=>Math.random()-0.5);

  Array.from(picks).forEach((ticker,i)=>{
    const s = sentiments[i];
    const news = randChoice(HEADLINES[s]);
    const card = document.createElement('div');
    card.className = 'stock';
    card.dataset.ticker = ticker;
    card.dataset.sent = s;
    card.dataset.double = '0';
    card.dataset.ins = '0';
    card.dataset.peek = '0';
    card.innerHTML = `
      <div class="row" style="justify-content:space-between">
        <h3>${ticker}</h3>
        <span class="tag ${s==='good'?'good':s==='bad'?'bad':'neutral'}">${s.toUpperCase()}</span>
      </div>
      <div class="news">${news}</div>
      <div class="muted hidden odds" aria-live="polite" style="margin-top:6px"></div>
      <div class="boosts">
        <button class="sm btn-peek">🔍 Use Peek (${state.boosts.peek||0})</button>
        <button class="sm btn-double">✨ Use Double (${state.boosts.double||0})</button>
        <button class="sm btn-ins">🛡️ Use Insurance (${state.boosts.ins||0})</button>
      </div>
      <div class="choices">
        <button class="choice" data-ticker="${ticker}" data-sent="${s}">Pick for Day ${state.day}</button>
      </div>
    `;
    el.stocksWrap.appendChild(card);
  });

  // boosts
  $$('.btn-peek').forEach(btn=>{
    btn.onclick = (e)=>{
      const card = e.target.closest('.stock');
      if((state.boosts.peek||0)<=0){ toast('No peeks left'); emit('boost:used',{type:'peek', none:true}); return; }
      setBoosts({...state.boosts, peek: state.boosts.peek-1});
      card.dataset.peek = '1';
      const sent = card.dataset.sent;
      const {mu, sigma} = SENTIMENT[sent];
      const txt = card.querySelector('.odds');
      txt.textContent = `Odds hint → mean: ${fmtPct(mu)} • typical move (σ): ${fmtPct(sigma)}`;
      txt.classList.remove('hidden');
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

  // pick
  $$('#stocks .choice').forEach(btn=>{
    btn.onclick = ()=> applyChoice(btn);
  });
}

function applyChoice(btn){
  const ticker = btn.dataset.ticker;
  const sentiment = btn.dataset.sent;
  const card = btn.closest('.stock');

  const {mu, sigma} = SENTIMENT[sentiment];
  let r = gaussian(mu, sigma);

  const useDouble = card.dataset.double==='1';
  const useIns = card.dataset.ins==='1';

  if(useDouble){
    r = r >= 0 ? r * 2 : r / 2;
  }
  if(useIns && r < 0){
    r = 0;
  }

  state.picks.push({day:state.day, ticker, sentiment, r, boosts:{double:useDouble,ins:useIns,peek:card.dataset.peek==='1'}});
  state.value = Math.max(0, state.value * (1 + r));

  const totalRet = (state.value/START_CASH - 1);
  el.value.textContent = fmtMoney(state.value);
  el.ret.textContent = fmtPct(totalRet);
  toast(`${ticker} moved ${fmtPct(r)} today`);
  el.progress.style.width = (state.day)/DAYS*100+'%';

  emit('pick:made', {sentiment, r, used:{double:useDouble, ins:useIns}});

  if(state.day>=DAYS){ setTimeout(endGame, 350); } else { setTimeout(()=>nextDay(false), 600); }
}

function endGame(){
  const totalRet = (state.value/START_CASH - 1);
  const baseCoins = Math.max(0, Math.round(20 + totalRet*200));
  const bonus = (state.value>START_CASH?10:0) + (state.picks.filter(p=>p.sentiment==='bad'&&p.r>0).length*5);
  const earned = Math.max(0, baseCoins + bonus);

  setCoins(state.coins + earned);

  el.finalValue.textContent = fmtMoney(state.value);
  el.finalRet.textContent = fmtPct(totalRet);
  el.earned.textContent = String(earned);

  const wins = state.picks.filter(p=>p.r>0).length;
  el.roundNote.textContent = `You had ${wins}/${DAYS} positive days. Headlines tilt odds — not guarantees.`;

  emit('game:end', {earned, totalRet, wins});
  confettiBurst(160);
  show('screen-results');
}

export function wireGameButtons(){
  $('#btn-end-early').onclick = ()=> endGame();
  $('#btn-retry').onclick = ()=>{ resetGame(); show('screen-game'); nextDay(true); };
}
