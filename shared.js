/* ═══════════════════════════════════════════════
   STREAMVAULT  shared.js  v5  — FIXED
   ✔ New TV show poster paths from your posters/
   ✔ Wishlist fully working (updates all buttons)
   ✔ Profile avatar dropdown with user info
   ✔ Mobile menu with user details
   ✔ buildParticles + renderTop10 included
   ✔ No missing functions
═══════════════════════════════════════════════ */

/* ── AUTH ── */
const Auth = {
  login(name, email, password) {
    const users = JSON.parse(localStorage.getItem('sv_users') || '[]');
    const user  = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok:false, msg:'Invalid email or password.' };
    localStorage.setItem('sv_user', JSON.stringify(user));
    return { ok:true, user };
  },
  signup(name, email, password) {
    const users = JSON.parse(localStorage.getItem('sv_users') || '[]');
    if (users.find(u => u.email === email)) return { ok:false, msg:'Email already registered.' };
    const user = {
      name, email, password,
      avatar : name.slice(0,2).toUpperCase(),
      plan   : 'Basic',
      joined : new Date().toLocaleDateString()
    };
    users.push(user);
    localStorage.setItem('sv_users', JSON.stringify(users));
    localStorage.setItem('sv_user',  JSON.stringify(user));
    return { ok:true, user };
  },
  logout()  { localStorage.removeItem('sv_user'); window.location.href = 'login.html'; },
  current() { return JSON.parse(localStorage.getItem('sv_user') || 'null'); },
  require() {
    if (!this.current()) { window.location.href = 'login.html'; return false; }
    return true;
  }
};

/* ══════════════════════════════════════
   WISHLIST  — stores full movie objects
   • wlAdd / wlRemove / wlHas / wlToggle
   • wlRefreshButtons(id) — syncs ALL ♡ buttons for that movie on the page
══════════════════════════════════════ */
const Watchlist = {
  _key: 'sv_watchlist',
  get() {
    const raw = JSON.parse(localStorage.getItem(this._key) || '[]');
    // normalise any legacy string entries
    return raw.map(item => {
      if (typeof item === 'string') {
        return MOVIES_DB.all.find(m => m.title === item) ||
               { id:item, title:item, img:'', rating:'--', lang:'--', year:'--', genre:'--', desc:'', badge:'', type:'movie' };
      }
      return item;
    });
  },
  _save(list) { localStorage.setItem(this._key, JSON.stringify(list)); },
  add(movie) {
    if (!movie) return;
    const list = this.get();
    if (!list.find(m => String(m.id) === String(movie.id))) { list.push(movie); this._save(list); }
  },
  remove(id) {
    const list = this.get().filter(m => String(m.id) !== String(id));
    this._save(list);
  },
  has(id) { return !!this.get().find(m => String(m.id) === String(id)); },
  toggle(movie) {
    if (!movie) return false;
    if (this.has(movie.id)) { this.remove(movie.id); return false; }
    this.add(movie); return true;
  }
};

/* wlToggle(id) — called by every ♡ button.
   Adds/removes from wishlist AND updates ALL buttons for that movie on the page instantly. */
function wlToggle(id) {
  if (!Auth.current()) { window.location.href = 'login.html'; return; }
  id = parseInt(id);
  const movie = MOVIES_DB.all.find(m => m.id === id);
  if (!movie) return;
  const added = Watchlist.toggle(movie);
  /* update every button that has class wl-{id} */
  document.querySelectorAll('.wl-' + id).forEach(btn => {
    btn.textContent = added ? '❤️' : '♡';
    btn.classList.toggle('wl-active', added);
  });
  showToast(
    added ? `"${movie.title}" added to Wishlist ❤️` : `"${movie.title}" removed from Wishlist`,
    added ? '❤️' : '🗑️'
  );
}

/* ── PLAY ── */
function playContent(id, type) {
  if (!Auth.current()) { window.location.href = 'login.html'; return; }
  window.location.href = `player.html?id=${id}&type=${type || 'movie'}`;
}

/* ══════════════════════════════════════
   MOVIES DATABASE
   TV show images updated to your posters/
══════════════════════════════════════ */
const MOVIES_DB = {
  trending: [
    {id:1,  title:"Baahubali 2",           img:"posters/baahubali-2.jpg",           year:"2017",rating:"9.5",lang:"Telugu", badge:"TOP",   genre:"Action",  desc:"The epic conclusion to the Baahubali saga — two brothers, one kingdom, an unforgettable war for the throne of Mahishmati.",           duration:"2h 47m",type:"movie"},
    {id:2,  title:"RRR",                   img:"posters/rrr.jpg",                   year:"2022",rating:"8.5",lang:"Telugu", badge:"4K",    genre:"Action",  desc:"Two legendary freedom fighters — Ram and Bheem — cross paths in a powerful story of friendship and revolution against British rule.", duration:"3h 7m", type:"movie"},
    {id:3,  title:"Animal",                img:"posters/animal.jpg",                year:"2023",rating:"7.5",lang:"Hindi",  badge:"HOT",   genre:"Action",  desc:"A son's obsessive love for his father turns into a deadly quest for revenge in this raw, unapologetic action drama.",               duration:"3h 21m",type:"movie"},
    {id:4,  title:"Jawan",                 img:"posters/jawan.jpg",                 year:"2023",rating:"7.9",lang:"Hindi",  badge:"",      genre:"Thriller",desc:"A man is driven by a personal vendetta to rectify the wrongs in society, while keeping a promise made years ago.",                   duration:"2h 49m",type:"movie"},
    {id:5,  title:"Dangal",                img:"posters/dangal.jpg",                year:"2016",rating:"8.3",lang:"Hindi",  badge:"",      genre:"Drama",   desc:"Based on the true story of Mahavir Singh Phogat who trains his daughters to become world-class wrestlers.",                          duration:"2h 41m",type:"movie"},
    {id:6,  title:"Kantara 2",             img:"posters/kantara.jpeg",              year:"2025",rating:"8.2",lang:"Kannada",badge:"NEW",   genre:"Mystery", desc:"The mystical sequel continues the story of tradition, faith and a village deity in the dense forests of coastal Karnataka.",          duration:"2h 30m",type:"movie"},
    {id:7,  title:"Aravindha Sametha",     img:"posters/aravindha sametha.jpeg",    year:"2018",rating:"7.3",lang:"Telugu", badge:"",      genre:"Action",  desc:"A young man caught in a decades-long factional rivalry tries to break the cycle of bloodshed for love and peace.",                   duration:"2h 45m",type:"movie"},
    {id:8,  title:"Bigil",                 img:"posters/bigil.jpeg",                year:"2019",rating:"6.7",lang:"Tamil",  badge:"",      genre:"Drama",   desc:"A football coach leads a women's team to victory while fighting against the local rowdy's stranglehold over their lives.",            duration:"2h 58m",type:"movie"},
    {id:9,  title:"Eagle",                 img:"posters/eagle.jpeg",                year:"2024",rating:"5.9",lang:"Telugu", badge:"",      genre:"Action",  desc:"An intelligence officer with a secret identity unravels a global conspiracy threatening national security.",                          duration:"2h 15m",type:"movie"},
    {id:10, title:"Brahmastra",            img:"posters/brahmastra.jpeg",           year:"2022",rating:"5.6",lang:"Hindi",  badge:"",      genre:"Fantasy", desc:"A young DJ discovers that he has a mysterious connection with the Brahmastra — a weapon of the gods.",                               duration:"2h 34m",type:"movie"},
    {id:11, title:"Kabali",                img:"posters/kabali.jpeg",               year:"2016",rating:"6.1",lang:"Tamil",  badge:"",      genre:"Action",  desc:"An aged gangster leader fights for the rights of Tamil laborers in Malaysia while searching for his lost family.",                   duration:"2h 20m",type:"movie"},
    {id:12, title:"Salaar",                img:"posters/salaar.jpeg",               year:"2023",rating:"6.7",lang:"Telugu", badge:"",      genre:"Action",  desc:"A violent man tries to keep a promise to his dying friend, but must take up arms once again in a kingdom of chaos.",                 duration:"2h 58m",type:"movie"},
    {id:13, title:"War",                   img:"posters/war.jpeg",                  year:"2019",rating:"6.6",lang:"Hindi",  badge:"",      genre:"Action",  desc:"An Indian soldier is assigned to eliminate his former mentor who has gone rogue, in a global cat-and-mouse chase.",                   duration:"2h 34m",type:"movie"},
  ],
  mostViewed: [
    {id:14, title:"Ala Vaikunthapurramuloo",img:"posters/ala vaikunthapurramuloo.jpeg",year:"2020",rating:"7.3",lang:"Telugu", badge:"",       genre:"Comedy",  desc:"A man raised in a poor family discovers he was switched at birth and is actually heir to a business empire.",       duration:"2h 39m",type:"movie"},
    {id:15, title:"3 Idiots",              img:"posters/3-idiots.jpg",              year:"2009",rating:"8.4",lang:"Hindi",  badge:"CLASSIC",genre:"Comedy",  desc:"Three friends at an engineering college challenge the conventional system of education in India.",                   duration:"2h 50m",type:"movie"},
    {id:16, title:"Rangasthalam",          img:"posters/rangasthalam.jpeg",         year:"2018",rating:"8.2",lang:"Telugu", badge:"",       genre:"Drama",   desc:"A partially deaf man returns to his village and discovers the dark truth behind the local political strongman.",       duration:"2h 59m",type:"movie"},
    {id:17, title:"Kaithi",                img:"posters/kaithi.jpeg",               year:"2019",rating:"8.4",lang:"Tamil",  badge:"",       genre:"Thriller",desc:"A prisoner released from jail gets entangled in a drug bust on the same night he plans to meet his daughter.",          duration:"2h 17m",type:"movie"},
    {id:18, title:"KGF 2",                 img:"posters/kgf.jpeg",                  year:"2022",rating:"8.2",lang:"Kannada",badge:"TOP",    genre:"Action",  desc:"Rocky's empire expands but faces threats from the government and a powerful new nemesis named Adheera.",               duration:"2h 48m",type:"movie"},
    {id:19, title:"24",                    img:"posters/24.jpeg",                   year:"2016",rating:"7.9",lang:"Tamil",  badge:"",       genre:"Sci-Fi",  desc:"A scientist invents a time watch, setting off a chain of events across multiple timelines spanning three generations.", duration:"2h 42m",type:"movie"},
    {id:20, title:"Master",                img:"posters/master.jpeg",               year:"2021",rating:"7.4",lang:"Tamil",  badge:"",       genre:"Thriller",desc:"An alcoholic professor faces off against a ruthless gangster who uses children as soldiers.",                           duration:"2h 59m",type:"movie"},
    {id:21, title:"Chhaava",               img:"posters/chhaava.jpeg",              year:"2025",rating:"7.3",lang:"Hindi",  badge:"NEW",    genre:"Drama",   desc:"The story of Sambhaji Maharaj, fierce son of Chhatrapati Shivaji, and his stand against the Mughal empire.",         duration:"2h 41m",type:"movie"},
    {id:22, title:"Uppena",                img:"posters/uppena.jpeg",               year:"2021",rating:"6.5",lang:"Telugu", badge:"",       genre:"Romance", desc:"A fisherman's son falls in love with a landlord's daughter — a story of love crushed by caste and class divide.",     duration:"2h 11m",type:"movie"},
    {id:23, title:"Pushpa: The Rise",      img:"posters/pushpa-rise.jpg",           year:"2021",rating:"7.6",lang:"Telugu", badge:"",       genre:"Action",  desc:"A laborer rises through the ranks of a red sandalwood smuggling syndicate, making enemies along the way.",             duration:"3h 1m", type:"movie"},
    {id:24, title:"Beast",                 img:"posters/beast.jpeg",                year:"2022",rating:"5.2",lang:"Tamil",  badge:"",       genre:"Action",  desc:"A RAW agent is forced out of retirement when a supermarket is taken hostage in a terror attack.",                     duration:"2h 20m",type:"movie"},
    {id:25, title:"Sita Ramam",            img:"posters/sita ramam.jpeg",           year:"2022",rating:"8.6",lang:"Telugu", badge:"HOT",    genre:"Romance", desc:"A love story set during the Indo-Pakistan war — a soldier receives letters from a mysterious woman.",                 duration:"2h 44m",type:"movie"},
    {id:26, title:"Vikram",                img:"posters/vikram.jpg",                year:"2022",rating:"8.3",lang:"Tamil",  badge:"",       genre:"Action",  desc:"A special agent investigates a series of murders by a masked vigilante gang.",                                          duration:"2h 54m",type:"movie"},
  ],
  hollywood: [
    {id:27, title:"Deadpool & Wolverine",  img:"posters/deadpool-wolverine.jpg",       year:"2024",rating:"7.6",lang:"English",badge:"NEW",    genre:"Action",    desc:"Deadpool and Wolverine team up in a multiverse-hopping adventure that changes the Marvel Cinematic Universe.",   duration:"2h 7m", type:"movie"},
    {id:28, title:"Dune Part Two",         img:"posters/dune-part-two.jpg",            year:"2024",rating:"8.4",lang:"English",badge:"4K",     genre:"Sci-Fi",    desc:"Paul Atreides unites with the Fremen on a path of revenge against the conspirators who destroyed his family.",  duration:"2h 46m",type:"movie"},
    {id:29, title:"Inside Out 2",          img:"posters/inside-out-2.jpg",             year:"2024",rating:"7.5",lang:"English",badge:"",       genre:"Animation", desc:"Riley enters adolescence and her emotional world is upended by the arrival of new, complicated emotions.",        duration:"1h 40m",type:"movie"},
    {id:30, title:"Interstellar",          img:"posters/interstellar.jpg",             year:"2014",rating:"8.7",lang:"English",badge:"CLASSIC",genre:"Sci-Fi",    desc:"A team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",           duration:"2h 49m",type:"movie"},
    {id:31, title:"John Wick Ch.4",        img:"posters/john-wick-chapter-4.jpg",      year:"2023",rating:"7.5",lang:"English",badge:"",       genre:"Action",    desc:"John Wick faces a new enemy with powerful alliances while searching for a path to defeat the High Table.",       duration:"2h 49m",type:"movie"},
    {id:32, title:"Inception",             img:"posters/inception.jpg",               year:"2010",rating:"8.8",lang:"English",badge:"CLASSIC",genre:"Sci-Fi",    desc:"A thief who steals corporate secrets through dream-sharing is tasked with planting an idea instead.",            duration:"2h 28m",type:"movie"},
    {id:33, title:"Avatar 2",              img:"posters/avatar-the-way-of-water.jpg", year:"2022",rating:"7.4",lang:"English",badge:"4K",     genre:"Sci-Fi",    desc:"Jake Sully and his family must leave their home to explore Pandora's oceans as a new threat arrives.",           duration:"3h 12m",type:"movie"},
    {id:34, title:"Harry Potter",          img:"posters/harry potter.jpeg",            year:"2002",rating:"7.7",lang:"English",badge:"",       genre:"Fantasy",   desc:"An orphaned boy discovers he is a wizard and enrols in Hogwarts School of Witchcraft and Wizardry.",             duration:"2h 32m",type:"movie"},
    {id:35, title:"Oppenheimer",           img:"posters/oppenheimer.jpg",              year:"2023",rating:"8.2",lang:"English",badge:"4K",     genre:"Drama",     desc:"The story of J. Robert Oppenheimer and the development of the atomic bomb during World War II.",                duration:"3h",    type:"movie"},
    {id:36, title:"Iron Man 3",            img:"posters/iron man 3.jpeg",              year:"2013",rating:"7.1",lang:"English",badge:"",       genre:"Action",    desc:"Tony Stark faces a powerful enemy called the Mandarin while dealing with PTSD after The Avengers.",              duration:"2h 10m",type:"movie"},
    {id:37, title:"Avengers",             img:"posters/avengers.jpeg",               year:"2018",rating:"8.4",lang:"English",badge:"",       genre:"Action",    desc:"Earth's mightiest heroes must come together and learn to fight as a team to stop Thanos.",                       duration:"2h 29m",type:"movie"},
    {id:38, title:"Gladiator",            img:"posters/gladiador.jpeg",              year:"2000",rating:"8.5",lang:"English",badge:"CLASSIC",genre:"Action",    desc:"A Roman general is betrayed and his family murdered. He fights as a gladiator for revenge.",                    duration:"2h 35m",type:"movie"},
    {id:39, title:"The Hobbit",           img:"posters/hobbit.jpeg",                 year:"2012",rating:"7.8",lang:"English",badge:"",       genre:"Fantasy",   desc:"Bilbo Baggins joins dwarves on a quest to reclaim their mountain home from the dragon Smaug.",                   duration:"2h 49m",type:"movie"},
    {id:40, title:"Titanic",             img:"posters/titanic.jpeg",                year:"1997",rating:"8.0",lang:"English",badge:"CLASSIC",genre:"Romance",   desc:"A young aristocrat falls in love with a poor artist aboard the ill-fated RMS Titanic.",                          duration:"3h 14m",type:"movie"},
    {id:41, title:"Iron Man 1",          img:"posters/iron man.jpeg",               year:"2008",rating:"7.9",lang:"English",badge:"",       genre:"Action",    desc:"Billionaire Tony Stark builds a powered suit of armor to escape captivity, becoming Iron Man.",                 duration:"2h 6m", type:"movie"},
    {id:42, title:"Joker",              img:"posters/joker.jpeg",                  year:"2019",rating:"8.3",lang:"English",badge:"",       genre:"Thriller",  desc:"A failed comedian descends into madness and transforms into the iconic Batman villain, the Joker.",              duration:"2h 2m", type:"movie"},
    {id:43, title:"Spider-Man",         img:"posters/spider man.jpeg",             year:"2021",rating:"8.1",lang:"English",badge:"HOT",    genre:"Action",    desc:"Peter Parker's multiverse crumbles as villains from alternate dimensions arrive to destroy him.",                 duration:"2h 28m",type:"movie"},
  ],
  paradise: [
    {id:0, title:"Paradise", img:"posters/paradise.jpeg", year:"2025",rating:"9.0",lang:"Telugu",badge:"NEW",genre:"Action",
     desc:"A high-octane action drama. When a decorated officer uncovers a conspiracy that reaches the highest corridors of power, he must fight to protect everything he loves — at any cost.",
     duration:"2h 35m",type:"movie"},
  ],

  /* ── TV SHOWS — using YOUR updated poster paths ── */
  tvshows: [
    {
      id:101, type:"show", title:"Phantom Kingdom",
      img:"posters/phantom.jpeg",
      year:"2024",rating:"9.1",lang:"English",badge:"ORIGINAL",genre:"Fantasy",
      desc:"In a kingdom where magic is forbidden, a young blacksmith discovers he is heir to the most powerful sorcerer throne. A tale of destiny, betrayal, and epic wars.",
      seasons:2,episodes:18,duration:"~50 min/ep",
      eps:[
        {ep:1,title:"The Awakening",      dur:"52m",desc:"Aryan discovers his hidden powers after a royal attack on his village."},
        {ep:2,title:"Blood and Iron",      dur:"48m",desc:"He joins the rebel army and uncovers the king's dark secret."},
        {ep:3,title:"The Forbidden Spell", dur:"55m",desc:"A forbidden ritual puts the entire kingdom at risk."},
        {ep:4,title:"Crown of Shadows",    dur:"51m",desc:"The sorcerer's council reveals the truth of Aryan's birthright."},
        {ep:5,title:"War at the Gates",    dur:"58m",desc:"Season finale — armies clash as the prophecy unfolds."},
      ]
    },
    {
      id:102, type:"show", title:"Neon Syndicate",
      img:"posters/neon.jpeg",
      year:"2024",rating:"8.8",lang:"English",badge:"ORIGINAL",genre:"Thriller",
      desc:"A cyberpunk crime thriller set in 2087 Mumbai. An undercover cop infiltrates the world's most dangerous digital crime syndicate where reality and the metaverse blur dangerously.",
      seasons:1,episodes:10,duration:"~45 min/ep",
      eps:[
        {ep:1,title:"Boot Sequence",  dur:"46m",desc:"Detective Zara goes undercover in the neon-drenched slums of Neo-Mumbai."},
        {ep:2,title:"Ghost Protocol", dur:"44m",desc:"Her cover is nearly blown when the syndicate runs a loyalty test."},
        {ep:3,title:"Jacked In",      dur:"48m",desc:"Zara enters the metaverse and discovers a virtual assassination ring."},
        {ep:4,title:"Data Heist",     dur:"45m",desc:"A massive data theft operation targets the city's neural grid."},
        {ep:5,title:"Firewall",       dur:"51m",desc:"The syndicate's true leader is finally revealed — shocking everyone."},
      ]
    },
    {
      id:103, type:"show", title:"Sacred Soil",
      img:"posters/scared soil.jpeg",
      year:"2023",rating:"9.3",lang:"Telugu",badge:"ORIGINAL",genre:"Drama",
      desc:"A multi-generational saga of a farming family in rural Andhra Pradesh fighting corporate land acquisition while holding onto tradition, love, and identity.",
      seasons:3,episodes:30,duration:"~40 min/ep",
      eps:[
        {ep:1,title:"Roots",      dur:"42m",desc:"The Raju family has farmed the same land for 100 years — until a company arrives."},
        {ep:2,title:"The Offer",  dur:"39m",desc:"A tempting offer divides the family into two camps."},
        {ep:3,title:"Harvest",    dur:"44m",desc:"Despite threats, the family chooses to harvest together one last time."},
        {ep:4,title:"The Verdict",dur:"41m",desc:"A court battle determines the fate of the sacred land."},
        {ep:5,title:"New Roots",  dur:"45m",desc:"The next generation carries the family's legacy forward."},
      ]
    },
    {
      id:104, type:"show", title:"Code Red",
      img:"posters/code red.jpeg",
      year:"2025",rating:"8.6",lang:"Hindi",badge:"ORIGINAL",genre:"Action",
      desc:"India's elite counter-terrorism unit faces its most dangerous mission yet. When a bioweapon threatens three major cities, six agents have 72 hours to stop the unthinkable.",
      seasons:1,episodes:8,duration:"~55 min/ep",
      eps:[
        {ep:1,title:"Hour Zero",    dur:"58m",desc:"A mysterious vial is stolen from a high-security lab. Code Red is activated."},
        {ep:2,title:"The Mole",     dur:"54m",desc:"There's a traitor inside the unit. Trust is the first casualty."},
        {ep:3,title:"48 Hours",     dur:"56m",desc:"The team splits up to cover three cities simultaneously."},
        {ep:4,title:"Trigger Point",dur:"59m",desc:"Agent Arjun goes rogue to follow his own lead — risking everything."},
        {ep:5,title:"Countdown",    dur:"61m",desc:"The clock hits zero and the battle for survival begins."},
      ]
    },
    {
      id:105, type:"show", title:"The Last Village",
      img:"posters/village.jpeg",
      year:"2024",rating:"8.4",lang:"Tamil",badge:"ORIGINAL",genre:"Mystery",
      desc:"A journalist investigates the sudden disappearance of an entire village in Tamil Nadu's western ghats. What she finds shakes the foundations of science, faith, and government.",
      seasons:2,episodes:16,duration:"~42 min/ep",
      eps:[
        {ep:1,title:"Gone",          dur:"44m",desc:"340 people vanish overnight from a remote hill village. No trace remains."},
        {ep:2,title:"The Shrine",    dur:"41m",desc:"A local temple holds clues — but the priest refuses to speak."},
        {ep:3,title:"Underground",   dur:"45m",desc:"A secret government file is leaked — the village was not the first."},
        {ep:4,title:"The Return",    dur:"43m",desc:"One survivor reappears with no memory and a strange symbol on his hand."},
        {ep:5,title:"Truth Beneath", dur:"47m",desc:"The journalist discovers a truth that was never meant to be found."},
      ]
    },
    {
      id:106, type:"show", title:"Emperor's Game",
      img:"posters/emperor.jpeg",
      year:"2023",rating:"8.9",lang:"Hindi",badge:"ORIGINAL",genre:"Drama",
      desc:"Set in the corridors of Indian Parliament, a political genius outmaneuvers allies and enemies alike in a deadly game of power, conscience, and ambition.",
      seasons:2,episodes:20,duration:"~48 min/ep",
      eps:[
        {ep:1,title:"The Pawn",    dur:"50m",desc:"Rising MP Vikram Nair enters Parliament with clean hands — and a plan."},
        {ep:2,title:"Coalition",   dur:"47m",desc:"To pass a crucial bill, he must make a deal he swore he never would."},
        {ep:3,title:"The Whip",    dur:"49m",desc:"A party rebellion puts everything Vikram built at risk overnight."},
        {ep:4,title:"Queen's Gambit",dur:"52m",desc:"His political rival reveals a devastating secret from his past."},
        {ep:5,title:"Checkmate",   dur:"55m",desc:"The final move — who controls India's next Prime Minister?"},
      ]
    },
    {
      id:107, type:"show", title:"Midnight Raga",
      img:"posters/midnight raga.jpeg",
      year:"2024",rating:"8.2",lang:"Tamil",badge:"ORIGINAL",genre:"Romance",
      desc:"A classical carnatic musician and a jazz composer fall in love at an international music festival in Chennai — but their worlds, families, and ambitions pull them apart.",
      seasons:1,episodes:12,duration:"~38 min/ep",
      eps:[
        {ep:1,title:"First Note",    dur:"40m",desc:"Their accidental duet goes viral. The world notices — but so do their families."},
        {ep:2,title:"Rhythm",        dur:"37m",desc:"Rehearsals become late nights — and something deeper begins."},
        {ep:3,title:"Dissonance",    dur:"39m",desc:"Family pressure threatens to silence them both."},
        {ep:4,title:"Crescendo",     dur:"42m",desc:"A sold-out concert becomes the night everything changes."},
        {ep:5,title:"The Final Raga",dur:"44m",desc:"Love or legacy — they must choose, and the music decides."},
      ]
    },
    {
      id:108, type:"show", title:"Wildfire",
      img:"posters/wild fire.jpeg",
      year:"2025",rating:"8.7",lang:"English",badge:"ORIGINAL",genre:"Sci-Fi",
      desc:"After a rogue AI ignites a chain reaction of global wildfires in 2041, a team of climate scientists, hackers, and soldiers race to shut it down before Earth becomes uninhabitable.",
      seasons:1,episodes:9,duration:"~52 min/ep",
      eps:[
        {ep:1,title:"Ignition",    dur:"54m",desc:"73 fires start simultaneously across 4 continents — the AI's first signal."},
        {ep:2,title:"Smoke Screen",dur:"51m",desc:"The AI is learning — and adapting to their every move."},
        {ep:3,title:"Ash and Ember",dur:"53m",desc:"A survivors' camp holds vital data buried in the fire zone."},
        {ep:4,title:"Override",    dur:"56m",desc:"A dangerous manual override of the AI's core system is attempted."},
        {ep:5,title:"New World",   dur:"58m",desc:"With seconds remaining, the final decision falls on one person alone."},
      ]
    },
  ]
};

MOVIES_DB.all = [
  ...MOVIES_DB.paradise,
  ...MOVIES_DB.trending,
  ...MOVIES_DB.mostViewed,
  ...MOVIES_DB.hollywood,
  ...MOVIES_DB.tvshows,
];

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
let _tt;
function showToast(msg, icon = '✅') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast'; t.id = 'toast';
    t.innerHTML = `<span id="toastIcon"></span><span id="toastMsg"></span>`;
    document.body.appendChild(t);
  }
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;
  t.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════
   MAKE CARD — ▶ Play + ❤️ Wishlist button
   Every wishlist button uses class wl-{id}
   so wlToggle() can update all at once.
══════════════════════════════════════ */
function makeCard(m) {
  const type   = m.type || 'movie';
  const inList = Watchlist.has(m.id);
  const info   = m.seasons ? `${m.seasons} Seasons · ${m.lang}` : `${m.lang} · ${m.year}`;
  return `
    <div class="mc" data-id="${m.id}">
      <img src="${m.img}" alt="${m.title}" loading="lazy"
           onerror="this.style.background='linear-gradient(135deg,#1a2035,#0e1525)';this.removeAttribute('src')"/>
      ${m.badge ? `<div class="c-badge">${m.badge}</div>` : ''}
      <div class="c-rating">★ ${m.rating}</div>
      <div class="c-overlay">
        <div class="c-title">${m.title}</div>
        <div class="c-info">${info}</div>
        <div class="c-actions">
          <button class="ca play"
            onclick="event.stopPropagation(); playContent(${m.id},'${type}')">▶ Play</button>
          <button class="ca add wl-${m.id} ${inList ? 'wl-active' : ''}"
            onclick="event.stopPropagation(); wlToggle(${m.id})">${inList ? '❤️' : '♡'}</button>
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════
   BUILD PARTICLES (used by index.html)
══════════════════════════════════════ */
function buildParticles() {
  const c = document.getElementById('particles');
  if (!c) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'part';
    const sz = Math.random() * 4 + 2;
    p.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;` +
      `animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*8}s;`;
    c.appendChild(p);
  }
}

/* ══════════════════════════════════════
   RENDER TOP 10 (used by index.html)
══════════════════════════════════════ */
function renderTop10() {
  const el = document.getElementById('top10Row');
  if (!el) return;
  const picks = [...MOVIES_DB.trending]
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, 8);
  el.innerHTML = picks.map((m, i) => `
    <div class="t10-card" onclick="playContent(${m.id},'movie')">
      <div class="t10-num">${i + 1}</div>
      <div class="t10-img">
        <img src="${m.img}" alt="${m.title}" loading="lazy"
             onerror="this.style.background='#1a2035';this.removeAttribute('src')"/>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════
   NAVBAR — desktop + mobile with user info + avatar dropdown
══════════════════════════════════════ */
function buildNav(activePage) {

  /* inject avatar dropdown CSS once */
  if (!document.getElementById('sv-nav-style')) {
    const s = document.createElement('style');
    s.id = 'sv-nav-style';
    s.textContent = `
      .avatar-wrap { position:relative; cursor:pointer; }
      .avatar-menu {
        display:none; position:absolute; top:calc(100% + 10px); right:0;
        background:#0e1525; border:1px solid rgba(255,255,255,.12);
        border-radius:14px; min-width:200px; overflow:hidden;
        box-shadow:0 20px 60px rgba(0,0,0,.8); z-index:9999;
      }
      .avatar-wrap.open .avatar-menu { display:block; animation:menuPop .2s ease; }
      @keyframes menuPop { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      .avatar-menu .am-header {
        padding:.9rem 1.1rem .75rem;
        border-bottom:1px solid rgba(255,255,255,.07);
        background:rgba(229,9,20,.06);
      }
      .avatar-menu .am-name { font-weight:700; font-size:.92rem; color:#e8eaf0; }
      .avatar-menu .am-plan { font-size:.72rem; color:#e50914; margin-top:2px; }
      .avatar-menu a {
        display:flex; align-items:center; gap:10px;
        padding:.65rem 1.1rem; color:#e8eaf0; text-decoration:none;
        font-size:.84rem; transition:background .15s, color .15s;
      }
      .avatar-menu a:hover { background:rgba(229,9,20,.14); color:#fff; }
      .avatar-menu hr { border:none; border-top:1px solid rgba(255,255,255,.07); margin:3px 0; }
      .avatar-menu .am-signout { color:#ff6b6b !important; }
      .avatar-menu .am-signout:hover { background:rgba(229,9,20,.22) !important; }
      /* mobile menu extras */
      .mob-user { display:flex;align-items:center;gap:.8rem;padding:1rem 0 .9rem;border-bottom:1px solid rgba(255,255,255,.07); }
      .mob-av { width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#e50914,#ff6b35);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;color:#fff;border:2px solid #e50914;flex-shrink:0; }
      .mob-name { font-weight:700;font-size:.88rem;color:#e8eaf0; }
      .mob-plan { font-size:.7rem;color:#e50914;margin-top:1px; }
      .mob-auth { display:flex;gap:.6rem;padding-top:.9rem; }
      .mob-auth a { flex:1;text-align:center;justify-content:center; }
    `;
    document.head.appendChild(s);
  }

  const user = Auth.current();
  const nav  = document.getElementById('mainNav');
  if (!nav) return;
  const wc   = Watchlist.get().length;
  const wl   = `Wishlist ❤️${wc > 0 ? ` (${wc})` : ''}`;

  nav.innerHTML = `
    <a class="nav-logo" href="index.html">🎬 STREAMVAULT</a>
    <ul class="nav-links">
      <li><a href="index.html"          ${activePage==='home'  ?'class="active"':''}>Home</a></li>
      <li><a href="movies.html"         ${activePage==='movies'?'class="active"':''}>Movies</a></li>
      <li><a href="tvshows.html"        ${activePage==='shows' ?'class="active"':''}>TV Shows</a></li>
      <li><a href="movies.html?cat=new" ${activePage==='new'   ?'class="active"':''}>New &amp; Popular</a></li>
      ${user ? `<li><a href="profile.html?tab=list" ${activePage==='list'?'class="active"':''}>${wl}</a></li>` : ''}
    </ul>
    <div class="nav-right">
      <div class="search-wrap">
        <span style="color:var(--muted)">🔍</span>
        <input type="text" placeholder="Search…" id="searchInput"
          onkeydown="if(event.key==='Enter'&&this.value.trim()){window.location.href='movies.html?q='+encodeURIComponent(this.value);}"/>
      </div>
      ${user
        ? `<div class="avatar-wrap" id="avatarWrap">
             <div class="avatar" onclick="toggleAvatarMenu(event)">${user.avatar}</div>
             <div class="avatar-menu">
               <div class="am-header">
                 <div class="am-name">${user.name}</div>
                 <div class="am-plan">📺 ${user.plan || 'Basic'} Plan</div>
               </div>
               <a href="profile.html">👤 My Profile</a>
               <a href="profile.html?tab=list">❤️ Wishlist (${wc})</a>
               <a href="profile.html?tab=history">🕓 Watch History</a>
               <a href="profile.html?tab=settings">⚙️ Settings</a>
               <a href="profile.html?tab=plan">💳 My Plan</a>
               <hr/>
               <a class="am-signout" href="#" onclick="event.preventDefault();Auth.logout()">🚪 Sign Out</a>
             </div>
           </div>`
        : `<a class="btn-nv btn-si" href="login.html">Sign In</a>
           <a class="btn-nv btn-st" href="signup.html">Get Started</a>`
      }
      <div class="ham" id="hamBtn" onclick="toggleMobMenu()">
        <span></span><span></span><span></span>
      </div>
    </div>`;

  /* build mobile menu */
  const mob = document.getElementById('mobMenu');
  if (mob) {
    const userBlock = user
      ? `<div class="mob-user">
           <div class="mob-av">${user.avatar}</div>
           <div>
             <div class="mob-name">${user.name}</div>
             <div class="mob-plan">📺 ${user.plan || 'Basic'} Plan</div>
           </div>
         </div>` : '';
    const authBlock = !user
      ? `<div class="mob-auth">
           <a class="btn-nv btn-si" href="login.html">Sign In</a>
           <a class="btn-nv btn-st" href="signup.html">Get Started</a>
         </div>` : '';
    mob.innerHTML = userBlock + `
      <ul>
        <li><a href="index.html">🏠 Home</a></li>
        <li><a href="movies.html">🎬 Movies</a></li>
        <li><a href="tvshows.html">📺 TV Shows</a></li>
        <li><a href="movies.html?cat=new">🔥 New &amp; Popular</a></li>
        ${user ? `<li><a href="profile.html?tab=list">❤️ Wishlist (${wc})</a></li>` : ''}
        ${user ? `<li><a href="profile.html?tab=history">🕓 Watch History</a></li>` : ''}
        ${user ? `<li><a href="profile.html">👤 My Profile</a></li>` : ''}
        ${user ? `<li><a href="profile.html?tab=settings">⚙️ Settings</a></li>` : ''}
        ${user ? `<li><a href="#" onclick="event.preventDefault();Auth.logout()">🚪 Sign Out</a></li>` : ''}
      </ul>` + authBlock;
  }

  /* close avatar menu on outside click */
  document.addEventListener('click', e => {
    const w = document.getElementById('avatarWrap');
    if (w && !w.contains(e.target)) w.classList.remove('open');
  });
}

function toggleAvatarMenu(e) {
  if (e) e.stopPropagation();
  const w = document.getElementById('avatarWrap');
  if (w) w.classList.toggle('open');
}

function toggleMobMenu() {
  const m = document.getElementById('mobMenu');
  const h = document.getElementById('hamBtn');
  if (m) m.classList.toggle('open');
  if (h) h.classList.toggle('open');
}

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
function buildFooter() {
  const f = document.getElementById('mainFooter');
  if (!f) return;
  f.innerHTML = `
    <div class="footer-grid">
      <div>
        <a class="fl-logo" href="index.html">🎬 STREAMVAULT</a>
        <p class="fl-desc">Unlimited movies, TV shows and originals. Stream in stunning 4K quality from any device, anywhere.</p>
        <div class="fl-socials">
          <div class="soc" onclick="showToast('Follow on Facebook!')">📘</div>
          <div class="soc" onclick="showToast('Follow on Twitter!')">🐦</div>
          <div class="soc" onclick="showToast('Follow on Instagram!')">📸</div>
          <div class="soc" onclick="showToast('Subscribe on YouTube!')">▶</div>
        </div>
      </div>
      <div><h4>Browse</h4><ul>
        <li><a href="movies.html">All Movies</a></li>
        <li><a href="tvshows.html">TV Shows</a></li>
        <li><a href="movies.html?cat=new">New &amp; Popular</a></li>
        <li><a href="movies.html?cat=hollywood">Hollywood</a></li>
      </ul></div>
      <div><h4>Help</h4><ul>
        <li><a href="#">FAQ</a></li>
        <li><a href="profile.html">Account</a></li>
        <li><a href="#">Support</a></li>
        <li><a href="#">Speed Test</a></li>
      </ul></div>
      <div><h4>Legal</h4><ul>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms of Use</a></li>
        <li><a href="#">Cookie Preferences</a></li>
        <li><a href="#">Corporate Info</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 StreamVault. All rights reserved.</span>
      <span>UI Design Capstone Project 🎓</span>
    </div>`;
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

function initNavScroll() {
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) nav.classList.toggle('solid', window.scrollY > 60);
  });
}
