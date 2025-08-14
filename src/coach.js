import { $, fmtPct } from './ui.js';
import { on } from './bus.js';
import { BRIEFINGS } from './data.js';

const bubble = $('#coach-bubble');

function say(text){ bubble.textContent = text; }

on('day:start', d => {
  const msg = BRIEFINGS[(d-1) % BRIEFINGS.length];
  say(msg);
});

on('boost:used', ({type}) => {
  if(type==='peek')  say("Smart peek! Use clues, not guesses.");
  if(type==='double')say("Smart move! That double return might pay off.");
  if(type==='ins')   say("Shield up! Insurance can block a bad dip.");
});

on('pick:made', ({sentiment, r, used}) => {
  if(sentiment==='bad'){
    say("That’s risky! Sometimes contrarians win big, sometimes not.");
    return;
  }
  if(used?.double){ say("Smart move! That double return might pay off."); return; }
  if(used?.ins){ say("Protected! Insurance keeps nasty drops at bay."); return; }
  say(r >= 0 ? "Nice! The headline tailwind helped today." : "Tough break. Headlines tilt odds—not guarantees.");
});

export function pennySayExplicit(text){ say(text); } // optional external use
