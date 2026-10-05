const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const A = 'assets/';
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const arrowLeft = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6"/></svg>';
const pin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/></svg>';
const studyURL = 'https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316';
const studios = [
  {id:'cyclebar',name:'CycleBar',category:'Cycling',url:'https://www.cyclebar.com/',intro:'Find your rhythm. Ride to the music. Leave with a little more energy.',description:'An indoor cycling experience built around music, movement, and a room full of people riding together. Explore the brand’s studios and find a ride that fits your routine.',focus:'Indoor cycling',bring:'Water, comfortable workout clothes, and your energy.'},
  {id:'solidcore',name:'[solidcore]',category:'Strength',url:'https://solidcore.co/',intro:'Slow, intentional movement. A challenge you can share.',description:'A strength workout on a specialized reformer, with slow, controlled movement and resistance. Discover a new way to challenge yourself alongside your workout circle.',focus:'Resistance training',bring:'Water and fitted, comfortable workout clothes.'},
  {id:'purebarre',name:'Pure Barre',category:'Barre',url:'https://www.purebarre.com/',intro:'Small movements. Shared motivation. A stronger everyday.',description:'Barre classes combine small, controlled movements with an emphasis on strength, balance, and flexibility. Find your place at the barre and connect with others who keep coming back.',focus:'Barre',bring:'Water and grip socks; check the studio’s requirements.'},
  {id:'corepower',name:'CorePower Yoga',category:'Yoga',url:'https://www.corepoweryoga.com/',intro:'Make space for your practice—and for new connections.',description:'Explore yoga and yoga-inspired fitness classes, including heated formats. Choose a class style that fits your experience and make your practice part of a shared routine.',focus:'Yoga & yoga sculpt',bring:'A mat, towel, and water; confirm the class temperature.'},
  {id:'soulcycle',name:'SoulCycle',category:'Cycling',url:'https://www.soul-cycle.com/',intro:'A room, a rhythm, and a reason to come back.',description:'Music-led indoor cycling brings a group together for a shared ride. Find an instructor, playlist, and studio atmosphere that make movement something to look forward to.',focus:'Indoor cycling',bring:'Water and workout clothes; check cycling shoe options.'},
  {id:'orangetheory',name:'Orangetheory Fitness',category:'Strength',img:'brand-orangetheory.webp',focal:'center 40%',url:'https://www.orangetheory.com/',intro:'A little encouragement goes a long way. Find yours here.',description:'Group fitness classes combine treadmill, rowing, and strength work with heart-rate tracking. Explore the format and check the studio’s current class options.',focus:'Cardio & strength',bring:'Water, a towel, and supportive training shoes.'},
  {id:'clubpilates',name:'Club Pilates',category:'Pilates',url:'https://www.clubpilates.com/',intro:'Find your flow with a Pilates practice that grows with you.',description:'Reformer Pilates classes offer a place to build strength and explore controlled movement. Look through the studio’s class levels to find the right starting point for you.',focus:'Reformer Pilates',bring:'Water and grip socks; ask about an introductory class.'},
  {id:'barrys',name:'Barry’s',category:'Strength',url:'https://www.barrys.com/',intro:'Meet in the Red Room. Leave with something in common.',description:'A group workout combining strength training and cardio in Barry’s signature Red Room. Check the local studio’s formats and book your workout directly with the studio.',focus:'Cardio & strength',bring:'Water and supportive training shoes.'},
  {id:'barre3',name:'Barre3',category:'Barre',url:'https://barre3.com/',intro:'Balance, strength, and a room that moves together.',description:'A full-body class that moves between strength, cardio and mindful work at the barre, with every posture meant to be modified to the day you are having. Find a studio nearby and a class you can keep coming back to.',focus:'Barre & balance',bring:'Water and grip socks; check the studio’s requirements.'}
];
function dateOffset(days, hour=7) { const d=new Date();d.setDate(d.getDate()+days);d.setHours(hour,0,0,0);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(hour).padStart(2,'0')}:00`; }
const seedEvents = [
  {id:'e1',title:'Pilates & a coffee after',category:'Pilates',studio:'clubpilates',img:null,area:'Dupont Circle',place:'Dupont Circle, Washington, DC',date:dateOffset(2,7),duration:50,people:8,host:'The morning circle',lat:38.9096,lon:-77.0434},
  {id:'e2',title:'Find your flow, together',category:'Yoga',studio:'corepower',img:null,area:'Georgetown',place:'Georgetown, Washington, DC',date:dateOffset(2,18),duration:60,people:10,host:'After-work flow',lat:38.9050,lon:-77.0620},
  {id:'e3',title:'A ride to start your day',category:'Cycling',studio:'cyclebar',img:null,area:'NoMa',place:'NoMa, Washington, DC',date:dateOffset(3,7),duration:45,people:6,host:'Early birds',lat:38.9070,lon:-77.0030},
  {id:'e4',title:'The easy Sunday run',category:'Running',img:null,area:'Georgetown',place:'Georgetown Waterfront Park',date:dateOffset(4,9),duration:40,people:12,host:'The Sunday circle',lat:38.9020,lon:-77.0620},
  {id:'e5',title:'Meet me at the barre',category:'Barre',studio:'purebarre',img:null,area:'Capitol Hill',place:'Capitol Hill, Washington, DC',date:dateOffset(4,18),duration:50,people:5,host:'The evening circle',lat:38.8868,lon:-76.9960},
  {id:'e6',title:'A stronger kind of morning',category:'Strength',studio:'solidcore',img:null,area:'Logan Circle',place:'Logan Circle, Washington, DC',date:dateOffset(5,8),duration:50,people:7,host:'Weekend movement',lat:38.9097,lon:-77.0298}
];
const defaultState={profile:null,loggedOut:false,plans:[],logged:[],joined:[],saved:[],created:[],posts:[],connections:[],requests:[],drafts:[]};
let state;
try {state={...defaultState,...JSON.parse(localStorage.getItem('viri-preview')||'{}')};}catch {state={...defaultState};}
/* Anything the database owns is left out. Keeping a copy of threads,
   connections or the feed in localStorage only creates ways to show
   somebody a stale version of a conversation, or the same message twice. */
const SERVER_OWNED=['threads','unread','feed','people','connections','requests','incoming','blocked','found'];
function save(){try{
  const keep={...state}; SERVER_OWNED.forEach(k=>{delete keep[k];});
  localStorage.setItem('viri-preview',JSON.stringify(keep));
}catch{toast('This browser cannot save changes. Your preview still works for this visit.');}}
let studioIndex=0, revealObserver;
let toastTimer;
const allEvents=()=>[...seedEvents,...state.created];
function prettyDate(date){return new Date(date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});}
function prettyTime(date){return new Date(date).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function initials(name){return (name||'Your Circle').split(' ').map(v=>v[0]).slice(0,2).join('').toUpperCase();}
const button=(text,href,cls='')=>`<a class="button ${cls}" href="${href}">${text}</a>`;
/* Two kinds of box. note() is for things that are still a preview and will
   stop being true; info() is for standing facts, which should not wear a
   label implying they are temporary. */
const note=text=>`<div class="preview-note"><strong>Preview</strong> ${text}</div>`;
const info=text=>`<div class="preview-note is-plain">${text}</div>`;
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function openModal(title,content,after){$('#modal').innerHTML=`<div class="dialog-top"><p>VIRI · Vitality Ritual</p><button class="icon-button" data-action="close-modal" aria-label="Close dialog">×</button></div><h2>${title}</h2>${content}`;$('#modal').showModal();after?.();}
function closeModal(){$('#modal').close();}
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeModal();}});
/* The seal is the brand kit's viri-01, letterforms already outlined so it needs
   no font. The hand-rolled one it replaces ran VITALITY RITUAL EST. 2026 as a
   single run around the ring, which left the back half upside down. Colour comes
   from currentColor so .footer-seal can still tint it cream on the dark footer. */
function seal(label){return `<svg class="seal" viewBox="0 0 400 400" role="img" aria-label="${label}"><circle cx="200.0" cy="200.0" r="176" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="200.0" cy="200.0" r="160" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><g fill="currentColor"><g transform="translate(200.0 200.0) rotate(-58.4879) translate(0 -139) translate(-6.2605 0) scale(0.019000 -0.019000)"><path d="M634 699 369 0H289L24 699H100L329 76L560 699Z"/></g><g transform="translate(200.0 200.0) rotate(-51.0946) translate(0 -139) translate(-2.1755 0) scale(0.019000 -0.019000)"><path d="M150 699V0H80V699Z"/></g><g transform="translate(200.0 200.0) rotate(-44.2457) translate(0 -139) translate(-4.9400 0) scale(0.019000 -0.019000)"><path d="M489 699V641H295V0H225V641H30V699Z"/></g><g transform="translate(200.0 200.0) rotate(-35.7404) translate(0 -139) translate(-6.1940 0) scale(0.019000 -0.019000)"><path d="M485 166H167L106 0H32L287 690H366L620 0H546ZM464 224 326 602 188 224Z"/></g><g transform="translate(200.0 200.0) rotate(-27.6227) translate(0 -139) translate(-3.9995 0) scale(0.019000 -0.019000)"><path d="M150 57H401V0H80V699H150Z"/></g><g transform="translate(200.0 200.0) rotate(-21.1615) translate(0 -139) translate(-2.1755 0) scale(0.019000 -0.019000)"><path d="M150 699V0H80V699Z"/></g><g transform="translate(200.0 200.0) rotate(-14.3126) translate(0 -139) translate(-4.9400 0) scale(0.019000 -0.019000)"><path d="M489 699V641H295V0H225V641H30V699Z"/></g><g transform="translate(200.0 200.0) rotate(-6.1519) translate(0 -139) translate(-5.3580 0) scale(0.019000 -0.019000)"><path d="M542 699 318 272V0H248V272L22 699H101L283 336L464 699Z"/></g><g transform="translate(200.0 200.0) rotate(6.7510) translate(0 -139) translate(-1.7385 0) scale(0.019000 -0.019000)"><path d="M43 347Q43 369 57.5 383.5Q72 398 94 398Q115 398 129.5 383.5Q144 369 144 347Q144 325 129.5 310.0Q115 295 94 295Q72 295 57.5 310.0Q43 325 43 347Z"/></g><g transform="translate(200.0 200.0) rotate(19.7440) translate(0 -139) translate(-5.5765 0) scale(0.019000 -0.019000)"><path d="M452 0 279 292H150V0H80V699H290Q407 699 467.5 643.0Q528 587 528 496Q528 420 484.5 366.5Q441 313 356 297L536 0ZM150 349H291Q373 349 414.5 389.0Q456 429 456 496Q456 565 416.0 602.5Q376 640 290 640H150Z"/></g><g transform="translate(200.0 200.0) rotate(26.8552) translate(0 -139) translate(-2.1755 0) scale(0.019000 -0.019000)"><path d="M150 699V0H80V699Z"/></g><g transform="translate(200.0 200.0) rotate(33.7041) translate(0 -139) translate(-4.9400 0) scale(0.019000 -0.019000)"><path d="M489 699V641H295V0H225V641H30V699Z"/></g><g transform="translate(200.0 200.0) rotate(42.2447) translate(0 -139) translate(-6.2795 0) scale(0.019000 -0.019000)"><path d="M147 699V259Q147 155 196.5 105.0Q246 55 332 55Q418 55 466.5 104.5Q515 154 515 259V699H585V260Q585 127 514.5 60.0Q444 -7 331 -7Q218 -7 147.5 60.0Q77 127 77 260V699Z"/></g><g transform="translate(200.0 200.0) rotate(51.3022) translate(0 -139) translate(-6.1940 0) scale(0.019000 -0.019000)"><path d="M485 166H167L106 0H32L287 690H366L620 0H546ZM464 224 326 602 188 224Z"/></g><g transform="translate(200.0 200.0) rotate(59.4198) translate(0 -139) translate(-3.9995 0) scale(0.019000 -0.019000)"><path d="M150 57H401V0H80V699H150Z"/></g><g transform="translate(200.0 200.0) rotate(209.4577) translate(0 -139) rotate(180) translate(-4.2755 0) scale(0.017000 -0.017000)"><path d="M150 642V381H415V323H150V58H445V0H80V700H445V642Z"/></g><g transform="translate(200.0 200.0) rotate(201.7753) translate(0 -139) rotate(180) translate(-4.8620 0) scale(0.017000 -0.017000)"><path d="M56 180H130Q135 129 175.0 90.5Q215 52 292 52Q363 52 404.5 88.5Q446 125 446 181Q446 226 423.0 253.5Q400 281 366.0 294.5Q332 308 272 324Q202 343 161.0 361.0Q120 379 91.0 417.0Q62 455 62 520Q62 574 90.0 616.5Q118 659 169.0 683.0Q220 707 286 707Q383 707 442.5 659.5Q502 612 511 537H435Q428 580 388.0 613.5Q348 647 280 647Q217 647 175.0 613.5Q133 580 133 522Q133 478 156.0 451.0Q179 424 213.5 410.0Q248 396 307 380Q375 361 417.0 342.5Q459 324 488.0 286.0Q517 248 517 184Q517 135 491.0 91.0Q465 47 414.0 20.0Q363 -7 292 -7Q223 -7 170.5 17.0Q118 41 88.0 84.0Q58 127 56 180Z"/></g><g transform="translate(200.0 200.0) rotate(194.0333) translate(0 -139) rotate(180) translate(-4.4200 0) scale(0.017000 -0.017000)"><path d="M489 699V641H295V0H225V641H30V699Z"/></g><g transform="translate(200.0 200.0) rotate(187.6578) translate(0 -139) rotate(180) translate(-1.5470 0) scale(0.017000 -0.017000)"><path d="M41 47Q41 69 55.5 83.5Q70 98 92 98Q113 98 127.5 83.5Q142 69 142 47Q142 25 127.5 10.0Q113 -5 92 -5Q70 -5 55.5 10.0Q41 25 41 47Z"/></g><g transform="translate(200.0 200.0) rotate(175.2642) translate(0 -139) rotate(180) translate(-4.8620 0) scale(0.017000 -0.017000)"><path d="M436 517Q436 586 401.5 627.5Q367 669 289 669Q213 669 171.5 621.5Q130 574 125 495H57Q63 606 125.5 667.5Q188 729 289 729Q386 729 446.0 674.5Q506 620 506 520Q506 399 405.5 285.5Q305 172 158 64H528V5H51V55Q235 193 335.5 302.5Q436 412 436 517Z"/></g><g transform="translate(200.0 200.0) rotate(167.1859) translate(0 -139) rotate(180) translate(-5.2360 0) scale(0.017000 -0.017000)"><path d="M308 727Q445 727 498.0 632.0Q551 537 551 365Q551 190 498.0 94.0Q445 -2 308 -2Q170 -2 117.5 94.0Q65 190 65 365Q65 537 118.0 632.0Q171 727 308 727ZM308 664Q236 664 198.0 625.0Q160 586 147.0 522.0Q134 458 134 365Q134 269 147.0 204.5Q160 140 198.0 101.0Q236 62 308 62Q380 62 418.0 101.0Q456 140 469.0 204.5Q482 269 482 365Q482 458 469.0 522.0Q456 586 418.0 625.0Q380 664 308 664Z"/></g><g transform="translate(200.0 200.0) rotate(159.1077) translate(0 -139) rotate(180) translate(-4.8620 0) scale(0.017000 -0.017000)"><path d="M436 517Q436 586 401.5 627.5Q367 669 289 669Q213 669 171.5 621.5Q130 574 125 495H57Q63 606 125.5 667.5Q188 729 289 729Q386 729 446.0 674.5Q506 620 506 520Q506 399 405.5 285.5Q305 172 158 64H528V5H51V55Q235 193 335.5 302.5Q436 412 436 517Z"/></g><g transform="translate(200.0 200.0) rotate(150.9838) translate(0 -139) rotate(180) translate(-5.3465 0) scale(0.017000 -0.017000)"><path d="M326 672Q228 672 179.0 596.0Q130 520 134 347Q154 407 210.5 441.5Q267 476 340 476Q445 476 506.5 411.5Q568 347 568 234Q568 168 542.5 114.5Q517 61 464.5 29.0Q412 -3 334 -3Q185 -3 128.5 92.0Q72 187 72 361Q72 731 326 731Q422 731 477.0 678.5Q532 626 542 542H477Q455 672 326 672ZM143 245Q143 164 191.0 110.0Q239 56 331 56Q408 56 454.0 103.0Q500 150 500 231Q500 318 455.0 367.0Q410 416 327 416Q280 416 238.0 397.0Q196 378 169.5 339.5Q143 301 143 245Z"/></g></g><circle cx="103.0" cy="200.0" r="2.4" fill="currentColor" opacity=".8"/><circle cx="297.0" cy="200.0" r="2.4" fill="currentColor" opacity=".8"/><g fill="currentColor"><g transform="translate(115.120 240.0)"><g transform="translate(0.000 0) scale(0.120000 -0.120000)"><path d="M682 657V683C659 681 633 681 608 681C584 681 543 681 520 683V657C570 654 572 619 572 613C572 602 569 595 566 587L369 74L163 613C160 620 158 625 158 630C158 657 198 657 219 657V683C187 681 140 681 107 681C81 681 34 681 10 683V657C68 657 79 653 91 621L329 0C334 -14 335 -16 346 -16C357 -16 358 -14 363 0L590 591C599 613 615 656 682 657Z"/></g><g transform="translate(88.160 0) scale(0.120000 -0.120000)"><path d="M682 84C682 90 682 97 673 97C665 97 664 91 664 87C659 22 630 0 599 0C544 0 538 63 532 124C529 145 527 160 525 182C519 232 511 305 392 341C487 360 567 424 567 504C567 598 461 683 321 683H52V657C121 657 132 657 132 612V71C132 26 121 26 52 26V0C81 2 133 2 164 2C195 2 247 2 276 0V26C207 26 196 26 196 71V334H313C370 334 402 311 416 298C456 259 456 232 456 164C456 97 456 63 486 29C524 -12 575 -16 597 -16C671 -16 682 67 682 84ZM491 504C491 375 385 350 310 350H196V618C196 652 198 657 238 657H311C394 657 491 628 491 504Z"/></g></g></g></svg>`;}
function renderFooter(){ $('#footer').innerHTML=`<div class="footer-main"><div class="wrap"><div class="footer-grid"><div class="footer-brand"><a class="footer-seal" href="#/" aria-label="VIRI home">${seal('VIRI \u2014 Vitality Ritual')}</a><a class="footer-logo" href="#/" aria-label="VIRI home">VIRI</a><p>Vitality Ritual</p><p>Build community around what moves you.</p><div class="socials"><a href="https://www.instagram.com/vitalityritual.co/" target="_blank" rel="noopener" aria-label="VIRI on Instagram, opens in a new tab"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/></svg>Instagram</a></div></div><div class="footer-links"><p class="footer-label">Your next ritual</p><a href="#/explore">Explore opportunities</a><a href="#/studios">Discover studios</a><a href="#/read">The VIRI edit</a>${signedIn()?'<a href="#/profile">Your profile</a>':''}<a href="#/login">Log in</a></div><div class="footer-links"><p class="footer-label">Our community</p><a href="#/about">About us</a><a href="#/connect">Contact us</a><a href="#/signup">Join now</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} VIRI · Vitality Ritual</span><span><a href="#/privacy">Privacy</a> · <a href="#/terms">Terms</a> · <button class="plain-link" data-action="credits">Image credits</button></span></div></div></div>`;}
function revealWords(text){return text.split(' ').map((word,i)=>`<span class="reveal-word" style="--word:${i}">${word}</span>`).join(' ');}
function home(){return `<div class="home-page">
<section class="cover">
  <div class="cover-rail cover-rail-l" aria-hidden="true"><span class="rail-type">Vitality Ritual</span></div>
  <figure class="cover-plate"><img class="cover-image" src="${A}pin-trail.jpg" alt="Two women on a trail at golden hour, one holding a quad stretch"><span class="cover-veil" aria-hidden="true"></span></figure>
  <div class="cover-rail cover-rail-r" aria-hidden="true"><span class="rail-seal">${seal('VIRI \u2014 Vitality Ritual')}</span><span class="rail-hair"></span><span class="rail-cap">Est. 2026</span></div>
  <h1 id="home-title" class="cover-title"><span class="cw">Socialize</span><em class="cw">your</em><span class="cw">Fitness</span></h1>
</section>
<section class="statement" data-reveal>
  <h2>Community built for your goals</h2>
  <p>Connect with the people in your city who already share your fitness interests. Instead of trying to convince your friend to take that morning spin class with you, connect with someone who is already signed up.</p>
  <a class="button" href="#/signup">Join now</a>
</section>
<section class="feature feature-connect" data-reveal>
  <figure class="feature-media connect-media">
    <img src="${A}connect-steps.jpg" alt="Two friends sitting on marble steps with iced coffees after a workout" loading="lazy">
  </figure>
  <div class="feature-panel">
    <h2>Find your circle</h2>
    <ol class="panel-list">
      <li><span class="panel-n">1</span><span class="panel-body"><span class="panel-t">Build your profile</span><span class="panel-d"><span>What moves you, where you go, and when.</span></span></span></li>
      <li><span class="panel-n">2</span><span class="panel-body"><span class="panel-t">Explore what’s nearby</span><span class="panel-d"><span>Add your classes.</span></span></span></li>
      <li><span class="panel-n">3</span><span class="panel-body"><span class="panel-t">Find your people</span><span class="panel-d"><span>See who’s booked the same classes as you, connect, and go together.</span></span></span></li>
    </ol>
    <a class="panel-link" href="#/signup">Start your profile ${arrow}</a>
  </div>
</section>
<section class="section studio-section"><div class="wrap"><div class="section-head" data-reveal><h2 class="section-title">Find your next favorite</h2><div class="head-controls"><a class="text-link" href="#/studios">All studios ${arrow}</a></div></div><div class="studio-carousel"><button class="circle-button carousel-arrow" data-action="studio-prev" aria-label="Previous studios" disabled>‹</button><div class="cards-three" id="studio-grid" aria-live="polite" aria-label="Featured studios">${studioCards()}</div><button class="circle-button carousel-arrow" data-action="studio-next" aria-label="Next studios">›</button></div><p class="section-foot">Member counts are illustrative for this preview.</p></div></section>
<section class="section longevity-split" data-reveal><div class="wrap">
  <div class="longevity-grid">
    <h2 class="longevity-title">Connection is part of longevity</h2>
    <div class="longevity-body">
      <p class="longevity-figure"><strong>50%</strong> higher odds of survival</p>
      <p class="longevity-lede">People with strong social ties outlived those without them across 148 studies and <a href="${studyURL}" target="_blank" rel="noopener">308,849 people</a>—an effect researchers put on par with quitting smoking. VIRI functions by bringing you the connections that already exist in your day-to-day routines.</p>
      <a class="longevity-cta" href="#/signup">Find your circle ${arrow}</a>
    </div>
  </div>
  
</div></section>
<section class="section edit-section"><div class="wrap"><div class="section-head" data-reveal><h2 class="section-title">The VIRI edit</h2><a class="text-link" href="#/read">All stories ${arrow}</a></div><div class="cards-three">${allArticles().slice(0,3).map((a,i)=>articleCard(a,i)).join('')}</div></div></section>
<section class="testimonial" data-reveal><div class="wrap">
  <p class="stars" aria-label="Five stars">★★★★★</p>
  <blockquote>${reviews[0].text}</blockquote>
  <p class="testimonial-by">${reviews[0].name} · Illustrative member story</p>
</div></section>
${joinFinale()}</div>`;}
/* the carousel runs to the end and stops on an All studios card rather than
   wrapping back round to the first studio */
const STUDIO_LAST=()=>studios.length+1-3;
function studioCards(){return [0,1,2].map(i=>studioIndex+i).filter(i=>i<=studios.length)
  .map(i=>i<studios.length?studioCard(studios[i]):allStudiosCard()).join('');}
function syncStudioNav(){
  const p=$('[data-action="studio-prev"]'), n=$('[data-action="studio-next"]');
  if(p)p.disabled=studioIndex<=0;
  if(n)n.disabled=studioIndex>=STUDIO_LAST();
}
/* the photograph has to show the thing the studio actually does */
const STUDIO_PHOTO={cyclebar:'hero-cycling-studio.webp',solidcore:'hero-pilates.jpg',purebarre:'studio-arches.jpg',
  corepower:'hero-mats.jpg',soulcycle:'brand-soulcycle.jpg',orangetheory:'brand-orangetheory.webp',
  clubpilates:'pin-matclass.jpg',barrys:'brand-barrys.jpg',barre3:'barre-white.jpg'};
const studioPhoto=s=>STUDIO_PHOTO[s.id]||null;
function studioCard(s){const count=[128,96,84,112,105,76,93,68,74][studios.indexOf(s)];return `<article class="tile tile-studio" data-reveal><a href="#/studios/${s.id}"><div class="tile-plate"><img class="plate-photo" src="${A+studioPhoto(s)}" alt="" aria-hidden="true" loading="lazy"><h3 class="plate-name">${s.name}</h3><span class="plate-cat">${s.category}</span></div><p class="tile-meta"><span class="tile-index">${count} members</span></p></a></article>`;}
function allStudiosCard(){return `<article class="tile tile-studio tile-all" data-reveal><a href="#/studios"><div class="tile-plate tile-plate-all"><h3 class="plate-name">All studios</h3><span class="plate-cat">See every one ${arrow}</span></div><p class="tile-meta"><span class="tile-index">${studios.length} in Washington, DC</span></p></a></article>`;}
function statistics(){return `<section class="longevity-section"><a class="longevity-inner" href="#/signup" data-reveal><p class="eyebrow">Wellness goes beyond the workout</p><h2>Connection is part of longevity</h2><p class="longevity-figure"><strong>50%</strong> higher odds of survival</p><p class="longevity-lede">People with strong social ties outlived those without them across 148 studies and <a href="${studyURL}" target="_blank" rel="noopener">308,849 people</a>—an effect researchers put on par with quitting smoking. VIRI functions by bringing you the connections that already exist in your day-to-day routines.</p><span class="longevity-cta">Find your circle ${arrow}</span></a></section>`;}
function joinFinale(){return `<section class="join-finale" aria-label="Join VIRI" data-reveal><div class="join-inner"><p class="eyebrow">Your people. Your pace. Your ritual.</p><h2>Find your circle</h2>${button('Join now','#/signup','light')}</div></section>`;}
function joinSection(){return joinFinale();}
const reviews=[{title:'A familiar face at class',text:'“I came for a workout and found people I look forward to seeing every week.”',name:'The studio regular'},{title:'A new city, a new circle',text:'“Having someone to meet for a run makes a big city feel a little more like home.”',name:'The new neighbor'},{title:'A ritual worth keeping',text:'“A shared class and a coffee afterward became the part of my week I never want to miss.”',name:'The weekend mover'}];
function artDate(s){if(!s)return null;const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);}
const fmtLong=s=>{const d=artDate(s);return d?d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'';};
const fmtShort=s=>{const d=artDate(s);return d?d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';};
const articles=[
  {id:'fall-things-to-do',category:'Mindset',title:'8 Actually Interesting Ways to Keep Yourself Busy This Fall',titleLines:['8 Actually Interesting','Ways to Keep Yourself','Busy This Fall'],img:'',author:'Margaret Cole',date:'2026-10-05',desc:'Eight alternatives to scrolling and TV, from a wellness challenge to a book club.',body:`<p>Tired of scrolling or watching TV being your main pass-times?  Let’s talk about some alternatives to spice up your life this fall.</p><h2>1. Start a Fitness/Wellness Challenge</h2><p>It’s still the season of new beginnings (in my opinion), so commit to a fitness/wellness challenge, big or small.  Always wanted to try 75 Hard or a variation of this?  There’s still time left in the year.  Want to try waking up at 5am for a week?  It’s only a few days, test yourself to see if you can do it.  Been forgetting to drink enough water recently?  How about you try to drink 64 oz for 10 days straight.  The possibilities are endless, and testing yourself is such a fun way to occupy your mind—plus VIRI just built in a ‘goal setting’ feature, so we can help you track your progress along the way.</p><h2>2. Have AI Teach You Something</h2><p>I think most of us aren’t actually using AI to its full capacity.  I’ve found that AI can actually be fun when you learn to use it in the right ways.  Say you have a 30-minute commute to work each day.  Perhaps you put in your headphones, turn on the Claude voice feature, and then have it give you a 30-minute French lesson every morning on your way to work.  Want to take a personal finance class without spending thousands on registering through a college?  Have Claude create a one-semester curriculum with twice-weekly classes that you “attend.”  Want to create a business but don’t know where to start?  Have Claude walk you through every step.</p><h2>3. Start a Substack</h2><p>I know everyone has one nowadays but maybe it’s because typing out your thoughts, opinions, stories, and knowledge is incredibly healthy and beneficial for you.  Substack is free to join and you can design your page exactly how you like, write whatever you want, and decide who your target audience is.  Maybe your target audience is just you—that is completely okay!  Maybe your family and friends have all been asking how you’re doing and instead of writing the same text over and over again you decide it’s more fun to write a little blog, accompanied with pictures, and then send it out in a weekly newsletter to them.</p><h2>4. Create Better Organizational Systems</h2><p>Impossible to go through your email inbox because there are tens of thousands of messages in it?  Create folders and sort your emails into them over the course of a few weeks.  Unsubscribe from the annoying newsletters that keep clouding everything up.  Same goes for the files on your computer.</p><p>Hard to find things in your kitchen cabinets?  Spend an afternoon rearranging and re-shelving everything.  Messy closet?  First, go through all your clothes.  Next, you can restructure your shelf/cabinet labeling if it currently doesn’t make sense.  Decide the order in which you want to hang your hangers if everything seems too random right now.</p><h2>5. Learn How to Do a Beauty Service Yourself</h2><p>In my <a href="#/read/saving-money">money saving</a> article, one hack I listed was learning how to do your hair or nails yourself instead of paying for these services.  Teach yourself how to trim your dead ends in a few minutes with a Youtube tutorial.  Practice doing your own nails and once you’ve gotten the basics down learn more complicated designs like french tips, nail art, etc.  Maybe you can even make some money out of it by offering your services to others once you’ve gotten good enough.</p><h2>6. Plan Your Next Trip</h2><p>This can be real or fictional, take place in three months or three years.  Trip planning can be so fun and as delusional as you want it to be.  Have a week of PTO that you don’t know what to do with next year yet?  Why not brainstorm a few ideas, write out an itinerary for yourself, and spend some time researching a new place.</p><h2>7. Fall-Themed Cooking/Baking</h2><p>The vast majority of us already need to cook multiple times a week in order to get by as adults, but let’s bring back the fun in cooking/baking this season.  What are some ways that you can make your meals more fall?  Bored on a rainy Saturday?  Make some banana bread.  Try out a good pumpkin soup recipe.  The other day I saw chai chocolate chip cookies on a menu—if you try this one you have to let me know.  Plus coming back to your home smelling like fresh baked goods or soup is so underrated.</p><h2>8. Start a Book Club</h2><p>I often find myself saying that I want to read more, but without a built-in accountability structure, this often falls apart.  While it may take some effort to coordinate, find a book you’ve been wanting to read and ask a few friends if they want to get together to read it too.  This doesn’t have to be as daunting as reading an entire book each month—if work is super busy, you could set a goal of having read a few chapters a month and talking about it over coffee.  You can also do the same thing with a TV show or movie series you’ve been wanting to watch!</p>`},
  {id:'office-dressing',category:'Style',title:'What We’re Actually Wearing to the Office',titleLines:['What We’re Actually','Wearing to the Office'],img:'office-dressing.webp',author:'Annabel Green',date:'2026-10-03',desc:'Start with what you love, learn your office, and build from there.',body:`<p>Dressing for the office comes with a certain rigidity, and that&rsquo;s fine. The best-dressed people know the dress code and wear it well.</p><h2>Start With What You Love</h2><p>Open your closet and pull out the pieces you reach for most. Ask yourself why you like them: the way the trouser falls, the fabric, the color on your skin. Those answers will help guide your future purchases and help you find your own style.</p><h2>Where to Shop</h2><p>Ann Taylor is the go-to for classic, polished workwear, like a tailored sheath dress or a suiting set. Banana Republic does well with timeless pieces in quality fabrics like Italian wool. Tuckernuck adds a preppy touch. Stick to the classic cuts, since the trendier styles tend to lean &ldquo;elevated business casual.&rdquo;</p><h2>Find Your Neutrals</h2><p>Look at the range of colors in your own skin, from lightest to deepest. Clothes in that range, like ivory, camel, taupe, and espresso, may look good on you.</p><p>Seasons can also change your palette. The gloom of fall and winter invites deeper colors, like chocolate brown, and burgundy. Spring makes room for brighter shades, like soft pinks and light blues. Your neutrals stay the foundation, and the season decides how much color to layer on top.</p><h2>Trends Worth Borrowing</h2><ul><li><b>Eyelet blouses:</b> light and feminine, best in white or ivory.</li><li><b>All black:</b> a black turtleneck with black pants looks clean and sleek.</li><li><b>Soft bohemian:</b> flowing sleeves and earthy tones, kept muted and tailored.</li><li><b>French luxury:</b> think Balmain, with sharp shoulders and structured jackets.</li><li><b>The high-neck white blouse:</b> light, airy, and conservative.</li></ul><h2>The D.C. Dress Code</h2><p>Washington dresses conservatively, so keep your colors to navy, charcoal, black, ivory, and camel. The pant length matters too. A flowy wide-leg trouser goes with a heel. With ballet flats or loafer mules, choose a straighter or slightly cropped leg that ends at the ankle. Tailor each pair to the shoe you&rsquo;ll wear with it.</p><h2>Dressing Up the Not-Quite-Formal</h2><p>Pieces from outside the workwear aisle can work too. A conservative blouse from Zara pairs well with a formal trouser. Get a feel for how your office dresses before you start mixing, and take cues from the people you admire there.</p><h2>The Short List</h2><ul><li>Loafer mules</li><li>Flowy wide-leg trousers, tailored to the shoe</li><li>Ballet flats</li><li>A tailored sheath dress</li><li>A clean blazer</li><li>A black turtleneck</li><li>A high-neck white blouse</li><li>An eyelet blouse</li><li>A conservative blouse (Zara works)</li></ul><h2>The Bottom Line</h2><p>Modest cuts, conservative colors, quality staples, and a well-fitted hem look polished because they&rsquo;ve always worked. Start with what you love, learn your office, and build from there.</p>`},
 {id:'busy-personality-trait',category:'Mindset',title:'It’s Time to Stop Acting Like Being Busy is a Personality Trait',titleLines:['It’s Time to Stop','Acting Like Being Busy','is a Personality Trait'],img:'busy-desk.webp',author:'Margaret Cole',date:'2026-10-02',desc:'Five months into my first full-time job, I stopped calling myself busy — and my life finally felt under control.',body:`<p>I will admit, when I started my first full time job back in May, I probably said the words “I’m so busy” at least five times a day.  And to an extent, this was true—I was training for a marathon, cooking for myself, spending most of my day working, trying to manage my social life, and attempting to get 8 hours of sleep a night.  Objectively, at least 90% of my time awake was spent doing things, but back then, I didn’t actually understand what being busy meant.  In my mind, as you went up in the corporate ladder, you’d get paid more to do less, but boy was I wrong.</p><p>During my very first full team meeting roughly a week into starting my job, one of the firm’s top executives commended a director for having stayed at the office until 3 a.m. the previous night to finish a deck.  I was shocked, first at the fact that he had worked until 3 a.m. the night before, but more so that you would have never known unless this executive had pointed it out.  One thing I began to notice after this meeting was that I was actually the least busy person at my firm.  Objectively, every other analyst or director who had been at the firm longer than me had more work on their plate, but they just never actually said so.</p><p>Take my boss, as an example.  He is arguably the most busy person at my firm aside from the CEO.  Not only does he oversee almost every client portfolio that the firm has, but he also writes reports (something an analyst should be doing but that he simply enjoys), is in meetings all day long, takes international work trips multiple times a year, makes client pitches, and on top of all this he lives an hour commute from the office, has a wife and four children, and trains for Ironman triathlons every year.  Not once has he said to me “I’m so busy.”</p><p>After that first team meeting, I stopped saying I was busy at work.  Breaking the habit around friends was more difficult, although I have gotten better at this.  I noticed though whenever I would hang out with friends or try to get in touch with people, the phrase “work has been so busy” was constantly circulating through the air.  And whenever it did, I would get so frustrated and think to myself <em>I can’t believe they’re complaining about being busy when I do so much more than them.</em>  Imagine how my coworkers, imagine how that director felt hearing me say this during my very first week of work.</p><p>And now, almost five months into my job, I have gotten significantly busier than I was at the beginning, both professionally and personally—think about the fact that I am writing this article right now.  But the peculiar thing is that my life feels way more under control now than it did back then because I finally stopped thinking about myself as being busy.</p><p class="prose-break">Aside from the mindset shift of understanding the “busyness” of everyone else around you, defining your priorities is the most important next step here.  Now I simply see myself as fulfilling everything that I choose to prioritize on a day-to-day basis.</p><p>So, if I were starting this shift over again, I would define 3-5 key priorities that I currently want to dedicate my time towards.  A few ideas might be receiving a promotion, getting enough sleep, exercising, saving money, or developing a hobby.  Once you’ve defined your priorities, take a look at your calendar and ask yourself, <em>if someone were to look at my calendar, would they be able to identify what my priorities are?</em>  This is key.  Physically build your priorities into your schedule.  This doesn’t mean you have to put everything you do into an actual calendar, but ask yourself a few times a week, <em>did my time this week actually reflect my defined priorities?</em>  And if it didn’t, that’s a sign that you need to readjust something.</p><p>After learning these lessons, I can confidently say that I am not “so busy” anymore.  So the next time you sit down to catch up with your friend over coffee, I want you to ask yourself before you say the words, <em>would my boss, my CEO, or the humble director define themselves as “so busy” if I asked them how they were doing?</em></p>`},
 {id:'saving-money',category:'Mindset',title:'13 Ways I Save Money as a Post-Grad Girl Living on My Own',titleLines:['13 Ways I Save Money','as a Post-Grad Girl','Living on My Own'],img:'money-autumn.jpg',author:'Margaret Cole',date:'2026-10-01',desc:'The small decisions I make to save money while still living my best life.',body:`<p>I graduated from college four months ago and was able to immediately start renting my own studio apartment in Washington, DC with no financial assistance.  A high-paying job is not what made this possible — in fact, by the most recent metrics, I am considered lower-middle class.  The way I was able to do it was by making conscious decisions to save money both before I moved here and after I started working full time.  Here are 13 small ways I save money as a post-grad girl living on my own.</p><p>Let’s start with the basics.</p><h2>1. High-yield savings account (emergency fund)</h2><p>If your savings aren’t currently in a high-yield savings account (HYSA), it is time for you to immediately find a new bank and transfer them.  HYSAs give you roughly 10 times the annual interest rate a traditional bank does, and most of these accounts are completely free to open and incur no annual fee.  If you have $1,000 in your account, your bank will give you an additional $30 to $35 a year just for keeping your money there.  And while $30 isn’t very much, let’s say you have $20,000 in your account — that’s an additional $600 to $700 a year.  My HYSA also functions as my “emergency fund.”  An emergency fund is exactly what it sounds like: money set aside for unanticipated emergencies such as unexpected medical bills, car repair expenses, family travel, getting laid off from a job, etc.  Generally, your emergency fund should cover 3 to 6 months of your essential living expenses and it is recommended that you do not touch this money.  If you start building an emergency fund, specifically in a HYSA, you’re setting yourself up for success later down the line and giving yourself free money through annual interest rates.</p><h2>2. Brokerage account &amp; Roth IRA / 401(k)</h2><p>Once you’ve gotten #1 under your belt, investments are how you grow your additional money and prevent yourself from overspending.  Many banks have a built-in investing feature, so you can invest your money in the stock market within seconds, just by transferring it from your savings to a brokerage account.  If you are just getting into investing for the first time, the most low-risk way to grow your money is by investing it into mutual funds, such as the S&amp;P 500 (sometimes traded as VOO).  If you are looking for detailed instructions on how to invest in the S&amp;P and what the S&amp;P 500 is, let me know and I’ll write up an article for you.</p><p>Along these same lines, either enrolling in your company’s 401(k) program or opening a separate Roth IRA is another great way to accumulate wealth over a long period of time.  I would recommend having both a brokerage account and a Roth IRA/401(k), as they have different benefits to your long-term wealth.  There are many ways you can choose to invest your money, but my general preference is that every month, any money that exceeds my emergency fund cap gets split 50/50 and goes directly into my two investment accounts.</p><h2>3. Paying off your credit card in full every month</h2><p>This one is short and sweet.  You should not be spending money that you don’t have, and so if you don’t feel comfortable paying off your full credit card bill in a given month, that’s a sign that you’re spending too much money.</p><h2>4. Consider getting a roommate if you can’t afford your lifestyle</h2><p>Most of the young 20-somethings at my corporate office live with roommates, and honestly, I believe this is an incredibly lucrative financial decision.  Before you decide to live on your own, you need to ask yourself how much living alone is really worth to you.  While it is certainly inconvenient at times to accommodate your living conditions with someone else’s, you will literally save tens of thousands of dollars per year by splitting the cost of rent with someone else.  My rent, which I pay on my own, consumes over 40% of my salary, a percentage I frankly do not recommend for anyone trying to save money in their early 20s, so this is a tip I would think about deeply before you tie yourself down to a lease.</p><h2>5. Meal prepping</h2><p>I meal prep all of my lunches and dinners.  In a given week, I might go out to eat once, but most normal weeks I try to cook every meal on my own.  Depending on ingredient costs, by choosing to meal prep instead of buying your lunch out, you could be saving $15+ per meal.  Another expense to consider when trying to save money by meal prepping is how expensive your protein of choice is.  In terms of meat, your cheapest options are likely chicken and ground beef, followed by red meat and then various types of fish.</p><h2>6. Avoiding meal and grocery delivery services</h2><p>I have completely deleted these apps off my phone, because when they are on my phone I become too tempted to use them.  Delivery fees and taxes sometimes make a given meal on a delivery service app double what it would have been before, so instead of spending $10 on a coffee and pastry you might be spending $20.  While this might seem like a negligible amount one time, the reality is that it’s rarely ever just one time once you start using these services.</p><h2>7. Consider using public transit if the time is similar to Ubering</h2><p>Again, choosing convenience over your wallet is a slippery slope, so before I choose to Uber anywhere, I always check the time it would take to get to the given location by both car and public transit — and if the difference is negligible, I opt for public transit.</p><h2>8. Take your cards off Apple Pay</h2><p>This is one I struggle with, but using Apple Pay 100% makes me spend money more easily.  The act of physically taking out your card to pay for something forces you to actually think about a purchase you are about to make before you simply tap your phone.  Even though the difference is only seconds, I saved thousands on credit card bills last year by removing my card from Apple Pay.</p><h2>9. Turn on your banking notifications</h2><p>If your banking app sends you alerts when you spend money, turn on your notifications.  Although it may be annoying to constantly be alerted any time you spend a few bucks on coffee, groceries, etc., physically seeing the number in your account go down is often enough to prompt you to reconsider spending more.</p><h2>10. Don’t buy new clothes before you’ve gone through your wardrobe first</h2><p>I make it a priority to go through my closet roughly once every two months to evaluate the necessity of each piece of clothing I own.  I also force myself to be strict with buying new clothes by only having a set number of hangers and never buying more.  If I don’t have the hanger or closet space, I certainly don’t need the new item.</p><h2>11. Before buying a new item of clothing, ask how many outfits you can make with it</h2><p>If an item can only be worn logically with one specific pair of pants or one shirt, you likely wouldn’t benefit very much from buying it.  I always try to make sure I have at least 3 to 4 different items of clothing that I can wear a given top or bottom with before I consider buying it.</p><h2>12. Learn how to do cosmetic expenses yourself</h2><p>Beauty expenses such as getting your nails done or dyeing and cutting your hair add up massively over time.  I used to get my nails done once every three weeks and I ended up spending over $1,000 in a year on nails alone.  I eventually taught myself how to do my nails myself.  While this may take you a few weeks to learn, it’s a skill you can pick up quickly and it will save you thousands.  The same goes for your hair.  I used to get my hair professionally cut and dyed at a salon and it would often cost well over $200 per visit.  However, roughly a year ago, I decided to learn how to cut my hair myself from a simple 10-minute YouTube video and I have been trimming my hair for free ever since.  The same goes with a basic dye job, however, this can be a little more risky.  If you do your research and are very careful, you can turn this into another very cheap expense.</p><h2>13. Take advantage of free trials</h2><p>This one is specifically related to fitness class free trials.  Often, studios will have a first visit free or one-week free promotion in order to convince people to sign up for their service.  ClassPass also has an incredible offer where you can get your first month completely for free and trial up to 10 different workout classes during the month.  Before you choose to start paying for a workout service regularly, check if they have any promotions and take advantage of them.  In the past three months, I have not paid for a single workout class I have taken, all because of this hack.</p>`},
 {id:'run-essentials',category:'Movement',title:'Starting Your Running Journey? Here Are Our Top Essentials to Get You Started.',titleLines:['Starting Your','Running Journey?','Here Are Our Top','Essentials to Get','You Started.'],img:'run-essentials.jpg',author:'Margaret Cole',date:'2026-09-30',desc:'The vest, the shoe, the headphones and the fuel that have carried me through years of running.',body:`<p>As someone who has been running for the majority of my life, I’m excited to bring you VIRI’s list of top running essentials.  Whether you are training for your first 5k or a marathon, these are the items that are sure to elevate your experience.</p><h2>1. Water carrier</h2><p>While it’s technically possible to survive your runs without bringing water, I certainly wouldn’t advise it.  Instead of viewing needing water as a weakness, water should be your aid, even if you’re only out for a 30-minute jog.  I’ve tried both a running vest and a handheld water bottle.  There are pros and cons to each, but here are my biggest takeaways that you might consider when deciding how to carry water on your runs.</p><h3><a href="https://www.amazon.com/SWIFTVEST-Waterproof-Reflective-Lightweight-Accessories/dp/B0CR8LKMVH/" target="_blank" rel="noopener">Amazon running vest</a> &middot; $37.99</h3><figure class="prod"><img src="${A}gear-vest.jpg" alt="A black SWIFTVEST running vest with a blue soft flask alongside it" loading="lazy"><figcaption>SWIFTVEST running vest &middot; $37.99</figcaption></figure><p>I have run hundreds of miles in this vest, and that is not an exaggeration.  The water pouch is 17 oz and is very spill proof.  17 oz of water will likely be enough for anyone running up to the half marathon distance, but if you’re training for a full marathon, in my experience, this is simply not enough water for your weekend long run.  Another thing to keep in mind is that this running vest has a pretty tight phone pocket, so it’s pretty challenging to take your phone in and out — I resort to holding my phone the majority of the time when using this vest.  The vest has adjustable straps and doesn’t move around when you wear it, but be prepared for your torso to feel damp based on how much you tend to sweat while running.  Overall, if you’re just beginning your running journey or are running on a budget, I’d say this vest is likely the best option you will find for its price.  If you’re willing to bring out the big bucks and upgrade to a more highly functional vest, I’d recommend the <a href="https://www.rei.com/product/230699/salomon-active-skin-4-hydration-vest" target="_blank" rel="noopener">Salomon Active Skin 4 hydration vest</a>, which retails for $100, but frankly, 99% of runners can do perfectly well with a basic Amazon vest.</p><h3><a href="https://www.amazon.com/Nathan-SpeedDraw-Insulated-Handheld-Metallic/dp/B08SJHK5LV/" target="_blank" rel="noopener">Handheld water bottle</a> &middot; $34.99</h3><figure class="prod"><img src="${A}gear-bottle.jpg" alt="A Nathan SpeedDraw handheld water bottle with a zip pocket" loading="lazy"><figcaption>Nathan SpeedDraw handheld &middot; $34.99</figcaption></figure><p>About a month ago, I switched from a running vest to a handheld water bottle.  This bottle holds 18 oz of water and you’d think that this would cause unnecessary strain on your arm while running, but that has not been my experience at all.  The bottle is easy to carry, has an adjustable strap so you can loosen or tighten it, and has a zipper pocket big enough to hold at least 6 running gels (which would get you through an entire marathon).  My only two warnings about this handheld water bottle are that the zipper pocket is not big enough to hold a phone, and your hand will likely get very sweaty depending on the intensity of your workout.  The sweatiness doesn’t make the water bottle any less functional and my hand doesn’t slip when it gets sweaty, but you may experience a mild discomfort from the feeling.</p><p>After having tried both, I prefer the water bottle simply because it is small and holds slightly more water.  Both are great options, but ultimately up to your personal preference.</p><h2>2. A high quality running shoe</h2><p>I have tried several different brands of running shoes, but my go-to for the past four years have been the <a href="https://www.hoka.com/en/us/womens-everyday-running-gear/clifton-10/1162031.html" target="_blank" rel="noopener">Hoka Clifton 10</a>, which tends to retail from $125 to $155.</p><figure class="prod"><img src="${A}gear-shoe.jpg" alt="A white Hoka Clifton 10 running shoe in profile" loading="lazy"><figcaption>Hoka Clifton 10 &middot; $125&ndash;$155</figcaption></figure><p>The shoe you pick is incredibly important and should be tailored to the structure of your foot.  Before you pick a shoe, determine if you need a shoe more suited to someone with flat or arched feet, because this will make a huge difference in injury prevention.  If you are more prone to injury, you may also want to consider a shoe with more cushioning on the bottom, which the Clifton 10 has.  Another thing to take into consideration is the size of the toe box — some shoes have a widened toe box, which, if you like more breathing room in your shoe, could be beneficial.  As someone with high arches, narrow feet, and leg sensitivity to switching running surfaces (e.g. going from gravel to pavement), the Clifton 10 is the best shoe for me.  Do your research before making the investment!</p><h2>3. <a href="https://shokz.com/products/openrunpro2?variant=45134507868360" target="_blank" rel="noopener">Shokz OpenRun 2 headphones</a> &middot; $179.95</h2><figure class="prod"><img src="${A}gear-headphones.jpg" alt="Shokz OpenRun open-ear bone conduction headphones in white" loading="lazy"><figcaption>Shokz OpenRun 2 &middot; $179.95</figcaption></figure><p>Yes, these headphones are quite an investment, but I swear by them.  I have run with AirPods, Beats, etc. and these are by far the best headphones I have found.  If you’re doing an intense running workout, I would 90% count on your AirPod falling out at some point, and if you’re wearing over-the-ear Beats, be ready for your ears (and headphones) to become sweaty and to not hear anything going on around you.  The Shokz OpenRun headphones (specifically the mini size) work perfectly for me because they stay in place while I run, the sound is high-quality, they don’t cause additional sweat, and they are built for you to be able to hear what’s going on around you while still listening to your music.  When I got these, I was skeptical that the sounds around me would make it difficult for me to hear my music at the volume I wanted (which is loud), but somehow they work perfectly.</p><p class="prose-break">And if you’re getting into longer distance running, such as half or full marathons, here are some additional product recommendations I would give you that have aided me in my training.</p><h2>4. <a href="https://www.amazon.com/Honey-Stinger-Exercise-Performance-Nutrition/dp/B0GWSDN2CR/" target="_blank" rel="noopener">Honey Stinger energy gels</a> &middot; price varies by quantity</h2><figure class="prod"><img src="${A}gear-gels.jpg" alt="A variety pack of Honey Stinger energy gels in several flavours" loading="lazy"><figcaption>Honey Stinger energy gels &middot; variety pack</figcaption></figure><p>When I started training for my first official half marathon, I was very suspicious of integrating running gels into my nutrition, and frankly, I avoided them for as long as possible.  However, once I started reaching 9+ mile long runs, I had to give in and try mid-run fueling.  Fueling while you’re in the middle of a long run is critical to your performance because your body’s stored carbohydrates (glycogen) run low after about 90 minutes, and taking in extra carbs prevents severe fatigue and keeps your energy steady.  There are tons of different types of energy gels, but my favorite has to be the Honey Stinger variety pack.  These gels have a similar consistency to honey, as opposed to Gu gels, which are much thicker.  They sit well in my stomach, are easy to open, quick to consume, and have several different delicious flavors to choose from.</p><h2>5. Electrolyte powder &middot; price varies by quantity</h2><p>I have tried several different types of electrolyte powders over the years, but my favorite has to be the classic <a href="https://liquid-iv.com" target="_blank" rel="noopener">Liquid I.V.</a>  While I do not recommend casually drinking electrolyte powder due to its high sodium concentration, replenishing with electrolytes during a high-intensity, heavily sweat-inducing, or long-distance run is crucial to runners’ health.  My rule of thumb for taking electrolytes is very similar to when I take gels.  I only consume electrolytes in my water when I am completing a run generally over 9 miles or if I’m planning on my run being high intensity.  You may also consider buying electrolyte tablets as opposed to powder, which I have done before.  The pro of an electrolyte tablet is it’s small and you just drop it in your water before you head out the door.  The primary con is that they’re hard to take with you if you plan on putting it in your water partway through your run, because you’d have to either bring one in a bag or bring the entire tube.</p><p class="prose-break">There are so many more running products I could talk to you about, but these are the basics that have carried me through my journey.  And now that it’s officially fall, you can enjoy each of these items in the perfectly crisp weather!</p>`},
 {id:'corporate-burnout',category:'Mindset',title:'Dealing With Corporate Burnout? Here’s How I Avoid it.',titleLines:['Dealing With','Corporate Burnout?','Here’s How I Avoid it.'],img:'coat-journal.jpg',author:'Margaret Cole',date:'2026-09-28',desc:'Three things that moved me from seeing myself as a product of my office work to a person defined by my passions.',body:`<p>For all my post-grad gals currently working a 9-5, I promise that you can get through this, and for those worried about joining the 9-5 grind in the future, perhaps you can avoid the burnout entirely.</p><p>I’m not sure about you, but before I started my first official big-girl job, I romanticized the heck out of it.  I was finally going to be a consultant—a title that nobody really understood, but that held a certain prestige that you wanted to possess regardless.  I would now be able to throw around corporate jargon about shareholder value, market cap, and optimizing for efficiency, and I’d look like a girlboss while I did it. And truth be told, the beginning was great.  I was living on my own, financially independent, and shaping every aspect of my life (outside of the 8 hours a day, minimum, that I had to spend at a desk).  But the romanticization ended quickly.  I became more worried about office politics and delivering results than my own personal happiness.  And once you enter this mindset, it’s extremely difficult to stop thinking this way and instead shift your focus onto the things that should actually matter in your life.</p><p>Here are some of the ways that I’ve been able to manage my corporate burnout that do not involve simply pivoting careers.</p><h2>1. Find a passion completely unrelated to work.</h2><p>This is, above all else, the best piece of advice I will offer you today.  If you wake up every day and don’t have anything consistent to look forward to outside of work, your life is going to revolve around your job.  The fact of the matter is that when you work in corporate, at least 60% of your day is spent working, and that percentage becomes much higher when you account for the time it takes to get ready, commute, and unwind from work every day.  So, if you aren’t being incredibly intentional with the few hours that you have outside of the office, you’re going to find that work is the only thing on your mind.</p><p>For me, I can confidently tell you that my main passion at the moment is running.  Roughly half a year ago, I signed up for a marathon (which I will be running in October!), and what they don’t tell you before you sign up for a marathon is that this kind of goal requires you to alter most of your lifestyle.  Not only will you average about an hour of running every day, but you will also have to change your sleep schedule, what you eat, how often you eat, how you cross-train, etc.  While my passion for running has ebbed and flowed as I’ve gone through the grueling summer training months, running has kept me focused on living a life for myself, completely separate from work.  And because I’ve found a passion that I’ve fully invested myself in, one that has to exist outside of the 9-5 hours, I am able to shift my mind (and lifestyle) away from work and wake up every morning with a sense of purpose and actions to go alongside it.</p><p>If you are currently struggling to figure out what that passion might be, check out this article for some potential ideas.</p><h2>2. Build a morning routine.</h2><p>One thing I noticed was that when my corporate burnout was at its worst, I had simultaneously let go of my morning routine.  I would set my alarm so I had just enough time to get ready for work, and I did nothing in the morning for my own enjoyment.  The (perhaps unfortunate) reality is that when I started waking up earlier, I finally regained much of the happiness I had lost to work.  As I’ve mentioned in “<a href="#/read/september-reset">The Truth About the September Wellness Reset</a>,” shifting your morning routine sustainably has to happen gradually, but once you’ve successfully made this shift, I guarantee your life will become so much more fulfilling.</p><p>Now, I’m not saying that you have to wake up and walk 10,000 steps, do red light therapy as you stand on your vibration plate, and then write in your journal for 30 minutes.  Instead, experiment with some different morning routine action items and decide for yourself what makes sense to keep and get rid of.  In my experience, roughly 2 to 2.5 hours is the perfect amount of time that I need in the mornings to get my day started on the right track.  This number is completely individual to your needs, but for reference, my morning routine looks something along the lines of:</p><ul><li>Wake up at 5:30am</li><li>Morning run or workout class (~1 hour)</li><li>Shower, stretch, and get ready for work</li><li>Breakfast and hydration</li><li>~1 hour of deep work, unrelated to my 9-5 (recently this has been building VIRI, but in the past this time may have been occupied by reading, skincare, playing with my kitten, or simply taking my sweet time when getting ready for the day).</li></ul><p>And because I have built a routine that brings me joy and allows me to focus on myself for several hours before working all day, I am able to wake up refreshed and actually excited to start the day.</p><h2>3. Adjust your Ego</h2><p>As hard as it may be to admit, your office survived before you were hired, and they will continue to survive after you find your next job.  And yes, your presence may be making a real impact on how your office and the people around you operate, but I promise the workplace will not burn down if you take a vacation, leave at 5 instead of 7, or tell a coworker that you don’t have the bandwidth to take on another task.  This mindset reframing walks a very careful line—you should absolutely continue to show up from 9-5 and produce excellent work, but you will reach a breaking point sooner or later if you don’t set boundaries with your work and you see yourself as an indispensable machine.</p><p>Ironically, my boss taught me this lesson.  Aside from my company’s CEO, he is arguably the most indispensable person at my firm.  While grabbing lunch, he said, “Margaret, even if I were to take a month-long vacation, the firm would be completely fine and everything would stay afloat.”  Hearing that from him specifically really put into perspective the importance of adjusting one’s ego in the workplace.  So, the last piece of advice I would give you in order to avoid corporate burnout is to do your job well, but within the confines of realistic work-life boundaries.</p><p>There are so many other factors I could tell you about that have helped make a difference in my recovery from corporate burnout, but these three steps have made the biggest difference in my transition from seeing myself as a product of my office work to seeing myself as a person defined by my passions and personal happiness.</p>`},
 {id:'september-reset',category:'Mindset',title:'The Truth About the September Wellness Reset',titleLines:['The Truth About the','September Wellness Reset'],img:'reading.jpg',author:'Margaret Cole',date:'2026-09-19',desc:'Why the fresh start you are waiting for is one you can build yourself, any day you choose.',body:`<p>If you’ve been on social media in the last three weeks, you’ve likely seen dozens of videos framing September as the new January.  And in some ways, it can be.  We are two-thirds of the way through the year, which may seem daunting, but this leaves four whole months to start the habit or work toward the goal you’ve been telling your friends you were going to begin but just didn’t have the time or motivation to.  But if we’re being honest, there isn’t much about September that makes it the perfect month to turn your life around—the timing is fairly arbitrary.  It’s still summer for the first three weeks of the month, and most high schools and colleges have already started their academic years.</p><p>The real appeal of September that influencers have been pushing is the idea of having a new beginning.  The concept of new beginnings has been studied extensively by some of the world’s top academics, such as Dr. Katy Milkman, a professor of behavioral economics at the Wharton School at the University of Pennsylvania.  Dr. Milkman’s 2021 book <em>How to Change: The Science of Getting from Where You Are to Where You Want to Be</em>, discusses the concept of “the fresh start effect,” which she coined back in a <a href="https://static1.squarespace.com/static/5353b838e4b0e68461b517cf/t/53b17c1be4b09fe9f6e12f32/1404140571261/the-fresh-start-effect.pdf" target="_blank" rel="noopener">2014 study</a>.  I had the privilege of not only reading Dr. Milkman’s book but also speaking to her in February about the fresh start effect.  Simply put, her theory is that landmark moments—such as New Year’s, your birthday, the first day of a new month, or even a Monday—make us feel mentally separate from our past failures and give us a temporary boost in motivation to change.</p><p>This theory isn’t necessarily groundbreaking because we actually implement the fresh start effect in our own lives all the time.  When was the last time that you told yourself that Monday was going to be the day you finally started waking up early, going to the gym more consistently, etc.?  In my opinion, the key implication of Dr. Milkman’s research is not the finding itself, but what we can do with an awareness of our psychological tendencies.  By knowing that we are more likely, at least temporarily, to experience a boost in motivation during landmark moments, we can construct our own fresh starts to strategically accomplish our goals.</p><p>Here is an example of how I have implemented this concept in my own life. On Monday, August 24th, I made a commitment to myself to start becoming a morning person.  Throughout June and July, I had fallen into a habit of giving myself just enough time to do the bare essentials before working my 9-to-5.  As a result, I was left trying to squeeze everything non-work-related into the few hours I had after getting home each day.  And, surprise, it wasn’t working—I was living reactively, not proactively.</p><p>What finally sparked my desire to change was something completely unexpected.  On Saturday, August 22nd, my mom sent me a link to wellness influencer Michaela Allocca’s podcast, which primarily deals with becoming a productive, independent woman in your 20s.  Two days later, while on a run, I listened to her episode titled “<a href="https://podcasts.apple.com/us/podcast/dont-depend-on-daddy/id1473703898?l=zh-Hans-CN" target="_blank" rel="noopener">How to Become a Morning Person | 6 Tips to Make Your Mornings Better That Actually Stick</a>.”  During the episode, Michaela talked about how we often try to jump from 1 to 100 when making big life changes, and how unrealistic this is when trying to build sustainable habits.  Instead, she recommended starting small and gradually adjusting your routine.</p><p>I realized that I had been doing exactly the opposite.  There had been several mornings in the previous months when I had told myself, tomorrow is it—I’m waking up at 5 a.m. and going on a 10-mile run. But when my alarm went off in the morning, I would immediately snooze it and go back to sleep.  This time, I decided to take a more reasonable approach: I would start small, make Monday my fresh start, and gradually work toward the morning routine I actually wanted.</p><p>And it worked.  It’s now been almost a month, and I have successfully conditioned myself to naturally wake up at 5:30 a.m.  With three hours of time for myself before work, I’ve found a renewed sense of motivation to accomplish my personal goals and prioritize my wellness.  More importantly, though, I put Dr. Milkman’s research into practice.  I chose a landmark moment—a Monday—to separate myself from the routine that wasn’t working, paired it with a goal that felt attainable, and gave myself the motivation to finally make a change.</p><p>My Monday morning wasn’t inherently different from any other Monday.  What made it different was that I decided it was a fresh start.</p><p>This is exactly what the September reset has become: an artificially constructed new beginning that we can use to harness motivation and change for the better.  Here’s the good news: if you didn’t start your end-of-year lock-in on September 1st, that’s okay!  There are so many landmark moments in your day-to-day life just waiting for you to capitalize on.  Now, this doesn’t mean that you should wait until October 1st, the start of the next quarter, your birthday, etc., to finally commit to making a change.  You have the capability (and should absolutely use it) to construct your own fresh start right now, and once you have, you’ll be able to look back and see just how much you were able to accomplish by simply choosing to begin.</p>`},
];
/* drafts used to be merged in ahead of the published articles here; see
   archive/story-composer.md. state.drafts is still in the saved state shape. */
const allArticles=()=>[...articles]
  .sort((x,y)=>(artDate(y.date)?.getTime()||0)-(artDate(x.date)?.getTime()||0));
/* Issue number: allArticles() runs newest-first, so the oldest is No. 01 and the
   newest is highest. Home slices the first three, which keeps these indices. */
const artNo=(a,i)=>{const n=allArticles();return String(n.length-(i??n.indexOf(a))).padStart(2,'0');};
function articleCard(a,i){return `<article class="tile" data-reveal><a href="#/read/${a.id}"><div class="tile-media">${a.img?`<img src="${A+a.img}" alt="${escapeHTML(a.desc)}" loading="lazy">`:`<span class="card-ph" role="img" aria-label="Photograph to come"><span class="ph-mark">${phMark()}</span><span class="ph-cap">Photo<br>to come</span></span>`}</div><p class="tile-meta"><span class="tile-index"><span class="tile-no">No. ${artNo(a,i)}</span>${a.date?`<time class="tile-date" datetime="${a.date}">${fmtShort(a.date)}</time>`:''}</span></p><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.desc)}</p></a></article>`;}
function readNext(current){
  const others=allArticles().filter(x=>x.id!==current).slice(0,3);
  if(!others.length)return '';
  return `<nav class="read-next" aria-label="Read next">
    <p class="rail-label">Read next</p>
    ${others.map(x=>`<a class="rn-item" href="#/read/${x.id}">
      <span class="rn-cat">${escapeHTML(x.category)}</span>
      <span class="rn-title">${escapeHTML(x.title)}</span>
      ${x.date?`<time class="rn-date" datetime="${x.date}">${fmtShort(x.date)}</time>`:''}
    </a>`).join('')}
  </nav>`;
}
const subscribeBox=()=>`<form class="subscribe" id="subscribe-form">
  <p class="rail-label">The VIRI edit</p>
  <p class="subscribe-copy">One letter a month. What we are reading, where we are moving, and who we met doing it.</p>
  <label class="sr-only" for="sub-email">Email address</label>
  <input id="sub-email" name="email" type="email" placeholder="you@example.com" required>
  <button class="button small" type="submit">Subscribe</button>
  <p class="subscribe-note">One letter now and then. Unsubscribe whenever you like.</p>
</form>`;
function readPage(id){if(id){const a=allArticles().find(x=>x.id===id);if(!a)return notFound();
  return `<article class="article">
    <div class="wrap">
      <a href="#/read" class="text-link">${arrowLeft} All stories</a>
      <header class="article-head${a.titleLines?' is-split':''}">
        <p class="eyebrow">${escapeHTML(a.category)} &middot; The VIRI edit</p>
        <h1>${a.titleLines?a.titleLines.map(escapeHTML).join(' <br>'):escapeHTML(a.title)}</h1>
        <div class="article-titles">
          <p class="standfirst">${escapeHTML(a.desc)}</p>
          <p class="byline">${a.date?`<time datetime="${a.date}">${fmtLong(a.date)}</time>`:''}${a.author?`<span class="byline-dot" aria-hidden="true">&middot;</span><span>By ${escapeHTML(a.author)}</span>`:''}</p>
        </div>
        <figure class="article-figure">${a.img?`<img src="${A+a.img}" alt="${escapeHTML(a.desc)}">`:`<span class="card-ph" role="img" aria-label="Photograph to come"><span class="ph-mark">${phMark()}</span><span class="ph-cap">Photo<br>to come</span></span>`}</figure>
      </header>
      <div class="article-body">
        <aside class="article-rail">${subscribeBox()}${readNext(a.id)}</aside>
        <div class="article-prose">
          ${a.body}
          <div class="article-foot">${button('Find your next ritual','#/explore')}</div>
        </div>
      </div>
    </div>
  </article>`;}
  return `<section class="page-head"><div class="wrap"><p class="eyebrow">The VIRI edit</p><h1>A little inspiration<br>for your everyday.</h1><p>Movement, community, and the rituals that bring us together.</p></div></section><section class="wrap" style="padding-bottom:80px"><div class="cards-three">${allArticles().map((a,i)=>articleCard(a,i)).join('')}</div></section><section class="edit-note"><div class="wrap"><div class="edit-note-inner"><h2>Choosing between your workout and your friends</h2><div class="edit-note-cols"><p>Friendships take upkeep, and upkeep takes time, which is often in short supply. Work takes most of the day. Whatever time is left tends to be stretched thin.</p><p>This shows up in the data. Researchers have found a real drop in the number of close friends Americans report having compared to a few decades ago. Longer hours, more moves, and more time spent alone. Some people manage to stay connected anyway, usually because they&rsquo;ve built specific time for it rather than waiting for it to happen.</p><p>We grew up in Colorado, where being active and being social were rarely separate plans, a hike doubled as a catch-up, a group ride doubled as how you met people. That&rsquo;s part of what got us thinking about this. But the real starting point was DC itself. The city is full of women showing up to the same studios, the same classes, week after week, often multiple times. The network already exists. What&rsquo;s been missing is a way to actually connect the people in it. Everyone&rsquo;s in the room together, and most people leave still strangers, straight past each other and on to the next thing.</p><h3>What VIRI is for</h3><p>VIRI is built to close that gap: a way to actually meet the people already showing up alongside you, on purpose, often enough that they stop being strangers. Staying active and staying connected don&rsquo;t have to compete for the same hour. Given the right setup, they can be the same hour.</p></div></div></div></section>`;}
/* ===================== Explore: map, classes, rosters ===================== */
/* No day, no time of day, no class: Explore lists studios now, and when
   somebody trains is something they tell us, not something we invent. */
let ex={city:'dc',cat:'All',members:false,query:'',venue:null};
let exView='studios';   /* 'studios' or 'passes': the two tabs under the city row */
const exCity=()=>VIRI.cities.find(c=>c.id===ex.city)||VIRI.cities[0];
const exVenue=id=>VIRI.venues.find(v=>v.id===id);
const exPerson=id=>VIRI.people.find(p=>p.id===id);
/* Real members live in state.people, the sample roster in VIRI.people.
   Pages should not have to know which they are holding. */
const personById=id=>(state.people&&state.people[id])||exPerson(id)||null;
let exAll=null;
/* buildClasses is gone. Studios are real; their timetables were not. */
const exVenues=()=>((window.VIRI&&VIRI.venues)||[]);


function exMatch(v){
  if(v.city!==ex.city)return false;
  if(ex.cat!=='All'&&v.cat!==ex.cat)return false;
  if(ex.members&&!((state.venueCounts||{})[v.id]))return false;
  if(ex.query){const q=ex.query.toLowerCase();
    if(!((v.brand+' '+v.area+' '+v.cat).toLowerCase().includes(q)))return false;}
  return true;
}
const exFiltered=()=>exVenues().filter(exMatch);

/* ---- map geometry ---- */
function exBox(city){
  /* frame on the studios and neighborhoods only — water and parks may run off the edge */
  const pts=[];
  VIRI.venues.forEach(v=>{if(v.city===city.id)pts.push([v.lon,v.lat]);});
  city.areas.forEach(a=>pts.push([a.lon,a.lat]));
  let w=Math.min(...pts.map(p=>p[0])),e=Math.max(...pts.map(p=>p[0]));
  let s=Math.min(...pts.map(p=>p[1])),n=Math.max(...pts.map(p=>p[1]));
  const px=(e-w)*0.14||0.01, py=(n-s)*0.14||0.01;
  w-=px;e+=px;s-=py;n+=py;
  const k=Math.cos((s+n)/2*Math.PI/180), target=640/1000;
  const dw=(e-w)*k, dh=n-s;
  if(dh/dw<target){const add=(dw*target-dh)/2;s-=add;n+=add;}
  else{const add=(dh/target/k-(e-w))/2;w-=add;e+=add;}
  return {w,e,s,n};
}
function exXY(b,lon,lat){return [(lon-b.w)/(b.e-b.w)*1000,(1-(lat-b.s)/(b.n-b.s))*640];}
const exPath=(b,line)=>line.map((p,i)=>(i?'L':'M')+exXY(b,p[0],p[1]).map(v=>v.toFixed(1)).join(' ')).join(' ');

function exSchematic(){
  const city=exCity(), b=exBox(city), list=exFiltered();
  const counts={}; list.forEach(c=>{counts[c.venue]=(counts[c.venue]||0)+1;});
  const venues=VIRI.venues.filter(v=>v.city===city.id);
  const water=city.water.map(l=>`<path d="${exPath(b,l)}" fill="none" stroke="var(--map-water)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const green=city.green.map(l=>`<path d="${exPath(b,l)+(l.length>2?' Z':'')}" fill="${l.length>2?'var(--map-green)':'none'}" stroke="var(--map-green)" stroke-width="${l.length>2?0:9}" stroke-linecap="round"/>`).join('');
  const pinPts=venues.map(v=>exXY(b,v.lon,v.lat));
  const placed=[];
  const labels=city.areas.map(a=>{
    const[x,y]=exXY(b,a.lon,a.lat);
    const half=a.n.length*5.2+12;
    let ly=y-20, tries=0;
    while(tries<3&&pinPts.some(p=>Math.abs(p[0]-x)<half+16&&p[1]>ly-16&&p[1]<ly+10)){ly-=24;tries++;}
    if(x-half<8||x+half>992||ly<24||ly>622)return '';
    if(pinPts.some(p=>Math.abs(p[0]-x)<half+16&&p[1]>ly-16&&p[1]<ly+10))return '';
    if(placed.some(p=>Math.abs(p[0]-x)<p[2]+half+18&&Math.abs(p[1]-ly)<24))return '';
    placed.push([x,ly,half]);
    return `<text class="map-area" x="${x.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">${escapeHTML(a.n.toUpperCase())}</text>`;}).join('');
  const pins=venues.map(v=>{
    const[x,y]=exXY(b,v.lon,v.lat), n=counts[v.id]||0, on=ex.venue===v.id;
    const r=n?9+Math.min(n,6)*1.5:6.5;
    return `<g class="map-pin ${on?'is-on':''} ${n?'':'is-empty'}" data-action="ex-venue" data-id="${v.id}" tabindex="0" role="button"
      aria-label="${escapeHTML(v.brand)}, ${escapeHTML(v.area)} — ${n} class${n===1?'':'es'}">
      <circle class="pin-halo" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r+9).toFixed(1)}"/>
      <circle class="pin-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/>
      ${n?`<text class="pin-n" x="${x.toFixed(1)}" y="${(y+4.2).toFixed(1)}" text-anchor="middle">${n}</text>`:''}
      <title>${escapeHTML(v.brand)} · ${escapeHTML(v.area)}</title></g>`;}).join('');
  return `<svg class="map-svg" id="ex-map" viewBox="0 0 1000 640" role="img" aria-label="${escapeHTML(city.name)} studio map">
      <rect x="0" y="0" width="1000" height="640" fill="var(--map-ground)"/>
      <g id="ex-mapg">${green}${water}${labels}${pins}</g>
    </svg>`;
}


/* ---- slippy tile map (no library: web-mercator tiles + markers) ---- */
const TILE=256, TILE_URL=(z,x,y)=>`https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
const lon2x=(lon,z)=>(lon+180)/360*Math.pow(2,z);
const lat2y=(lat,z)=>{const r=lat*Math.PI/180;return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*Math.pow(2,z);};
const x2lon=(x,z)=>x/Math.pow(2,z)*360-180;
const y2lat=(y,z)=>{const n=Math.PI-2*Math.PI*y/Math.pow(2,z);return 180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)));};
let mapS={z:13,cx:0,cy:0,pan:null,fail:0,ok:0,dead:false,city:null};

function exMap(){
  const city=exCity();
  return `<div class="map-shell">
    <div class="map-frame" id="ex-mapframe">
      <div class="map-world" id="ex-world" aria-hidden="true"></div>
      <div class="map-markers" id="ex-markers"></div>
      <div class="map-fallback" id="ex-fallback" hidden><div class="map-fallback-in">${exSchematic()}</div>
        <p class="map-fallback-note">Map tiles cannot load in this published preview &mdash; its security policy blocks outside images. Open the files locally and the real map appears here. This is the fallback.</p></div>
      <div class="map-tools">
        <button class="circle-button" data-action="ex-zoom" data-dir="in" aria-label="Zoom in">+</button>
        <button class="circle-button" data-action="ex-zoom" data-dir="out" aria-label="Zoom out">&minus;</button>
        <button class="circle-button" data-action="ex-zoom" data-dir="reset" aria-label="Fit all studios">&#8634;</button>
      </div>
      <p class="map-credit">&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors</p>
    </div>
    <p class="map-foot">${VIRI.venues.filter(v=>v.city===city.id).length} studios in ${escapeHTML(city.name)} &middot; drag to move &middot; locations approximate</p>
    <p class="map-note">Studio locations are approximate and listings do not imply a partnership. Check schedules and prices with the studio itself.</p>
  </div>`;
}
function exFitCity(){
  const city=exCity(), vs=VIRI.venues.filter(v=>v.city===city.id);
  const el=$('#ex-mapframe'); if(!el||!vs.length)return;
  const w=el.clientWidth||900, h=el.clientHeight||560;
  let z=17;
  for(;z>9;z--){
    const xs=vs.map(v=>lon2x(v.lon,z)*TILE), ys=vs.map(v=>lat2y(v.lat,z)*TILE);
    if(Math.max(...xs)-Math.min(...xs)<w-120&&Math.max(...ys)-Math.min(...ys)<h-120)break;
  }
  mapS.z=z; mapS.city=city.id;
  mapS.cx=vs.reduce((s,v)=>s+lon2x(v.lon,z),0)/vs.length;
  mapS.cy=vs.reduce((s,v)=>s+lat2y(v.lat,z),0)/vs.length;
}
function exDraw(){
  const frame=$('#ex-mapframe'), world=$('#ex-world'), marks=$('#ex-markers');
  if(!frame||!world)return;
  const w=frame.clientWidth, h=frame.clientHeight, z=mapS.z, n=Math.pow(2,z);
  const px=mapS.cx*TILE-w/2, py=mapS.cy*TILE-h/2;      /* world px of top-left */
  const x0=Math.floor(px/TILE)-1, y0=Math.floor(py/TILE)-1;
  const cols=Math.ceil(w/TILE)+3, rows=Math.ceil(h/TILE)+3;
  let html='';
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const tx=x0+c, ty=y0+r; if(ty<0||ty>=n)continue;
    const wx=((tx%n)+n)%n;
    html+=`<img class="map-tile" src="${TILE_URL(z,wx,ty)}" alt="" loading="eager" draggable="false"
      style="left:${Math.round(tx*TILE-px)}px;top:${Math.round(ty*TILE-py)}px">`;
  }
  world.innerHTML=html;
  world.querySelectorAll('.map-tile').forEach(t=>{
    t.addEventListener('error',()=>{if(++mapS.fail>=4&&!mapS.ok)exFallback(true);});
    t.addEventListener('load',()=>{mapS.ok++;});
  });
  if(marks){
    const counts={}; exFiltered().forEach(c=>{counts[c.venue]=(counts[c.venue]||0)+1;});
    marks.innerHTML=VIRI.venues.filter(v=>v.city===exCity().id).map(v=>{
      const mx=lon2x(v.lon,z)*TILE-px, my=lat2y(v.lat,z)*TILE-py, k=counts[v.id]||0;
      return `<button class="map-mark ${ex.venue===v.id?'is-on':''} ${k?'':'is-empty'}"
        style="left:${mx.toFixed(1)}px;top:${my.toFixed(1)}px" data-action="ex-venue" data-id="${v.id}"
        title="${escapeHTML(v.brand)} · ${escapeHTML(v.area)}"
        aria-label="${escapeHTML(v.brand)}, ${escapeHTML(v.area)} — ${k} class${k===1?'':'es'}">${k||''}</button>`;
    }).join('');
  }
}
function exFallback(on){
  mapS.dead=on;
  const f=$('#ex-fallback'), w=$('#ex-world'), m=$('#ex-markers'), c=$('#ex-credit');
  if(f)f.hidden=!on;
  if(w)w.style.visibility=on?'hidden':'visible';
  if(m)m.style.visibility=on?'hidden':'visible';
  $('#ex-mapframe')?.classList.toggle('is-fallback',on);
}
function exBindMap(){
  const frame=$('#ex-mapframe'); if(!frame)return;
  if(mapS.city!==exCity().id||!mapS.cx)exFitCity();
  mapS.fail=0;mapS.ok=0;
  exDraw();
  if(mapS.dead)exFallback(true);
  const pt=e=>{const t=e.touches?e.touches[0]:e;return {x:t.clientX,y:t.clientY};};
  const down=e=>{if(e.target.closest('.map-mark')||e.target.closest('.map-tools'))return;
    const p=pt(e);mapS.pan={x:p.x,y:p.y,cx:mapS.cx,cy:mapS.cy};frame.classList.add('is-dragging');};
  const move=e=>{if(!mapS.pan)return;const p=pt(e);
    mapS.cx=mapS.pan.cx-(p.x-mapS.pan.x)/TILE;mapS.cy=mapS.pan.cy-(p.y-mapS.pan.y)/TILE;
    exDraw();if(e.cancelable)e.preventDefault();};
  const up=()=>{mapS.pan=null;frame.classList.remove('is-dragging');};
  frame.addEventListener('mousedown',down);frame.addEventListener('touchstart',down,{passive:true});
  window.addEventListener('mousemove',move);frame.addEventListener('touchmove',move,{passive:false});
  window.addEventListener('mouseup',up);frame.addEventListener('touchend',up);
}
function exZoom(dir){
  if(dir==='reset'){exFitCity();exDraw();return;}
  const z=Math.min(18,Math.max(10,mapS.z+(dir==='in'?1:-1)));
  if(z===mapS.z)return;
  const k=Math.pow(2,z-mapS.z);
  mapS.cx*=k;mapS.cy*=k;mapS.z=z;
  mapS.fail=0;
  exDraw();
}

/* ---- people ---- */
function exAvatars(ids,max){
  const shown=ids.slice(0,max||4);
  return `<span class="av-stack">${shown.map(id=>{const p=personById(id);
    return `<span class="av" title="${escapeHTML(p?p.name:'')}">${escapeHTML(initials(p?p.name:'V'))}</span>`;}).join('')}${
    ids.length>shown.length?`<span class="av av-more">+${ids.length-shown.length}</span>`:''}</span>`;
}
const exLinked=id=>state.connections.includes(id)?'connected'
  :(state.incoming||[]).includes(id)?'incoming'
  :(state.requests||[]).includes(id)?'requested':'none';
function exConnectBtn(p){
  const s=exLinked(p.id);
  return `<button class="button small ${s==='none'?'':'outline'}" data-action="ex-connect" data-id="${p.id}"
    aria-pressed="${s!=='none'}" ${s==='connected'?'disabled':''}>${
    s==='connected'?'Connected &#10003;':s==='requested'?'Requested':'Connect'}</button>`;
}
function exPersonCard(p,cls){
  return `<article class="person">
    <button class="person-av" data-action="ex-person" data-id="${p.id}" aria-label="View ${escapeHTML(p.name)}'s profile">${escapeHTML(initials(p.name))}</button>
    <div class="person-body">
      <h4>${escapeHTML(p.name)}</h4>
      <p class="person-meta">${escapeHTML(p.area)} &middot; ${p.months} month${p.months===1?'':'s'} on VIRI &middot; ${p.classes} classes</p>
      <p class="person-line">${escapeHTML(p.line)}</p>
      <p class="person-cats">${p.cats.map(c=>`<span class="tag">${escapeHTML(c)}</span>`).join('')}</p>
    </div>
    <div class="person-act">${exConnectBtn(p)}</div>
  </article>`;
}

/* ---- class detail ---- */

function studiosPage(id){if(id){const s=studios.find(s=>s.id===id);if(!s)return notFound();return `<section class="page-head"><div class="wrap"><a class="text-link" href="#/studios">${arrowLeft} All studios</a><p class="eyebrow" style="margin-top:28px">${s.category}</p><h1>${s.name}</h1></div></section><div class="wrap studio-detail"><img src="${A+studioPhoto(s)}" alt="A studio space of the kind ${s.name} runs"><div class="studio-description"><h2>${s.intro}</h2><p>${s.description}</p><div class="studio-facts"><div><span class="small">The movement</span><br>${s.focus}</div></div><p class="small"><strong>Before you go</strong><br>${s.bring} Locations, formats, and amenities vary; confirm with the studio.</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px"><a class="button" href="${s.url}" target="_blank" rel="noopener">Visit studio website ${arrow}</a><button class="button outline" data-action="save-studio" data-id="${s.id}" aria-pressed="${state.saved.includes(s.id)}">${state.saved.includes(s.id)?'Saved ✓':'Save studio'}</button></div></div></div><div class="wrap">${info('Studio listings are for discovery. VIRI has no booking integration or confirmed partnership with these brands.')}<div class="community-banner"><div><h3>Find someone to go with.</h3><p>Explore shared plans and people who enjoy ${s.category.toLowerCase()}.</p></div><a href="#/explore" class="button" data-action="studio-explore" data-category="${s.category}">Explore ${s.category.toLowerCase()} ${arrow}</a></div></div>`;}return `<section class="page-head"><div class="wrap"><p class="eyebrow">Discover a new ritual</p><h1>A studio for every kind of you.</h1><p>Add your favorite places to move, then find your people.</p></div></section><section class="wrap" style="padding-bottom:80px"><div class="explore-grid">${studios.map(studioCard).join('')}</div></section>`;}
const phMark=()=>`<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="1" y="1" width="46" height="38" rx="1"/><circle cx="16" cy="14" r="4.2"/><path d="M4 33l12-11 8 7 7-6 13 11"/></svg>`;
function aboutPage(){return `<section class="about-hero is-placeholder"><div class="about-hero-ph" aria-hidden="true"><span class="ph-mark">${phMark()}</span><span class="ph-cap">Hero photograph<br>to come</span></div><div class="wrap"><p class="eyebrow">Vitality Ritual</p><h1>Build Community<br>Around What<br>Moves You.</h1>${button('join now','#/signup','light')}</div></section><section class="section"><div class="wrap about-story"><h2>Make a big city<br>feel a little smaller.</h2><div class="prose"><p>VIRI is a social network for people who want to live actively and connect locally. Build your own circle by discovering people in your area who share your interests, attend the same studios, take similar classes, follow similar routines, or have similar schedules.</p><p>Whether it’s finding a Pilates or yoga class, a new weight lifting buddy, or a partner to train for your next marathon with, VIRI helps you connect with people outside your existing network from across your city. Meet new people, build your community, and create your own corner of the city.</p></div></div></section>
<section class="philosophy" data-reveal><div class="philosophy-band">
  <figure class="philosophy-media"><img src="${A}studio-sculpt.jpg" alt="Women working out together in a bright studio" loading="lazy"></figure>
  <div class="philosophy-copy">
    <p class="eyebrow">Our philosophy</p>
    <h2>The workout was never the hard part.</h2>
    <p>Most people in a new city already know what they want to do. They know the class, the route, the hour that works. What is currently lacking is the consistency of having other people to do it with, and that is the part no fitness app has tried to solve. Studios sell you a spot in a room. They do not introduce you to the person on the next mat.</p>
    <p>So VIRI starts from the other end. You tell us what you already do and when, and we show you the people nearby doing the same thing at the same time \u2014 not strangers to be matched with, but people you were going to stand beside anyway.</p>
    <p>The <a href="https://www.sciencedirect.com/science/article/pii/S0091743516300147" target="_blank" rel="noopener">research</a> here is unglamorous and consistent: people who train alongside others, in groups that feel like groups rather than rooms full of individuals, stay with it markedly longer than people training alone. Belonging is one of the strongest predictors of whether someone is still showing up months later. The social part is not a nice extra on top of the habit. It is what makes the habit hold.</p>
    <p class="philosophy-note">Our co-founder Margaret holds a BA in sociology, where course after course came back to the same finding \u2014 that community and connection sit underneath physical and mental wellbeing rather than beside them. VIRI is that idea, built for the hour of the day when people are already together and not yet talking.</p>
  </div>
</div></section>
<section class="section founders" data-reveal><div class="wrap">
  <h2 class="founders-title"><span class="f-script">Meet&nbsp;the</span><span class="f-serif">Founders</span></h2>
  <div class="founders-grid">
    <article class="founder-letter">
      <div class="prose">
        <p>Growing up in Colorado, I was always active &mdash; running, skiing, swimming, tennis, golf, hiking, you name it. Making friends through fitness was easy, because my classmates were just as into the active lifestyle as I was. The pattern continued in college, but once I graduated and moved to Washington, DC, the disconnect between fitness and connection was obvious. Everyone was in their own world, but weirdly, right next to each other, often living parallel lives.</p>
        <p>I would show up to my early morning workout classes and think the whole time, &ldquo;Why is she up at 5am too? When did she move here? Is she training for something? Maybe she works in corporate.&rdquo;</p>
        <p>But we live in an age of digital connection, where walking up to someone in your workout class and starting a conversation is far harder than it sounds. That was when I realized we needed VIRI.</p>
        <p>VIRI takes the routines you have already built and elevates them. Our goal is to connect you with the people nearby living the same lifestyle, because the power of social connection is backed by science. Whether you are looking for someone to chat with before class or an accountability partner, we guarantee that you will benefit.</p>
      </div>
      <p class="founders-sign"><span class="founder-signature">Margaret</span>
        <span class="founders-role">Margaret Cole &middot; Co-founder</span></p>
    </article>
    <article class="founder-letter">
      <div class="prose">
        <p>I grew up in Colorado too, where exercise and friendship were often the same thing. Staying active never felt separate from being social &mdash; it simply was the social activity.</p>
        <p>I was also a gymnast for almost a decade, which taught me that training is easier and far more rewarding with a team. The work felt lighter with others beside me, the hard days were shared, and I showed up knowing that people were counting on me. Motivation was built into the routine, and I never had to look far for it.</p>
        <p>College worked much the same way. A big city does not. Most adults are absorbed in their own responsibilities, living in different neighborhoods and keeping different hours, so the routines that used to form without effort become much harder to find. Health and wellness are usually the first thing a full schedule pushes aside, even for people who care deeply.</p>
        <p>I missed having a team, and I suspected many others did too. That is why we started VIRI &mdash; so that working out in company becomes as ordinary in a city as it was for me growing up. I have seen the difference between training alone and training together, and most people would choose the second if it were easier to find.</p>
      </div>
      <p class="founders-sign"><span class="founder-signature">Annabel</span>
        <span class="founders-role">Annabel Green &middot; Co-founder</span></p>
    </article>
    <figure class="founders-photo" aria-label="Photograph of Margaret and Annabel — to come">
      <span class="ph-mark">${phMark()}</span><span class="ph-cap">A photograph of<br>Margaret &amp; Annabel<br>to come</span>
    </figure>
  </div>
  <a class="button outline founders-cta" href="#/connect">Contact us ${arrow}</a>
</div></section>${joinSection()}`;}
/* Where the contact form and the report notifications deliver. FormSubmit
   relays them without a backend, which this static site has no way to
   provide. The address is activated and sending; see relayDelivered in db.js
   for why a 200 from this service does not mean a message went anywhere. */
const CONTACT_EMAIL='info@vitalityritual.org';
const contactEndpoint=()=>CONTACT_EMAIL?`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`:'';
function contactPage(){return `<section class="page-head"><div class="wrap"><p class="eyebrow">Contact us</p><h1>Good things start<br>with a conversation.</h1><p>Questions, press, partnerships, or a studio that belongs on VIRI — write to us here.</p></div></section>
<div class="wrap contact-wrap">
  ${CONTACT_EMAIL?'':note('The VIRI inbox is not live yet, so notes sent from this preview are not delivered.')}
  <form id="contact-form" class="contact-form" novalidate>
    <div class="field-pair">
      <div class="field"><label class="visually-hidden" for="ct-first">First name</label>
        <input id="ct-first" name="first" placeholder="First name" autocomplete="given-name" maxlength="40"></div>
      <div class="field"><label class="visually-hidden" for="ct-last">Last name</label>
        <input id="ct-last" name="last" placeholder="Last name" autocomplete="family-name" maxlength="40"></div>
    </div>
    <div class="field"><label class="visually-hidden" for="ct-email">Email address</label>
      <input id="ct-email" name="email" type="email" placeholder="Email address" autocomplete="email" maxlength="120"></div>
    <div class="field"><label class="visually-hidden" for="ct-message">How can we help?</label>
      <textarea id="ct-message" name="message" placeholder="How can we help?" maxlength="2000"></textarea></div>
    <p id="ct-error" class="field-error" role="alert"></p>
    <button class="button contact-send" type="submit">Send ${arrow}</button>
  </form>
</div>`;}
function thanksPage(){return `<div class="wrap handoff"><div class="handoff-card thanks-card">
  <p class="eyebrow">Thank you</p>
  <h1>Your note has been sent.</h1>
  <p>We have it, and we will get back to you at our earliest convenience.</p>
  ${CONTACT_EMAIL?"":note("The VIRI inbox is not live yet, so this note was not delivered.")}
  <div class="thanks-actions">${button('Back to home','#/','small outline')}${button('Explore VIRI','#/explore','small')}</div>
</div></div>`;}
function bindContact(){
  const f=$('#contact-form');if(!f)return;
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const err=$('#ct-error'), btn=f.querySelector('button[type=submit]'), fd=new FormData(f);
    const first=String(fd.get('first')||'').trim(), last=String(fd.get('last')||'').trim();
    const email=String(fd.get('email')||'').trim(), message=String(fd.get('message')||'').trim();
    if(!first||!last){err.textContent='Please enter your first and last name.';return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){err.textContent='Please enter an email address we can reply to.';return;}
    if(!message){err.textContent='Please tell us what your inquiry is about.';return;}
    err.textContent='';
    const url=contactEndpoint();
    if(url){
      const label=btn.innerHTML; btn.disabled=true; btn.textContent='Sending…';
      try{
        const res=await fetch(url,{method:'POST',
          headers:{'Content-Type':'application/json',Accept:'application/json'},
          body:JSON.stringify({name:`${first} ${last}`,email,message,
            _subject:'New inquiry from vitalityritual.org',_captcha:'false',_template:'table'})});
        await relayDelivered(res);
      }catch(_){
        btn.disabled=false; btn.innerHTML=label;
        err.textContent='That did not send. Please try again in a moment.';
        return;
      }
    }
    location.hash='#/thanks';
  });
}
/* the sign-up screen takes the name only; the rest is asked one question at a
   time on #/join, which starts on the email step because the name is in hand */
function exPanel(){return exMap();}

/* ---- class list ---- */
/* A studio, what it is, and how many members say they train there. The count
   is the only thing VIRI knows that a map would not tell you. */
function exRow(v){
  const n=(state.venueCounts||{})[v.id]||0;
  const saved=(state.saved||[]).includes(v.id);
  const mine=(state.routines||[]).filter(r=>r.venueId===v.id);
  return `<article class="cls-row">
    <div class="cls-main">
      <h3>${escapeHTML(v.brand)}</h3>
      <p class="small">${escapeHTML(v.area)} &middot; ${escapeHTML(v.cat)}</p>
      ${n?`<p class="cls-going">${n} member${n===1?'':'s'} train${n===1?'s':''} here</p>`:''}
      ${mine.length?`<p class="cls-going">In your week: ${mine.map(r=>escapeHTML(WEEKDAYS[r.weekday]+', '+r.band)).join('; ')}</p>`:''}
    </div>
    <div class="cls-actions">
      <button class="button small" data-action="add-routine" data-id="${escapeHTML(v.id)}">Add to my week</button>
      <button class="button small outline" data-action="save-studio" data-id="${escapeHTML(v.id)}">${saved?'Saved':'Save'}</button>
    </div>
  </article>`;
}
function exList(){
  const list=exFiltered();
  const head=`<p class="small ex-count" role="status">${list.length} studio${list.length===1?'':'s'}</p>`;
  if(!list.length)return head+`<div class="empty-state">
    <h3>Nothing here yet.</h3><p>Try another activity, or clear the filters.</p>
    <button class="button small outline" data-action="ex-reset" style="margin-top:18px">Clear filters</button></div>`;
  return head+`<div class="cls-list">${list.map(exRow).join('')}</div>`;
}

/* ---- page ---- */
function exHead(){return `<section class="page-head"><div class="wrap"><div class="page-head-row">
    <div>
    <h1>Every studio near you.<br>And who trains there.</h1>
    <p>Add the ones you go to, and VIRI finds the women who are in the room with you.</p></div>
  </div></div></section>`;}
function exCityTabs(){return `<div class="ex-cities" role="tablist" aria-label="City">${VIRI.cities.map(c=>
      `<button role="tab" class="city-tab ${c.id===ex.city?'active':''}" data-action="ex-city" data-id="${c.id}"
        aria-selected="${c.id===ex.city}">${escapeHTML(c.name)}</button>`).join('')}</div>
    <div class="ex-views" role="tablist" aria-label="What to look at">
      <button role="tab" class="view-tab ${exView==='studios'?'active':''}" data-action="ex-view" data-view="studios" aria-selected="${exView==='studios'}">Studios</button>
      <button role="tab" class="view-tab ${exView==='passes'?'active':''}" data-action="ex-view" data-view="passes" aria-selected="${exView==='passes'}">Available guest passes</button>
    </div>`;}
function explorePage(){
  if(exView==='passes')return `${exHead()}<div class="wrap">${exCityTabs()}${passesView()}</div>`;
  return `${exHead()}
  <div class="wrap">
    ${exCityTabs()}
    <div class="toolbar">
      <label class="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg>
        <input type="search" id="ex-search" aria-label="Search studios" placeholder="A studio or a neighbourhood" value="${escapeHTML(ex.query)}"></label>
      <button class="chip ${ex.members?'active':''}" data-action="ex-members" aria-pressed="${ex.members}">Where members train</button>
    </div>
    <div class="chips" aria-label="Activity">${['All'].concat(VIRI.categories).map(c=>
      `<button class="chip ${ex.cat===c?'active':''}" data-action="ex-cat" data-cat="${c}" aria-pressed="${ex.cat===c}">${c}</button>`).join('')}</div>
    <div class="ex-layout">
      <div class="ex-panel" id="ex-panel">${exPanel()}</div>
      <div class="ex-side" id="ex-side">${exList()}</div>
    </div>
  </div>`;
}
function exRefresh(both){
  const p=$('#ex-panel'), s=$('#ex-side');
  if(s)s.innerHTML=exList();
  if(p&&both!==false){p.innerHTML=exPanel();exBindMap();}
}
function exPersonModal(id){
  const p=personById(id); if(!p)return;
  /* What she said her week looks like, rather than classes we invented for her. */
  const upcoming=((personById(id)||{}).routines||[]).slice(0,4);
  openModal(escapeHTML(p.name),`<p class="modal-meta">${escapeHTML(p.area)} &middot; ${escapeHTML((VIRI.cities.find(c=>c.id===p.city)||{}).name||'')}</p>
    <p>${escapeHTML(p.line)}</p>
    <p class="person-cats">${p.cats.map(c=>`<span class="tag">${escapeHTML(c)}</span>`).join('')}</p>
    <p class="small">${p.months} month${p.months===1?'':'s'} on VIRI &middot; ${p.classes} classes logged &middot; illustrative profile</p>
    ${upcoming.length?`<h3 class="modal-sub">Also going to</h3><ul class="modal-list">${upcoming.map(c=>{
      const v=exVenue(c.venue);return `<li>${escapeHTML(c.title)} &middot; ${escapeHTML(v.brand)} &middot; ${prettyDate(c.start)} ${prettyTime(c.start)}</li>`;}).join('')}</ul>`:''}
    <div class="dialog-actions">${exConnectBtn(p)}
      <button class="button small outline" data-action="close-modal">Close</button></div>`);
}
async function exConnect(id){
  if(!signedIn()){toast('Create your profile first so they know who is reaching out.');location.hash='#/signup';return;}
  const p=personById(id);
  /* The sample roster has no accounts behind it, so a request would have
     nowhere to go. Say so rather than pretending it was sent. */
  if(!isRealAccount(id)){toast('This is a sample member, so there is no one to send a request to.');return;}
  const linked=exLinked(id);
  if(linked==='connected')return;
  if(linked==='incoming'){
    const r=await dbAcceptConnection(id);
    if(r.error){toast(r.error.message);return;}
    toast(`You and ${p?p.name:'they'} are now friends.`);
  }else if(linked==='requested'){
    const r=await dbRemoveConnection(id);
    if(r.error){toast(r.error.message);return;}
    toast('Request withdrawn.');
  }else{
    const r=await dbRequestConnection(id);
    if(r.error){toast(r.error.message);return;}
    toast(`Request sent to ${p?p.name:'them'}.`);
  }
  save();render(false);if($('#modal').open)requestsModal();
}


function eventDetails(id){const e=allEvents().find(x=>x.id===id);if(!e)return;const s=studios.find(s=>s.id===e.studio);openModal(escapeHTML(e.title),`<p class="eyebrow">${escapeHTML(e.category)} · ${e.type==='club'?'Community club':'Group activity'}</p><p class="dialog-copy">${prettyDate(e.date)} at ${prettyTime(e.date)}<br>${e.duration} minutes · ${escapeHTML(e.place)}</p>${e.description?`<p style="margin-top:20px">${escapeHTML(e.description)}</p>`:''}<div class="notice-box small">${e.custom?'This activity was created in your local preview. It has not been posted to a live network.':'Example activity and approximate location. This is not a real class schedule or a confirmed booking.'}</div>${s?`<p>Interested in ${s.name}? Check its official site for actual locations, schedules, and booking.</p><p style="margin-top:10px"><a class="text-link" href="${s.url}" target="_blank" rel="noopener">Visit ${s.name} ${arrow}</a></p>`:''}<div class="dialog-actions"><button class="button outline small" data-action="show-map" data-id="${e.id}">Show on map</button><button class="button small" data-action="join-event" data-id="${e.id}">${state.joined.includes(e.id)?'Leave activity':'Join activity'}</button></div>`);}
/* Joining applied to a class VIRI had invented. Studios are added to your
   week instead, which is a statement you make rather than a booking. */
function toggleJoin(id){ routineModal(id); }
/* the sign-up screen takes the name only; the rest is asked one question at a
   time on #/join, which starts on the email step because the name is in hand */
function polaroidPage(){return `<section class="pola-page"><div class="pola-field" aria-hidden="true"><span class="pola" style="--l:0%;--t:2%;--r:-8deg;--d:1.0s"><span class="pola-shot"></span></span><span class="pola" style="--l:17%;--t:22%;--r:6deg;--d:3.0s"><span class="pola-shot"></span></span><span class="pola" style="--l:34%;--t:0%;--r:-5deg;--d:0.0s"><span class="pola-shot"></span></span><span class="pola" style="--l:52%;--t:20%;--r:7deg;--d:2.33s"><span class="pola-shot"></span></span><span class="pola" style="--l:70%;--t:2%;--r:-6deg;--d:1.67s"><span class="pola-shot"></span></span><span class="pola" style="--l:78%;--t:46%;--r:5deg;--d:0.67s"><span class="pola-shot"></span></span><span class="pola" style="--l:56%;--t:54%;--r:-7deg;--d:1.33s"><span class="pola-shot"></span></span><span class="pola" style="--l:34%;--t:44%;--r:6deg;--d:2.67s"><span class="pola-shot"></span></span><span class="pola" style="--l:13%;--t:56%;--r:-4deg;--d:0.33s"><span class="pola-shot"></span></span><span class="pola" style="--l:-3%;--t:38%;--r:8deg;--d:2.0s"><span class="pola-shot"></span></span></div><a class="pola-join" href="#/signup" aria-label="Join now"><span class="pola-word" aria-hidden="true"><span style="--i:0">J</span><span style="--i:1">O</span><span style="--i:2">I</span><span style="--i:3">N</span><span class="pola-sp"> </span><span style="--i:4">N</span><span style="--i:5">O</span><span style="--i:6">W</span></span></a><p class="pola-foot">Already have a profile? <a href="#/login">Log in</a></p></section>`;}
function signupPage(){return `<section class="signup-split">
  <figure class="signup-split-shot">
    <img src="${A}signup-viri.webp" alt="A woman in a standing bow pose against a warm wall, with the VIRI wordmark across the picture">
  </figure>
  <div class="signup-split-form">
    <div class="signup-split-inner">
      <h1>Sign up now</h1>
      <form id="signup-form" novalidate>
        <div class="field"><label class="visually-hidden" for="su-first">First name</label>
          <input id="su-first" name="first" placeholder="First name" autocomplete="given-name" maxlength="40"></div>
        <div class="field"><label class="visually-hidden" for="su-last">Last name</label>
          <input id="su-last" name="last" placeholder="Last name" autocomplete="family-name" maxlength="40"></div>
        <p id="su-error" class="field-error" role="alert"></p>
        <button class="button" type="submit">Go ${arrow}</button>
      </form>
      <p class="signup-foot">Already have a profile? <a href="#/login">Log in</a></p>
    </div>
  </div>
</section>`;}
function bindSignup(){
  const f=$('#signup-form');if(!f)return;
  $('#su-first')?.focus({preventScroll:true});
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(f), err=$('#su-error');
    const first=String(fd.get('first')||'').trim(), last=String(fd.get('last')||'').trim();
    if(!first||!last){err.textContent='Please enter your first and last name.';return;}
    joinData.name=`${first} ${last}`;
    joinStep=1;
    goTo('#/join');
  });
}
/* Sign-up asks five things. The first - first and last name - is the sign-up
   page itself, so #/join opens on 02 and the counter still reads out of 05. */
/* alphabetical, with the two catch-all answers held at the end rather than
   sorted into the middle of the activities */
const JOIN_FORMS=['Barre','Bootcamp','Dance','Golf','HIIT','Hiking','Indoor cycling','Outdoor cycling','Pilates','Rowing','Running','Skiing','Snowboarding','Strength training','Swimming','Tennis','Walking','Yoga','Other','No preference'];
const JOIN_TIMES=['Before 5am','5–7am','8–10am','10–12pm','12–3pm','3–5pm','5–7pm','8pm Onward'];
const JOIN_STUDIOS=studios.map(s=>s.name).concat('I’m flexible');
/* the two opt-out answers clear every other box in their group, and any other
   box clears them - holding both at once says nothing */
const JOIN_ANY={forms:'No preference',studios:'I’m flexible'};
const US_STATES=['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','American Samoa','Guam','Northern Mariana Islands','Puerto Rico','U.S. Virgin Islands'];
/* the placeholder sits in the box, so the list underneath offers different ones */
const BIO_PLACEHOLDER='Corporate girl training for a marathon and looking for a running buddy.';
const BIO_EXAMPLES=[
  'Just moved to DC and looking for a pilates and cycling partner.',
  'Early riser. 6am classes, coffee after, always up for a new studio.',
  'Training for my first half and would love company on long runs.',
  'Lifting four days a week and looking for someone to keep me honest.'
];
/* The placeholder is deliberately not one of these: five suggestions plus a
   sixth already in the box reads as a closed list, and this field takes
   anything somebody wants to type. */
const INDUSTRY_EXAMPLES=['Marketing','Startup','Graduate studies','Finance','Tech'];
const JOIN_STEPS=[
  {key:'name',type:'text',q:'What should we call you?',hint:'However you introduce yourself in class.',placeholder:'First and last name',autocomplete:'name',required:true},
  {key:'email',type:'account',q:'Where can we reach you?',hint:'Your email is how you sign back in. It is never shown to other members.',required:true},
  {type:'training',q:'How you train.',hint:'All three are optional, and nothing here is locked in.'},
  {type:'location',q:'Where do you train most?',hint:'This is how we show you the people and studios nearby.'},
  {type:'personal',q:'A little more about you.',hint:'All optional, and all of it helps us put you next to people you would actually get on with.'}
];
/* VIRI is 18+. Not only because the form introduces strangers who then meet
   alone, but because a minor can generally disaffirm a contract — including
   the liability waiver in the terms, which is the only thing standing behind
   this product. A waiver that a 16-year-old can walk away from protects
   nobody, so the form cannot express an age that could rely on it. */
const YEAR_NOW=new Date().getFullYear();
const BIRTH_YEARS=Array.from({length:75},(_,i)=>YEAR_NOW-18-i);
const GRAD_YEARS=Array.from({length:77},(_,i)=>YEAR_NOW+6-i);
/* A year gives an age that is wrong for anyone whose birthday has not come
   round yet, which is about half of people at any moment. Count from the
   date when there is one. */
function ageOf(v){
  if(!v)return null;
  const s=String(v);
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)){
    const b=new Date(s+'T00:00:00'), n=new Date();
    let age=n.getFullYear()-b.getFullYear();
    const m=n.getMonth()-b.getMonth();
    if(m<0||(m===0&&n.getDate()<b.getDate()))age--;
    return age;
  }
  return YEAR_NOW-Number(s);   /* older profiles that only stored a year */
}
/* The latest date of birth that is already 18 today. */
const OLDEST_MINOR=()=>{const d=new Date();d.setFullYear(d.getFullYear()-18);return d.toISOString().slice(0,10);};
let joinStep=0, joinData={name:'',email:'',password:'',forms:[],times:[],studios:[],region:'',city:'',
  birthYear:'',college:'',collegeYear:'',industry:'',photo:'',bio:''};
const checkGrid=(name,options,chosen,cols='')=>`<div class="check-grid${cols}">${options.map(o=>
  `<label class="check-box"><input type="checkbox" name="${name}" value="${escapeHTML(o)}"${chosen.includes(o)?' checked':''}><span>${escapeHTML(o)}</span></label>`).join('')}</div>`;
function joinControl(s){
  if(s.type==='training')return `
    <fieldset class="join-set"><legend>What are your primary forms of exercise?</legend>
      ${checkGrid('forms',JOIN_FORMS,joinData.forms)}</fieldset>
    <fieldset class="join-set"><legend>What are the primary times you exercise?</legend>
      ${checkGrid('times',JOIN_TIMES,joinData.times)}</fieldset>
    <fieldset class="join-set"><legend>Attend any of these regularly? Add them to your favorites:</legend>
      ${checkGrid('studios',JOIN_STUDIOS,joinData.studios,' is-wide')}</fieldset>`;
  if(s.type==='location')return `
    <div class="field"><label for="join-region">State or territory</label>
      <select id="join-region" name="region"><option value="">Select one</option>${US_STATES.map(r=>
        `<option${joinData.region===r?' selected':''}>${escapeHTML(r)}</option>`).join('')}</select></div>
    <div class="field"><label for="join-city">Your primary city <span class="field-optional">Optional</span></label>
      <input id="join-city" name="city" placeholder="Washington" autocomplete="address-level2" maxlength="60" value="${escapeHTML(joinData.city||'')}"></div>`;
if(s.type==='account')return `
    <div class="field"><label for="join-input">Email address</label>
      <input id="join-input" name="email" type="email" autocomplete="email" placeholder="you@example.com" value="${escapeHTML(joinData.email||'')}"></div>
    <div class="field"><label for="join-pass">Choose a password</label>
      <input id="join-pass" name="password" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters" value="${escapeHTML(joinData.password||'')}">
      <p class="field-eg">Eight characters or more. You can also sign in with Google once that is switched on.</p></div>
    <label class="check-box join-women"><input type="checkbox" id="join-woman" name="woman"${joinData.woman?' checked':''}><span>VIRI is for women. I confirm I am a woman.</span></label>
    <label class="check-box join-agree"><input type="checkbox" id="join-agree" name="agree"${joinData.agree?' checked':''}><span>I agree to the <a href="#/terms" target="_blank" rel="noopener">Terms</a> and <a href="#/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>`;
  if(s.type==='personal')return `
    <div class="field"><label for="join-born">Date of birth</label>
      <input id="join-born" name="birthDate" type="date" required max="${OLDEST_MINOR()}" value="${escapeHTML(joinData.birthDate||'')}">
      <label class="check-box show-age"><input type="checkbox" id="join-showage" name="showAge"${joinData.showAge?' checked':''}><span>Show my age on my profile</span></label>
      <p class="field-eg">We ask because VIRI is for over-18s. Whether anyone else sees it is up to you, and you can change this in Settings later.</p></div>
    <fieldset class="join-set college-block">
      <legend>Did you go to college?</legend>
      <label class="check-box"><input type="checkbox" id="join-went" name="went"${joinData.college||joinData.collegeYear?' checked':''}><span>Yes, I went to college</span></label>
      <div class="college-more">
        <div class="field"><label for="join-college">Where</label>
          <input id="join-college" name="college" maxlength="70" placeholder="Georgetown University" value="${escapeHTML(joinData.college||'')}"></div>
        <div class="field"><label for="join-grad">Graduated</label>
          <select id="join-grad" name="collegeYear"><option value="">Prefer not to say</option>${GRAD_YEARS.map(y=>
            `<option value="${y}"${joinData.collegeYear==String(y)?' selected':''}>${y}</option>`).join('')}</select></div>
      </div>
    </fieldset>
    <div class="field"><label for="join-industry">What industry do you work in? <span class="field-optional">Optional</span></label>
      <input id="join-industry" name="industry" maxlength="50" placeholder="Consulting" value="${escapeHTML(joinData.industry||'')}">
      <div class="field-eg"><p>For example:</p><ul>${INDUSTRY_EXAMPLES.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div></div>`;
  return `<input id="join-input" name="${s.key}" type="${s.type}" placeholder="${s.placeholder}" autocomplete="${s.autocomplete}" value="${escapeHTML(joinData[s.key]||'')}" maxlength="80">`;
}
/* the header icon and the menu's "Your circle" group send you to sign-up
   until a profile exists on this device, and to the profile once it does */
/* A real session decides this now, not a local flag: authUser comes from
   Supabase and state.profile is only filled once that exists. */
const signedIn=()=>!!(typeof authUser!=='undefined'&&authUser)&&!!state.profile;
/* assigning the hash it already holds fires no hashchange, so a route that
   sends you where you already are has to re-render by hand */
const goTo=h=>{if(location.hash===h)render();else location.hash=h;};
/* The header has two shapes. Signed out it is the marketing site: Explore,
   Studios, Read, About. Signed in it is the product: Feed, Explore, Messages,
   My profile, with the marketing links folded into the burger and the account
   behind the avatar. The signed-out markup is captured once at load so there is
   one source of truth to restore to. */
const HEADER_OUT={
  left:$('.nav-left')?.innerHTML||'',
  right:$('.nav-right')?.innerHTML||'',
  icon:$('#account-button')?.innerHTML||'',
  menu:$('#menu-panel')?.innerHTML||''
};
const CHEV='<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const navItem=(href,label,here,count)=>`<a href="${href}"${here?' aria-current="page"':''}>${label}` +
  `${count?`<span class="nav-dot" aria-label="${count} unread">${count}</span>`:''}</a>`;
/* Nothing here was ever checked again after the page loaded, so a message or a
   request only appeared if you happened to reload. This looks every half
   minute, and only redraws when something actually changed — redrawing on a
   timer would fight with whatever you were typing. */
let pollTimer=null, lastSignature='';
function signatureOf(){
  return JSON.stringify([
    (state.incoming||[]).slice().sort(),
    (state.connections||[]).slice().sort(),
    (state.unread||[]).slice().sort(),
    Object.entries(state.threads||{}).map(([k,v])=>[k,v.length]).sort(),
    (state.notifications||[]).map(n=>n.id+(n.read?'r':''))
  ]);
}
async function pollForNews(){
  if(!signedIn()||document.hidden)return;
  try{
    await dbLoadConnections();
    await dbLoadMessages();
    if(typeof dbLoadNotifications==='function')await dbLoadNotifications();
  }catch(e){return;}
  const now=signatureOf();
  if(now===lastSignature)return;
  lastSignature=now;
  /* Leave a half-written message alone. */
  const typing=document.activeElement;
  const guard=typing&&/^(INPUT|TEXTAREA)$/.test(typing.tagName)&&typing.value;
  if(guard){syncAccountLinks();return;}
  render(false);
}
function startPolling(){
  if(pollTimer)return;
  lastSignature=signatureOf();
  pollTimer=setInterval(pollForNews,30000);
  setTimeout(pollForNews,1200);   /* first look straight away, not in thirty seconds */
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)pollForNews();});
}

function syncAccountLinks(){
  const on=signedIn();
  if(on)startPolling();
  if(on&&typeof askAboutYesterday==='function')setTimeout(askAboutYesterday,900);
  const here=(location.hash.replace(/^#\/?/,'')||'').split('/')[0];
  const left=$('.nav-left'), right=$('.nav-right'),
        icon=$('#account-button'), panel=$('#account-panel'),
        card=$('#account-card'), menu=$('#menu-panel');
  /* signed in the brand moves to the left and becomes the way back to the
     feed, so Feed stops being a separate word; what is left beside it is
     the two places you go, with the account and the burger on the right */
  const brand=$('.wordmark');
  if(brand){brand.setAttribute('href',on?'#/feed':'#/');
    brand.setAttribute('aria-label',on?'VIRI \u2014 your feed':'VIRI \u2014 Vitality Ritual, home');}
  $('.site-header')?.classList.toggle('is-in',on);
  /* Search is for finding members, so it appears with the rest of the
     signed-in tools rather than to visitors who have nobody to find. */
  /* The count is the point of the button: a request nobody notices is a
     request nobody answers. */
  const req=$('#requests-button');
  const waitingOn=on?(state.incoming||[]).length:0;
  if(req){req.hidden=!on;req.dataset.badge=waitingOn||'';
    req.setAttribute('aria-label',waitingOn?`Requests, ${waitingOn} waiting for you`:'Requests');}
  const seek=$('#search-button');
  if(seek){seek.hidden=!on;seek.classList.toggle('is-here',here==='find');}
  const bell=$('#notes-button');
  if(bell){const n=on?(state.unseenNotes||0):0;bell.hidden=!on;bell.dataset.badge=n?(n>9?'9+':String(n)):'';
    bell.setAttribute('aria-label',n?`Notifications, ${n} new`:'Notifications');bell.classList.toggle('is-here',here==='notifications');}
  const make=$('#create-button');
  const waiting=on?pendingPlans().length:0;
  if(make){make.hidden=!on;
    make.dataset.badge=waiting||'';
    make.setAttribute('aria-label',waiting?`Log a session \u2014 ${waiting} class${waiting===1?'':'es'} to confirm`:'Log a session');}
  if(left)left.innerHTML=on
    ? navItem('#/explore','Explore',here==='explore')
      +navItem('#/messages','Messages',here==='messages',(state.unread||[]).length)
      +navItem('#/read','Read',here==='read')
    : HEADER_OUT.left;
  /* About is in the burger once signed in, so the lone right-hand link goes */
  if(right){right.innerHTML=on?'':HEADER_OUT.right;right.hidden=on;}
  if(menu)menu.innerHTML=on
    ? '<p class="menu-label">Discover</p><a href="#/explore">Explore</a><a href="#/studios">Studios</a>'
      +'<a href="#/read">Read</a><a href="#/about">About</a>'
      +`<p class="menu-label">${escapeHTML(state.profile.name)}</p>`
      +'<a href="#/profile">My profile</a><a href="#/settings">Settings</a>'
      +'<button class="plain-link" data-action="log-out">Log out</button>'
    : HEADER_OUT.menu;
  if(icon){
    icon.innerHTML=on?`<span class="acc-av">${avatarFor(state.profile)}</span>${CHEV}`:HEADER_OUT.icon;
    icon.classList.toggle('account-button',on);
    icon.classList.toggle('icon-button',!on);
    icon.setAttribute('aria-label',on?(onPhone()?'Your account':'Your profile'):'Sign up or log in');
  }
  if(card)card.innerHTML=on
    ? `<p class="menu-label">${escapeHTML(state.profile.name)}</p><a href="#/profile">My profile</a><a href="#/settings">Settings</a><button class="plain-link" data-action="log-out">Log out</button>`
    : '';
  if(icon){const menu=on&&onPhone();icon.setAttribute('aria-haspopup',menu?'true':'false');if(!menu)icon.removeAttribute('aria-expanded');else if(!icon.hasAttribute('aria-expanded'))icon.setAttribute('aria-expanded','false');}
  if(panel&&!on){panel.hidden=true;icon?.setAttribute('aria-expanded','false');}
  /* the phone carries the same four destinations as the signed-in top nav */
  const bar=$('#tabbar');
  if(bar){
    bar.hidden=!on;
    if(on){
      const ic={feed:'<path d="M3 10.5 12 3l9 7.5V21H3V10.5Z"/>',
        explore:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
        messages:'<path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/>',
        create:'<rect x="3" y="3" width="18" height="18"/><path d="M12 8v8M8 12h8"/>'};
      const tab=(href,key,label)=>`<a href="${href}" aria-label="${label}"${here===key?' aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${ic[key]}</svg></a>`;
      bar.innerHTML=tab('#/feed','feed','Feed')+tab('#/explore','explore','Explore')
        +tab('#/messages','messages','Messages')
        +`<button class="tab-make" data-action="post-activity" data-badge="${waiting||''}" aria-label="${waiting?`Log a session, ${waiting} to confirm`:'Log a session'}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic.create}</svg></button>`
        +`<a href="#/profile" aria-label="My profile"${here==='profile'?' aria-current="page"':''}><span class="tab-av">${avatarFor(state.profile)}</span></a>`;
    } else bar.innerHTML='';
  }
}
/* Hover opens it on a pointer, tap and keyboard open it everywhere else. The
   panel's own box reaches up to the button so the pointer never crosses a gap. */
/* The avatar does two jobs, by screen. On a computer it is a link: pressing your
   own face takes you to your own profile (Settings and Log out are in the
   burger). On a phone the bottom bar already has your profile, so pressing it
   there looked like it did nothing; there it opens a small menu instead. The
   phone width is the one at which the bottom bar appears. */
const onPhone=()=>window.matchMedia('(max-width:760px)').matches;
function bindAccountMenu(){
  const btn=$('#account-button'), panel=$('#account-panel');
  if(panel)panel.hidden=true;
  if(!btn||btn.dataset.bound)return;
  btn.dataset.bound='1';
  btn.addEventListener('click',e=>{
    e.preventDefault();
    if(!signedIn()){goTo('#/login');return;}
    if(!onPhone()){goTo('#/profile');return;}
    const open=panel.hidden;
    panel.hidden=!open; btn.setAttribute('aria-expanded',String(open));
    $('#menu-panel').hidden=true; $('#menu-button')?.setAttribute('aria-expanded','false');
  });
}
function joinPage(){
  const s=JOIN_STEPS[joinStep], n=JOIN_STEPS.length, last=joinStep===n-1;
  return `<section class="join-flow"><div class="join-card">
    <p class="join-count">${String(joinStep+1).padStart(2,'0')} &nbsp;/&nbsp; ${String(n).padStart(2,'0')}</p>
    <h1>${s.q}</h1>
    <p class="join-hint">${s.hint}</p>
    <form id="join-form" class="join-field">${joinControl(s)}
      <p id="join-error" class="field-error" role="alert"></p>
      ${last?'<p class="join-later">None of this is final. You can add or change any of it later from your profile.</p>':''}
      <div class="join-actions">
        ${joinStep>0?'<button type="button" class="button outline" data-action="join-back">Back</button>':'<a class="button outline" href="#/signup">Back</a>'}
        <button class="button" type="submit">${last?'Create my account':`Continue ${arrow}`}</button>
      </div>
    </form>
    <div class="join-progress" aria-hidden="true">${JOIN_STEPS.map((_,i)=>`<span class="${i<=joinStep?'is-on':''}"></span>`).join('')}</div>
  </div></section>`;}
/* The crop is done here rather than taken as given: a 320px square is what gets
   stored (a picture off a phone is several megabytes of data URL against a ~5MB
   localStorage quota), and the canvas IS the preview, so what is on screen is
   exactly the file. photoEdit lives at module scope so stepping back and
   forward keeps the full-resolution original rather than re-cropping a crop. */
const PHOTO_OUT=320;
let photoEdit=null;
const photoCover=()=>{const im=photoEdit.img;return Math.max(PHOTO_OUT/im.width,PHOTO_OUT/im.height);};
function photoCentre(){const k=photoCover()*photoEdit.scale;
  photoEdit.x=(PHOTO_OUT-photoEdit.img.width*k)/2;photoEdit.y=(PHOTO_OUT-photoEdit.img.height*k)/2;}
function photoDraw(){
  const c=$('#join-canvas'); if(!c||!photoEdit)return;
  const im=photoEdit.img, k=photoCover()*photoEdit.scale, w=im.width*k, h=im.height*k;
  /* the square must stay covered, so panning stops at the edges */
  photoEdit.x=Math.min(0,Math.max(PHOTO_OUT-w,photoEdit.x));
  photoEdit.y=Math.min(0,Math.max(PHOTO_OUT-h,photoEdit.y));
  const g=c.getContext('2d');
  g.fillStyle='#F1EDE6'; g.fillRect(0,0,PHOTO_OUT,PHOTO_OUT);
  g.drawImage(im,photoEdit.x,photoEdit.y,w,h);
}
/* toDataURL on every pointermove would be wasteful, so the export happens when
   a gesture ends and once more at submit */
function photoCommit(){const c=$('#join-canvas');
  if(c&&photoEdit)joinData.photo=c.toDataURL('image/jpeg',.86);}
function photoLoad(src){return new Promise(res=>{
  const img=new Image();
  img.onload=()=>{photoEdit={img,scale:1,x:0,y:0};photoCentre();res(true);};
  img.onerror=()=>res(false); img.src=src;});}
function photoFromFile(file){return new Promise(res=>{
  if(!file||!/^image\//.test(file.type))return res(false);
  const fr=new FileReader();
  fr.onload=()=>photoLoad(fr.result).then(res);
  fr.onerror=()=>res(false); fr.readAsDataURL(file);});}
function bindPhoto(){
  const drop=$('#join-drop'); if(!drop)return;
  const file=$('#join-photo'), zoom=$('#join-zoom'), canvas=$('#join-canvas');
  const show=on=>{drop.dataset.has=on?'1':'0';};
  const fail=msg=>{$('#join-error').textContent=msg;};
  const ready=()=>{show(true);zoom.value=photoEdit.scale;photoDraw();photoCommit();fail('');};
  /* a re-render loses the canvas but not photoEdit, so the original is redrawn
     rather than re-cropped; after a reload only the stored square survives */
  if(photoEdit)ready();
  else if(joinData.photo)photoLoad(joinData.photo).then(ok=>{if(ok)ready();});
  const take=async src=>{
    const ok=await(src instanceof File?photoFromFile(src):photoLoad(src));
    if(!ok)return fail('That file could not be read as an image.');
    ready();
  };
  $('#join-pick')?.addEventListener('click',()=>file.click());
  $('#join-replace')?.addEventListener('click',()=>file.click());
  $('#join-remove')?.addEventListener('click',()=>{
    photoEdit=null;joinData.photo='';file.value='';show(false);fail('');});
  file.addEventListener('change',()=>{if(file.files?.[0])take(file.files[0]);});
  ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{
    e.preventDefault();drop.classList.add('is-over');}));
  ['dragleave','dragend'].forEach(t=>drop.addEventListener(t,e=>{
    if(t==='dragleave'&&drop.contains(e.relatedTarget))return;
    drop.classList.remove('is-over');}));
  drop.addEventListener('drop',e=>{
    e.preventDefault();drop.classList.remove('is-over');
    const dropped=e.dataTransfer?.files?.[0];
    if(dropped)take(dropped);});
  /* zoom around the middle of the frame, so the face you centred stays centred */
  zoom.addEventListener('input',()=>{
    if(!photoEdit)return;
    const base=photoCover(), im=photoEdit.img, was=photoEdit.scale, now=+zoom.value;
    const fx=(PHOTO_OUT/2-photoEdit.x)/(im.width*base*was);
    const fy=(PHOTO_OUT/2-photoEdit.y)/(im.height*base*was);
    photoEdit.scale=now;
    photoEdit.x=PHOTO_OUT/2-fx*im.width*base*now;
    photoEdit.y=PHOTO_OUT/2-fy*im.height*base*now;
    photoDraw();});
  zoom.addEventListener('change',photoCommit);
  let from=null;
  canvas.addEventListener('pointerdown',e=>{
    if(!photoEdit)return;
    canvas.setPointerCapture(e.pointerId);
    /* the canvas is drawn at 320 but displayed smaller, so pointer pixels have
       to be scaled into canvas pixels or the photo lags behind the cursor */
    const r=canvas.getBoundingClientRect();
    from={px:e.clientX,py:e.clientY,x:photoEdit.x,y:photoEdit.y,k:PHOTO_OUT/r.width};
    canvas.classList.add('is-dragging');});
  canvas.addEventListener('pointermove',e=>{
    if(!from)return;
    photoEdit.x=from.x+(e.clientX-from.px)*from.k;
    photoEdit.y=from.y+(e.clientY-from.py)*from.k;
    photoDraw();});
  ['pointerup','pointercancel'].forEach(t=>canvas.addEventListener(t,()=>{
    if(!from)return;from=null;canvas.classList.remove('is-dragging');photoCommit();}));
}

function bindJoin(){
  const f=$('#join-form');if(!f)return;
  $('#join-input')?.focus();
  /* "No preference" and "I'm flexible" are answers about the whole group */
  Object.entries(JOIN_ANY).forEach(([group,any])=>{
    $$(`input[name="${group}"]`,f).forEach(box=>box.addEventListener('change',()=>{
      if(!box.checked)return;
      $$(`input[name="${group}"]`,f).forEach(o=>{
        if(o!==box && (box.value===any || o.value===any))o.checked=false;});
    }));
  });
bindPhoto();
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const s=JOIN_STEPS[joinStep], err=$('#join-error'), fd=new FormData(f);
    const picked=g=>[...f.querySelectorAll(`input[name="${g}"]:checked`)].map(i=>i.value);
    if(s.type==='training'){joinData.forms=picked('forms');joinData.times=picked('times');joinData.studios=picked('studios');}
    else if(s.type==='location'){joinData.region=String(fd.get('region')||'');joinData.city=String(fd.get('city')||'').trim();}
    else if(s.type==='personal'){joinData.birthDate=String(fd.get('birthDate')||'');
      joinData.birthYear=joinData.birthDate?joinData.birthDate.slice(0,4):'';
      joinData.showAge=!!fd.get('showAge');
      if(!joinData.birthDate){err.textContent='Please give your date of birth.';return;}
      if(ageOf(joinData.birthDate)<18){err.textContent='VIRI is for women aged 18 and over.';return;}
      const went=!!fd.get('went');
      joinData.college=went?String(fd.get('college')||'').trim():'';
      joinData.collegeYear=went?String(fd.get('collegeYear')||''):'';
      joinData.industry=String(fd.get('industry')||'').trim();}
    else if(s.type==='account'){joinData.email=String(fd.get('email')||'').trim();
      joinData.password=String(fd.get('password')||'');joinData.agree=!!fd.get('agree');
      joinData.woman=!!fd.get('woman');}
    else joinData[s.key]=String(fd.get(s.key)||'').trim();
    if(s.required&&!joinData[s.key]){err.textContent=s.key==='email'?'Please enter an email address.':'Please enter your name.';return;}
    if(s.type==='account'){
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(joinData.email)){err.textContent='Please enter a valid email address.';return;}
      if(joinData.password.length<8){err.textContent='Please choose a password of at least 8 characters.';return;}
      if(!joinData.woman){err.textContent='VIRI is for women. Please confirm before continuing.';return;}
      if(!joinData.agree){err.textContent='Please accept the terms to continue.';return;}
    }
    err.textContent='';
    if(joinStep<JOIN_STEPS.length-1){joinStep++;render(false);return;}
    const btn=f.querySelector('button[type=submit]'), label=btn.innerHTML;
    btn.disabled=true; btn.textContent='Creating\u2026';
    const res=await dbSignUp(joinData.email,joinData.password,dbProfileFields(joinData));
    btn.disabled=false; btn.innerHTML=label;
    if(res.error){err.textContent=res.error.message;return;}
    /* the studios picked at sign-up are saved once the address is confirmed */
    pendingStudios=studios.filter(x=>joinData.studios.includes(x.name)).map(x=>x.id);
    try{localStorage.setItem('viri-pending-studios',JSON.stringify(pendingStudios));
      if(joinData.photo)localStorage.setItem('viri-pending-photo',joinData.photo);
      localStorage.setItem('viri-pending-showage',joinData.showAge?'1':'0');
      if(joinData.woman)localStorage.setItem('viri-pending-eligibility','1');}catch(e){}
    joinStep=0; goTo('#/check-email'); return;
    const forms=joinData.forms.filter(x=>x!==JOIN_ANY.forms);
    state.profile={name:joinData.name,email:joinData.email.toLowerCase(),
      area:joinData.city||joinData.region||'Washington, DC',region:joinData.region,city:joinData.city,
      interests:forms,times:joinData.times,
      studios:joinData.studios.filter(x=>x!==JOIN_ANY.studios),
      photo:joinData.photo,bio:joinData.bio,
      birthYear:joinData.birthYear,college:joinData.college,
      collegeYear:joinData.collegeYear,industry:joinData.industry};
    /* the studios chosen here are the saved ones the profile already lists */
    state.saved=[...new Set([...state.saved,...studios.filter(x=>joinData.studios.includes(x.name)).map(x=>x.id)])];
    state.loggedOut=false;save();joinStep=0;toast('Account created. Welcome to your circle.');goTo('#/profile');
  });
}
/* Requests sent was its own stat, which made a number nobody needed into a
   quarter of the panel. Friends now opens both lists instead. */
async function respondToRequest(id,what){
  const name=personById(id)?.name||'They';
  const r=await dbRemoveConnection(id);
  if(r.error){toast(r.error.message);return;}
  save();render(false);if($('#modal').open)friendsModal();
  toast(what==='declined'?'Request declined.':what==='withdrawn'?'Request withdrawn.':`${name} is no longer a friend.`);
}

/* Requests on their own, away from the friends list: two buttons, yes or no,
   nothing else to read. Both directions are here because "did she ever answer
   me?" is the other half of the question. */
/* A name alone is not enough to decide whether to accept somebody. The face
   and the line they wrote about themselves are the whole basis for it. */
function personRow(id, actions){
  const p = personById(id) || { name:'A member' };
  const meta = [p.area, (p.interests||[]).slice(0,2).join(', ')].filter(Boolean).join(' · ');
  return `<li>
    <span class="av-md">${p.photo?`<img src="${escapeHTML(p.photo)}" alt="">`:escapeHTML(initials(p.name))}</span>
    <div class="req-who">
      <strong><a class="person-link" href="#/member/${escapeHTML(id)}">${escapeHTML(p.name)}</a></strong>
      ${meta?`<span class="small">${escapeHTML(meta)}</span>`:''}
      ${p.bio?`<span class="req-bio">${escapeHTML(p.bio)}</span>`:''}
    </div>${actions||''}</li>`;
}

function requestsModal(){
  const waiting=state.incoming||[], sent=state.requests||[];
  const line=id=>{const p=personById(id);
    return p?[p.area,(p.interests||[]).slice(0,2).join(', ')].filter(Boolean).join(' · '):'';};
  const row=(id,actions)=>personRow(id,actions);
  openModal('Requests',
    `<h3 class="modal-sub">Waiting for you</h3>`+
    (waiting.length
      ? `<ul class="req-list">${waiting.map(id=>row(id,
          `<span class="req-acts">
             <button class="req-yes" data-action="accept-request" data-id="${escapeHTML(id)}" aria-label="Accept ${escapeHTML(personById(id)?.name||'request')}">&#10003;</button>
             <button class="req-no" data-action="decline-request" data-id="${escapeHTML(id)}" aria-label="Decline ${escapeHTML(personById(id)?.name||'request')}">&#10005;</button>
           </span>`)).join('')}</ul>`
      : '<p class="small">Nobody is waiting on you.</p>')+
    `<h3 class="modal-sub">You asked</h3>`+
    (sent.length
      ? `<ul class="req-list">${sent.map(id=>row(id,
          `<span class="req-acts"><button class="button small outline" data-action="withdraw-request" data-id="${escapeHTML(id)}">Withdraw</button></span>`)).join('')}</ul>`
      : '<p class="small">You have not asked anybody yet.</p>'));
}

function friendsModal(){
  const mine=state.connections||[], sent=state.requests||[], waiting=state.incoming||[];
  const nameOf=id=>personById(id)?.name||'A member';
  const lineOf=id=>{const p=personById(id);return p?[p.area,(p.interests||[]).slice(0,2).join(', ')].filter(Boolean).join(' · '):'';};
  const row=(id,actions='')=>personRow(id,actions);
  const list=(ids,actions=()=>'')=>`<ul class="friend-list">${ids.map(id=>row(id,actions(id))).join('')}</ul>`;
  openModal('Your friends',
    `<h3 class="modal-sub">Waiting for you</h3>`+
    (waiting.length
      ? list(waiting,id=>`<span class="friend-acts">`+
          `<button class="button small" data-action="accept-request" data-id="${escapeHTML(id)}">Accept</button>`+
          `<button class="button small outline" data-action="decline-request" data-id="${escapeHTML(id)}">Decline</button></span>`)
      : '<p class="small">No one is waiting on you.</p>')+
    `<h3 class="modal-sub">Friends</h3>`+
    (mine.length
      ? list(mine,id=>`<span class="friend-acts">`+
          `<a class="button small outline" href="#/messages">Message</a>`+
          `<button class="button small outline" data-action="remove-friend" data-id="${escapeHTML(id)}">Remove</button></span>`)
      : '<p class="dialog-copy">No one yet. Find someone in Search and they will show up here.</p>')+
    `<h3 class="modal-sub">Requests you have sent</h3>`+
    (sent.length
      ? list(sent,id=>`<button class="button small outline" data-action="withdraw-request" data-id="${escapeHTML(id)}">Withdraw</button>`)
      : '<p class="small">Nothing waiting. Requests you send sit here until they are answered.</p>'));
}

let profileTab='sessions';
/* ===================== sessions, feed and finding people =====================
   A session leads with the activity, not a picture: date and place, then the
   title, then a strip of figures, and only then the note and any photograph.
   That is what lets a session with no photo sit in the list without looking
   like a hole, which a grid of squares could never do. */
const SAMPLE_SESSIONS=[
  {sample:true,title:'Reformer, slowly',cat:'Pilates',place:'Club Pilates Dupont',
   dur:50,went:6,met:2,ago:'Wednesday · 7:00am',img:'connect-kerb.jpg',
   note:'Fifty minutes on the reformer and I can confirm my legs are furious. Same slot next week if anyone wants to come.',
   withIds:['dc-p0','dc-p3','dc-p7'],withLine:'Naomi, Amara and 4 others',comments:2},
  {sample:true,title:'Easy five before work',cat:'Running',place:'Rock Creek Park',
   dur:48,dist:'5.0 mi',went:2,ago:'Tuesday · 6:00am',
   note:'Met at the Dupont fountain at six. No photo, it was still dark.',
   withIds:['dc-p3'],withLine:'Amara',comments:1},
  {sample:true,title:'Front row, finally',cat:'Indoor cycling',place:'CycleBar Georgetown',
   dur:45,went:9,met:3,ago:'Monday · 6:00am',
   note:'Naomi saved me a bike. Still the fastest forty-five minutes of the week.',
   withIds:['dc-p0'],withLine:'Naomi and 8 others',comments:0}
];
/* your own posts first; the samples stand in only while you have none, so the
   shape of the page is visible before you have logged anything */
const mySessions=()=>state.posts.length
  ? state.posts.slice().reverse().map(sessionView)
  : SAMPLE_SESSIONS;
const avatarFor=p=>p&&p.photo
  ? `<img src="${p.photo}" alt="">`
  : escapeHTML(initials((p&&p.name)||'VIRI'));
/* faces of the people who were there, overlapped the way a roster reads */
const whoStack=ids=>!ids||!ids.length?'':`<span class="who-stack">${ids.slice(0,3).map(id=>{
  const p=personById(id);
  return `<span>${escapeHTML(initials(p?p.name:'VIRI'))}</span>`;}).join('')}</span>`;
/* Activities measured in miles. Indoor cycling is a class, not a distance. */
const isDistanceActivity=a=>!!a&&/run|jog|walk|hik|cycl|bik|ride|ruck/i.test(a)&&!/indoor|spin|class/i.test(a);
const isOnFoot=a=>!!a&&/run|jog|walk|hik|ruck/i.test(a);
function fmtDuration(min){
  min=Math.round(Number(min)||0); if(!min)return '';
  const h=Math.floor(min/60), m=min%60;
  return h?(m?`${h} hr ${m} min`:`${h} hr`):`${m} min`;
}
/* minutes a mile on foot, miles an hour on a bike */
function sessionPace(s){
  const miles=parseFloat(s.dist), min=Number(s.dur);
  if(!(miles>0)||!(min>0))return null;
  if(isOnFoot(s.cat)){const per=min/miles, mm=Math.floor(per), ss=Math.round((per-mm)*60);
    return ['Pace',`${ss===60?mm+1:mm}:${String(ss===60?0:ss).padStart(2,'0')} /mi`];}
  if(isDistanceActivity(s.cat))return ['Speed',`${(miles/(min/60)).toFixed(1)} mph`];
  return null;
}
/* Sessions exist in two shapes: as logged and stored (activity, duration,
   distance, description, photo, date) and as a card shows them (cat, dur,
   dist, note, img, ago). Everything goes through this one translation.
   Friends' sessions in the feed used to reach the card untranslated and
   showed nothing but "Went 1 person". */
function sessionView(p){
  const tags=(p.withIds||[]).map(id=>personById(id)).filter(Boolean);
  return {id:p.id,title:p.title,cat:p.activity||'',place:p.place||'',
    dur:Number(p.duration)||0,dist:p.distance||'',went:p.went||1+tags.length,
    ago:prettyDate(p.date),note:p.description||'',img:p.photo||'',
    withIds:tags.map(x=>x.id),
    withLine:tags.map(x=>x.name.split(' ')[0]).join(', '),
    ownerId:p.ownerId,comments:((state.comments||{})[p.id]||[]).length};
}
function sessionStats(s){
  const cells=[];
  if(s.dist)cells.push(['Distance',s.dist]);
  if(s.dur)cells.push(['Length',fmtDuration(s.dur)]);
  const pace=sessionPace(s); if(pace)cells.push(pace);
  if(s.cat)cells.push(['Activity',s.cat]);
  if(s.went)cells.push(['Went',`${s.went} ${s.went===1?'person':'people'}`]);
  if(s.met)cells.push(['Of those',`${s.met} new`]);
  if(!cells.length)return '';
  return `<div class="session-stats">${cells.map(([k,v])=>
    `<span><span class="session-k">${escapeHTML(k)}</span><span class="session-v">${escapeHTML(v)}</span></span>`).join('')}</div>`;
}
/* ===================== comments and joining =====================
   Comments sit under a session, seen and written by the people who can see the
   session at all: whoever logged it and her friends. The author can delete a
   comment; so can the session's owner, which is how an unwelcome one goes. */
let openThreads=new Set();
function commentThread(s,by){
  const list=(state.comments||{})[s.id]||[];
  const mine=sessionIsMine(s,by), me=authUser&&authUser.id;
  return `<div class="session-thread">
    ${list.length?list.map(c=>{
      const who=c.authorId===me?((state.profile&&state.profile.name)||'You'):((personById(c.authorId)||{}).name||'A member');
      const drop=c.authorId===me||mine;
      return `<div class="comment"><p class="comment-head"><b>${escapeHTML(who)}</b> <span class="small">${escapeHTML(prettyDate(c.at))}</span>${drop?` <button class="plain-link comment-x" data-action="comment-delete" data-id="${escapeHTML(c.id)}" data-session="${escapeHTML(String(s.id))}">Delete</button>`:''}</p>
        <p class="comment-body">${escapeHTML(c.body)}</p></div>`;}).join('')
      :'<p class="small">No comments yet.</p>'}
    ${signedIn()?`<form class="comment-form" data-session="${escapeHTML(String(s.id))}"><input name="body" maxlength="500" required placeholder="Add a comment" aria-label="Add a comment"><button class="button small" type="submit">Post</button></form>`:''}
  </div>`;
}
document.addEventListener('submit',async e=>{
  const f=e.target&&e.target.closest&&e.target.closest('.comment-form'); if(!f)return;
  e.preventDefault();
  const input=f.querySelector('input[name=body]'), btn=f.querySelector('button');
  btn.disabled=true;
  const r=await dbAddComment(f.dataset.session,input.value);
  btn.disabled=false;
  if(r.error){toast(r.error.message);return;}
  render(false);
});
async function deleteComment(id,sessionId){
  const r=await dbDeleteComment(id,sessionId);
  if(r.error){toast(r.error.message);return;}
  render(false); toast('Comment removed.');
}
/* "Join them next time" puts a friend's session into your own week. If they
   have a routine for it, it takes that routine's days and time; otherwise the
   day the session was logged. Either way the usual form opens first. */
const bandFor=d=>{const h=d.getHours();
  return h<5?'Before 5am':h<8?'5–7am':h<10?'8–10am':h<12?'10–12pm':h<15?'12–3pm':h<17?'3–5pm':h<20?'5–7pm':'8pm Onward';};
async function joinSession(id){
  if(!signedIn()){toast('Create your profile first.');location.hash='#/signup';return;}
  const s=(state.feed||[]).find(x=>String(x.id)===String(id));
  if(!s){toast('That session could not be found. Refresh and try again.');return;}
  const ownerId=s.ownerId||(s.by&&s.by.id);
  const first=((personById(ownerId)||s.by||{}).name||'Your friend').split(' ')[0];
  const theirs=ownerId&&typeof dbLoadRoutines==='function'?((await dbLoadRoutines(ownerId))||[]):[];
  const act=String(s.activity||'').trim().toLowerCase(), where=String(s.place||'').trim().toLowerCase();
  const same=theirs.filter(r=>String(r.activity||'').trim().toLowerCase()===act
    &&(!where||!r.venue||String(r.venue).toLowerCase().includes(where)||where.includes(String(r.venue).toLowerCase().split(' — ')[0])));
  if(same.length){
    const band=same[0].band;
    routineModal(null,{activity:s.activity,venueLabel:same[0].venue||s.place||'',venueId:same[0].venueId||'',
      days:[...new Set(same.filter(r=>r.band===band).map(r=>r.weekday))],band,
      note:`This is in ${first}'s week. Add it to yours and you will be there together.`,joinedFrom:ownerId});
  }else{
    const when=new Date(s.date);
    routineModal(null,{activity:s.activity,venueLabel:s.place||'',venueId:'',days:[when.getDay()],band:bandFor(when),
      note:`${first} logged this on a ${WEEKDAYS[when.getDay()]}. Change the day or time if you like.`,joinedFrom:ownerId});
  }
}
/* A heart and a count. Your own sessions show the count (and who, on hover)
   but cannot be liked by you; samples have nobody behind them. */
const HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7.1 4.5c2 0 3.5 1.1 4.9 2.9 1.4-1.8 2.9-2.9 4.9-2.9 3.5 0 5.7 3.4 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"/></svg>';
function likeButton(s,by){
  if(!s.id)return '';
  const who=(state.likes||{})[s.id]||[], me=authUser&&authUser.id, liked=!!me&&who.includes(me), n=who.length;
  if(sessionIsMine(s,by)){
    const names=who.map(id=>((personById(id)||{}).name||'A member').split(' ')[0]).join(', ');
    return `<span class="session-like is-mine"${names?` title="Liked by ${escapeHTML(names)}"`:''} aria-label="${n} ${n===1?'like':'likes'}">${HEART}${n}</span>`;
  }
  return `<button class="plain-link session-like${liked?' is-on':''}" data-action="session-like" data-id="${escapeHTML(String(s.id))}" aria-pressed="${liked}" aria-label="${liked?'Unlike':'Like'} this session, ${n} ${n===1?'like':'likes'}">${HEART}${n}</button>`;
}
/* the heart changes at once; if the server says no, it changes back */
async function toggleLike(id){
  if(!signedIn()){toast('Sign in to like a session.');return;}
  const me=authUser.id; state.likes=state.likes||{};
  const before=[...(state.likes[id]||[])], on=!before.includes(me);
  state.likes[id]=on?[...before,me]:before.filter(x=>x!==me); render(false);
  const r=await dbSetLike(id,on);
  if(r.error){state.likes[id]=before;render(false);toast(r.error.message);}
}
/* Your own sessions, and the samples shown on your own empty profile.
 Someone
   else's session always arrives with an id that is not in your posts. */
const sessionIsMine=(s,by)=>!by&&(!s.id||(state.posts||[]).some(x=>x.id===s.id));
function sessionCard(s,by){
  if(s.ago===undefined)s=sessionView(s);
  return `<article class="session">
    ${by?`<div class="session-by"><span class="av-sm">${avatarFor(by)}</span>
      <span><b>${by.id&&isRealAccount(by.id)?`<a class="person-link" href="#/member/${escapeHTML(by.id)}">${escapeHTML(by.name)}</a>`:escapeHTML(by.name)}</b><span class="small">${escapeHTML(s.ago)} &middot; ${escapeHTML(s.place)}</span></span>
      ${by.id&&!state.connections.includes(by.id)
        ?`<button class="button small outline" data-action="ex-connect" data-id="${escapeHTML(by.id)}">Add friend</button>`
        :'<span class="tag">Friend</span>'}${safetyButton(by.id,by.name)}</div>`
     :`<p class="session-meta">${escapeHTML(s.ago)}${s.place?` &middot; ${escapeHTML(s.place)}`:''}${s.id&&(state.posts||[]).some(x=>x.id===s.id)?` <button class="plain-link session-edit" data-action="edit-session" data-id="${escapeHTML(String(s.id))}">Edit</button>`:''}</p>`}
    <h3 class="session-title">${escapeHTML(s.title)}</h3>
    ${sessionStats(s)}
    ${s.note?`<p class="session-note">${escapeHTML(s.note)}</p>`:''}
    ${s.img?`<figure class="session-shot"><img src="${/^(data:|https?:|blob:)/.test(s.img)?s.img:A+s.img}" alt="" loading="lazy"></figure>`:''}
    <div class="session-foot">
      ${s.withLine?`${whoStack(s.withIds)}<span class="small">with ${escapeHTML(s.withLine)}</span>`:''}
      ${sessionIsMine(s,by)?'':`<button class="button small" data-action="session-join" data-id="${escapeHTML(String(s.id||''))}">Join them next time</button>`}
      ${likeButton(s,by)}
      <button class="plain-link session-talk" data-action="session-talk" data-id="${escapeHTML(String(s.id||''))}" aria-expanded="${!!(s.id&&openThreads.has(String(s.id)))}" aria-label="Comments">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/></svg>${s.comments||0}</button>
    </div>
    ${s.id&&openThreads.has(String(s.id))?commentThread(s,by):''}
  </article>`;
}
/* Local state updates at once so the page stays quick; the server write
   follows. If it fails, say so rather than letting someone believe something
   was saved that was not. */
function dbPush(p,what){
  Promise.resolve(p).then(r=>{if(r&&r.error)toast(`Saved on this device, but ${what} did not reach the server.`);})
    .catch(()=>toast(`Saved on this device, but ${what} did not reach the server.`));
}
let pendingStudios=[];
/* Sign-up no longer ends on the profile: with email confirmation on, the
   account does not exist as a usable thing until the link is clicked. Saying
   so plainly beats dropping someone on an empty profile that does not work. */
function checkEmailPage(){return `<div class="wrap handoff"><div class="handoff-card thanks-card">
  <p class="eyebrow">Almost there</p>
  <h1>Check your email.</h1>
  <p>We have sent a link to ${escapeHTML(joinData.email||'your address')}. Open it and your profile is ready.</p>
  <p class="small" style="margin-top:16px">Your account is not active until that address is confirmed, so nothing happens until you do. If it has not arrived in a few minutes, look in spam.</p>
  <div class="thanks-actions">${button('Back to VIRI','#/','small outline')}</div>
</div></div>`;}
let msgThread=null;
/* ---- messages ----
   No message is ever sent from here; the threads are drawn from the people you
   have actually connected to, so the page is yours rather than a mock-up, and
   the composer says plainly that it does not send. */
/* Initials are the fallback, not the default. The messages list and its
   header were rendering them unconditionally and dropping the photograph. */
const faceOf=p=>p&&p.photo
  ? `<img src="${escapeHTML(p.photo)}" alt="">`
  : escapeHTML(initials((p&&p.name)||'?'));

function messagesPage(){
  if(!signedIn())return authPage();
  /* Friends only. The commonest way a social product hurts women is letting a
     stranger write to them, so the connection has to come first. */
  const ids=(state.connections||[]).filter(id=>!isBlocked(id));
  const open=msgThread&&ids.includes(msgThread)?msgThread:ids[0];
  const who=open?personById(open):null;
  const thread=(state.threads||{})[open]||[];
  const preview=id=>{const t=(state.threads||{})[id]||[];const last=t[t.length-1];
    return last?`${last.mine?'You: ':''}${last.body}`:'No messages yet';};
  return `<section class="page-head is-tight"><div class="wrap"><h1>Messages</h1></div></section>
  <div class="wrap msg">
    ${ids.length?`<div class="msg-grid">
      <aside class="msg-list">
        ${ids.map(id=>{const p=personById(id)||{name:'A member'};
          return `<button class="msg-row${id===open?' is-on':''}${(state.unread||[]).includes(id)?' is-unread':''}" data-action="msg-open" data-id="${escapeHTML(id)}">
            <span class="av-md">${faceOf(p)}</span>
            <span class="msg-who"><b>${escapeHTML(p.name)}</b>
              <span class="small">${escapeHTML(preview(id).slice(0,60))}</span></span>
          </button>`;}).join('')}
      </aside>
      <section class="msg-thread">
        <header class="msg-head">
          <a class="av-md msg-face" href="#/member/${escapeHTML(open)}" aria-label="${escapeHTML(who.name)}&rsquo;s profile">${faceOf(who)}</a>
          <span class="msg-who"><b><a class="person-link" href="#/member/${escapeHTML(open)}">${escapeHTML(who.name)}</a></b><span class="small">${escapeHTML([who.area,(who.interests||[]).slice(0,2).join(', ')].filter(Boolean).join(' · '))}</span></span></header>
        <div class="msg-body" id="msg-body">
          ${thread.length?thread.map(m=>
            `<p class="msg-bubble ${m.mine?'me':'them'}">${escapeHTML(m.body)}</p>`).join('')
            :`<p class="small msg-empty">Nothing yet. Say hello &mdash; you are both going to the same places.</p>`}
        </div>
        <form class="msg-send" id="msg-form" data-id="${escapeHTML(open)}">
          <label class="visually-hidden" for="msg-input">Message ${escapeHTML(who.name)}</label>
          <input id="msg-input" name="msg" placeholder="Write a message" maxlength="2000" autocomplete="off">
          <button class="button small" type="submit">Send</button>
        </form>
      </section>
    </div>`
    :`<div class="msg-none">
       <p class="dialog-copy">You can message people once you are friends. It stops strangers writing to you.</p>
       <a class="button small" href="#/find">Find people ${arrow}</a>
     </div>`}
  </div>`;}

async function sendMessage(form){
  const to=form.dataset.id, input=form.querySelector('#msg-input');
  const text=input.value.trim(); if(!text)return;
  const btn=form.querySelector('button[type=submit]');
  btn.disabled=true; input.value='';
  const r=await dbSendMessage(to,text);
  btn.disabled=false;
  if(r.error){input.value=text;toast(r.error.message);return;}
  render(false);
  const body=$('#msg-body'); if(body)body.scrollTop=body.scrollHeight;
  $('#msg-input')?.focus();
}

async function exportMyData(btn){
  const label=btn?btn.innerHTML:'';
  if(btn){btn.disabled=true;btn.textContent='Gathering…';}
  const {data,error}=await dbExportData();
  if(btn){btn.disabled=false;btn.innerHTML=label;}
  if(error||!data){toast(error?error.message:'Your data could not be gathered.');return;}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`viri-my-data-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  const n=(data.sessions||[]).length,ph=(data.photos||[]).length;
  toast(`Downloaded. ${n} session${n===1?'':'s'}, ${ph} photo${ph===1?'':'s'}, and everything on your profile.`);
}

function deleteAccountModal(){
  openModal('Delete your account',`<p class="dialog-copy">This removes your profile, your sessions, your plans, your saved studios and your photographs. It cannot be undone, and we will not be able to bring any of it back.</p><p class="dialog-copy">If you want a copy first, close this and choose <b>Download my data</b>.</p><form id="del-form"><div class="field"><label for="del-confirm">Type DELETE to confirm</label><input id="del-confirm" name="confirm" autocomplete="off" autocapitalize="characters" required></div><p id="del-error" class="field-error" role="alert"></p><div class="dialog-actions"><button class="button outline small" type="button" data-action="close-modal">Keep my account</button><button class="button small is-grave" type="submit" id="del-go" disabled>Delete everything</button></div></form>`,()=>{
    const input=$('#del-confirm'),go=$('#del-go');
    input.addEventListener('input',()=>{go.disabled=input.value.trim()!=='DELETE';});
    $('#del-form').addEventListener('submit',async ev=>{
      ev.preventDefault();
      if(input.value.trim()!=='DELETE')return;
      go.disabled=true;go.textContent='Deleting…';
      const {error}=await dbDeleteAccount();
      if(error){go.disabled=false;go.textContent='Delete everything';$('#del-error').textContent=error.message;return;}
      try{localStorage.clear();}catch(e){}
      state={profile:null,loggedOut:true,plans:[],logged:[],joined:[],saved:[],created:[],posts:[],connections:[]};
      closeModal();location.hash='#/';render(false);
      toast('Your account and everything in it has been deleted.');
    });
  });
}

/* Real accounts carry a uuid; the sample members in the preview carry names
   like 'alex'. Reporting one of those would write a row pointing at nobody. */
const isRealAccount=id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id||''));
const isBlocked=id=>(state.blocked||[]).includes(id);

/* Every face in the product gets the same quiet control in the same corner, so
   nobody has to hunt for it at the moment they most need it. */
function safetyButton(id,name){
  if(!id||!signedIn()||id===(state.profile&&state.profile.id))return '';
  return `<button class="icon-more" data-action="person-menu" data-id="${escapeHTML(id)}" data-name="${escapeHTML(name||'')}" aria-label="Report or block ${escapeHTML(name||'this person')}" title="More">&#8943;</button>`;
}

function personMenu(id,name){
  openModal(escapeHTML(name||'This person'),
    `<p class="dialog-copy">If this person is making VIRI worse for you, you can tell us, or stop them reaching you entirely.</p>
     <div class="safety-menu">
       <button class="button small outline" data-action="report-person" data-id="${escapeHTML(id)}" data-name="${escapeHTML(name||'')}">Report this person</button>
       ${isBlocked(id)
         ?`<button class="button small outline" data-action="unblock-person" data-id="${escapeHTML(id)}" data-name="${escapeHTML(name||'')}">Unblock</button>`
         :`<button class="button small outline is-grave" data-action="block-person" data-id="${escapeHTML(id)}" data-name="${escapeHTML(name||'')}">Block</button>`}
     </div>`);
}

function reportModal(id,name){
  const who=name||'this person';
  openModal('Report '+escapeHTML(who),
    `<p class="dialog-copy">This goes to the VIRI team. We read every one. ${escapeHTML(who)} is not told that you reported them.</p>
     <form id="report-form">
       <div class="field"><label for="rp-reason">What happened?</label>
         <select id="rp-reason" name="reason" required>
           ${REPORT_REASONS.map(([v,l])=>`<option value="${v}">${escapeHTML(l)}</option>`).join('')}
         </select></div>
       <div class="field"><label for="rp-detail">Anything you want to add <span class="field-optional">Optional</span></label>
         <textarea id="rp-detail" name="detail" maxlength="2000" placeholder="You do not have to explain. Anything you tell us helps."></textarea></div>
       <p id="rp-error" class="field-error" role="alert"></p>
       <div class="dialog-actions">
         <button class="button outline small" type="button" data-action="close-modal">Cancel</button>
         <button class="button small" type="submit">Send report</button>
       </div>
     </form>`,()=>{
    $('#report-form').addEventListener('submit',async ev=>{
      ev.preventDefault();
      if(!isRealAccount(id)){$('#rp-error').textContent='This is a sample member in the preview, so there is no account to report.';return;}
      const btn=ev.target.querySelector('button[type=submit]'),label=btn.innerHTML;
      btn.disabled=true;btn.textContent='Sending…';
      const fd=Object.fromEntries(new FormData(ev.target));
      const {error}=await dbReport(id,fd.reason,String(fd.detail||'').trim());
      if(error){btn.disabled=false;btn.innerHTML=label;$('#rp-error').textContent=error.message;return;}
      closeModal();
      toast('Thank you. We have your report and we will look at it.');
    });
  });
}

function blockConfirm(id,name){
  const who=name||'this person';
  openModal('Block '+escapeHTML(who),
    `<p class="dialog-copy">${escapeHTML(who)} will not be able to message you or send you a friend request, and you will not see each other. They are not told.</p>
     <p class="dialog-copy">You can undo this in Settings whenever you like.</p>
     <div class="dialog-actions">
       <button class="button outline small" data-action="close-modal">Cancel</button>
       <button class="button small is-grave" data-action="block-confirm" data-id="${escapeHTML(id)}" data-name="${escapeHTML(who)}">Block ${escapeHTML(who)}</button>
     </div>`);
}

async function doBlock(id,name){
  if(!isRealAccount(id)){closeModal();toast('This is a sample member in the preview, so there is nobody to block.');return;}
  const {error}=await dbBlock(id);
  closeModal();
  if(error){toast(error.message);return;}
  render(false);
  toast((name||'They')+' can no longer reach you.');
}

async function doUnblock(id,name){
  const {error}=await dbUnblock(id);
  closeModal();
  if(error){toast(error.message);return;}
  render(false);
  toast((name||'They')+' is unblocked.');
}

/* The photograph and the bio used to be a sixth sign-up step. Asking for them
   before somebody has seen the product is asking early; both are now offered
   from the profile, where there is a reason to bother. The cropper is the same
   one, moved rather than rewritten — the ids are unchanged so bindPhoto() works
   on it untouched. */
function photoModal(){
  openModal('Your photo', `<form id="pm-form">
  <div class="field"><label for="join-photo">Profile photo <span class="field-optional">Optional</span></label>
    <div class="photo-drop" id="join-drop" data-has="${joinData.photo?'1':'0'}">
      <input id="join-photo" name="photo" type="file" accept="image/*" class="visually-hidden">
      <div class="photo-empty">
        <p class="photo-lede">Drag a photo here, or <button type="button" class="plain-link" id="join-pick">choose a file</button>.</p>
      </div>
      <div class="photo-editor">
        <div class="photo-stage"><canvas id="join-canvas" width="320" height="320"></canvas><span class="photo-ring" aria-hidden="true"></span></div>
        <div class="photo-tools">
          <label for="join-zoom">Zoom</label>
          <input id="join-zoom" type="range" min="1" max="4" step="0.01" value="1">
          <p class="photo-hint">Drag the photo to move it inside the circle.</p>
          <p class="photo-swap"><button type="button" class="plain-link" id="join-replace">Choose another</button>
            <button type="button" class="plain-link" id="join-remove">Remove</button></p>
        </div>
      </div>
    </div></div>
    <p id="pm-error" class="field-error" role="alert"></p>
    <div class="dialog-actions">
      <button class="button outline small" type="button" data-action="close-modal">Cancel</button>
      <button class="button small" type="submit">Save photo</button>
    </div>
  </form>`, () => {
    joinData.photo = joinData.photo || '';
    bindPhoto();
    $('#pm-form').addEventListener('submit', async ev => {
      ev.preventDefault();
      if (typeof photoCommit === 'function') photoCommit();
      const btn = ev.target.querySelector('button[type=submit]'), label = btn.innerHTML;
      if (!joinData.photo) { $('#pm-error').textContent = 'Choose a photo first.'; return; }
      btn.disabled = true; btn.textContent = 'Saving\u2026';
      const r = await dbSetAvatar(joinData.photo);
      if (r.error) { btn.disabled = false; btn.innerHTML = label; $('#pm-error').textContent = r.error.message; return; }
      save(); closeModal(); render(false); toast('Your photo is up.');
    });
  });
}

function bioModal(){
  const current = (state.profile && state.profile.bio) || '';
  openModal(current ? 'Your bio' : 'Add a bio', `<form id="bio-form">
    <div class="field">
      <label class="visually-hidden" for="bio-text">A short bio</label>
      <textarea id="bio-text" name="bio" maxlength="160" rows="3" placeholder="${escapeHTML(BIO_PLACEHOLDER)}">${escapeHTML(current)}</textarea>
      <div class="field-eg"><p>For example:</p><ul>${BIO_EXAMPLES.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div>
    </div>
    <p id="bio-error" class="field-error" role="alert"></p>
    <div class="dialog-actions">
      <button class="button outline small" type="button" data-action="close-modal">Cancel</button>
      <button class="button small" type="submit">Save</button>
    </div>
  </form>`, () => {
    $('#bio-form').addEventListener('submit', async ev => {
      ev.preventDefault();
      const text = $('#bio-text').value.trim();
      const btn = ev.target.querySelector('button[type=submit]'), label = btn.innerHTML;
      btn.disabled = true; btn.textContent = 'Saving\u2026';
      state.profile = { ...state.profile, bio: text };
      const r = await dbSaveProfileEdits({ bio: text });
      if (r && r.error) { btn.disabled = false; btn.innerHTML = label; $('#bio-error').textContent = r.error.message; return; }
      save(); closeModal(); render(false);
      toast(text ? 'Your bio is saved.' : 'Bio cleared.');
    });
  });
}

/* Somebody else's profile. Everything on it is what they chose to put on a
   profile, except their sessions, which only friends see — the same line the
   feed draws, for the same reason. */
function memberPage(id){
  if(!signedIn())return authPage();
  if(id===authUser.id){location.replace('#/profile');return '';}
  const p=personById(id);
  if(!p)return `<div class="wrap pf"><p class="small">Loading…</p></div>`;
  if(p.gone)return `<div class="wrap pf"><h1>No longer here</h1><p class="dialog-copy">This member has left VIRI.</p><a class="button small outline" href="#/find">Find people ${arrow}</a></div>`;
  const st=exLinked(id), friends=st==='connected';
  const theirs=friends?(state.feed||[]).filter(s=>s.by&&s.by.id===id):[];
  return `<div class="wrap pf">
    <header class="pf-head">
      <span class="pf-avatar">${p.photo?`<img src="${escapeHTML(p.photo)}" alt="">`:`<span class="av-xl">${escapeHTML(initials(p.name))}</span>`}</span>
      <div class="pf-id">
        <div class="pf-name-row">
          <h1>${escapeHTML(p.name)}</h1>
          ${friends
            ? `<a class="button small" href="#/messages" data-action="msg-open" data-id="${escapeHTML(id)}">Message</a>`
            : st==='incoming'
              ? `<button class="button small" data-action="ex-connect" data-id="${escapeHTML(id)}">Accept request</button>`
              : st==='requested'
                ? `<span class="tag">Requested</span>`
                : `<button class="button small" data-action="ex-connect" data-id="${escapeHTML(id)}">Connect</button>`}
          ${safetyButton(id,p.name)}
        </div>
        <div class="pf-bio">
          ${p.bio?`<p class="pf-bio-text">${escapeHTML(p.bio)}</p>`:''}
          <p class="small">${escapeHTML([p.area,p.age?String(p.age):''].filter(Boolean).join(' · '))}</p>
          ${(p.interests||[]).length?`<div class="pf-tags">${p.interests.map(c=>`<span>${escapeHTML(c)}</span>`).join('')}</div>`:''}
          ${(p.times||[]).length?`<p class="small">Usually trains ${escapeHTML(p.times.join(', ').toLowerCase())}</p>`:''}
        </div>
      </div>
      ${goalsPanel(p.goals)}
    </header>
    ${(p.routines||[]).length?`<section class="pf-week"><p class="rail-label">Her week <span class="period-dates">${weekRangeLabel()}</span></p>${weekList(p.routines)}</section>`:''}
    ${galleryStrip(p.gallery)}
    <div class="pf-main">
      ${friends
        ? (theirs.length
            ? `<div class="sessions">${theirs.map(s=>sessionCard(s,null)).join('')}</div>`
            : '<p class="small">Nothing logged yet.</p>')
        : '<p class="small">Sessions are shared between friends. Connect to see what she has been doing.</p>'}
    </div>
  </div>`;}

/* The registry is filled on demand, so a profile reached directly needs
   fetching before it can be drawn. */
let memberFetching='';
async function ensureMember(id){
  if(!id||(state.people&&state.people[id])||memberFetching===id)return;
  memberFetching=id;
  await dbPeople([id]);
  if(typeof dbLoadGallery==='function')await dbLoadGallery(id);
  if(typeof dbLoadRoutines==='function')await dbLoadRoutines(id);
  if(typeof dbLoadGoals==='function')await dbLoadGoals(id);
  memberFetching='';
  if((location.hash||'').includes(id))render(false);
}

/* A few photographs you can click through, which is how somebody decides
   whether they would get on with you — more use than a single square. */
let lightboxAt=0, lightboxOf=[];
function galleryStrip(photos,{own=false}={}){
  if(!photos||!photos.length)return own
    ? `<p class="small gallery-empty">Add a few photos so people get a sense of you. <button class="plain-link" data-action="add-gallery">Add photos</button></p>`
    : '';
  return `<div class="gallery">
    ${photos.map((p,i)=>`<figure class="gallery-cell">
      <button class="gallery-open" data-action="open-photo" data-index="${i}" aria-label="Photo ${i+1} of ${photos.length}">
        <img src="${escapeHTML(p.url||'')}" alt="" loading="lazy"></button>
      ${own?`<button class="gallery-x" data-action="remove-photo" data-id="${escapeHTML(p.id)}" aria-label="Remove photo ${i+1}">&#10005;</button>`:''}
    </figure>`).join('')}
    ${own&&photos.length<GALLERY_MAX?`<button class="gallery-add" data-action="add-gallery" aria-label="Add a photo">+</button>`:''}
  </div>`;}

function openLightbox(photos,index){
  lightboxOf=photos; lightboxAt=index;
  const draw=()=>{
    const p=lightboxOf[lightboxAt];
    openModal('', `<div class="lightbox">
      <img src="${escapeHTML(p.url||'')}" alt="">
      ${lightboxOf.length>1?`<div class="lightbox-nav">
        <button class="plain-link" data-action="photo-prev">&#8249; Back</button>
        <span class="small">${lightboxAt+1} of ${lightboxOf.length}</span>
        <button class="plain-link" data-action="photo-next">Next &#8250;</button>
      </div>`:''}
    </div>`);
  };
  draw();
}

async function removeGalleryPhoto(id){
  const r=await dbRemoveGalleryPhoto(id);
  if(r.error){toast(r.error.message);return;}
  render(false); toast('Photo removed.');
}

async function addGalleryPhoto(){
  const input=document.createElement('input');
  input.type='file'; input.accept='image/*';
  input.addEventListener('change', async ()=>{
    const file=input.files&&input.files[0]; if(!file)return;
    const data=await shrinkImage(file,1200);
    if(!data){toast('That file could not be read as an image.');return;}
    toast('Uploading…');
    const r=await dbAddGalleryPhoto(data);
    if(r.error){toast(r.error.message);return;}
    render(false); toast('Added.');
  });
  input.click();
}

/* Everything sign-up asked for, in one place. The old version offered a name
   and a neighbourhood, which left the answers that actually decide who you are
   matched with unreachable once you had given them. The photograph is not here
   because it has its own control on the avatar. */
function editProfileModal(){
  const p=state.profile||{};
  const box=(group,value,checked)=>`<label class="check-box"><input type="checkbox" name="${group}" value="${escapeHTML(value)}"${checked?' checked':''}><span>${escapeHTML(value)}</span></label>`;
  openModal('Edit your profile', `<form id="ep-form" class="ep-form">
    <div class="field"><label for="ep-name">Your name</label>
      <input id="ep-name" name="name" maxlength="60" required value="${escapeHTML(p.name||'')}"></div>

    <div class="field"><label for="ep-region">State or territory</label>
      <select id="ep-region" name="region"><option value="">Select one</option>${US_STATES.map(r=>
        `<option${p.region===r?' selected':''}>${escapeHTML(r)}</option>`).join('')}</select></div>
    <div class="field"><label for="ep-city">Your primary city</label>
      <input id="ep-city" name="city" maxlength="60" placeholder="Washington" value="${escapeHTML(p.city||'')}"></div>
    <div class="field"><label for="ep-area">Your neighbourhood</label>
      <input id="ep-area" name="area" maxlength="70" placeholder="Logan Circle" value="${escapeHTML(p.area||'')}"></div>

    <div class="field"><label for="ep-bio">A short bio <span class="field-optional">Optional</span></label>
      <textarea id="ep-bio" name="bio" maxlength="160" rows="3" placeholder="${escapeHTML(BIO_PLACEHOLDER)}">${escapeHTML(p.bio||'')}</textarea></div>

    <fieldset class="join-set"><legend>What are your primary forms of exercise?</legend>
      <div class="check-grid">${JOIN_FORMS.map(x=>box('interests',x,(p.interests||[]).includes(x))).join('')}</div></fieldset>

    <fieldset class="join-set"><legend>When do you usually train?</legend>
      <div class="check-grid">${JOIN_TIMES.map(x=>box('times',x,(p.times||[]).includes(x))).join('')}</div></fieldset>

    <div class="field"><label for="ep-born">Date of birth</label>
      <input id="ep-born" name="birthDate" type="date" max="${OLDEST_MINOR()}" value="${escapeHTML(p.birthDate||'')}">
      <label class="check-box show-age"><input type="checkbox" name="showAge"${p.showAge?' checked':''}><span>Show my age on my profile</span></label></div>

    <fieldset class="join-set college-block"><legend>Did you go to college?</legend>
      <label class="check-box"><input type="checkbox" id="ep-went" name="went"${p.college||p.collegeYear?' checked':''}><span>Yes, I went to college</span></label>
      <div class="college-more">
        <div class="field"><label for="ep-college">Where</label>
          <input id="ep-college" name="college" maxlength="70" placeholder="Georgetown University" value="${escapeHTML(p.college||'')}"></div>
        <div class="field"><label for="ep-grad">Graduated</label>
          <select id="ep-grad" name="collegeYear"><option value="">Prefer not to say</option>${GRAD_YEARS.map(y=>
            `<option${String(p.collegeYear)===String(y)?' selected':''}>${y}</option>`).join('')}</select></div>
      </div></fieldset>

    <div class="field"><label for="ep-industry">What industry do you work in? <span class="field-optional">Optional</span></label>
      <input id="ep-industry" name="industry" maxlength="50" placeholder="Consulting" value="${escapeHTML(p.industry||'')}">
      <div class="field-eg"><p>For example:</p><ul>${INDUSTRY_EXAMPLES.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></div></div>

    <p id="ep-error" class="field-error" role="alert"></p>
    <div class="dialog-actions">
      <button class="button outline small" type="button" data-action="close-modal">Cancel</button>
      <button class="button small" type="submit">Save changes</button>
    </div>
  </form>`, () => {
    $('#ep-form').addEventListener('submit', async ev => {
      ev.preventDefault();
      const form=ev.target, fd=new FormData(form);
      const picked=g=>[...form.querySelectorAll(`input[name="${g}"]:checked`)].map(i=>i.value);
      const name=String(fd.get('name')||'').trim();
      if(!name){$('#ep-error').textContent='Please give a name.';return;}
      const birthDate=String(fd.get('birthDate')||'');
      if(birthDate&&ageOf(birthDate)<18){$('#ep-error').textContent='VIRI is for women aged 18 and over.';return;}
      const went=!!fd.get('went');
      const patch={
        name, region:String(fd.get('region')||''), city:String(fd.get('city')||'').trim(),
        area:String(fd.get('area')||'').trim(), bio:String(fd.get('bio')||'').trim(),
        interests:picked('interests'), times:picked('times'),
        birthDate:birthDate||null, showAge:!!fd.get('showAge'),
        college:went?String(fd.get('college')||'').trim():'',
        collegeYear:went?String(fd.get('collegeYear')||''):'',
        industry:String(fd.get('industry')||'').trim()
      };
      const btn=form.querySelector('button[type=submit]'), label=btn.innerHTML;
      btn.disabled=true; btn.textContent='Saving…';
      const r=await dbSaveProfileEdits(patch);
      if(r.error){btn.disabled=false;btn.innerHTML=label;$('#ep-error').textContent=r.error.message;return;}
      state.profile={...state.profile,...patch};
      save(); closeModal(); render(false); toast('Profile updated.');
    });
  });
}

/* Your week, in your own words. This is what replaces the generated class
   schedule: rather than VIRI inventing a 6am Tuesday at Logan Circle and
   hoping it matches reality, you say that is when you go. Everything built on
   it is then true, and two people who say the same thing are in the same room. */
/* Which week "this week" means. Sunday to Saturday, matching periodStart() in
   db.js, so the range printed on the page is the same week the goal bars count. */
function weekRangeLabel(when){
  const d=new Date(when||Date.now()); d.setHours(0,0,0,0);
  const start=new Date(d); start.setDate(d.getDate()-d.getDay());
  const end=new Date(start); end.setDate(start.getDate()+6);
  const md=x=>x.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  return start.getMonth()===end.getMonth()
    ? `${md(start)} &ndash; ${end.getDate()}`
    : `${md(start)} &ndash; ${md(end)}`;
}
const monthLabel=()=>new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'});

function weekList(routines,{own=false}={}){
  const rs=[...(routines||[])].sort((a,b)=>a.weekday-b.weekday||a.band.localeCompare(b.band));
  if(!rs.length)return own
    ? `<p class="small week-empty">Tell VIRI where you train and roughly when. That is how it finds the people who are there with you. <button class="plain-link" data-action="add-routine">Add to my week</button></p>`
    : '<p class="small">Nothing shared yet.</p>';
  return `<ul class="week-list">${rs.map(r=>`<li>
    <div><strong>${escapeHTML(r.activity||r.venue||'Training')}</strong>
      <span class="small">${escapeHTML(WEEKDAYS[r.weekday])} &middot; ${escapeHTML(r.band)}${r.venue?' · '+escapeHTML(r.venue):''}</span></div>
    ${own?`<span class="week-acts"><button class="plain-link" data-action="edit-routine" data-id="${escapeHTML(r.id)}">Edit</button><button class="plain-link" data-action="remove-routine" data-id="${escapeHTML(r.id)}">Remove</button><button class="plain-link" data-action="offer-pass" data-id="${escapeHTML(r.id)}">Guest pass</button></span>`:''}
  </li>`).join('')}</ul>
  ${own?`<button class="button small outline" data-action="add-routine">Add another</button>`:''}`;}

/* Activity first, place second and optional. A week of runs is a complete
   answer; so is a week of runs with one barre class in it. Requiring a studio
   made the whole feature useless to anyone who mostly trains outdoors. */
function routineModal(presetVenue,extra){
  const join=extra||{};
  const editing=join.editId?(state.routines||[]).find(r=>r.id===join.editId):null;
  const venues=(window.VIRI&&VIRI.venues)||[];
  const cityName=(state.profile&&state.profile.city)||'';
  const near=venues.filter(v=>{
    const c=(VIRI.cities||[]).find(x=>x.id===v.city);
    return !cityName||(c&&cityName.toLowerCase().includes(c.name.split(',')[0].toLowerCase()));
  });
  const list=(near.length?near:venues);
  const preset=presetVenue?venues.find(v=>v.id===presetVenue):null;
  /* a venue's category is not always one of the activities on offer: a gym is
     strength training, a cycling studio is indoor cycling */
  const presetForm=preset?({Gym:'Strength training',Strength:'Strength training',Cycling:'Indoor cycling'}[preset.cat]||preset.cat):'';
  const formWant=join.activity?(JOIN_FORMS.find(f=>f.toLowerCase()===String(join.activity).trim().toLowerCase())||'Other'):presetForm;
  openModal(editing?'Edit this routine':'Add to your week', `<form id="rt-form">${join.note?`<p class="dialog-copy">${escapeHTML(join.note)}</p>`:''}
    <div class="field"><label for="rt-act">What do you do?</label>
      <select id="rt-act" name="activity" required>
        ${JOIN_FORMS.filter(x=>x!=='No preference').map(x=>
          `<option${formWant===x?' selected':''}>${escapeHTML(x)}</option>`).join('')}
      </select></div>

    <div class="field"><label for="rt-place">Where? <span class="field-optional">Optional</span></label>
      <input id="rt-place" name="venueLabel" list="rt-venues" maxlength="80"
        placeholder="A studio, a gym, a park &mdash; or leave it blank"
        value="${preset?escapeHTML(preset.brand+' — '+preset.area):escapeHTML(join.venueLabel||'')}">
      <input type="hidden" name="venueId" id="rt-vid" value="${preset?escapeHTML(preset.id):escapeHTML(join.venueId||'')}">
      <datalist id="rt-venues">${list.map(v=>
        `<option data-id="${escapeHTML(v.id)}" value="${escapeHTML(v.brand+' — '+v.area)}"></option>`).join('')}</datalist>
      <p class="field-eg">Leave it blank for a run, a walk, or anything without a fixed place. If your gym is not in the list, just type it.</p></div>

    <fieldset class="interest-fieldset"><legend>Which days?</legend>
      <div class="day-picker">${WEEKDAYS.map((d,i)=>`<label class="check-box"><input type="checkbox" name="weekday" value="${i}"${(join.days?join.days.includes(i):i===new Date().getDay())?' checked':''}><span>${escapeHTML(d.slice(0,3))}</span></label>`).join('')}</div>
      <p class="field-eg">Pick every day it happens &mdash; a run on four mornings is four entries, added in one go. This repeats every week; this week is <strong>${weekRangeLabel()}</strong>.</p></fieldset>
    <div class="field"><label for="rt-band">Roughly when?</label>
      <select id="rt-band" name="band" required>${JOIN_TIMES.map(t=>`<option${join.band===t?' selected':''}>${escapeHTML(t)}</option>`).join('')}</select>
      <p class="field-eg">A rough window, not a clock time &mdash; enough to find the people who are there with you.</p></div>
    <p id="rt-error" class="field-error" role="alert"></p>
    <div class="dialog-actions">
      <button class="button outline small" type="button" data-action="close-modal">Cancel</button>
      <button class="button small" type="submit">${editing?'Save changes':'Add it'}</button>
    </div>
  </form>`, () => {
    const place=$('#rt-place'), vid=$('#rt-vid');
    /* if what they typed matches a studio we know, keep its id so matching is
       exact rather than by spelling */
    place.addEventListener('input',()=>{
      const hit=list.find(v=>(v.brand+' — '+v.area)===place.value);
      vid.value=hit?hit.id:'';
    });
    $('#rt-form').addEventListener('submit', async ev => {
      ev.preventDefault();
      const fd=new FormData(ev.target);
      const btn=ev.target.querySelector('button[type=submit]'), label=btn.innerHTML;
      /* a checkbox group cannot carry `required`, so the empty case is ours to catch */
      const days=fd.getAll('weekday').map(Number).filter(n=>n>=0&&n<=6);
      if(!days.length){$('#rt-error').textContent='Pick at least one day.';return;}
      $('#rt-error').textContent='';
      if(editing){
        btn.disabled=true; btn.textContent='Saving…';
        const fields={venueId:String(fd.get('venueId')||''),venueLabel:String(fd.get('venueLabel')||''),
          activity:String(fd.get('activity')||''),band:String(fd.get('band'))};
        /* this routine keeps its own day if it is still ticked; any other ticked day is added */
        const ordered=days.includes(editing.weekday)?[editing.weekday,...days.filter(d=>d!==editing.weekday)]:days;
        const r=await dbUpdateRoutine(editing.id,{...fields,weekday:ordered[0]});
        if(r.error){btn.disabled=false;btn.innerHTML=label;$('#rt-error').textContent=r.error.message;return;}
        const rest=ordered.slice(1);
        if(rest.length){const r2=await dbAddRoutineDays({...fields,days:rest});if(r2.error)toast(r2.error.message);}
        if(typeof dbRoutineMatches==='function')await dbRoutineMatches();
        save(); closeModal(); render(false);
        toast(rest.length?`Updated, and added ${rest.length} more ${rest.length===1?'day':'days'}.`:'Updated.');
        return;
      }
      /* Nothing is saved yet: the next step shows how it will look, and is where
         a guest pass can be offered. */
      routinePreview({ venueId:String(fd.get('venueId')||''), venueLabel:String(fd.get('venueLabel')||''),
        activity:String(fd.get('activity')||''), days, band:String(fd.get('band')) }, join);
    });
  });
}

async function removeRoutine(id){
  const r=await dbRemoveRoutine(id);
  if(r.error){toast(r.error.message);return;}
  if(typeof dbRoutineMatches==='function')await dbRoutineMatches();
  save(); render(false); toast('Removed.');
}

/* ===================== guest passes =====================
   A member who has a guest pass she will not use lists it; another member asks
   for it; the owner says yes or no; they arrange the rest between themselves.
   VIRI does not hold, check or sell passes, and says so wherever one is offered.
   For now every pass is visible to every signed-in member. */
const PASS_TERMS='VIRI does not provide, check or sell guest passes, and the studio’s own rules apply. Arrange it directly with the member, and please never charge for a pass.';
const passDateObj=iso=>{const [y,m,d]=String(iso).split('-').map(Number);return new Date(y,(m||1)-1,d||1);};
const passWhen=p=>`${prettyDate(passDateObj(p.date))} &middot; ${escapeHTML(p.band)}`;
/* the next four weeks' dates for the given weekdays, today included */
function nextDates(weekdays){
  const out=[], d0=new Date(); d0.setHours(0,0,0,0);
  for(let i=0;i<28;i++){
    const d=new Date(d0); d.setDate(d0.getDate()+i);
    if(weekdays.includes(d.getDay()))out.push({iso:localDay(d),label:prettyDate(d)});
  }
  return out;
}
/* same rule routineModal uses to decide which studios are "near" her */
function passCityId(venueId){
  const v=((window.VIRI&&VIRI.venues)||[]).find(x=>x.id===venueId);
  if(v)return v.city;
  const cn=((state.profile&&state.profile.city)||'').toLowerCase();
  const c=(VIRI.cities||[]).find(x=>cn&&cn.includes(x.name.split(',')[0].toLowerCase()));
  return c?c.id:'';
}
function passFields(dates){
  return `<fieldset class="interest-fieldset pass-box"><legend>Your guest pass</legend>
    <p class="field-eg pass-lead">Which dates will you have it for? These are the next four weeks.</p>
    <div class="pass-dates">${dates.map((d,i)=>`<label class="check-box"><input type="checkbox" name="passDate" value="${escapeHTML(d.iso)}"${i===0?' checked':''}><span>${escapeHTML(d.label)}</span></label>`).join('')}</div>
    <div class="field"><label for="pass-spots">How many passes can you share?</label>
      <select id="pass-spots" name="spots">${[1,2,3,4,5].map(n=>`<option>${n}</option>`).join('')}</select></div>
    <div class="field"><label for="pass-note">A note <span class="field-optional">Optional</span></label>
      <input id="pass-note" name="passNote" maxlength="200" placeholder="e.g. Works for any class that morning"></div>
    <p class="field-eg">Every member signed in to VIRI can see this and ask you for it, and you decide who gets it. ${PASS_TERMS}</p></fieldset>`;
}
const readPassFields=form=>{const fd=new FormData(form);
  return {dates:fd.getAll('passDate').map(String),spots:Number(fd.get('spots'))||1,note:String(fd.get('passNote')||'')};};

/* Step two of adding to your week: how it will look, and the chance to offer a
   guest pass. Nothing has been saved until the last button. */
function routinePreview(v,join){
  const hasPlace=!!String(v.venueLabel||'').trim();
  const days=[...v.days].sort((a,b)=>a-b);
  const dates=nextDates(days);
  openModal('Here is how it will look',`<form id="rt-confirm">
    <p class="dialog-copy">This is what goes into your week. Check it, then add it.</p>
    <div class="rail-box pass-preview"><p class="rail-label">Your week <span class="period-dates">${weekRangeLabel()}</span></p>
      ${days.map(d=>`<div class="rail-line"><b>${escapeHTML(WEEKDAYS[d])}</b> &middot; ${escapeHTML(v.band)}<br>${escapeHTML(v.activity||'Training')}${hasPlace?`<br><span class="small">${escapeHTML(v.venueLabel)}</span>`:''}</div>`).join('')}</div>
    <p class="field-eg">This repeats every week.</p>
    <div id="pass-offer" hidden>${passFields(dates)}</div>
    ${hasPlace?'':'<p class="field-eg">To offer a guest pass, go back and say which studio it is for.</p>'}
    <p id="rt-error" class="field-error" role="alert"></p>
    <div class="dialog-actions">
      <button class="button outline small" type="button" id="rt-back">Back</button>
      <button class="button outline small" type="button" id="pass-toggle" aria-expanded="false"${hasPlace?'':' disabled'}>I have a guest pass</button>
      <button class="button small" type="submit" id="rt-go">Add to my week</button>
    </div></form>`,()=>{
    let offering=false;
    $('#rt-back').addEventListener('click',()=>routineModal(null,{activity:v.activity,venueLabel:v.venueLabel,venueId:v.venueId,
      days:v.days,band:v.band,joinedFrom:join.joinedFrom||'',note:join.note||''}));
    $('#pass-toggle').addEventListener('click',()=>{
      offering=!offering;
      $('#pass-offer').hidden=!offering;
      $('#pass-toggle').textContent=offering?'No guest pass':'I have a guest pass';
      $('#pass-toggle').setAttribute('aria-expanded',String(offering));
      $('#rt-go').textContent=offering?'Add and list the pass':'Add to my week';
    });
    $('#rt-confirm').addEventListener('submit',async ev=>{
      ev.preventDefault();
      const btn=$('#rt-go'), label=btn.textContent, err=$('#rt-error');
      const pass=offering?readPassFields(ev.target):null;
      if(pass&&!pass.dates.length){err.textContent='Pick at least one date for the pass.';return;}
      err.textContent=''; btn.disabled=true; btn.textContent='Adding…';
      const r=await dbAddRoutineDays({venueId:v.venueId,venueLabel:v.venueLabel,activity:v.activity,days:v.days,band:v.band,joinedFrom:join.joinedFrom||''});
      const already=!!r.error&&/already in your week/i.test(r.error.message);
      if(r.error&&!(pass&&already)){btn.disabled=false;btn.textContent=label;err.textContent=r.error.message;return;}
      if(!r.error&&typeof dbRoutineMatches==='function')await dbRoutineMatches();
      let note='';
      if(pass){
        const pr=await dbCreateGuestPasses({venueId:v.venueId,venueLabel:v.venueLabel,cityId:passCityId(v.venueId),
          activity:v.activity,band:v.band,...pass});
        note=pr.error?` The guest pass was not listed: ${pr.error.message}`
          :` Your guest pass is listed under Explore, Available guest passes.${pr.data.failure?` Some dates were not listed: ${pr.data.failure.message}`:''}`;
      }
      save(); closeModal(); render(false);
      const added=r.error?0:r.data.added, dup=r.error?0:r.data.duplicates;
      toast((r.error?'That was already in your week.'
        :added===1&&!dup?'Added to your week.'
        :`Added ${added} ${added===1?'day':'days'} to your week.${dup?` ${dup} ${dup===1?'was':'were'} already there.`:''}`)+note);
    });
  });
}

/* From a routine already in your week */
function offerPassModal(id){
  const r=(state.routines||[]).find(x=>x.id===id); if(!r)return;
  if(!String(r.venue||'').trim()){toast('A guest pass needs a studio. Use Edit to say where this one is.');return;}
  openModal('Offer a guest pass',`<form id="pass-form">
    <p class="dialog-copy"><b>${escapeHTML(r.activity||'Training')}</b> &middot; ${escapeHTML(r.venue)}<br>${escapeHTML(WEEKDAYS[r.weekday])} &middot; ${escapeHTML(r.band)}</p>
    ${passFields(nextDates([r.weekday]))}
    <p id="pass-error" class="field-error" role="alert"></p>
    <div class="dialog-actions"><button class="button outline small" type="button" data-action="close-modal">Cancel</button>
      <button class="button small" type="submit">List the pass</button></div></form>`,()=>{
    $('#pass-form').addEventListener('submit',async ev=>{
      ev.preventDefault();
      const pass=readPassFields(ev.target), err=$('#pass-error');
      if(!pass.dates.length){err.textContent='Pick at least one date.';return;}
      const btn=ev.target.querySelector('button[type=submit]'), label=btn.textContent;
      err.textContent=''; btn.disabled=true; btn.textContent='Listing…';
      const pr=await dbCreateGuestPasses({venueId:r.venueId,venueLabel:r.venue,cityId:passCityId(r.venueId),
        activity:r.activity||'Training',band:r.band,...pass});
      if(pr.error){btn.disabled=false;btn.textContent=label;err.textContent=pr.error.message;return;}
      closeModal(); render(false);
      toast((pr.data.duplicates?`Listed. ${pr.data.duplicates} ${pr.data.duplicates===1?'date was':'dates were'} already listed.`
        :'Listed under Explore, Available guest passes.')+(pr.data.failure?` Some dates were not listed: ${pr.data.failure.message}`:''));
    });
  });
}

/* ---- the Explore tab ---- */
const passOwnerLink=p=>{
  const o=personById(p.ownerId)||{name:'A member'};
  return `<a class="pass-who" href="#/member/${escapeHTML(p.ownerId)}"><span class="av-sm">${avatarFor(o)}</span><span><b>${escapeHTML(o.name)}</b>${o.area?`<br><span class="small">${escapeHTML(o.area)}</span>`:''}</span></a>`;
};
function passCard(p){
  const ask=passBoard.asks[p.id], o=personById(p.ownerId)||{name:'A member'}, first=String(o.name||'her').split(' ')[0];
  const act=!ask?`<button class="button small" data-action="pass-ask" data-id="${escapeHTML(p.id)}">Ask for this pass</button>`
    :ask.status==='accepted'?`<span class="pass-status ok">She said yes</span> <a class="button small" href="#/messages" data-action="msg-open" data-id="${escapeHTML(p.ownerId)}">Message ${escapeHTML(first)}</a>`
    :ask.status==='declined'?'<span class="pass-status">Not this time</span>'
    :`<span class="pass-status">Requested</span> <button class="plain-link" data-action="pass-withdraw" data-id="${escapeHTML(ask.id)}">Withdraw</button>`;
  return `<article class="pass-card">${passOwnerLink(p)}
    <p class="pass-what"><b>${escapeHTML(p.venue)}</b><br>${escapeHTML(p.activity)} &middot; ${passWhen(p)}</p>
    <p class="small">${p.left} ${p.left===1?'pass':'passes'} available</p>
    ${p.note?`<p class="pass-note-text">&ldquo;${escapeHTML(p.note)}&rdquo;</p>`:''}
    <div class="pass-act">${act}</div></article>`;
}
function myPassCard(p){
  const reqs=passBoard.incoming.filter(q=>q.passId===p.id);
  return `<article class="pass-card mine">
    <p class="pass-what"><b>${escapeHTML(p.venue)}</b><br>${escapeHTML(p.activity)} &middot; ${passWhen(p)}</p>
    <p class="small">${p.left} of ${p.spots} ${p.spots===1?'pass':'passes'} still available${p.note?` &middot; &ldquo;${escapeHTML(p.note)}&rdquo;`:''}</p>
    ${reqs.length?`<ul class="pass-reqs">${reqs.map(q=>{
      const who=personById(q.requesterId)||{name:'A member'};
      return `<li><div><a href="#/member/${escapeHTML(q.requesterId)}"><b>${escapeHTML(who.name)}</b></a> asked for it${q.note?`<br><span class="small">&ldquo;${escapeHTML(q.note)}&rdquo;</span>`:''}</div>
        <div class="pass-act">${q.status==='pending'
          ?`<button class="button small" data-action="pass-answer" data-id="${escapeHTML(q.id)}" data-accept="1"${p.left<1?' disabled':''}>Say yes</button><button class="button small outline" data-action="pass-answer" data-id="${escapeHTML(q.id)}" data-accept="0">Not this time</button>`
          :q.status==='accepted'?`<span class="pass-status ok">You said yes</span><a class="button small outline" href="#/messages" data-action="msg-open" data-id="${escapeHTML(q.requesterId)}">Message</a>`
          :'<span class="pass-status">You said no</span>'}</div></li>`;}).join('')}</ul>`
      :'<p class="small">Nobody has asked yet.</p>'}
    <div class="pass-act"><button class="plain-link" data-action="pass-remove" data-id="${escapeHTML(p.id)}">Remove this pass</button></div></article>`;
}
function passesView(){
  const city=exCity();
  if(!signedIn())return `<section class="pass-view"><p class="pass-lead">Members share guest passes they will not use. Create your profile to see what is available near you.</p>${button('Create your profile','#/signup','small')}</section>`;
  const b=passBoard;
  if(!b.loaded)return '<section class="pass-view"><p class="small">Loading guest passes&hellip;</p></section>';
  if(!b.ready)return '<section class="pass-view"><p class="small">Guest passes are not switched on yet.</p></section>';
  const me=authUser&&authUser.id;
  const mine=b.list.filter(p=>p.ownerId===me);
  const open=b.list.filter(p=>p.ownerId!==me&&(!p.cityId||p.cityId===city.id)&&(p.left>0||b.asks[p.id]));
  return `<section class="pass-view">
    <p class="pass-lead">Members share the guest passes they will not use. Ask for one and the owner decides; the two of you arrange the rest. ${PASS_TERMS}</p>
    ${mine.length?`<h2 class="pass-h">Yours</h2><div class="pass-grid">${mine.map(myPassCard).join('')}</div>`:''}
    <h2 class="pass-h">Available in ${escapeHTML(city.name)}</h2>
    ${open.length?`<div class="pass-grid">${open.map(passCard).join('')}</div>`
      :`<p class="small pass-empty">No guest passes in ${escapeHTML(city.name)} right now. Got one you will not use? <button class="plain-link" data-action="add-routine">Add it to your week</button> and tap &ldquo;I have a guest pass&rdquo;.</p>`}
  </section>`;
}
async function openPasses(passId){
  exView='passes';
  if(passId){const p=passBoard.list.find(x=>x.id===passId); if(p&&p.cityId)ex={...ex,city:p.cityId};}
  if(location.hash.replace(/^#\/?/,'').split('/')[0]!=='explore'){location.hash='#/explore';}
  passBoard.loaded=false; render(false);
  await dbLoadGuestPasses();
  if(exView==='passes'&&location.hash.replace(/^#\/?/,'').split('/')[0]==='explore')render(false);
}
function setExView(v){
  if(v==='passes'){openPasses();return;}
  exView='studios'; render(false);
}
function passAskModal(id){
  const p=passBoard.list.find(x=>x.id===id); if(!p)return;
  const o=personById(p.ownerId)||{name:'her'}, first=String(o.name).split(' ')[0];
  openModal('Ask for this guest pass',`<form id="ask-form">
    <p class="dialog-copy"><b>${escapeHTML(p.venue)}</b><br>${escapeHTML(p.activity)} &middot; ${passWhen(p)}</p>
    <div class="field"><label for="ask-note">A note to ${escapeHTML(first)} <span class="field-optional">Optional</span></label>
      <textarea id="ask-note" name="note" rows="3" maxlength="300" placeholder="Say hi, and anything she should know"></textarea></div>
    <p class="field-eg">${escapeHTML(first)} decides, and nothing is promised until she says yes. Then you will see a Message button here to sort out the details. ${PASS_TERMS}</p>
    <p id="ask-error" class="field-error" role="alert"></p>
    <div class="dialog-actions"><button class="button outline small" type="button" data-action="close-modal">Cancel</button>
      <button class="button small" type="submit">Send request</button></div></form>`,()=>{
    $('#ask-form').addEventListener('submit',async ev=>{
      ev.preventDefault();
      const btn=ev.target.querySelector('button[type=submit]'), label=btn.textContent;
      btn.disabled=true; btn.textContent='Sending…';
      const r=await dbRequestPass(id,String(new FormData(ev.target).get('note')||''));
      if(r.error){btn.disabled=false;btn.textContent=label;$('#ask-error').textContent=r.error.message;return;}
      closeModal(); render(false); toast(`Request sent to ${first}.`);
    });
  });
}
async function withdrawPass(requestId){
  const r=await dbWithdrawPassRequest(requestId);
  if(r.error){toast(r.error.message);return;}
  render(false); toast('Request withdrawn.');
}
async function answerPass(requestId,accept){
  const r=await dbAnswerPassRequest(requestId,accept);
  if(r.error){toast(r.error.message);return;}
  render(false); toast(accept?'Said yes. Message her to sort out the details.':'Answered.');
}
async function removePass(btn,id){
  if(btn.dataset.armed!=='1'){btn.dataset.armed='1';btn.textContent='Tap again to remove it';return;}
  const r=await dbDeleteGuestPass(id);
  if(r.error){toast(r.error.message);return;}
  render(false); toast('Guest pass removed.');
}

/* Goals sit beside the details at the top of a profile, where somebody else
   can see them. That visibility is the feature: a bar that only you can see
   is a note to self, and a note to self is what people stop keeping. */
function goalsPanel(goals,{own=false}={}){
  const gs=goals||[];
  const group=period=>{
    const rows=gs.filter(g=>g.period===period);
    const label=period==='week'
      ? `This week <span class="period-dates">${weekRangeLabel()}</span>`
      : `This month <span class="period-dates">${monthLabel()}</span>`;
    if(!rows.length)return own
      ? `<p class="goal-none">${label} &mdash; <button class="plain-link" data-action="add-goal" data-id="${period}">set a goal</button></p>`
      : '';
    return `<div class="goal-group"><p class="goal-label">${label}</p>
      ${rows.map(g=>`<div class="goal">
        <div class="goal-top">
          <span class="goal-name">${escapeHTML(g.title)}</span>
          <span class="goal-count">${g.done} of ${g.target}</span>
        </div>
        <div class="goal-bar" role="img" aria-label="${g.done} of ${g.target} done">
          <span style="width:${g.pct}%"></span></div>
        ${goalScheduleLine(g)?`<p class="goal-when">${escapeHTML(goalScheduleLine(g))}</p>`:''}
        ${own?`<span class="goal-acts"><button class="plain-link goal-x" data-action="edit-goal" data-id="${escapeHTML(g.id)}">Edit</button><button class="plain-link goal-x" data-action="remove-goal" data-id="${escapeHTML(g.id)}">Remove</button></span>`:''}
      </div>`).join('')}
      ${own&&rows.length<GOALS_PER_PERIOD?`<button class="plain-link" data-action="add-goal" data-id="${period}">Add another</button>`:''}
    </div>`;};
  const body=group('week')+group('month');
  if(!body)return own?`<aside class="goals-panel"><p class="rail-label">Goals</p><p class="goal-none">Three a week, three a month, and a question each morning about yesterday. <button class="plain-link" data-action="add-goal" data-id="week">Set your first</button></p></aside>`:'';
  return `<aside class="goals-panel"><p class="rail-label">Goals</p>${body}</aside>`;}

/* Goals whose week or month is over, newest first, on your own profile. */
let goalHistoryLoaded=false, goalHistoryOpen=false;
/* two taps, like deleting a session */
async function deleteHistoryGoal(btn){
  if(btn.dataset.armed!=='1'){btn.dataset.armed='1';btn.textContent='Tap again to delete';return;}
  btn.disabled=true;
  const r=await dbRemoveGoal(btn.dataset.id);
  if(r.error){btn.disabled=false;btn.dataset.armed='';btn.textContent='Delete';toast(r.error.message);return;}
  goalHistoryOpen=true; render(false); toast('Goal deleted.');
}
function goalHistory(){
  const gs=state.goalHistory;
  if(!goalHistoryLoaded||gs===undefined)return '';
  const head='<div class="pf-section-head"><h2>Past goals</h2></div>';
  if(gs===null)return `<section class="pf-section goal-history">${head}<p class="small">Past goals could not be loaded. Refresh to try again.</p></section>`;
  if(!gs.length)return `<section class="pf-section goal-history">${head}<p class="small">When a week or month ends, its goals are kept here.</p></section>`;
  const groups=[];
  for(const g of gs){
    const key=g.period+'|'+g.periodStart;
    let grp=groups.find(x=>x.key===key);
    if(!grp){grp={key,period:g.period,start:g.periodStart,rows:[]};groups.push(grp);}
    grp.rows.push(g);
  }
  const label=grp=>grp.period==='week'
    ? `Week of ${weekRangeLabel(grp.start+'T12:00:00')}`
    : new Date(grp.start+'T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'});
  return `<section class="pf-section goal-history"><details${goalHistoryOpen?' open':''}>
    <summary class="pf-section-head"><h2>Past goals</h2><span class="period-dates">${gs.length}</span></summary>
    ${groups.map(grp=>`<div class="goal-group"><p class="goal-label">${label(grp)}</p>
      ${grp.rows.map(g=>`<div class="goal${g.done>=g.target?' is-met':''}">
        <div class="goal-top">
          <span class="goal-name">${escapeHTML(g.title)}</span>
          <span class="goal-count">${g.done} of ${g.target}${g.done>=g.target?' &#10003;':''}</span>
        </div>
        <div class="goal-bar" role="img" aria-label="${g.done} of ${g.target} done"><span style="width:${g.pct}%"></span></div>
        <button class="plain-link goal-x" data-action="history-goal-delete" data-id="${escapeHTML(g.id)}">Delete</button>
      </div>`).join('')}</div>`).join('')}
  </details></section>`;
}

/* "Asks after Mon, Wed, Fri" / "Asks after Oct 4, Oct 11, Oct 18" — nothing for every day */
function goalScheduleLine(g){
  const md=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
  if(g.checkDates&&g.checkDates.length)return `Asks after ${g.checkDates.map(md).join(', ')}`;
  if(g.checkDays&&g.checkDays.length)return `Asks after ${[...g.checkDays].sort((a,b)=>a-b).map(i=>WEEKDAYS[i].slice(0,3)).join(', ')}`;
  return '';
}

/* Setting or editing a goal. A goal is still for this week or this month —
   that is what brings people back — but it can say when it should be asked
   about: every day, on chosen weekdays, or only after chosen dates. Three
   long runs on known dates is three questions, not thirty. */
function goalModal(period,editId){
  const g=editId?(state.goals||[]).find(x=>x.id===editId):null;
  if(editId&&!g){toast('That goal could not be found. Refresh and try again.');return;}
  if(g)period=g.period;
  const start=new Date(periodStart(period)+'T00:00:00');
  const end=period==='week'?new Date(start.getFullYear(),start.getMonth(),start.getDate()+6):new Date(start.getFullYear(),start.getMonth()+1,0);
  const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const lo=ymd(start), hi=ymd(end), span=period==='week'?'this week':'this month';
  const mode0=g&&g.checkDates&&g.checkDates.length?'dates':g&&g.checkDays&&g.checkDays.length?'days':'daily';
  const days0=(g&&g.checkDays)||[];
  const dates0=g&&g.checkDates&&g.checkDates.length?g.checkDates:[''];
  const dateRow=v=>`<input type="date" name="dates" min="${lo}" max="${hi}" value="${escapeHTML(v||'')}" aria-label="Date">`;
  openModal(g?'Edit this goal':period==='month'?'A goal for this month':'A goal for this week', `<form id="goal-form">
    <div class="field"><label for="goal-title">What are you aiming at?</label>
      <input id="goal-title" name="title" maxlength="80" required value="${escapeHTML(g?g.title:'')}" placeholder="${period==='month'?'Three long runs before the marathon':'Up at 6am, Monday to Friday'}">
    </div>
    <fieldset class="interest-fieldset"><legend>When should VIRI ask?</legend>
      <div class="goal-modes">${[['daily','Every day'],['days','On certain days'],['dates','On specific dates']].map(([v,l])=>
        `<label class="check-box"><input type="radio" name="mode" value="${v}"${mode0===v?' checked':''}><span>${l}</span></label>`).join('')}</div>
      <div class="goal-mode-panel" data-mode="days"${mode0==='days'?'':' hidden'}>
        <div class="day-picker">${WEEKDAYS.map((d,i)=>`<label class="check-box"><input type="checkbox" name="days" value="${i}"${days0.includes(i)?' checked':''}><span>${escapeHTML(d.slice(0,3))}</span></label>`).join('')}</div>
      </div>
      <div class="goal-mode-panel" data-mode="dates"${mode0==='dates'?'':' hidden'}>
        <div class="goal-dates" id="goal-dates">${dates0.map(dateRow).join('')}</div>
        <button type="button" class="plain-link" id="goal-add-date">Add another date</button>
      </div>
      <p class="field-eg" id="goal-mode-eg"></p>
    </fieldset>
    <div class="field" id="goal-target-field"${mode0==='dates'?' hidden':''}><label for="goal-target">How many times?</label>
      <input id="goal-target" name="target" type="number" min="1" max="31" value="${g?g.target:(period==='month'?12:5)}">
    </div>
    <p id="goal-error" class="field-error" role="alert"></p>
    <div class="dialog-actions">
      <button class="button outline small" type="button" data-action="close-modal">Cancel</button>
      <button class="button small" type="submit">${g?'Save changes':'Set it'}</button>
    </div>
  </form>`, () => {
    const form=$('#goal-form'), eg=$('#goal-mode-eg'), targetField=$('#goal-target-field');
    const md=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const explain={
      daily:'Each morning VIRI asks whether you did it the day before, and the bar fills from your answers.',
      days:'VIRI asks the morning after each day you pick.',
      dates:`VIRI asks only the morning after each date, and the goal is every one of them. Dates fall ${span}, ${md(start)} – ${md(end)}.`};
    const mode=()=>form.querySelector('input[name=mode]:checked').value;
    const sync=()=>{const m=mode();
      form.querySelectorAll('.goal-mode-panel').forEach(p=>{p.hidden=p.dataset.mode!==m;});
      targetField.hidden=m==='dates'; eg.textContent=explain[m];};
    form.querySelectorAll('input[name=mode]').forEach(r=>r.addEventListener('change',sync)); sync();
    /* a stale message next to the browser's own date check is worse than none */
    form.addEventListener('input',()=>{$('#goal-error').textContent='';});
    $('#goal-add-date').addEventListener('click',()=>{const box=$('#goal-dates');
      if(box.children.length>=31)return; box.insertAdjacentHTML('beforeend',dateRow('')); box.lastElementChild.focus();});
    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      const fd=new FormData(form), m=mode(), err=$('#goal-error'); err.textContent='';
      let checkDays=null, checkDates=null, target=Number(fd.get('target'))||0;
      if(m==='days'){
        checkDays=fd.getAll('days').map(Number).filter(n=>n>=0&&n<=6);
        if(!checkDays.length){err.textContent='Pick at least one day.';return;}
      }
      if(m==='dates'){
        checkDates=[...new Set(fd.getAll('dates').map(String).filter(Boolean))].sort();
        if(!checkDates.length){err.textContent='Add at least one date.';return;}
        if(checkDates.some(d=>d<lo||d>hi)){err.textContent=`Every date has to fall ${span}, ${md(start)} – ${md(end)}.`;return;}
        target=checkDates.length;
      }
      if(!(target>=1&&target<=31)){err.textContent='How many times? Between 1 and 31.';return;}
      const btn=form.querySelector('button[type=submit]'), label=btn.innerHTML;
      btn.disabled=true; btn.textContent='Saving…';
      const r=g?await dbUpdateGoal(g.id,{title:fd.get('title'),target,checkDays,checkDates})
               :await dbAddGoal({period,title:fd.get('title'),target,checkDays,checkDates});
      if(r.error){btn.disabled=false;btn.innerHTML=label;err.textContent=r.error.message;return;}
      save(); closeModal(); render(false); toast(g?'Goal updated.':'Goal set.');
    });
  });
}

async function removeGoal(id){
  const r=await dbRemoveGoal(id);
  if(r.error){toast(r.error.message);return;}
  save(); render(false); toast('Goal removed.');
}

/* The morning question. One day at a time, oldest unanswered first, so a
   missed Tuesday can still be filled in on Thursday. */
let askedThisVisit=false;
/* Asked on its own at most once a day. It used to come back on every page
   load, because the only memory of having asked was this variable, and a
   refresh wipes it. Answering one day moves straight on to the next. */
const goalsAskKey='viri-goals-asked';
function askAboutYesterday(continuing){
  if(askedThisVisit||!signedIn())return;
  const today=new Date().toDateString();
  if(continuing!==true){
    try{if(localStorage.getItem(goalsAskKey)===today)return;}catch(e){}
  }
  const waiting=(typeof goalsAwaitingAnswer==='function'?goalsAwaitingAnswer():[]);
  if(!waiting.length)return;
  askedThisVisit=true;
  try{localStorage.setItem(goalsAskKey,today);}catch(e){}
  const day=waiting[0].day;
  const sameDay=waiting.filter(w=>w.day===day);
  const pretty=new Date(day+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
  openModal(`How did ${pretty} go?`, `<p class="dialog-copy">Answer honestly &mdash; the bar is only worth something if it is true.</p>
    <ul class="ask-list">${sameDay.map(w=>`<li>
      <span>${escapeHTML(w.goal.title)}</span>
      <span class="req-acts">
        <button class="req-yes" data-action="goal-yes" data-id="${escapeHTML(w.goal.id)}" data-day="${day}" aria-label="Yes">&#10003;</button>
        <button class="req-no" data-action="goal-no" data-id="${escapeHTML(w.goal.id)}" data-day="${day}" aria-label="No">&#10005;</button>
      </span></li>`).join('')}</ul>
    <div class="dialog-actions"><button class="button outline small" data-action="close-modal">Not now</button></div>`);
}

async function answerGoal(id,day,done){
  const r=await dbCheckIn(id,day,done);
  if(r.error){toast(r.error.message);return;}
  const left=(typeof goalsAwaitingAnswer==='function'?goalsAwaitingAnswer():[]).filter(w=>w.day===day);
  save(); render(false);
  if(left.length){askedThisVisit=false;askAboutYesterday(true);}
  else{closeModal();toast(done?'Logged. Nice.':'Logged.');}
}

function settingsPage(){
  if(!signedIn())return authPage();
  const p=state.profile;
  const row=(k,v)=>`<div class="set-row"><span class="set-k">${escapeHTML(k)}</span><span class="set-v">${v}</span></div>`;
  return `<section class="page-head is-tight"><div class="wrap"><h1>Settings</h1></div></section>
  <div class="wrap set">
    ${info('Your profile is stored in your VIRI account. This browser keeps a copy so pages open quickly.')}
    <section class="set-block">
      <h2>Your details</h2>
      ${row('Name',escapeHTML(p.name))}
      ${row('Email',escapeHTML(p.email||'—'))}
      ${row('Password','<a class="plain-link" href="#/reset-password">Change your password</a>')}
      ${row('Where you train',escapeHTML([p.city,p.region].filter(Boolean).join(', ')||p.area||'—'))}
      ${row('Age',ageOf(p.birthDate||p.birthYear)
        ? `${ageOf(p.birthDate||p.birthYear)} &middot; <span class="small">${p.showAge?'shown on your profile':'hidden from your profile'}</span>`
        : '<span class="small">Not set</span>')}
      <label class="check-box set-toggle"><input type="checkbox" data-action="toggle-show-age"${p.showAge?' checked':''}><span>Show my age on my profile</span></label>
      <label class="check-box set-toggle"><input type="checkbox" data-action="toggle-digest"${p.emailDigest!==false?' checked':''}><span>Email me once a day when something new happens</span></label>
      ${row('College',p.college?escapeHTML(p.college)+(p.collegeYear?', '+escapeHTML(p.collegeYear):''):'<span class="small">Not shared</span>')}
      ${row('Industry',p.industry?escapeHTML(p.industry):'<span class="small">Not shared</span>')}
      <button class="button small outline" data-action="edit-profile">Edit these</button>
    </section>
    <section class="set-block">
      <h2>What you are matched on</h2>
      <p class="set-note">Search only shows you people whose week overlaps yours. These are the answers it uses.</p>
      ${row('Activities',(p.interests||[]).length?p.interests.map(c=>`<span class="tag">${escapeHTML(c)}</span>`).join(''):'<span class="small">None chosen</span>')}
      ${row('Times',(p.times||[]).length?p.times.map(c=>`<span class="tag">${escapeHTML(c)}</span>`).join(''):'<span class="small">None chosen</span>')}
      ${row('Studios saved',String((state.saved||[]).length))}
      <a class="button small outline" href="#/find">See who that matches</a>
    </section>
    <section class="set-block">
      <h2>This device</h2>
      <p class="set-note">Logging out keeps your profile on your account, so everything is here when you come back.</p>
      <div class="set-actions">
        <button class="button small outline" data-action="log-out">Log out</button>
      </div>
    </section>
    <section class="set-block">
      <h2>People you have blocked</h2>
      <p class="set-note">They cannot message you or send you a friend request, and you do not appear to each other. They were never told.</p>
      ${(state.blocked||[]).length
        ? (state.blocked||[]).map(id=>{const who=(typeof exPerson==='function'&&personById(id))||null;
            return `<div class="set-row"><span class="set-k">${escapeHTML(who?who.name:id)}</span><span class="set-v"><button class="button small outline" data-action="unblock-person" data-id="${escapeHTML(id)}" data-name="${escapeHTML(who?who.name:'')}">Unblock</button></span></div>`;}).join('')
        : '<p class="small">You have not blocked anyone.</p>'}
    </section>
    <section class="set-block">
      <h2>Your data</h2>
      <p class="set-note">Everything VIRI holds about you, in one file: your profile, your sessions, your plans, your saved studios and your photographs. The pictures are inside the file, so it still opens years from now.</p>
      <div class="set-actions">
        <button class="button small outline" data-action="export-data">Download my data</button>
      </div>
    </section>
    <section class="set-block">
      <h2>Delete your account</h2>
      <p class="set-note">This removes your profile and everything in it, for good. If you want a copy, download your data first.</p>
      <div class="set-actions">
        <button class="button small outline is-grave" data-action="delete-account">Delete my account</button>
      </div>
    </section>
  </div>`;}

function profilePage(){
  const p=state.profile;
  if(!signedIn())return authPage();
  const saved=studios.filter(s=>state.saved.includes(s.id));
  const going=state.routines||[];
  const list=mySessions();
  /* "Going to" listed classes from the old generated timetable; routines have no
     titles or times, so it showed nothing true. Your week covers it. */
  const tab=(profileTab==='going'||(profileTab==='moderation'&&!amAdmin()))?'sessions':profileTab;
  return `<div class="wrap pf">
    <header class="pf-head pf-card">
      <span class="pf-avatar">${avatarFor(p)}
        <button class="pf-avatar-edit" data-action="edit-photo" aria-label="${p.photo?'Change your photo':'Add a photo'}" title="${p.photo?'Change photo':'Add a photo'}">${p.photo?'Change':'Add photo'}</button></span>
      <div class="pf-id">
        <div class="pf-name-row">
          <h1>${escapeHTML(p.name)}</h1>
          <button class="button small" data-action="post-activity">Log a session</button>
          <button class="button small outline" data-action="edit-profile">Edit profile</button>
          <button class="button small outline" data-action="share-profile">Share</button>
        </div>
        <div class="pf-stats">
          <button class="stat-open" data-action="pf-tab" data-id="sessions"><b>${list.length}</b> session${list.length===1?'':'s'}</button>
          <button class="stat-open" data-action="show-friends"><b>${state.connections.length}</b> friend${state.connections.length===1?'':'s'}</button>
          <button class="stat-open" data-action="pf-tab" data-id="studios"><b>${saved.length}</b> studio${saved.length===1?'':'s'}</button>
        </div>
        <div class="pf-bio">
          ${p.bio
            ? `<p class="pf-bio-text">${escapeHTML(p.bio)} <button class="plain-link" data-action="edit-bio">Edit</button></p>`
            : `<p class="pf-bio-add"><button class="plain-link" data-action="edit-bio">Add a bio</button> <span class="small">Optional, and it helps people decide whether to say hello.</span></p>`}
          <p class="small">${escapeHTML(p.area||'Washington, DC')}${(p.times||[]).length?` &middot; ${escapeHTML(p.times.slice(0,2).join(', '))}`:''}</p>
          ${(()=>{const bits=[];
            /* Stored for eligibility, shown only on request. */
            const a=p.showAge?ageOf(p.birthDate||p.birthYear):null; if(a)bits.push(a+'');
            if(p.college)bits.push(escapeHTML(p.college)+(p.collegeYear?` \u2019${String(p.collegeYear).slice(-2)}`:''));
            else if(p.collegeYear)bits.push('Class of '+escapeHTML(p.collegeYear));
            if(p.industry)bits.push(escapeHTML(p.industry));
            return bits.length?`<p class="pf-facts">${bits.join(' &middot; ')}</p>`:'';})()}
          ${(p.interests||[]).length?`<div class="pf-chips">${p.interests.map(c=>
            `<span>${escapeHTML(c)}</span>`).join('')}</div>`:''}
        </div>
      </div>
      ${goalsPanel(state.goals,{own:true})}
    </header>
    <section class="pf-section"><div class="pf-section-head"><h2>Photos</h2></div>${galleryStrip(state.gallery,{own:true})}</section>
    <section class="pf-section pf-activity"><div class="pf-section-head"><h2>Activity</h2></div>
    <nav class="pf-tabs" aria-label="Your profile">
      ${[['sessions','Sessions'],['studios','Saved studios'],...(amAdmin()?[['moderation','Moderation'+(modOpenCount()?` (${modOpenCount()})`:'')]]:[])].map(([k,label])=>
        `<button class="pf-tab${tab===k?' is-on':''}" data-action="pf-tab" data-id="${k}"${tab===k?' aria-current="true"':''}>${label}</button>`).join('')}
    </nav>
    <div class="pf-main">
    <div class="pf-body">${
      tab==='moderation'
        ? moderationPanel()
      : tab==='studios'
        ? (saved.length
            ? `<div class="pf-rows">${saved.map(s=>
                `<a class="pf-row" href="#/studios/${s.id}"><b>${escapeHTML(s.name)}</b><span class="small">${escapeHTML(s.category)}</span>${arrow}</a>`).join('')}</div>`
            : `<p class="pf-empty">No studios yet. Save one while you explore and it will sit here.</p>${button('Find a studio','#/studios','small outline')}`)
      : tab==='going'
        ? (going.length
            ? `<div class="pf-rows">${going.map(c=>{const v=exVenue(c.venue);
                return `<a class="pf-row" href="#/book/${c.id}"><b>${escapeHTML(c.title)}</b><span class="small">${escapeHTML(v?v.brand:'')} &middot; ${prettyDate(c.start)} &middot; ${prettyTime(c.start)}</span>${arrow}</a>`;}).join('')}</div>`
            : `<p class="pf-empty">Nothing on the plan. Add a class and the people going show up with it.</p>${button('Find a class','#/find','small outline')}`)
      : `${state.posts.length?'':`<p class="pf-sample">${list.length} sample sessions, so you can see the shape of this page. <button class="plain-link" data-action="post-activity">Log one of your own</button> and these make way.</p>`}
         <div class="sessions">${list.map(s=>sessionCard(s)).join('')}</div>
`
    }</div>
    <aside class="pf-rail">
      <div class="rail-box pf-weekbox">
        <p class="rail-label">Your week <span class="period-dates">${weekRangeLabel()}</span></p>
        ${going.length?[...going].sort((a,b)=>a.weekday-b.weekday||(BAND_HOUR[a.band]??0)-(BAND_HOUR[b.band]??0)).map(r=>
          `<div class="rail-line"><b>${escapeHTML(WEEKDAYS[r.weekday])}</b> &middot; ${escapeHTML(r.band)}<br>${escapeHTML(r.activity||'Training')}${r.venue?`<br><span class="small">${escapeHTML(r.venue)}</span>`:''}
            <span class="week-acts"><button class="plain-link" data-action="edit-routine" data-id="${escapeHTML(r.id)}">Edit</button><button class="plain-link" data-action="remove-routine" data-id="${escapeHTML(r.id)}">Remove</button><button class="plain-link" data-action="offer-pass" data-id="${escapeHTML(r.id)}">Guest pass</button></span></div>`).join('')
          :'<p class="small">Tell VIRI where you train and roughly when. That is how it finds the people who are there with you.</p>'}
        <button class="button small outline" data-action="add-routine">${going.length?'Add another':'Add to my week'}</button>
        <a class="text-link" href="#/explore">Find studios ${arrow}</a>
      </div>
      <div class="rail-box plain">
        <p class="rail-label">Waiting for you</p>
        ${(state.incoming||[]).length
          ? (state.incoming||[]).slice(0,3).map(id=>{const p=personById(id)||{name:'A member'};
              return `<p class="rail-line"><b>${escapeHTML(p.name)}</b><br><span class="small">wants to connect</span></p>`;}).join('')
            + '<button class="plain-link" data-action="show-friends">Answer them</button>'
          : '<p class="small">No requests waiting.</p>'}
        <a class="text-link" href="#/find">Find people ${arrow}</a>
      </div>
    </aside>
    </div>
    </section>
    ${goalHistory()}
  </div>`;
}
/* ---- the home feed: other people's sessions ---- */
const FEED_SHAPE=[
  {title:'45 minutes, no complaints',cat:'Indoor cycling',dur:45,went:9,ago:'This morning · 6:00am',
   place:'CycleBar Georgetown',img:'brand-cyclebar.webp',comments:3,
   note:'Front row, back row, does not matter. Still the fastest 45 minutes of my week. Same bike Thursday if anyone wants it.'},
  {title:'Six miles and a flat white',cat:'Running',dist:'6.0 mi',dur:57,went:4,ago:'Yesterday · 6:30am',
   place:'Rock Creek Park',comments:1,
   note:'Same time Saturday if anyone wants in. We stop for coffee, it is not a race.'},
  {title:'Shaking by minute twelve',cat:'Barre',dur:60,went:11,ago:'Yesterday · 10:00am',
   place:'Barre3 14th Street',comments:0,
   note:'First time at this location. Everyone was lovely and nobody mentioned my form.'}
];
function feedPage(){
  if(!signedIn())return authPage();
  const feed=state.feed||[];
  const waiting=(state.incoming||[]).length;
  return `<div class="wrap feed-wrap">
    <section class="feed-col">
      <div class="feed-top">
        <h1>This week, near you</h1>
        <a class="text-link" href="#/find">Find people ${arrow}</a>
      </div>
      ${waiting?`<div class="preview-note is-plain"><b>${waiting}</b> ${waiting===1?'person is':'people are'} waiting for you to answer. <button class="plain-link" data-action="show-friends">See ${waiting===1?'it':'them'}</button></div>`:''}
      ${feed.length
        ? `<div class="sessions">${feed.map(s=>sessionCard(s,s.by)).join('')}</div>`
: (state.suggested||[]).length
  ? `<div class="feed-suggest">
       <p class="rail-label">People who train like you</p>
       <p class="small feed-suggest-why">${(state.connections||[]).length?'Your friends have not logged a session yet. Meanwhile, these are members nearby whose week looks like yours.':'Your feed fills with sessions from your friends. These are members nearby whose week looks like yours.'}</p>
       ${(state.suggested||[]).map(p=>`<div class="find-row">
         <span class="av-md">${p.photo?`<img src="${escapeHTML(p.photo)}" alt="">`:escapeHTML(initials(p.name))}</span>
         <div class="find-who">
           <b>${escapeHTML(p.name)}</b>
           <span class="small">${escapeHTML([p.area,(p.interests||[]).slice(0,2).join(', ')].filter(Boolean).join(' · '))}</span>
           ${p.usual?`<span class="small find-usual">Usually: ${escapeHTML(p.usual)}</span>`:''}
           ${p.slotMatches&&p.slotMatches.length?`<span class="find-why">You both train ${escapeHTML(p.slotMatches.slice(0,2).map(r=>WEEKDAYS[r.weekday]+' '+r.band).join(' and '))}</span>`:''}
           ${p.shared&&p.shared.length?`<span class="find-why">You both do ${escapeHTML(p.shared.slice(0,2).join(' and '))}</span>`:''}
         </div>
         <button class="button small" data-action="ex-connect" data-id="${escapeHTML(p.id)}">Connect</button>
         ${safetyButton(p.id,p.name)}
       </div>`).join('')}
       <a class="text-link" href="#/find">See everyone ${arrow}</a>
     </div>`
  : `<div class="feed-empty">
       <p class="dialog-copy">${(state.connections||[]).length
         ? 'Nothing from your friends yet. When they log a session it appears here.'
         : 'Nobody else has joined your area yet. When they do, they will show up here.'}</p>
       <a class="button small" href="#/find">Find people ${arrow}</a>
     </div>`}
    </section>
    <aside class="feed-rail">
      <div class="rail-box">
        <p class="rail-label">Your week <span class="period-dates">${weekRangeLabel()}</span></p>
        ${(state.plans||[]).filter(x=>x.start>Date.now()).sort((a,b)=>a.start-b.start).slice(0,3).map(c=>
          `<p class="rail-line"><b>${prettyDate(c.start)} ${prettyTime(c.start)}</b><br>${escapeHTML(c.place||c.title)}</p>`).join('')
          || '<p class="small">Nothing booked. Add a class from Explore and it shows up here.</p>'}
        <a class="text-link" href="#/explore">Explore classes ${arrow}</a>
      </div>
      <div class="rail-box plain">
        <p class="rail-label">Your circle</p>
        <p class="rail-line"><b>${(state.connections||[]).length}</b> friend${(state.connections||[]).length===1?'':'s'}</p>
        <a class="text-link" href="#/find">Find more ${arrow}</a>
      </div>
    </aside>
  </div>`;}
/* ---- find: people first, classes second ----
   A match is a real overlap, not a guess: either you are both booked into the
   same class, or the class is one your own answers say you would go to. */
function findPage(){
  if(!signedIn())return authPage();
  const p=state.profile;
  const results=state.found||null;   /* null until a search has run */
  const chips=(p&&p.interests||[]).slice(0,6);
  const card=m=>{const st=exLinked(m.id);
    return `<div class="find-row">
      <span class="av-md">${m.photo?`<img src="${escapeHTML(m.photo)}" alt="">`:escapeHTML(initials(m.name))}</span>
      <div class="find-who">
        <b><a class="person-link" href="#/member/${escapeHTML(m.id)}">${escapeHTML(m.name)}</a></b>
        <span class="small">${escapeHTML([m.area,m.age?m.age+'':''].filter(Boolean).join(' · '))}</span>
        <span class="find-why">${(m.shared&&m.shared.length)||(m.sharedTimes&&m.sharedTimes.length)
          ? `You both do ${escapeHTML((m.shared||[]).slice(0,2).join(' and ')||'')}${(m.shared||[]).length&&(m.sharedTimes||[]).length?', ':''}${(m.sharedTimes||[]).length?escapeHTML((m.sharedTimes||[]).slice(0,1).join('')).toLowerCase():''}`
          : escapeHTML((m.interests||[]).slice(0,3).join(', ')||'No activities listed')}</span>
      </div>
      ${st==='connected'?'<span class="tag">Friend</span>'
        :st==='incoming'?`<button class="button small" data-action="ex-connect" data-id="${escapeHTML(m.id)}">Accept</button>`
        :st==='requested'?'<span class="tag">Requested</span>'
        :`<button class="button small" data-action="ex-connect" data-id="${escapeHTML(m.id)}">Connect</button>`}
      ${safetyButton(m.id,m.name)}
    </div>`;};
  return `<section class="page-head"><div class="wrap"><p class="eyebrow">Find your people</p><h1>Who else trains<br>the way you do.</h1></div></section>
  <div class="wrap find">
    <form class="find-bar" id="find-form">
      <label class="visually-hidden" for="find-q">Search by city</label>
      <input id="find-q" name="q" type="search" placeholder="${escapeHTML(p&&p.city?p.city:'A city')}" value="${escapeHTML(findCity)}">
      <button class="button" type="submit">Search</button>
    </form>
    ${chips.length?`<div class="find-chips">${chips.map(c=>
      `<button class="chip${findActivities.includes(c)?' is-on':''}" data-action="find-chip" data-id="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('')}</div>`:''}
    ${(state.roomMatches||[]).length?`<p class="rail-label find-head">In the room with you</p>
      <div class="find-results">${(state.roomMatches||[]).slice(0,6).map(m=>{
        const exact=(m.slots||[]).filter(s=>s.exact);
        const why=exact.length
          ? `${escapeHTML(exact[0].venue)} on ${escapeHTML(WEEKDAYS[exact[0].weekday])}s, ${escapeHTML(exact[0].band)}`
          : `Also goes to ${escapeHTML((m.slots||[])[0]?.venue||'')}`;
        const st=exLinked(m.id);
        return `<div class="find-row">
          <span class="av-md">${faceOf(m)}</span>
          <div class="find-who"><b><a class="person-link" href="#/member/${escapeHTML(m.id)}">${escapeHTML(m.name)}</a></b>
            <span class="find-why">${why}</span></div>
          ${st==='connected'?'<span class="tag">Friend</span>'
            :st==='requested'?'<span class="tag">Requested</span>'
            :`<button class="button small" data-action="ex-connect" data-id="${escapeHTML(m.id)}">Connect</button>`}
          ${safetyButton(m.id,m.name)}
        </div>`;}).join('')}</div>`:''}
    ${results&&results.length?`<p class="rail-label find-head">Others nearby</p>`:''}
    <div class="find-results">
      ${results===null
        ? '<p class="small">Finding people near you&hellip;</p>'
        : results.length
          ? results.map(card).join('')
          : '<p class="small">Nobody matched. Try removing a filter, or widening the city.</p>'}
    </div>
  </div>`;}

let findCity='', findActivities=[], feedFetched=false;
async function runSearch(){
  const q=$('#find-q'); if(q)findCity=q.value.trim();
  state.found=await dbSearchPeople({ city:findCity||((state.profile&&state.profile.city)||''), activities:findActivities });
  render(false);
}
function authPage(){return `<section class="auth-layout"><div class="auth-image"><img src="${A}studio-entry.jpg" alt="Two women arriving at the studio together"><h2>A new ritual.<br>A new circle.<br>A little more you.</h2></div><div class="auth-form"><p class="eyebrow">Welcome back</p><h1>Back to your circle.</h1><p>Sign in to your VIRI account.</p><form id="auth-form"><div class="field"><label for="auth-email">Email address</label><input id="auth-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required></div><div class="field"><label for="auth-pass">Password</label><input id="auth-pass" name="password" type="password" autocomplete="current-password" required></div><p class="auth-forgot"><a href="#/forgot">Forgot your password?</a></p><p id="auth-error" class="field-error" role="alert"></p><button class="button" type="submit" style="margin-top:18px">Open my profile</button></form><p class="small">New here? <a href="#/signup">Join VIRI</a></p></div></section>`;}
function bindAuth(){$('#auth-form')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const fd=new FormData(e.target), err=$('#auth-error');
  const email=String(fd.get('email')||'').trim().toLowerCase(), pass=String(fd.get('password')||'');
  if(!email||!pass){err.textContent='Enter your email and password.';return;}
  const btn=e.target.querySelector('button[type=submit]'), label=btn.innerHTML;
  btn.disabled=true; btn.textContent='Signing in\u2026';
  const res=await dbSignIn(email,pass);
  btn.disabled=false; btn.innerHTML=label;
  /* Supabase says "Invalid login credentials" for a wrong password AND for an
     unconfirmed address, which sends people hunting for a typo that is not
     there. Name the likelier cause. */
  if(res.error){err.textContent=/invalid login/i.test(res.error.message)
    ? 'That email and password did not match. If you have just signed up, open the confirmation link first.'
    : res.error.message; return;}
  toast('Welcome back to your circle.'); goTo('#/profile');
});}

/* The "Show my age" switch in Settings called toggleShowAge, which was never
   written, so it threw and changed nothing. It saves, and says what happened. */
async function toggleShowAge(on){
  const r=await dbSetShowAge(on);
  if(r.error){toast(r.error.message);render(false);return;}
  save();render(false);toast(on?'Your age now shows on your profile.':'Your age is hidden from your profile.');
}
async function toggleDigest(on){
  const r=await dbSetEmailDigest(on);
  if(r.error){toast(r.error.message);render(false);return;}
  save();render(false);toast(on?'You will get one email a day when something new happens.':'Daily emails are off.');
}

/* ===================== stopping the daily email ===================== */
let stopEmails={token:null,status:'idle'};
function stopEmailsPage(token){
  if(stopEmails.token!==token)stopEmails={token,status:'start'};
  const s=stopEmails.status;
  const body=s==='ok'
    ? '<p class="eyebrow">VIRI</p><h1>Those emails have stopped.</h1><p>You will not get the daily summary any more. You can turn it back on any time in Settings.</p>'
    : s==='bad'
      ? '<p class="eyebrow">VIRI</p><h1>That link did not work.</h1><p>It may have been copied only in part. Sign in and switch the daily email off in Settings instead.</p>'
      : '<p class="eyebrow">VIRI</p><h1>Stopping the emails…</h1>';
  return `<div class="wrap handoff"><div class="handoff-card thanks-card">${body}<p style="margin-top:18px">${button('Go to VIRI','#/','small')}</p></div></div>`;
}

/* ===================== newsletter confirmation ===================== */
let subConfirm={token:null,status:'idle'};
function confirmSubscriptionPage(token){
  if(subConfirm.token!==token)subConfirm={token,status:'start'};
  const s=subConfirm.status;
  const body=s==='ok'
    ? '<p class="eyebrow">The VIRI Edit</p><h1>You are subscribed.</h1><p>It arrives once a month. Every issue has a link at the bottom to stop it.</p>'
    : s==='bad'
      ? '<p class="eyebrow">The VIRI Edit</p><h1>That link did not work.</h1><p>It may have been copied only in part. Sign up again at the bottom of the Read page and use the newest email.</p>'
      : '<p class="eyebrow">The VIRI Edit</p><h1>Confirming…</h1>';
  return `<div class="wrap handoff"><div class="handoff-card thanks-card">${body}<p style="margin-top:18px">${button('Read The VIRI Edit','#/read','small')}</p></div></div>`;
}

/* ===================== moderation =====================
   A tab on an admin's own profile, so her profile stays a normal profile. Kept
   in plain variables, not `state`, because state is saved in the browser and an
   admin tab must never outlive the sign-in it belongs to. */
let adminFor=null, adminIs=false, modData=undefined;
const amAdmin=()=>!!(authUser&&adminFor===authUser.id&&adminIs);
function checkAdmin(){
  const me=authUser&&authUser.id;
  if(!me||adminFor===me||typeof dbIsAdmin!=='function')return;
  adminFor=me; adminIs=false; modData=undefined;
  dbIsAdmin().then(async ok=>{
    if(!authUser||authUser.id!==me)return;
    adminIs=ok; if(!ok)return;           /* nothing changes for a non-admin, so no redraw to close a menu */
    modData=await dbLoadReports();
    if(location.hash==='#/profile')render(false);
  });
}
const modOpenCount=()=>modData&&modData.reports?modData.reports.filter(r=>r.status==='open').length:0;
function modName(id){
  const me=authUser&&authUser.id; if(id===me)return 'You';
  const p=personById(id); return p?p.name:null;
}
function modPerson(id,fallback){
  const n=modName(id); if(!n)return `<span class="small">${fallback}</span>`;
  return isRealAccount(id)&&id!==(authUser&&authUser.id)?`<a class="person-link" href="#/member/${escapeHTML(id)}">${escapeHTML(n)}</a>`:escapeHTML(n);
}
function modReportCard(r){
  const label=(REPORT_REASONS.find(x=>x[0]===r.reason)||[,r.reason||'Report'])[1];
  const open=r.status==='open', sus=!!(modData.suspended||{})[r.reportedId];
  const when=d=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const outcome=open?'':({dismissed:'Dismissed',suspended:'Member suspended',deleted:'Account deleted'}[r.action]||'Handled');
  return `<article class="mod-report${open?' is-open':''}">
    <p class="mod-head"><b>${escapeHTML(label)}</b> <span class="small">${escapeHTML(when(r.at))}</span></p>
    <p class="mod-who">About ${modPerson(r.reportedId,'A deleted member')} &middot; reported by ${modPerson(r.reporterId,'A member who has left')}</p>
    ${r.detail?`<p class="mod-detail">&ldquo;${escapeHTML(r.detail)}&rdquo;</p>`:''}
    ${open?'':`<p class="mod-outcome"><b>${escapeHTML(outcome)}</b> by ${escapeHTML(modName(r.handledBy)||'an admin')}${r.handledAt?` on ${escapeHTML(when(r.handledAt))}`:''}${r.note?` &mdash; ${escapeHTML(r.note)}`:''}</p>`}
    <div class="mod-acts">
      ${open?`<label class="visually-hidden" for="mod-note-${escapeHTML(r.id)}">Note, optional</label>
        <input id="mod-note-${escapeHTML(r.id)}" class="mod-note" maxlength="500" placeholder="A note for the record (optional)">
        <div class="mod-btns">
          <button class="button small outline" data-action="mod-dismiss" data-id="${escapeHTML(r.id)}">Dismiss</button>
          ${r.reportedId&&!sus?`<button class="button small outline" data-action="mod-suspend" data-id="${escapeHTML(r.id)}" data-member="${escapeHTML(r.reportedId)}">Suspend</button>`:''}
          ${r.reportedId?`<button class="button small outline mod-danger" data-action="mod-delete" data-id="${escapeHTML(r.id)}" data-member="${escapeHTML(r.reportedId)}">Delete account</button>`:''}
        </div>`:''}
      ${sus?`<button class="plain-link" data-action="mod-unsuspend" data-id="${escapeHTML(r.id)}" data-member="${escapeHTML(r.reportedId)}">Lift suspension</button>`:''}
      ${!open&&r.action==='dismissed'?`<button class="plain-link" data-action="mod-reopen" data-id="${escapeHTML(r.id)}">Reopen</button>`:''}
    </div></article>`;
}
function moderationPanel(){
  if(!amAdmin())return '';
  if(modData===undefined)return '<p class="small">Loading reports…</p>';
  if(modData===null)return '<p class="small">Reports could not be loaded. Refresh to try again.</p>';
  const open=modData.reports.filter(r=>r.status==='open'), done=modData.reports.filter(r=>r.status!=='open');
  return `<div class="mod">
    <p class="small mod-lede">Only you and the other VIRI admins see this tab. Suspending hides a member and signs her out until you lift it. Deleting an account cannot be undone. Every action is recorded with your name.</p>
    <h3 class="mod-h">Open (${open.length})</h3>
    ${open.length?open.map(modReportCard).join(''):'<p class="small">Nothing waiting.</p>'}
    ${done.length?`<details class="mod-done"><summary class="mod-h">Handled (${done.length})</summary>${done.map(modReportCard).join('')}</details>`:''}
  </div>`;
}
/* suspend and delete take two taps, so a stray one cannot do either */
async function modAct(btn){
  const kind=btn.dataset.action.replace('mod-',''), rid=btn.dataset.id, member=btn.dataset.member;
  if((kind==='suspend'||kind==='delete')&&btn.dataset.armed!=='1'){
    btn.dataset.armed='1'; btn.dataset.label=btn.textContent; btn.textContent=kind==='delete'?'Tap again to delete for good':'Tap again to suspend'; return;
  }
  const note=((document.getElementById('mod-note-'+rid)||{}).value||'').trim();
  btn.disabled=true;
  const r=kind==='dismiss'?await dbAdminResolve(rid,'dismissed',note)
        :kind==='reopen'?await dbAdminResolve(rid,'open','')
        :kind==='suspend'?await dbAdminSuspend(member,note)
        :kind==='unsuspend'?await dbAdminUnsuspend(member)
        :await dbAdminDeleteAccount(member,note);
  if(r.error){btn.disabled=false;btn.dataset.armed='';if(btn.dataset.label)btn.textContent=btn.dataset.label;toast(r.error.message);return;}
  modData=await dbLoadReports(); render(false);
  toast({dismiss:'Report dismissed.',reopen:'Report reopened.',suspend:'Member suspended.',unsuspend:'Suspension lifted.',delete:'Account deleted.'}[kind]);
}

/* ===================== notifications ===================== */
function noteText(n){
  const who=`<b>${escapeHTML(((personById(n.actorId)||{}).name)||'A member')}</b>`, d=n.detail||{};
  if(n.kind==='comment')return `${who} commented on <i>${escapeHTML(d.title||'your session')}</i>${d.excerpt?`: “${escapeHTML(d.excerpt)}”`:''}`;
  if(n.kind==='tag')return `${who} said you went to <i>${escapeHTML(d.title||'a session')}</i> together`;
  if(n.kind==='like')return `${who} liked <i>${escapeHTML(d.title||'your session')}</i>`;
  if(n.kind==='join')return `${who} added your ${d.weekday!=null&&WEEKDAYS[d.weekday]?escapeHTML(WEEKDAYS[d.weekday])+' ':''}${escapeHTML(d.activity||'routine')}${d.place?` at ${escapeHTML(d.place)}`:''} to their week`;
  if(n.kind==='pass_request')return `${who} asked for your guest pass${d.place?` at ${escapeHTML(d.place)}`:''}`;
  if(n.kind==='pass_accept')return `${who} said yes to your guest pass request${d.place?` at ${escapeHTML(d.place)}`:''}`;
  return who;
}
function notificationsPage(){
  if(!signedIn())return authPage();
  const list=state.notifications||[];
  return `<div class="wrap notes"><section class="pf-section"><div class="pf-section-head"><h2>Notifications</h2></div>
    ${list.length?`<ul class="note-list">${list.map(n=>`<li class="note${n.read?'':' is-new'}">
      <button class="note-open" data-action="open-note" data-id="${escapeHTML(n.id)}">
        <span class="av-sm">${avatarFor(personById(n.actorId)||{name:'VIRI'})}</span>
        <span class="note-text"><span>${noteText(n)}</span><span class="small">${escapeHTML(prettyDate(n.at))}</span></span>
      </button></li>`).join('')}</ul>`
      :'<p class="small">Nothing yet. When a friend likes or comments on one of your sessions, tags you in theirs, adds your routine to their week, or asks for a guest pass, it shows up here.</p>'}
  </section></div>`;
}
/* a comment opens its thread on your profile; a tag or a join opens the friend */
function openNote(id){
  const n=(state.notifications||[]).find(x=>x.id===id); if(!n)return;
  if(n.sessionId)openThreads.add(String(n.sessionId));
  if(n.kind==='pass_request'||n.kind==='pass_accept'){openPasses(n.passId);return;}
  if(n.kind==='comment'||n.kind==='like'){profileTab='sessions';goTo('#/profile');return;}
  goTo(`#/member/${n.actorId}`);
}

/* ===================== forgotten passwords ===================== */
const authShell=inner=>`<section class="auth-layout"><div class="auth-image"><img src="${A}studio-entry.jpg" alt="Two women arriving at the studio together"><h2>A new ritual.<br>A new circle.<br>A little more you.</h2></div><div class="auth-form">${inner}</div></section>`;
function forgotPage(){return authShell(`<p class="eyebrow">Forgot your password</p><h1>Choose a new one.</h1>
  <p>Enter the email address you signed up with and we will send you a link to set a new password.</p>
  <form id="forgot-form"><div class="field"><label for="forgot-email">Email address</label><input id="forgot-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required></div>
  <p id="forgot-error" class="field-error" role="alert"></p><button class="button" type="submit" style="margin-top:18px">Send the link</button></form>
  <p class="small"><a href="#/login">Back to sign in</a></p>`);}
function bindForgot(){$('#forgot-form')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const err=$('#forgot-error'), email=String(new FormData(e.target).get('email')||'');
  const btn=e.target.querySelector('button[type=submit]'), label=btn.innerHTML;
  btn.disabled=true; btn.textContent='Sending…';
  const r=await dbSendPasswordReset(email);
  btn.disabled=false; btn.innerHTML=label;
  if(r.error){err.textContent=r.error.message;return;}
  /* the same words whether or not there is an account */
  e.target.outerHTML=`<p class="auth-sent">If there is a VIRI account for <b>${escapeHTML(email.trim())}</b>, a link to choose a new password is on its way. It can take a minute, so check your spam folder too. The link works once.</p>`;
});}
/* Reached from the email's link (signed in for this purpose only), or from
   Settings to change a password you still know. */
function resetPasswordPage(){
  if(typeof authUser==='undefined'||!authUser)return authShell(`<p class="eyebrow">Choose a new password</p><h1>That link has run out.</h1>
    <p>Reset links work once and expire after a while. Ask for a fresh one and use it straight away.</p>
    <p style="margin-top:18px">${button('Send a new link','#/forgot','small')}</p>`);
  return authShell(`<p class="eyebrow">${state.profile?escapeHTML(state.profile.name):'Your account'}</p><h1>Choose a new password.</h1>
    <form id="reset-form">
      <div class="field"><label for="reset-pass">New password</label><input id="reset-pass" name="password" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters" required></div>
      <div class="field"><label for="reset-again">Type it again</label><input id="reset-again" name="again" type="password" autocomplete="new-password" minlength="8" required></div>
      <p id="reset-error" class="field-error" role="alert"></p><button class="button" type="submit" style="margin-top:18px">Save my new password</button></form>`);}
function bindReset(){$('#reset-form')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const fd=new FormData(e.target), err=$('#reset-error');
  const pass=String(fd.get('password')||''), again=String(fd.get('again')||'');
  if(pass.length<8){err.textContent='Use at least 8 characters.';return;}
  if(pass!==again){err.textContent='Those two do not match. Type the same password twice.';return;}
  const btn=e.target.querySelector('button[type=submit]'), label=btn.innerHTML;
  btn.disabled=true; btn.textContent='Saving…';
  const r=await dbUpdatePassword(pass);
  btn.disabled=false; btn.innerHTML=label;
  if(r.error){err.textContent=r.error.message;return;}
  toast('Password changed. Use the new one next time you sign in.'); goTo(signedIn()?'#/profile':'#/login');
});}

/* ===================== booking hand-off ===================== */
function bookPage(id){
  const c=(typeof exClasses==='function'?exClasses():[]).find(x=>x.id===id);
  if(!c)return `<div class="wrap handoff"><div class="handoff-card"><h1>That class has gone.</h1>
    <p>It may have already started, or the week has rolled over.</p>
    <p style="margin-top:18px">${button('Back to Explore','#/explore','small')}</p></div></div>`;
  const v=exVenue(c.venue), d=new Date(c.start), going=c.going.length;
  return `<div class="wrap handoff"><div class="handoff-card">
    <p class="eyebrow">Almost there</p>
    <h1>Book this one with ${escapeHTML(v.brand)}</h1>
    <p>VIRI holds your plan and introduces you to the room. The class itself is booked with the studio, the way you always have.</p>
    <div class="handoff-class">
      <b>${escapeHTML(c.title)}</b>
      <span>${escapeHTML(v.brand)} &middot; ${escapeHTML(c.area)} &middot; with ${escapeHTML(c.coach)}</span>
      <span>${d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} &middot; ${prettyTime(c.start)} &middot; ${c.dur} min</span>
      ${going?`<span>${going} VIRI member${going===1?'':'s'} already going</span>`:''}
    </div>
    <div class="handoff-choices">
      <button class="choice" data-action="book-existing" data-id="${c.id}">
        <span><b>I already book with ${escapeHTML(v.brand)}</b>
        <span>Take me to their booking page and add this to my VIRI plan.</span></span>
        ${arrow}</button>
      <button class="choice" data-action="book-new" data-id="${c.id}">
        <span><b>I need to set up an account</b>
        <span>New to this studio. Show me how to sign up, then add it to my plan.</span></span>
        ${arrow}</button>
      <button class="choice" data-action="book-plan" data-id="${c.id}">
        <span><b>Just add it to my plan for now</b>
        <span>I will sort the booking out myself. Put me on the roster so people can find me.</span></span>
        ${arrow}</button>
    </div>
    <p class="handoff-foot">This preview does not connect to ${escapeHTML(v.brand)} yet, so nothing is reserved and no account is created. When it does, this is where the hand-off happens — see README-explore.md for which booking platform each studio runs on.</p>
    <p class="handoff-foot"><a class="plain-link" href="#/explore">&larr; Back to Explore</a></p>
  </div></div>`;
}
function bookChoose(id,kind){
  const c=(typeof exClasses==='function'?exClasses():[]).find(x=>x.id===id);
  if(!c)return;
  if(!state.joined.includes(c.id)){state.joined=[...state.joined,c.id];}
  snapshotPlan(c);save();
  const v=exVenue(c.venue);
  const copy=kind==='existing'
    ? `In the live product this would open ${v.brand}'s booking page with the class preselected. Added to your plan here.`
    : kind==='new'
    ? `In the live product this would walk you through setting up a ${v.brand} account. Added to your plan here.`
    : 'Added to your plan. You are on the roster for this class.';
  toast(copy);
  location.hash='#/explore';
}

/* ===================== profile setup ===================== */
const SETUP_TIMES=['Before work','Mornings','Lunchtime','After work','Evenings','Weekends'];
/* ===================== did you go? =====================
   This used to work off a plan snapshotted from a generated class, because
   those classes were rebuilt each load and vanished the moment they started.
   The source is a routine now — something the member said about her own week
   — so the occurrences are derived rather than remembered, and they are true.

   A band is turned into a nominal hour only so an occurrence can be ordered
   and known to have passed. Nobody is told you were there at 6:00 sharp. */
const BAND_HOUR={'Before 5am':4,'5–7am':6,'8–10am':9,'10–12pm':11,'12–3pm':13,'3–5pm':16,'5–7pm':18,'8pm Onward':20};
/* When each band is over. "Did you go?" waits for this, not for a nominal hour
   later: a 12–3pm class is not finished at 2. */
const BAND_END={'Before 5am':5,'5–7am':7,'8–10am':10,'10–12pm':12,'12–3pm':15,'3–5pm':17,'5–7pm':19,'8pm Onward':22};

function routineOccurrences(){
  const out=[], now=Date.now();
  for(const r of state.routines||[]){
    const hour=BAND_HOUR[r.band]??7, endHour=BAND_END[r.band]??hour+1;
    /* Only slots that were still to come when the routine was added. Adding a
       Wednesday class on a Sunday used to ask, at once, about the Wednesday
       before — a class nobody had said they would go to. A routine with no
       recorded start (an old cached copy) asks about nothing until reloaded. */
    const since=r.createdAt?new Date(r.createdAt).getTime():now;
    /* today and the last seven days, so a week away still has something to answer */
    for(let back=0;back<=7;back++){
      const d=new Date(); d.setHours(hour,0,0,0); d.setDate(d.getDate()-back);
      if(d.getDay()!==r.weekday)continue;
      const end=new Date(d); end.setHours(endHour,0,0,0);
      if(end.getTime()>now||end.getTime()<=since)continue;
      const where=(r.venue||'').split(' — ')[0];
      out.push({ id:`${r.id}:${d.toISOString().slice(0,10)}`,
        title:where?`${r.activity||'Training'} at ${where}`:(r.activity||'Training'),
        cat:r.activity||'', dur:60, start:d.getTime(), end:end.getTime(), place:r.venue||'', going:[] });
    }
  }
  return out.sort((x,y)=>x.start-y.start);
}
/* A session already logged by hand that day, for the same activity, is the
   same session the routine is asking about. Asking anyway made "I went" add
   a second copy of a run that was already on the profile. */
const loggedByHand=p=>{
  const day=new Date(p.start).toDateString(), act=String(p.cat||'').trim().toLowerCase();
  return !!act&&(state.posts||[]).some(x=>x.date&&new Date(x.date).toDateString()===day
    &&String(x.activity||'').trim().toLowerCase()===act);
};
/* routineOccurrences() only returns slots that are over */
const pendingPlans=()=>routineOccurrences()
  .filter(p=>!(state.logged||[]).includes(p.id)&&!loggedByHand(p));
function attendModal(){
  const list=pendingPlans();
  if(!list.length)return postActivity();
  openModal(list.length===1?'Did you go?':'Did you go to these?',
    `<p class="dialog-copy">${list.length===1?'This is in your week.':'These are in your week.'} Logging takes one tap &mdash; everything is already known.</p>
     <div class="attend-list">${list.map(p=>`<div class="attend-row">
       <div class="attend-what"><b>${escapeHTML(p.title)}</b>
         <span class="small">${prettyDate(p.start)} ${prettyTime(p.start)} &middot; ${escapeHTML(p.place)} &middot; ${fmtDuration(p.dur)}</span></div>
       <div class="attend-acts">
         <button class="button small" data-action="attend-yes" data-id="${escapeHTML(p.id)}">I went</button>
         <button class="plain-link" data-action="attend-more" data-id="${escapeHTML(p.id)}">Add a photo</button>
         <button class="plain-link" data-action="attend-no" data-id="${escapeHTML(p.id)}">I did not</button>
       </div></div>`).join('')}</div>
     <div class="dialog-actions">
       <button class="button small outline" data-action="post-new">Log something else</button>
       <button class="button small outline" data-action="close-modal">Not now</button>
     </div>`);
}
const takePlan=id=>routineOccurrences().find(p=>p.id===id);
function logAttended(id){
  const p=takePlan(id); if(!p)return;
  state.posts.push({title:p.title,activity:p.cat,place:p.place,duration:p.dur,
    description:'',date:new Date(p.start).toISOString(),
    withIds:[],went:Math.max(1,(p.going||[]).length),fromPlan:p.id});
  state.logged=[...(state.logged||[]),id];
  if(typeof dbAddSession==='function'){
    const post=state.posts[state.posts.length-1];
    dbPush(dbAddSession(post).then(r=>{if(r&&r.data&&r.data.id){post.id=r.data.id;render(false);}return r;}),'that session');
    dbPush(dbRecordPlanAnswer({id,title:p.title,cat:p.cat,place:p.place,start:p.start,dur:p.dur}),'the answer');
  }
  save();closeModal();render(false);
  toast('Logged. You can add a photo or tag people any time.');
}
function skipAttended(id){
  state.logged=[...(state.logged||[]),id];
  const p=takePlan(id);
  if(typeof dbRecordPlanAnswer==='function'&&p)dbPush(dbRecordPlanAnswer({id,title:p.title,cat:p.cat,place:p.place,start:p.start,dur:p.dur}),'the answer');
  save();closeModal();render(false);toast('Left off your sessions.');
}
/* ---- photos on a post ----
   One picture per session, scaled to 900px and stored as a data URL. The whole
   of localStorage is about 5MB, so a full-size phone photo would fill it on its
   own; this keeps one at roughly a quarter of a megabyte. */
let postPhoto='';
function shrinkImage(file,maxW=900){return new Promise(res=>{
  if(!file||!/^image\//.test(file.type))return res('');
  const fr=new FileReader();
  fr.onload=()=>{const img=new Image();
    img.onload=()=>{const k=Math.min(1,maxW/img.width);
      const c=document.createElement('canvas');
      c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      res(c.toDataURL('image/jpeg',.75));};
    img.onerror=()=>res('');img.src=fr.result;};
  fr.onerror=()=>res('');fr.readAsDataURL(file);});}
/* Your own sessions can be changed after they are posted: the same form,
   filled in, saving over the original. */
function editSession(id){
  const p=(state.posts||[]).find(x=>String(x.id)===String(id));
  if(!p){toast('That session could not be found. Refresh and try again.');return;}
  postActivity(null,p);
}
function postActivity(pre,edit){
  postPhoto='';
  let keepPhoto=!!(edit&&edit.photo);
  const dur0=Math.round(Number(edit?edit.duration:(pre&&pre.dur))||45);
  const miles0=edit?(parseFloat(edit.distance)||''):'';
  const act0=edit?edit.activity:(pre&&pre.cat);
  const friends=(state.connections||[]).map(id=>personById(id)).filter(Boolean);
  const v=(x)=>escapeHTML(x||'');
  openModal(edit?'Edit this session':pre?'Log this session':'Log a session',
   `<p class="small" style="margin-bottom:20px">${edit?'Change anything, then save.':pre?'Everything from your plan is filled in. Change anything you like.':'This is saved to your profile.'}</p>
    <form id="post-form">
      <div class="field"><label for="post-title">Name this session</label>
        <input id="post-title" name="title" required maxlength="70" value="${v(edit?edit.title:(pre&&pre.title))}" placeholder="A lunchtime walk with a friend"></div>
      <div class="field"><label for="post-activity">Activity</label>
        <input id="post-activity" name="activity" maxlength="40" value="${v(act0)}" placeholder="Pilates" list="post-cats">
        <datalist id="post-cats">${JOIN_FORMS.filter(x=>x!==JOIN_ANY.forms&&x!=='Other').map(c=>`<option>${escapeHTML(c)}</option>`).join('')}</datalist></div>
      <div class="field"><label for="post-place">Where</label>
        <input id="post-place" name="place" maxlength="60" value="${v(edit?edit.place:(pre&&pre.place))}" placeholder="Club Pilates Dupont"></div>
      <fieldset class="interest-fieldset"><legend>How long</legend>
        <div class="post-pair">
          <label class="post-unit"><input id="post-hours" name="hours" type="number" inputmode="numeric" min="0" max="23" step="1" value="${Math.floor(dur0/60)}"><span>hours</span></label>
          <label class="post-unit"><input id="post-minutes" name="minutes" type="number" inputmode="numeric" min="0" max="59" step="1" value="${dur0%60}"><span>minutes</span></label>
        </div></fieldset>
      <div class="field" id="post-distance-field"${isDistanceActivity(act0)?'':' hidden'}><label for="post-distance">Distance <span class="field-optional">Optional</span></label>
        <div class="post-pair"><label class="post-unit"><input id="post-distance" name="distance" type="number" inputmode="decimal" min="0" max="500" step="0.01" placeholder="6.2" value="${miles0}"><span>miles</span></label></div>
        <p class="field-eg">For runs, walks, hikes and rides. Leave it blank if you did not track it.</p></div>
      <div class="field"><label for="post-description">How was it?</label>
        <textarea id="post-description" name="description" maxlength="400" placeholder="Share a little about your ritual.">${v(edit&&edit.description)}</textarea></div>
      <div class="field"><label for="post-photo">A photo <span class="field-optional">Optional</span></label>
        <div class="photo-drop" id="post-drop" data-has="${keepPhoto?1:0}">
          <input id="post-photo" type="file" accept="image/*" class="visually-hidden">
          <div class="photo-empty"><p class="photo-lede">Drag a photo here, or <button type="button" class="plain-link" id="post-pick">choose a file</button>.</p></div>
          <div class="photo-editor"><figure class="post-shot"><img id="post-preview" alt="Your photo"${keepPhoto?` src="${v(edit.photo)}"`:''}></figure>
            <p class="photo-swap"><button type="button" class="plain-link" id="post-repick">Choose another</button>
              <button type="button" class="plain-link" id="post-unpick">Remove</button></p></div>
        </div></div>
      ${`<fieldset class="interest-fieldset"><legend>Who you went with <span class="field-optional">Optional</span></legend>
        ${friends.length
          ? `<div class="check-grid">${friends.map(p=>
              `<label class="check-box"><input type="checkbox" name="withIds" value="${escapeHTML(p.id)}"${edit&&(edit.withIds||[]).includes(p.id)?' checked':''}><span>${escapeHTML(p.name)}</span></label>`).join('')}</div>`
          : '<p class="small">You can tag the people you have connected to. Connect with someone first and they appear here.</p>'}
      </fieldset>`}
      <p id="post-error" class="field-error" role="alert"></p>
      <div class="dialog-actions">${edit?'<button type="button" class="plain-link session-delete" id="post-delete">Delete this session</button>':''}<button class="button small" type="submit">${edit?'Save changes':'Post activity'}</button></div>
    </form>`,
   ()=>{
     const drop=$('#post-drop'), file=$('#post-photo'), prev=$('#post-preview');
     const take=async f=>{const d=await shrinkImage(f);
       if(!d){$('#post-error').textContent='That file could not be read as an image.';return;}
       postPhoto=d;keepPhoto=false;prev.src=d;drop.dataset.has='1';$('#post-error').textContent='';};
     $('#post-pick')?.addEventListener('click',()=>file.click());
     $('#post-repick')?.addEventListener('click',()=>file.click());
     $('#post-unpick')?.addEventListener('click',()=>{postPhoto='';keepPhoto=false;file.value='';drop.dataset.has='0';});
     file.addEventListener('change',()=>{if(file.files?.[0])take(file.files[0]);});
     ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('is-over');}));
     ['dragleave','dragend'].forEach(t=>drop.addEventListener(t,e=>{
       if(t==='dragleave'&&drop.contains(e.relatedTarget))return;drop.classList.remove('is-over');}));
     drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('is-over');
       const f=e.dataTransfer?.files?.[0];if(f)take(f);});
     /* two taps, so a stray one cannot remove a session */
     $('#post-delete')?.addEventListener('click',async e=>{
       const b=e.currentTarget;
       if(b.dataset.armed!=='1'){b.dataset.armed='1';b.textContent='Tap again to delete';return;}
       b.disabled=true;b.textContent='Deleting…';
       const r=await dbDeleteSession(edit);
       if(r.error){b.disabled=false;b.dataset.armed='';b.textContent='Delete this session';$('#post-error').textContent=r.error.message;return;}
       save();closeModal();render(false);toast('Session deleted.');
     });
     /* miles appear once the activity is one that has them */
     const distField=$('#post-distance-field');
     $('#post-activity').addEventListener('input',e=>{distField.hidden=!isDistanceActivity(e.target.value);});
     $('#post-form').addEventListener('submit',e=>{
       e.preventDefault();
       const f=Object.fromEntries(new FormData(e.target));
       if(!String(f.title||'').trim())return;
       const minutes=Math.round((Number(f.hours)||0)*60+(Number(f.minutes)||0));
       if(minutes<1){$('#post-error').textContent='How long was it? Add hours, minutes or both.';return;}
       const miles=!distField.hidden&&Number(f.distance)>0?Math.round(Number(f.distance)*100)/100:0;
       if(edit){
         /* changed only if a new photo was chosen, or one it had was removed */
         const photoChanged=!!postPhoto||(!!edit.photo&&!keepPhoto);
         Object.assign(edit,{title:String(f.title).trim(),activity:String(f.activity||'').trim(),
           place:String(f.place||'').trim(),duration:minutes,distance:miles?`${miles} mi`:'',
           description:String(f.description||'').trim()});
         if(photoChanged&&!postPhoto){edit.photo='';edit.photoPath='';}
         /* tags of people no longer in your friends list are not shown, so they are kept */
         const before=[...(edit.withIds||[])], shown=friends.map(p=>p.id);
         const ticked=[...e.target.querySelectorAll('input[name="withIds"]:checked')].map(i=>i.value);
         const after=[...new Set([...ticked,...before.filter(id=>!shown.includes(id))])];
         const tagsChanged=after.length!==before.length||after.some(id=>!before.includes(id));
         if(tagsChanged){edit.withIds=after;edit.went=1+after.length;}
         if(typeof dbUpdateSession==='function')dbPush((async()=>{
           if(photoChanged&&postPhoto){
             const path=await dbUploadPhoto(postPhoto,'session');
             if(!path)return {error:{message:'The photo could not be uploaded.'}};
             edit.photoPath=path;edit.photo=await dbPhotoUrl(path);render(false);}
           const r=await dbUpdateSession(edit,{photoChanged});
           if(r.error||!tagsChanged)return r;
           return dbSetSessionTags(edit.id,before,after);
         })(),'those changes');
         if(photoChanged&&postPhoto)edit.photo=postPhoto;
         save();closeModal();render(false);toast('Session updated.');
         return;
       }
       const withIds=[...e.target.querySelectorAll('input[name="withIds"]:checked')].map(i=>i.value);
       state.posts.push({title:String(f.title).trim(),activity:String(f.activity||'').trim(),
         place:String(f.place||'').trim(),duration:minutes,distance:miles?`${miles} mi`:'',
         description:String(f.description||'').trim(),photo:postPhoto,withIds,
         went:1+withIds.length,date:new Date().toISOString(),
         fromPlan:pre?pre.id:null});
       if(pre)state.logged=[...(state.logged||[]),pre.id];
       if(typeof dbAddSession==='function'){
         /* upload first: the row should hold a path, not a megabyte of image */
         const post=state.posts[state.posts.length-1];
         dbPush((async()=>{
           if(postPhoto){const path=await dbUploadPhoto(postPhoto,'session');
             if(path){post.photo=path;post.photoPath=path;}}
           const r=await dbAddSession(post);
           /* keep the id, so the session can be edited without a reload */
           if(r&&r.data&&r.data.id)post.id=r.data.id;
           if(post.photo&&!/^data:/.test(post.photo))post.photo=await dbPhotoUrl(post.photo);
           render(false); return r;
         })(),'that session');
         if(pre)dbPush(dbRecordPlanAnswer({id:pre.id,title:pre.title,cat:pre.cat,place:pre.place,start:pre.start,dur:pre.dur}),'the answer');
       }
       save();closeModal();render(false);toast('Session added to your profile.');
     });
   });
}
/* The real privacy policy, replacing the preview notice that claimed nothing
   left the browser — untrue from the moment the database went in. Every claim
   below describes what the code actually does; if the code changes, this has
   to change with it. */
function privacyPage(){return `<article class="article-detail legal">
  <p class="eyebrow">VIRI</p>
  <h1>Your privacy</h1>
  <p class="legal-date">Last updated 5 October 2026</p>

  <h2>Who we are</h2>
  <p>VIRI (Vitality Ritual) is a service for finding people to work out with. It is run by Margaret Cole, in Washington, DC. You can reach us about anything on this page at <a href="mailto:info@vitalityritual.org">info@vitalityritual.org</a>, and we will give you a postal address if you ask for one.</p>
  <p>VIRI is not a company. It is run by one person, and that person is responsible for your data. If that changes, this page will say so.</p>

  <h2>What we collect</h2>
  <p><b>When you make an account:</b> your email address and a password. The password is stored hashed &mdash; we never see it and cannot recover it for you.</p> <p><b>Emails.</b> Apart from confirming your address and resetting a password, we send one kind of email: if you have notifications you have not yet seen in VIRI, a single summary a day, and nothing on a day when nothing new has happened. It names the person and the session, never what anyone wrote. You can switch it off in Settings, or with the link in any of the emails. If you subscribe to The VIRI Edit we also email you once to confirm that, and then about once a month.</p>
  <p><b>Your profile.</b> Your name and the neighbourhood and city where you train are required. A photograph, a short bio, your college and year, and your industry are all optional. Your age is the one thing we require, because VIRI is for over-18s &mdash; but whether it appears on your profile is your choice, and it is off unless you turn it on. The activities you do and the times of week you usually train are what the search matches you on.</p>
  <p><b>What you do on VIRI:</b> sessions you log (activity, place, how long, how far, any note or photograph, the date, who you were with), classes you add to your plan, studios you save, people you connect with, and messages you send.</p>
  <p><b>Safety records:</b> if you report someone, we keep what you told us. If you block someone, we keep that too.</p>
  <p>Reports are read by the people who run VIRI. We can suspend an account, which hides the member and stops her signing in, or delete it. We record who took the action, when, and any note we made. A report about someone is kept after she leaves, because it is the record of what happened.</p>
  <p><b>If you subscribe to the VIRI edit</b> we keep your email address, and the date you confirmed it, and nothing else, so we can send it to you. You do not need an account to subscribe, and subscribing does not make one. Every letter has an unsubscribe link, and you can ask us to remove you at any time.</p>
  <p>We do <b>not</b> collect analytics. There is no tracking pixel, no advertising network, and no third-party script on this site other than the one that connects you to our database. Nobody is following you around the internet on our behalf.</p>

  <h2>Who sees your sessions</h2>
  <p>Your sessions are visible to you and to your friends, and to nobody else. Friends can like a session and comment on it. You can delete any comment on your own sessions, and anyone can delete their own comments. Likes and comments are deleted when the session or the account is.</p>
  <p>When a friend likes or comments on one of your sessions, says you went somewhere together, adds one of your routines to their week, or asks for a guest pass you have offered, you get a notification inside VIRI.</p>

  <h2>Guest passes</h2>
  <p>If you offer a guest pass, it is visible to every member who is signed in to VIRI: your name and neighbourhood, the studio, the date, a rough time and any note you add. It is not visible to anyone who is not signed in. A member can ask you for it, and you decide. We keep the request and your answer until the pass or either account is deleted, or the date has long gone. VIRI does not provide, check or sell guest passes.</p>

  <h2>Why the optional fields matter</h2>
  <p>Your neighbourhood, your usual training times, the studios you save and the sessions you log together describe where you are likely to be, and when. That is the point of the product &mdash; it is how you find someone to train with &mdash; but it is genuinely sensitive, more so than it first appears.</p>
  <p>So every one of those fields is optional, and you can remove any of them at any time. Think about what you are comfortable with other members seeing before you fill them in.</p>

  <h2>Who else touches your data</h2>
  <p>We use four other companies to run VIRI. They handle data on our behalf and are not allowed to use it for anything else.</p>
  <ul>
    <li><b>Supabase</b> &mdash; the database, your login, and your photographs</li>
    <li><b>Resend</b> &mdash; sends your confirmation, password-reset and notification emails</li>
    <li><b>FormSubmit</b> &mdash; relays the contact form and report notifications to our inbox</li>
    <li><b>GitHub Pages</b> &mdash; serves this website</li>
  </ul>
  <p>The Explore map loads its tiles from OpenStreetMap. Links to studios and articles take you to other companies&rsquo; websites, which have their own policies.</p>
  <p><b>We do not sell your data, and we do not share it for advertising.</b> We would disclose information if the law required it, or to protect someone from harm.</p>

  <h2>Your photographs</h2>
  <p>Photographs are stored privately. They are not at a public address that can be guessed or passed around &mdash; each view is a link that expires. When you upload a photograph it is re-encoded, which strips embedded location data, so a picture taken at your gym does not carry your gym&rsquo;s coordinates into VIRI.</p>

  <h2>What you can do</h2>
  <p>In <a href="#/settings">Settings</a>, at any time, without asking us:</p>
  <ul>
    <li><b>Download my data</b> gives you one file containing everything VIRI holds about you, with your photographs inside it rather than as links that expire.</li>
    <li><b>Delete my account</b> removes your profile, sessions, goals, routines, guest passes and requests for them, plans, saved studios, messages, connections, comments, likes, notifications and photographs. It is immediate and we cannot undo it.</li>
  </ul>
  <p>Depending on where you live you may have further rights &mdash; to correct information, to object to how it is used, or to complain to a regulator. Write to us and we will help.</p>

  <h2>What we keep after you leave</h2>
  <p>When you delete your account, everything above goes immediately.</p>
  <p>One exception: if somebody reported you, that report stays. Letting an account deletion erase the record of harm done to another member would make reporting worthless. Reports <i>you</i> filed about other people are deleted with your account.</p>

  <h2>Age</h2>
  <p>VIRI is for adults. You must be 18 or over to make an account, and we do not knowingly keep data about anyone younger. If you believe someone under 18 has an account, write to us and we will remove it.</p>

  <h2>Security</h2>
  <p>Your password is hashed. Photographs are private and reachable only by expiring links. Access to every table is controlled at the database itself, so one member&rsquo;s account cannot read another&rsquo;s data even if something goes wrong in the app. No system is perfect, and we will tell you promptly if something happens that affects you.</p>

  <h2>Changes</h2>
  <p>If we change this page in a way that matters, we will tell you rather than quietly updating it.</p>
</article>`;}

/* Only the preview terms live here now; the privacy branch this function used
   to carry claimed nothing left the browser, which the database made untrue.
   It is gone rather than merely unrouted, so it cannot be revived by accident. */
/* The terms of service. Published without legal review, which Margaret decided
   knowingly — the open questions are recorded in terms-of-service-notes.md
   rather than here, because an inventory of a waiver's weak points is not
   something to hand the people it is meant to work against. */
function termsPage(){return `<article class="article-detail legal">
  <p class="eyebrow">VIRI</p>
  <h1>Terms of service</h1>
  <p class="legal-date">Last updated 5 October 2026</p>

  <p class="legal-lede">VIRI helps you find people to exercise with. We do not check who those people are. Meeting someone from VIRI is your decision and your risk, exactly as it would be if you met them at the gym without us. Please read <a href="#terms-meeting">Meeting other members</a> &mdash; it is the most important part of this page.</p>

  <h2>1. Who you are agreeing with</h2>
  <p>VIRI (Vitality Ritual) is run by Margaret Cole in Washington, DC. &ldquo;We&rdquo; and &ldquo;us&rdquo; mean her. &ldquo;You&rdquo; means you.</p>
  <p>By making an account you accept these terms. If you do not accept them, do not make an account.</p>

  <h2>2. You must be 18</h2>
  <p>VIRI is for adults. You must be 18 or over. We ask your age when you join, and accounts we believe belong to someone under 18 are removed.</p>

  <h2>3. Who can join</h2>
  <p>VIRI is for women. Trans women are women.</p>
  <p>We do not verify this. We ask you to confirm it honestly when you join, and we remove accounts that we believe do not belong here.</p>

  <h2>4. Your account</h2>
  <p>Give us accurate information, and keep it accurate. Choose a password you do not use elsewhere, and keep it to yourself. What happens on your account is your responsibility.</p>
  <p>One person, one account. Do not make an account for anybody else, and do not pretend to be someone you are not.</p>

  <h2>5. What VIRI is, and what it is not</h2>
  <p>VIRI shows you other members whose activities and training times overlap with yours, and lets you talk to them. That is all it is.</p>
  <p><b>We do not check who anybody is.</b> There is no identity verification, no background check, no vetting, and no screening of any kind. We do not confirm that a name is real, that a photograph is of the person using the account, or that anything written on a profile is true.</p>
  <p>We are not a party to anything you arrange with another member. We do not supervise meetings, we are not present at them, and we are not responsible for what members do.</p>
  <p><b>Guest passes.</b> Members can offer guest passes they will not use, and ask each other for them. VIRI does not provide, check, hold or sell any pass, and cannot promise that a studio will honour one. Whether a pass is given, and how, is between the two members, and the studio’s own rules apply.</p>
  <p>We also do not run the studios or classes listed on VIRI, and we are not affiliated with them unless we say so. Check schedules, prices and requirements with the studio itself.</p>

  <h2 id="terms-meeting">6. Meeting other members</h2>
  <p><b>This is the part that matters.</b></p>
  <p>VIRI exists so you can meet people in person. That carries real risk. The people you meet are strangers, we have not checked them, and we cannot protect you from them.</p>
  <p><b>You decide whether to meet someone, and you accept the risk of doing so.</b> You are responsible for your own safety, and for deciding what information to share and with whom.</p>
  <p>Some things worth doing, every time:</p>
  <ul>
    <li>Meet in public, in a class or a studio, not somewhere private</li>
    <li>Tell someone you trust where you are going and who you are meeting</li>
    <li>Make your own way there and back</li>
    <li>Leave if you feel uncomfortable &mdash; you never owe anyone an explanation</li>
    <li>If you are in danger, contact the emergency services, not us</li>
  </ul>
  <p>Think carefully before putting your neighbourhood, your regular training times and the studios you attend on your profile. Together they describe where you can be found, and when. Every one of those fields is optional.</p>
  <p>You can <b>block</b> anyone, which stops them messaging you or sending you a request, and <b>report</b> anyone to us.</p>
  <p>We read every report. Reports about harassment, about feeling unsafe with someone, or about somebody pretending to be who they are not, are read <b>every day</b>. Everything else we aim to act on within two business days. We cannot undo harm that has already happened.</p>
  <p><b>If you are in danger, contact the emergency services.</b> We are not an emergency service, we are not monitoring VIRI around the clock, and we cannot respond like one.</p>

  <h2>7. What you post</h2>
  <p>Your sessions, photographs, bio and messages remain yours. By posting them you give us permission to store and display them on VIRI so the product can work &mdash; nothing more. We do not sell your content and we do not use it to advertise.</p>
  <p>Only post photographs you took or have the right to use, and do not post pictures of other people without their agreement.</p>

  <h2>8. How to behave</h2>
  <p>Do not:</p>
  <ul>
    <li>harass, threaten, stalk or intimidate anybody</li>
    <li>post anything sexual, violent, hateful or discriminatory</li>
    <li>pretend to be someone else, or lie about who you are</li>
    <li>use VIRI to advertise, recruit, sell or promote anything, which includes charging for a guest pass</li>
    <li>collect other members&rsquo; information, or share it outside VIRI</li>
    <li>use VIRI to arrange anything illegal</li>
    <li>try to break, overload or get around the security of the service</li>
  </ul>
  <p>Comments and messages are held to the same rules as everything else here: no harassment, no threats, nothing that outs or endangers someone. Report anything that crosses the line.</p>
  <p>Members who do these things lose their accounts.</p>

  <h2>9. Ending things</h2>
  <p>You can delete your account at any time in <a href="#/settings">Settings</a>. It is immediate.</p>
  <p>We can suspend or remove an account at any time, with or without warning, if we believe someone has broken these terms or is a risk to other members. We will usually explain, but when someone&rsquo;s safety is involved we may act first.</p>

  <h2>10. VIRI is provided as it is</h2>
  <p>VIRI is free, and it is provided as it is, with no promises. We do not guarantee that it will work, that it will be available, that anything on it is accurate, or that you will meet anyone.</p>
  <p>To the fullest extent the law allows, we exclude all warranties, express or implied.</p>

  <h2>11. What we are liable for</h2>
  <p>To the fullest extent the law allows, we are not liable for anything that happens between you and another member, including anything that happens when you meet in person. We are not liable for indirect or consequential loss, for lost data, or for the conduct of anyone else using VIRI.</p>
  <p>Where liability cannot lawfully be excluded, it is limited to one hundred US dollars.</p>
  <p>Nothing here excludes liability for our own fraud, for gross negligence or wilful misconduct, or for anything else that cannot lawfully be limited.</p>

  <h2>12. If you cause us a problem</h2>
  <p>If somebody brings a claim against us because of something you did on VIRI or something you did to another member, you agree to cover our reasonable costs in dealing with it.</p>

  <h2>13. Changes</h2>
  <p>We may change these terms. If a change matters, we will tell you before it takes effect. Continuing to use VIRI after that means you accept the new version.</p>

  <h2>14. Law</h2>
  <p>These terms are governed by the law of the District of Columbia, and any dispute belongs in the courts of the District of Columbia.</p>
  <p>If any part of this page turns out to be unenforceable, the rest still stands.</p>

  <h2>15. Talking to us</h2>
  <p><a href="mailto:info@vitalityritual.org">info@vitalityritual.org</a>. We will give you a postal address if you ask.</p>
</article>`;}
function notFound(){return `<section class="section wrap"><h1>Let’s find your way back.</h1><p style="margin:25px 0">This page isn’t part of your circle just yet.</p>${button('Back to VIRI','#/')}</section>`;}
function initWordmark(){
  const mark=$('#mark');
  if(!mark||mark.dataset.built)return;
  mark.dataset.built='1';
  $$('.mark-word',mark).forEach(word=>{
    const keep=Number(word.dataset.keep||0);
    const letters=[...word.textContent];
    word.textContent='';
    letters.forEach((ch,i)=>{
      const span=document.createElement('span');
      span.className='mark-letter '+(i<keep?'is-kept':'is-drop');
      span.textContent=ch;
      word.appendChild(span);
    });
  });
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){mark.classList.add('is-merged');return;}
  requestAnimationFrame(()=>{
    $$('.mark-letter',mark).forEach(el=>{el.style.width=el.getBoundingClientRect().width+'px';});
    requestAnimationFrame(()=>{
      setTimeout(()=>{
        mark.classList.add('is-animating');
        setTimeout(()=>mark.classList.add('is-merged'),1500);
      },700);
    });
  });
}
/* Split a heading into word-level masks so it can rise from behind an edge. */
function maskText(el){
  if(!el||el.dataset.masked)return;
  el.dataset.masked='1';
  const out=document.createDocumentFragment();
  let i=0;
  const pushWord=(node)=>{
    const wrap=document.createElement('span');
    wrap.className='ml';
    const inner=document.createElement('span');
    inner.className='mi';
    inner.style.transitionDelay=(i++*55)+'ms';
    inner.appendChild(node);
    wrap.appendChild(inner);
    out.appendChild(wrap);
    out.appendChild(document.createTextNode(' '));
  };
  [...el.childNodes].forEach(node=>{
    if(node.nodeType===3){
      node.textContent.split(/\s+/).filter(Boolean).forEach(w=>pushWord(document.createTextNode(w)));
    } else if(node.nodeName==='BR'){
      out.appendChild(document.createElement('br'));
    } else {
      pushWord(node.cloneNode(true));
    }
  });
  el.innerHTML='';
  el.appendChild(out);
  el.classList.add('is-masked');
  /* headings that sit outside a scroll-reveal wrapper play on load */
  if(!el.closest('[data-reveal]')) requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('is-shown')));
}
const MASK_SELECTOR='.section-title,.statement h2,.feature-panel h2,.feature-copy h2,.page-head h1,.about-hero h1,.join-inner h2,.longevity-inner h2,.longevity-title,.about-story h2,.article-detail h1,.testimonial blockquote,.auth-form h1,.auth-image h2';

function initPageMotion(){
  $$(MASK_SELECTOR).forEach(maskText);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.film-hero video, .about-hero video').forEach(v=>{
    const b=$(`[data-action="video-toggle"][data-video="${v.id}"]`)||$('.video-toggle');
    const sync=()=>{b.innerHTML=v.paused?'▶ <span>Play film</span>':'Ⅱ <span>Pause film</span>';b.setAttribute('aria-label',v.paused?'Play background video':'Pause background video');};
    v.addEventListener('play',sync);v.addEventListener('pause',sync);sync();
  });
  if(reduced||typeof IntersectionObserver==='undefined')return;
  const targets=$$('[data-reveal]');
  revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  targets.forEach(el=>{el.classList.add('will-reveal');revealObserver.observe(el);});
}
function render(scroll=true){revealObserver?.disconnect();const [path,id]=(location.hash.replace(/^#\/?/,'')||'').split('/');let html;switch(path){case '':if(signedIn()){location.replace('#/feed');return;}html=home();break;case 'explore':html=explorePage();break;case 'studios':html=studiosPage(id);break;case 'read':html=readPage(id);break;case 'about':html=aboutPage();break;case 'connect':html=contactPage();break;case 'thanks':html=thanksPage();break;case 'check-email':html=checkEmailPage();break;case 'signup':html=signupPage();break;case 'start':html=polaroidPage();break;case 'join':html=joinPage();break;case 'login':html=authPage();break;case 'forgot':html=forgotPage();break;case 'notifications':html=notificationsPage();break;case 'confirm-subscription':html=confirmSubscriptionPage(id);break;case 'stop-emails':html=stopEmailsPage(id);break;case 'reset-password':html=resetPasswordPage();break;case 'profile':html=profilePage();break;case 'member':html=memberPage(id);if(typeof ensureMember==='function')ensureMember(id);break;case 'feed':html=feedPage();break;case 'find':html=findPage();break;case 'messages':html=messagesPage();break;case 'settings':html=settingsPage();break;case 'book':html=bookPage(id);break;case 'privacy':html=privacyPage();break;case 'terms':html=termsPage();break;default:html=notFound();}$('#main').innerHTML=html;renderFooter();const names={'':'Vitality Ritual',explore:'Explore',studios:'Studios',read:'The VIRI edit',about:'About us',connect:'Contact us',thanks:'Thank you','check-email':'Check your email',signup:'Sign up',start:'Join now',join:'Create your profile',login:'Welcome back',forgot:'Forgot your password',notifications:'Notifications','confirm-subscription':'Confirm your subscription','stop-emails':'Stop the daily email','reset-password':'Choose a new password',profile:'Your circle',member:'A member',feed:'Feed',find:'Find your people',messages:'Messages',settings:'Settings',book:'Book this class',privacy:'Your privacy',terms:'Terms of service'};document.title=`VIRI — ${names[path]||'Find your way'}`;$$('.site-header nav a').forEach(a=>{if(a.getAttribute('href')===`#/${path}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});$('#menu-panel').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');$('#account-panel').hidden=true;$('#account-button').setAttribute('aria-expanded','false');syncAccountLinks();if(scroll){window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true});}initPageMotion();if($('#auth-form'))bindAuth();if(path==='stop-emails'&&stopEmails.status==='start'){stopEmails.status='working';const tok=stopEmails.token;dbStopDigestEmails(tok).then(r=>{if(stopEmails.token!==tok)return;stopEmails.status=r&&r.data?'ok':'bad';if((location.hash||'').startsWith('#/stop-emails'))render(false);});}if(path==='forgot')bindForgot();if(path==='confirm-subscription'&&subConfirm.status==='start'){subConfirm.status='working';const tok=subConfirm.token;dbConfirmSubscription(tok).then(r=>{if(subConfirm.token!==tok)return;subConfirm.status=r&&r.data?'ok':'bad';if((location.hash||'').startsWith('#/confirm-subscription'))render(false);});}if(path==='notifications'&&state.unseenNotes&&typeof dbMarkNotificationsRead==='function')dbMarkNotificationsRead().then(()=>syncAccountLinks());if(path==='reset-password')bindReset();if(path==='signup')bindSignup();if(path==='connect')bindContact();if(path==='find'){$('#find-form')?.addEventListener('submit',e=>{e.preventDefault();runSearch();});if(typeof dbRoutineMatches==='function'&&state.roomMatches===undefined){state.roomMatches=[];dbRoutineMatches().then(()=>{if(location.hash==='#/find')render(false);});}if(state.found===undefined||state.found===null)runSearch();}if(path==='profile'&&signedIn()&&!goalHistoryLoaded&&typeof dbLoadGoalHistory==='function'){goalHistoryLoaded=true;dbLoadGoalHistory().then(r=>{if(r===null)state.goalHistory=null;if(location.hash==='#/profile')render(false);});}if(path==='profile'&&signedIn())checkAdmin();if(path==='messages'){$('#msg-form')?.addEventListener('submit',e=>{e.preventDefault();sendMessage(e.target);});const b=$('#msg-body');if(b)b.scrollTop=b.scrollHeight;if(msgThread&&typeof dbMarkThreadRead==='function')dbMarkThreadRead(msgThread);}/* Fetch on arrival, not on every render — render() re-runs this block, so an
   unguarded fetch-then-render is an infinite loop. The flag clears when you
   leave, so coming back fetches again. */
if(path!=='feed')feedFetched=false;
else if(!feedFetched&&typeof dbLoadFeed==='function'){feedFetched=true;dbLoadFeed().then(()=>{if(location.hash==='#/feed')render(false);});}if(path==='join')bindJoin();
  $('#subscribe-form')?.addEventListener('submit',async e=>{e.preventDefault();
    const form=e.target, input=form.querySelector('#sub-email');
    const btn=form.querySelector('button[type=submit]');
    if(btn)btn.disabled=true;
    const r=await dbSubscribe(input.value,'viri-edit');
    if(btn)btn.disabled=false;
    if(r.error){toast(r.error.message);return;}
    form.reset();
    toast(r.data==='check-email'?'Nearly there. Check your inbox and click the link to confirm.':r.data==='already'?'You are already on the list.':'You are on the list. Look out for the next one.');});if(path==='explore'&&$('#ex-search')){$('#ex-search').addEventListener('input',e=>{ex.query=e.target.value;exRefresh();});exBindMap();}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-action]');if(!t)return;const {action,id,index,category,view,kind,name,channel}=t.dataset;switch(action){case 'video-toggle':{const v=$('#'+(t.dataset.video||'about-video'));if(v.paused)v.play().catch(()=>toast('Video playback is unavailable in this browser.'));else v.pause();break;}case 'close-modal':closeModal();break;case 'join-back':joinStep=Math.max(0,joinStep-1);render(false);break;case 'studio-prev':studioIndex=Math.max(0,studioIndex-1);$('#studio-grid').innerHTML=studioCards();syncStudioNav();break;case 'studio-next':studioIndex=Math.min(STUDIO_LAST(),studioIndex+1);$('#studio-grid').innerHTML=studioCards();syncStudioNav();break;case 'ex-view':setExView(t.dataset.view);break;case 'pass-ask':passAskModal(t.dataset.id);break;case 'pass-withdraw':withdrawPass(t.dataset.id);break;case 'pass-answer':answerPass(t.dataset.id,t.dataset.accept==='1');break;case 'pass-remove':removePass(t,t.dataset.id);break;case 'offer-pass':offerPassModal(t.dataset.id);break;case 'ex-city':ex={...ex,city:t.dataset.id,venue:null};render(false);break;

case 'ex-cat':ex={...ex,cat:t.dataset.cat,cls:null};render(false);break;
case 'ex-members':ex={...ex,members:!ex.members,cls:null};render(false);break;
case 'ex-time-set':ex={...ex,time:t.dataset.time};exRefresh();break;
case 'ex-venue':ex={...ex,venue:t.dataset.id||null,cls:null};exRefresh();break;
case 'ex-class':ex={...ex,cls:t.dataset.id};exRefresh();$('#ex-panel')?.scrollIntoView({block:'nearest'});break;
case 'ex-back':ex={...ex,cls:null};exRefresh();break;
case 'ex-person':exPersonModal(t.dataset.id);break;
case 'ex-connect':exConnect(t.dataset.id);break;
case 'book-existing':bookChoose(t.dataset.id,'existing');break;
case 'book-new':bookChoose(t.dataset.id,'new');break;
case 'book-plan':bookChoose(t.dataset.id,'plan');break;
case 'ex-zoom':exZoom(t.dataset.dir);break;
case 'ex-reset':ex={...ex,cat:'All',members:false,query:'',venue:null};render(false);break;
case 'reset-filters':explore={...explore,query:'',category:'All',area:'All neighborhoods'};render(false);break;case 'event-details':eventDetails(id);break;case 'join-event':toggleJoin(id);break;case 'show-map':closeModal();const target=allEvents().find(x=>x.id===id);explore={...explore,selected:id,kind:target?.type==='club'?'clubs':'classes',view:'map',category:'All',area:'All neighborhoods',query:''};if(location.hash!=='#/explore')location.hash='#/explore';else render(false);break;case 'save-studio':{const nowOn=!state.saved.includes(id);state.saved=nowOn?[...state.saved,id]:state.saved.filter(x=>x!==id);if(typeof dbSetStudio==='function')dbPush(dbSetStudio(id,nowOn),'that studio');save();render(false);}toast(state.saved.includes(id)?'Studio saved to your profile.':'Studio removed from your saved list.');break;case 'studio-explore':explore={...explore,category,kind:'classes'};break;case 'post-activity':pendingPlans().length?attendModal():postActivity();break;case 'post-new':closeModal();postActivity();break;case 'edit-session':editSession(t.dataset.id);break;case 'open-note':openNote(t.dataset.id);break;case 'mod-dismiss':case 'mod-suspend':case 'mod-delete':case 'mod-unsuspend':case 'mod-reopen':modAct(t);break;case 'session-like':toggleLike(t.dataset.id);break;case 'attend-yes':logAttended(t.dataset.id);break;case 'attend-no':skipAttended(t.dataset.id);break;case 'finish-next':{const n=(state.plans||[]).filter(x=>x.start>Date.now()).sort((a,b)=>a.start-b.start)[0];if(n){n.start=Date.now()-(n.dur+5)*60000;save();render(false);toast('Moved into the past. The + now has something to ask you.');}break;}case 'attend-more':{const p=takePlan(t.dataset.id);closeModal();postActivity(p);break;}case 'show-friends':friendsModal();break;case 'show-requests':requestsModal();break;case 'edit-bio':bioModal();break;case 'add-gallery':addGalleryPhoto();break;case 'add-routine':routineModal(t.dataset.id);break;case 'add-goal':goalModal(t.dataset.id);break;case 'edit-goal':goalModal(null,t.dataset.id);break;case 'remove-goal':removeGoal(t.dataset.id);break;case 'goal-yes':answerGoal(t.dataset.id,t.dataset.day,true);break;case 'goal-no':answerGoal(t.dataset.id,t.dataset.day,false);break;case 'remove-routine':removeRoutine(t.dataset.id);break;case 'open-photo':{const who=(location.hash||'').startsWith('#/member/')?personById(location.hash.split('/')[2]):null;openLightbox(who?(who.gallery||[]):(state.gallery||[]),Number(t.dataset.index)||0);break;}case 'photo-prev':lightboxAt=(lightboxAt-1+lightboxOf.length)%lightboxOf.length;openLightbox(lightboxOf,lightboxAt);break;case 'photo-next':lightboxAt=(lightboxAt+1)%lightboxOf.length;openLightbox(lightboxOf,lightboxAt);break;case 'remove-photo':removeGalleryPhoto(t.dataset.id);break;case 'edit-photo':photoModal();break;case 'accept-request':exConnect(t.dataset.id);break;case 'decline-request':respondToRequest(t.dataset.id,'declined');break;case 'withdraw-request':respondToRequest(t.dataset.id,'withdrawn');break;case 'remove-friend':respondToRequest(t.dataset.id,'removed');break;case 'msg-open':msgThread=t.dataset.id;render(false);if(typeof dbMarkThreadRead==='function')dbMarkThreadRead(msgThread);break;case 'log-out':dbSignOut().then(()=>{$('#account-panel').hidden=true;$('#account-button')?.setAttribute('aria-expanded','false');toast('Signed out.');location.hash='#/';render(false);});break;case 'pf-tab':profileTab=t.dataset.id;render(false);break;case 'session-join':joinSession(t.dataset.id);break;case 'session-talk':{const sid=t.dataset.id;if(!sid){toast('This is a sample session, so there is nobody to talk to yet.');break;}openThreads.has(sid)?openThreads.delete(sid):openThreads.add(sid);render(false);break;}case 'comment-delete':deleteComment(t.dataset.id,t.dataset.session);break;case 'edit-routine':{const r=(state.routines||[]).find(x=>x.id===t.dataset.id);if(r)routineModal(null,{editId:r.id,activity:r.activity,venueLabel:r.venue,venueId:r.venueId,days:[r.weekday],band:r.band});break;}case 'history-goal-delete':deleteHistoryGoal(t);break;case 'share-profile':toast('Your profile link is copied in the live product. Nothing leaves this device in the preview.');break;case 'find-chip':{const v=t.dataset.id;findActivities=findActivities.includes(v)?findActivities.filter(x=>x!==v):[...findActivities,v];runSearch();break;}case 'edit-profile':editProfileModal();break;case 'person-menu':personMenu(t.dataset.id,t.dataset.name);break;case 'report-person':closeModal();reportModal(t.dataset.id,t.dataset.name);break;case 'block-person':closeModal();blockConfirm(t.dataset.id,t.dataset.name);break;case 'block-confirm':doBlock(t.dataset.id,t.dataset.name);break;case 'unblock-person':doUnblock(t.dataset.id,t.dataset.name);break;case 'toggle-show-age':toggleShowAge(t.checked);break;case 'toggle-digest':toggleDigest(t.checked);break;case 'export-data':exportMyData(t);break;case 'delete-account':deleteAccountModal();break;case 'credits':openModal('Photography',`<p class="dialog-copy">Images are shown for this design preview. Studio photography belongs to the respective brands and photographers.</p><p style="margin-top:18px">Running photograph: Tyler Nix / Unsplash, via Shape Republic. Pilates studio: Ohouse. Yoga class: Three Birds Yoga. Yoga mats: Mayo Clinic News Network. Brand imagery: CycleBar, [solidcore], Pure Barre, CorePower Yoga, SoulCycle, Orangetheory, Club Pilates, and Barry’s.</p><p class="small" style="margin-top:18px">Community photographs are AI-generated originals; the lifestyle photography was supplied for this preview.</p>`);break;}});
$('#menu-button').addEventListener('click',()=>{const open=$('#menu-panel').hidden;$('#menu-panel').hidden=!open;$('#menu-button').setAttribute('aria-expanded',String(open));});
bindAccountMenu();
document.addEventListener('click',e=>{if(!e.target.closest('.site-header')){$('#menu-panel').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');$('#account-panel').hidden=true;$('#account-button').setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#menu-panel').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');$('#account-panel').hidden=true;$('#account-button').setAttribute('aria-expanded','false');}});
window.addEventListener('hashchange',()=>{if($('#modal').open)closeModal();render();});
initWordmark();
render(false);
/* The first render happens before the server answers, so it draws the
   signed-out site; this redraws once the session is known. */
/* arriving from a password-reset email goes straight to choosing the new one */
if(typeof dbBoot==='function')dbBoot().then(r=>{if(r&&r.claim==='recovery')history.replaceState(null,'','#/reset-password');render(false);}).catch(()=>{});
