// data.js — Expanded learning content, stocks, sectors, headlines, macro events, and concepts

// ===== Game scale =====
export const START_CASH = 1000;
export const DAYS = 7;

// ===== Stock universe =====
// Core large caps + kid-recognizable brands across sectors (variety every playthrough)
export const STOCKS = [
  // Tech
  "AAPL","MSFT","NVDA","AMD","CRM","ADBE","INTC","AVGO",
  // Consumer Discretionary
  "AMZN","TSLA","NFLX","SHOP","NKE","SBUX","DIS","UBER",
  // Communication Services
  "META","GOOGL","VZ","T","SPOT","EA",
  // Consumer Staples
  "WMT","TGT","KO","PEP","PG","COST",
  // Healthcare
  "JNJ","PFE","UNH","LLY","ABT",
  // Financials
  "JPM","V","MA","BAC","AXP","PYPL",
  // Energy / Industrials / Utilities
  "XOM","CVX","COP","CAT","BA","GE","NEE","SO",
];

// ===== Headlines =====
// General pools (used when a sector-specific pool is not available)
export const HEADLINES = {
  good: [
    "Earnings beat; guidance raised",
    "Major partnership announced",
    "Regulatory approval clears key product",
    "Strong demand drives shipment growth",
    "Analyst upgrades to Buy with higher target",
    "New product sees record pre-orders",
    "Cost-cutting plan boosts margins",
    "International expansion ahead of schedule",
    "Debt reduced; credit outlook improved",
    "User growth accelerates; churn improves",
  ],
  neutral: [
    "Mixed earnings; outlook reiterates",
    "Product launch as expected",
    "Sector rotates; fundamentals unchanged",
    "Company reaffirms long-term plan",
    "Market digesting prior gains",
    "Seasonality in focus; results inline",
    "Management reiterates capital plan",
    "No major surprises at investor day",
    "Macro steady; company stays the course",
    "Pricing unchanged; volumes stable",
  ],
  bad: [
    "Earnings miss; outlook trimmed",
    "Regulatory probe opens",
    "Key product delayed",
    "Supply constraints hit margins",
    "Analyst downgrades to Hold/Sell",
    "Cybersecurity incident under investigation",
    "Input costs jump; margin pressure",
    "Labor strike disrupts operations",
    "Currency strength weighs on exports",
    "Inventory build prompts discounting",
  ],
};

// Sector-targeted headlines; each entry adds flavor & learning hooks
export const HEADLINES_SECTOR = {
  Tech: {
    good: [
      "AI chip orders surge on new data center wins",
      "Cloud revenue climbs on enterprise migrations",
      "Developer conference showcases breakthrough tools",
      "Subscription software renewals exceed plan",
    ],
    neutral: [
      "PC shipments normalize after prior spike",
      "Cloud growth stable; pricing unchanged",
      "App store trends steady week over week",
    ],
    bad: [
      "Chip shortage returns for legacy nodes",
      "Export controls limit sales to key region",
      "Major outage triggers customer credits",
    ],
  },
  Consumer: {
    good: [
      "Holiday sales top forecasts; traffic strong",
      "Loyalty program boosts repeat purchases",
      "Same-store sales rise on higher basket size",
    ],
    neutral: [
      "Promotions offset inflation; margins steady",
      "Consumer confidence flat; demand unchanged",
    ],
    bad: [
      "Competition launches aggressive pricing",
      "Supply chain delays limit inventory",
      "Foot traffic slows in key markets",
    ],
  },
  Staples: {
    good: [
      "Grocery sales climb; coupons drive traffic",
      "Private label mix balanced; margins hold",
      "Input costs ease; prices steady",
    ],
    neutral: [
      "Promo calendar aligned with last year",
      "Volumes stable; pricing unchanged",
    ],
    bad: [
      "Private label gains pressure brands",
      "Commodity spike lifts packaging costs",
    ],
  },
  Healthcare: {
    good: [
      "Drug trial meets primary endpoint",
      "FDA approval for new therapy",
      "Insurance coverage expands for treatment",
    ],
    neutral: [
      "Pipeline update mixed; timelines maintained",
      "Procedure volumes normalizing",
    ],
    bad: [
      "Patent challenge threatens exclusivity",
      "Reimbursement cuts proposed",
      "Safety review delays launch",
    ],
  },
  Financials: {
    good: [
      "Rates rise widens bank margins",
      "Card spend grows double digits",
      "Delinquencies trend lower",
    ],
    neutral: [
      "Fed steady; margins unchanged",
      "Trading revenue mixed; fees stable",
    ],
    bad: [
      "Credit losses tick up",
      "Regulator fines big bank",
      "Deposits shift to higher-yield accounts",
    ],
  },
  Energy: {
    good: [
      "Oil prices jump on supply cut",
      "Refinery back online boosts output",
      "LNG contracts locked at higher prices",
    ],
    neutral: [
      "OPEC steady; demand outlook unchanged",
      "Hedging protects near-term cash flow",
    ],
    bad: [
      "Oil drops on demand fears",
      "Storm shuts Gulf platforms",
      "New methane rules increase costs",
    ],
  },
  Industrials: {
    good: [
      "Backlog rises on infrastructure orders",
      "Supply chain bottlenecks ease",
      "Fleet upgrade cycle accelerates",
    ],
    neutral: [
      "Freight rates steady; volumes consistent",
      "Bookings inline with seasonality",
    ],
    bad: [
      "Strike disrupts factory output",
      "Materials inflation squeezes margins",
    ],
  },
  Utilities: {
    good: [
      "Regulator approves rate case",
      "Renewable projects come online",
    ],
    neutral: [
      "Weather-normalized demand steady",
      "Fuel costs fully recovered in rates",
    ],
    bad: [
      "Storm damage increases expenses",
      "Heat wave drives peak costs",
    ],
  },
  CommServ: {
    good: [
      "Ad market rebound lifts revenue",
      "Subscriber additions beat estimates",
    ],
    neutral: [
      "Watch time stable; ad load unchanged",
      "Content slate on schedule",
    ],
    bad: [
      "Content spend rises; ARPU pressured",
      "Regulatory scrutiny on app store fees",
    ],
  },
};

// ===== Missions (optional hooks for future gamification) =====
export const MISSIONS = [
  { id:"defensive", text:"Pick a defensive sector (Staples/Utilities).", check:(t)=>["Staples","Utilities"].includes(STOCK_META[t]?.sector), reward:8 },
  { id:"rate_sensitive", text:"Pick a company helped by rising rates (Financials).", when:"fed_hike", check:(t)=>STOCK_META[t]?.sector==="Financials", reward:8 },
  { id:"oil_logic", text:"If oil dips, pick a sector that benefits.", when:"oil_dip", check:(t)=>["Consumer","Industrials"].includes(STOCK_META[t]?.sector), reward:8 },
];

// ===== Cash meta (future use) =====
export const CASH = { ticker: "CASH", name: "Cash", mu: 0.0005, sigma: 0.0001, icon: "💵" };

// ===== Macro events with learning bites =====
export const EVENTS = [
  { id:"cpi_hot",   title:"Inflation Came In Hot",  icon:"🔥", note:"Prices rose faster than expected.", teach:"When inflation runs hot, borrowing costs can rise and shoppers pull back. Banks often benefit; growth stocks can wobble." },
  { id:"cpi_cool",  title:"Inflation Cooled",       icon:"❄️", note:"Prices rose slower than expected.", teach:"Cooler inflation can help growth stocks and ease costs for many companies." },
  { id:"fed_hike",  title:"Fed Hikes Rates",        icon:"🏦", note:"Borrowing gets pricier.", teach:"Higher rates help bank lending margins but can slow housing and big-ticket purchases." },
  { id:"fed_cut",   title:"Fed Cuts Rates",         icon:"🪂", note:"Borrowing gets cheaper.", teach:"Cheaper loans can boost spending; bank margins may narrow." },
  { id:"oil_spike", title:"Oil Prices Spike",       icon:"🛢️", note:"Energy costs jump.", teach:"When oil jumps, energy profits can rise while transport and retailers may face higher costs." },
  { id:"oil_dip",   title:"Oil Prices Dip",         icon:"🛢️", note:"Energy costs fall.", teach:"Cheaper fuel can help airlines, shippers, and shoppers—but can hurt oil producers." },
  { id:"jobs_hot",  title:"Jobs Report: Hot",       icon:"💼", note:"Hiring strong; wages up.", teach:"Strong hiring can signal growth but also add inflation pressure." },
  { id:"jobs_cool", title:"Jobs Report: Cool",      icon:"🧊", note:"Hiring slows.", teach:"Cooling jobs can ease inflation but may signal slower growth." },
  { id:"usd_strong",title:"Dollar Strengthens",     icon:"💵", note:"US currency jumps.", teach:"A strong dollar makes US exports pricier; importers can benefit from cheaper inputs." },
  { id:"usd_weak",  title:"Dollar Weakens",         icon:"💵", note:"US currency slips.", teach:"A weaker dollar helps exporters; imported goods can cost more." },
];

export const EVENT_RULES = {
  cpi_hot:  { Tech:-0.002, Consumer:-0.002, Financials:+0.002, Staples:+0.001, Utilities:+0.001 },
  cpi_cool: { Tech:+0.002, Consumer:+0.002, Financials:-0.001 },
  fed_hike: { Financials:+0.002, Tech:-0.002, Consumer:-0.001, Utilities:+0.001 },
  fed_cut:  { Tech:+0.002, Consumer:+0.002, Financials:-0.001 },
  oil_spike:{ Energy:+0.003, Consumer:-0.002, Industrials:-0.001, Utilities:-0.001 },
  oil_dip:  { Energy:-0.002, Consumer:+0.001, Industrials:+0.001 },
  jobs_hot: { Consumer:+0.001, Industrials:+0.001, Financials:+0.001, Tech:-0.001 },
  jobs_cool:{ Consumer:-0.001, Industrials:-0.001, Utilities:+0.001, Staples:+0.001, Tech:+0.0005 },
  usd_strong:{ Industrials:-0.0015, Tech:-0.001, Consumer:+0.0005, Staples:+0.0005 },
  usd_weak: { Industrials:+0.0015, Tech:+0.001, Consumer:-0.0005, Staples:-0.0005 },
};

// ===== Sectors =====
export const SECTORS = {
  Tech:        { icon:"💻", blurb:"Computers, chips, apps, and cloud services.", drivers:["innovation","pricing power","subscriptions"], risks:["regulation","competition","export limits"], metrics:["users","ARPU","gross margin"] },
  Consumer:    { icon:"🛍️", blurb:"Things people want (clothes, gadgets, trips).", drivers:["confidence","promotions","traffic"], risks:["competition","supply chain","trends"], metrics:["same-store sales","tickets","basket size"] },
  Staples:     { icon:"🥤", blurb:"Everyday essentials (food, soap, drinks).", drivers:["steady demand","scale","shelf space"], risks:["commodity costs","private label"], metrics:["volume","pricing","gross margin"] },
  Healthcare:  { icon:"🏥", blurb:"Medicines, devices, and care.", drivers:["trial results","approvals","coverage"], risks:["patents","safety reviews"], metrics:["R&D pipeline","patients","reimbursement"] },
  Financials:  { icon:"🏦", blurb:"Banks, cards, and payments.", drivers:["interest rates","loan growth","spend"], risks:["credit losses","regulation"], metrics:["net interest margin","delinquencies"] },
  Energy:      { icon:"⛽", blurb:"Oil, gas, and power.", drivers:["commodity prices","production","costs"], risks:["storms","policy"], metrics:["barrels/day","hedges","cash flow"] },
  Industrials: { icon:"🏗️", blurb:"Factories, planes, and shipping.", drivers:["backlog","capacity","input costs"], risks:["strikes","fuel","cycles"], metrics:["orders","utilization","margin"] },
  Utilities:   { icon:"⚡", blurb:"Electricity and water.", drivers:["rates allowed","grid demand"], risks:["weather","fuel costs"], metrics:["rate base","load","reliability"] },
  CommServ:    { icon:"📺", blurb:"Media, social, and networks.", drivers:["ad market","subs","engagement"], risks:["content costs","regulation"], metrics:["MAUs","watch time","ARPU"] },
};

// ===== Stock metadata (sector map) =====
export const STOCK_META = {
  // Tech
  AAPL:{sector:"Tech"}, MSFT:{sector:"Tech"}, NVDA:{sector:"Tech"}, AMD:{sector:"Tech"},
  CRM:{sector:"Tech"}, ADBE:{sector:"Tech"}, INTC:{sector:"Tech"}, AVGO:{sector:"Tech"},
  // Consumer Discretionary
  AMZN:{sector:"Consumer"}, TSLA:{sector:"Consumer"}, NFLX:{sector:"Consumer"}, SHOP:{sector:"Consumer"},
  NKE:{sector:"Consumer"}, SBUX:{sector:"Consumer"}, DIS:{sector:"Consumer"}, UBER:{sector:"Consumer"},
  // Comm Services
  META:{sector:"CommServ"}, GOOGL:{sector:"CommServ"}, VZ:{sector:"CommServ"}, T:{sector:"CommServ"}, SPOT:{sector:"CommServ"}, EA:{sector:"CommServ"},
  // Staples
  WMT:{sector:"Consumer"}, TGT:{sector:"Consumer"}, KO:{sector:"Staples"}, PEP:{sector:"Staples"},
  PG:{sector:"Staples"}, COST:{sector:"Staples"},
  // Healthcare
  JNJ:{sector:"Healthcare"}, PFE:{sector:"Healthcare"}, UNH:{sector:"Healthcare"}, LLY:{sector:"Healthcare"}, ABT:{sector:"Healthcare"},
  // Financials
  JPM:{sector:"Financials"}, V:{sector:"Financials"}, MA:{sector:"Financials"}, BAC:{sector:"Financials"}, AXP:{sector:"Financials"}, PYPL:{sector:"Financials"},
  // Energy / Industrials / Utilities
  XOM:{sector:"Energy"}, CVX:{sector:"Energy"}, COP:{sector:"Energy"},
  CAT:{sector:"Industrials"}, BA:{sector:"Industrials"}, GE:{sector:"Industrials"},
  NEE:{sector:"Utilities"}, SO:{sector:"Utilities"},
};

// ===== Company blurbs (kid-friendly; only a subset shown in popovers) =====
export const COMPANY = {
  AAPL:{ name:"Apple", icon:"🍎", blurb:"Phones, computers, and services.", examples:["iPhone","Mac","App Store","iCloud"] },
  MSFT:{ name:"Microsoft", icon:"🪟", blurb:"Software and cloud for work & play.", examples:["Windows","Xbox","Office","Azure"] },
  NVDA:{ name:"NVIDIA", icon:"🤖", blurb:"Graphics and AI chips.", examples:["GeForce","RTX","AI data centers"] },
  AMD:{ name:"AMD", icon:"🎮", blurb:"Chips for PCs, consoles, and servers.", examples:["Ryzen","Radeon","PS5 chips"] },
  AMZN:{ name:"Amazon", icon:"🛒", blurb:"Shopping, fast delivery, and cloud.", examples:["Prime","Alexa","AWS"] },
  TSLA:{ name:"Tesla", icon:"⚡️", blurb:"Electric cars and clean energy.", examples:["Model 3","Superchargers","Powerwall"] },
  GOOGL:{ name:"Google", icon:"🔎", blurb:"Search, ads, Android, cloud.", examples:["Search","YouTube","Gmail","Pixel"] },
  META:{ name:"Meta", icon:"🗨️", blurb:"Social apps and ads.", examples:["Facebook","Instagram","WhatsApp"] },
  NFLX:{ name:"Netflix", icon:"🎬", blurb:"Streaming shows and movies.", examples:["Originals","Subscriptions"] },
  WMT:{ name:"Walmart", icon:"🏬", blurb:"Big-box stores with low prices.", examples:["Grocery","Pickup","Private label"] },
  KO:{ name:"Coca-Cola", icon:"🥤", blurb:"Drinks around the world.", examples:["Coke","Sprite","Fanta"] },
  PG:{ name:"Procter & Gamble", icon:"🧼", blurb:"Everyday household brands.", examples:["Tide","Pampers","Gillette"] },
  JNJ:{ name:"Johnson & Johnson", icon:"💊", blurb:"Healthcare & medicines.", examples:["Pharma","Med devices"] },
  JPM:{ name:"JPMorgan", icon:"🏦", blurb:"Banking and credit cards.", examples:["Loans","Cards","Investing"] },
  XOM:{ name:"ExxonMobil", icon:"🛢️", blurb:"Oil & gas production.", examples:["Upstream","Refining","Chemicals"] },
  CAT:{ name:"Caterpillar", icon:"🚜", blurb:"Big machines for building.", examples:["Excavators","Engines"] },
  NEE:{ name:"NextEra Energy", icon:"🌬️", blurb:"Electricity with renewables.", examples:["Wind","Solar","Utilities"] },
};

// ===== Sentiment tuning =====
export const SENTIMENT = {
  good:   { mu: 0.014,  sigma: 0.022 },
  neutral:{ mu: 0.001,  sigma: 0.013 },
  bad:    { mu: -0.013, sigma: 0.027 },
};

// ===== Penny briefings (optional flavor) =====
export const BRIEFINGS = [
  "Tech is lively, but a Fed headline can flip moods fast—helmet on.",
  "Energy steady; growth may bounce, but watch guidance words.",
  "Sideways days are fine—small wins add up.",
  "Earnings chatter everywhere. Beats can pop; misses can sting.",
  "Rates in focus—defensive picks can shine.",
  "Momentum cuts both ways—use boosts wisely.",
  "Mixed signals—follow the clues in headlines.",
];

// ===== Shop (unchanged) =====
export const CUSTOMS = [
  {id:"shades", name:"Cool Shades Penny", icon:"😎", price:200, desc:"Stylish & smart."},
  {id:"wizard", name:"Wizard Penny", icon:"🪄", price:400, desc:"Magically curious."},
  {id:"astro",  name:"Astronaut Penny", icon:"🚀", price:800, desc:"To the moon? Maybe."},
];

export const BOOSTS = [
  {id:"peek",   name:"Peek at Odds",  icon:"🔍", price:50,  desc:"Reveal odds on a card."},
  {id:"double", name:"Double Return", icon:"✨", price:100, desc:"If up, doubles; if down, halves."},
  {id:"ins",    name:"Loss Insurance",icon:"🛡️", price:75,  desc:"If loss, set to 0%."}
];

// ===== Concepts library: short, reusable learning blocks =====
// Keys map to keyword triggers in headlines & events
export const CONCEPTS = {
  earnings: {
    title: "Earnings vs. Expectations",
    what:  "Companies report profits every quarter; stocks move when results beat or miss what people expected.",
    why:   "Prices reflect expectations. Surprises move prices the most.",
    try:   "Next time you see 'beat' or 'miss', ask: was guidance raised or lowered?"
  },
  guidance: {
    title: "Guidance (The Road Ahead)",
    what:  "Guidance is the company’s forecast for future sales/profits.",
    why:   "Future expectations matter even more than last quarter.",
    try:   "Look for words like 'raise', 'lower', or 'reiterate'."
  },
  regulation: {
    title: "Regulation & Fines",
    what:  "Rules from governments can add costs or limit products.",
    why:   "More rules = more risk; clear approvals reduce uncertainty.",
    try:   "If an approval hits, which products can launch faster?"
  },
  supply: {
    title: "Supply & Shortages",
    what:  "Parts and factories must run smoothly to meet demand.",
    why:   "Shortages raise costs and delay sales.",
    try:   "Does the headline mention chips, ports, or weather?"
  },
  demand: {
    title: "Demand & Traffic",
    what:  "Shoppers and users drive sales and subscriptions.",
    why:   "Rising traffic = stronger revenue.",
    try:   "Watch for 'same-store sales' and 'active users'."
  },
  pricing: {
    title: "Pricing Power",
    what:  "Can a company raise prices without losing customers?",
    why:   "Strong brands can protect profit margins.",
    try:   "Are promos rising or falling this quarter?"
  },
  merger: {
    title: "Mergers & Acquisitions",
    what:  "Buying companies can boost growth or create synergies.",
    why:   "But it can add debt or integration risk.",
    try:   "Who benefits most from combining products or data?"
  },
  rates: {
    title: "Interest Rates",
    what:  "Rates change loan costs and savings returns.",
    why:   "Banks often like higher rates; growth stocks prefer lower ones.",
    try:   "Is the story a hike, a cut, or no change?"
  },
  oil: {
    title: "Oil & Fuel Costs",
    what:  "Energy prices affect many businesses.",
    why:   "High oil helps producers but hurts transport/retailers.",
    try:   "Think: Who uses more fuel? Who sells fuel?"
  },
  currency: {
    title: "Strong vs. Weak Dollar",
    what:  "A strong dollar makes exports pricier; a weak one helps exporters.",
    why:   "Global companies feel currency swings in results.",
    try:   "Does the company sell mostly in the US or overseas?"
  },
  cyber: {
    title: "Cybersecurity Incidents",
    what:  "Breaches can disrupt services and trust.",
    why:   "Fixes cost money; outages can lose customers.",
    try:   "Look for 'investigation', 'downtime', or 'credits'."
  },
  labor: {
    title: "Labor & Strikes",
    what:  "People power businesses; strikes pause production.",
    why:   "Higher wages lift costs but can also lift demand.",
    try:   "Is backlog large enough to catch up later?"
  },
};
