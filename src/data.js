export const START_CASH = 10000;
export const DAYS = 7;

export const STOCKS = ["AAPL","MSFT","NVDA","AMZN","TSLA","META","GOOGL","AMD","NFLX","CRM","SHOP","UBER"];

export const HEADLINES = {
  good:[
    'Earnings beat; guidance raised',
    'Major partnership announced',
    'Regulatory approval clears key product',
    'Strong demand drives shipment growth',
    'Analyst upgrades to Buy with higher target'
  ],
  neutral:[
    'Mixed earnings; outlook reiterates',
    'Product launch as expected',
    'Sector rotates; fundamentals unchanged',
    'Company reaffirms long-term plan',
    'Market digesting prior gains'
  ],
  bad:[
    'Earnings miss; outlook trimmed',
    'Regulatory probe opens',
    'Key product delayed',
    'Supply constraints hit margins',
    'Analyst downgrades to Hold/Sell'
  ]
};

// Kid-friendly feedback tuning
export const SENTIMENT = {
  good:   { mu: 0.014, sigma: 0.022 },
  neutral:{ mu: 0.001, sigma: 0.013 },
  bad:    { mu: -0.013, sigma: 0.027 }
};

// Penny's daily market briefings
export const BRIEFINGS = [
  "Tech stocks have been rallying, but a Fed speech later could shake things up—be cautious today.",
  "Energy looks steady; growth names might bounce, but watch for surprises in guidance.",
  "Markets feel sleepy—sideways is okay! Small wins add up over a week.",
  "Lots of earnings chatter. Beats can pop; misses can sting. Pick with the headline.",
  "Rate jitters in the air. Safer picks might shine more than usual.",
  "Momentum day? Maybe. But momentum cuts both ways—helmet on!",
  "Mixed signals everywhere. Use the clues you have and keep boosts handy."
];


export const CUSTOMS = [
  {id:'shades', name:'Cool Shades Penny', icon:'😎', price:200, desc:'Stylish & smart.'},
  {id:'wizard', name:'Wizard Penny', icon:'🪄', price:400, desc:'Magically curious.'},
  {id:'astro',  name:'Astronaut Penny', icon:'🚀', price:800, desc:'To the moon? Maybe.'},
];

export const BOOSTS = [
  {id:'peek', name:'Peek at Odds', icon:'🔍', price:50,  desc:'Reveal odds on a card.'},
  {id:'double', name:'Double Return', icon:'✨', price:100, desc:'If up, doubles; if down, halves.'},
  {id:'ins', name:'Loss Insurance', icon:'🛡️', price:75,  desc:'If loss, set to 0%.'}
];
