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
const defaultState={profile:null,joined:[],saved:[],created:[],posts:[],connections:[],requests:[],drafts:[]};
let state;
try {state={...defaultState,...JSON.parse(localStorage.getItem('viri-preview')||'{}')};}catch {state={...defaultState};}
function save(){try{localStorage.setItem('viri-preview',JSON.stringify(state));}catch{toast('This browser cannot save changes. Your preview still works for this visit.');}}
let studioIndex=0, revealObserver;
let toastTimer;
const allEvents=()=>[...seedEvents,...state.created];
function prettyDate(date){return new Date(date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});}
function prettyTime(date){return new Date(date).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function initials(name){return (name||'Your Circle').split(' ').map(v=>v[0]).slice(0,2).join('').toUpperCase();}
const button=(text,href,cls='')=>`<a class="button ${cls}" href="${href}">${text}</a>`;
const note=text=>`<div class="preview-note"><strong>Preview</strong> ${text}</div>`;
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function openModal(title,content,after){$('#modal').innerHTML=`<div class="dialog-top"><p>VIRI · Vitality Ritual</p><button class="icon-button" data-action="close-modal" aria-label="Close dialog">×</button></div><h2>${title}</h2>${content}`;$('#modal').showModal();after?.();}
function closeModal(){$('#modal').close();}
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeModal();}});
/* The seal is the brand kit's viri-01, letterforms already outlined so it needs
   no font. The hand-rolled one it replaces ran VITALITY RITUAL EST. 2026 as a
   single run around the ring, which left the back half upside down. Colour comes
   from currentColor so .footer-seal can still tint it cream on the dark footer. */
function seal(label){return `<svg class="seal" viewBox="0 0 400 400" role="img" aria-label="${label}"><circle cx="200.0" cy="200.0" r="176" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="200.0" cy="200.0" r="160" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".55"/><g fill="currentColor"><g transform="translate(200.0 200.0) rotate(-58.4879) translate(0 -139) translate(-6.2605 0) scale(0.019000 -0.019000)"><path d="M634 699 369 0H289L24 699H100L329 76L560 699Z"/></g><g transform="translate(200.0 200.0) rotate(-51.0946) translate(0 -139) translate(-2.1755 0) scale(0.019000 -0.019000)"><path d="M150 699V0H80V699Z"/></g><g transform="translate(200.0 200.0) rotate(-44.2457) translate(0 -139) translate(-4.9400 0) scale(0.019000 -0.019000)"><path d="M489 699V641H295V0H225V641H30V699Z"/></g><g transform="translate(200.0 200.0) rotate(-35.7404) translate(0 -139) translate(-6.1940 0) scale(0.019000 -0.019000)"><path d="M485 166H167L106 0H32L287 690H366L620 0H546ZM464 224 326 602 188 224Z"/></g><g transform="translate(200.0 200.0) rotate(-27.6227) translate(0 -139) translate(-3.9995 0) scale(0.019000 -0.019000)"><path d="M150 57H401V0H80V699H150Z"/></g><g transform="translate(200.0 200.0) rotate(-21.1615) translate(0 -139) translate(-2.1755 0) scale(0.019000 -0.019000)"><path d="M150 699V0H80V699Z"/></g><g transform="translate(200.0 200.0) rotate(-14.3126) translate(0 -139) translate(-4.9400 0) scale(0.019000 -0.019000)"><path d="M489 699V641H295V0H225V641H30V699Z"/></g><g transform="translate(200.0 200.0) rotate(-6.1519) translate(0 -139) translate(-5.3580 0) scale(0.019000 -0.019000)"><path d="M542 699 318 272V0H248V272L22 699H101L283 336L464 699Z"/></g><g transform="translate(200.0 200.0) rotate(6.7510) translate(0 -139) translate(-1.7385 0) scale(0.019000 -0.019000)"><path d="M43 347Q43 369 57.5 383.5Q72 398 94 398Q115 398 129.5 383.5Q144 369 144 347Q144 325 129.5 310.0Q115 295 94 295Q72 295 57.5 310.0Q43 325 43 347Z"/></g><g transform="translate(200.0 200.0) rotate(19.7440) translate(0 -139) translate(-5.5765 0) scale(0.019000 -0.019000)"><path d="M452 0 279 292H150V0H80V699H290Q407 699 467.5 643.0Q528 587 528 496Q528 420 484.5 366.5Q441 313 356 297L536 0ZM150 349H291Q373 349 414.5 389.0Q456 429 456 496Q456 565 416.0 602.5Q376 640 290 640H150Z"/></g><g transform="translate(200.0 200.0) rotate(26.8552) translate(0 -139) translate(-2.1755 0) scale(0.019000 -0.019000)"><path d="M150 699V0H80V699Z"/></g><g transform="translate(200.0 200.0) rotate(33.7041) translate(0 -139) translate(-4.9400 0) scale(0.019000 -0.019000)"><path d="M489 699V641H295V0H225V641H30V699Z"/></g><g transform="translate(200.0 200.0) rotate(42.2447) translate(0 -139) translate(-6.2795 0) scale(0.019000 -0.019000)"><path d="M147 699V259Q147 155 196.5 105.0Q246 55 332 55Q418 55 466.5 104.5Q515 154 515 259V699H585V260Q585 127 514.5 60.0Q444 -7 331 -7Q218 -7 147.5 60.0Q77 127 77 260V699Z"/></g><g transform="translate(200.0 200.0) rotate(51.3022) translate(0 -139) translate(-6.1940 0) scale(0.019000 -0.019000)"><path d="M485 166H167L106 0H32L287 690H366L620 0H546ZM464 224 326 602 188 224Z"/></g><g transform="translate(200.0 200.0) rotate(59.4198) translate(0 -139) translate(-3.9995 0) scale(0.019000 -0.019000)"><path d="M150 57H401V0H80V699H150Z"/></g><g transform="translate(200.0 200.0) rotate(209.4577) translate(0 -139) rotate(180) translate(-4.2755 0) scale(0.017000 -0.017000)"><path d="M150 642V381H415V323H150V58H445V0H80V700H445V642Z"/></g><g transform="translate(200.0 200.0) rotate(201.7753) translate(0 -139) rotate(180) translate(-4.8620 0) scale(0.017000 -0.017000)"><path d="M56 180H130Q135 129 175.0 90.5Q215 52 292 52Q363 52 404.5 88.5Q446 125 446 181Q446 226 423.0 253.5Q400 281 366.0 294.5Q332 308 272 324Q202 343 161.0 361.0Q120 379 91.0 417.0Q62 455 62 520Q62 574 90.0 616.5Q118 659 169.0 683.0Q220 707 286 707Q383 707 442.5 659.5Q502 612 511 537H435Q428 580 388.0 613.5Q348 647 280 647Q217 647 175.0 613.5Q133 580 133 522Q133 478 156.0 451.0Q179 424 213.5 410.0Q248 396 307 380Q375 361 417.0 342.5Q459 324 488.0 286.0Q517 248 517 184Q517 135 491.0 91.0Q465 47 414.0 20.0Q363 -7 292 -7Q223 -7 170.5 17.0Q118 41 88.0 84.0Q58 127 56 180Z"/></g><g transform="translate(200.0 200.0) rotate(194.0333) translate(0 -139) rotate(180) translate(-4.4200 0) scale(0.017000 -0.017000)"><path d="M489 699V641H295V0H225V641H30V699Z"/></g><g transform="translate(200.0 200.0) rotate(187.6578) translate(0 -139) rotate(180) translate(-1.5470 0) scale(0.017000 -0.017000)"><path d="M41 47Q41 69 55.5 83.5Q70 98 92 98Q113 98 127.5 83.5Q142 69 142 47Q142 25 127.5 10.0Q113 -5 92 -5Q70 -5 55.5 10.0Q41 25 41 47Z"/></g><g transform="translate(200.0 200.0) rotate(175.2642) translate(0 -139) rotate(180) translate(-4.8620 0) scale(0.017000 -0.017000)"><path d="M436 517Q436 586 401.5 627.5Q367 669 289 669Q213 669 171.5 621.5Q130 574 125 495H57Q63 606 125.5 667.5Q188 729 289 729Q386 729 446.0 674.5Q506 620 506 520Q506 399 405.5 285.5Q305 172 158 64H528V5H51V55Q235 193 335.5 302.5Q436 412 436 517Z"/></g><g transform="translate(200.0 200.0) rotate(167.1859) translate(0 -139) rotate(180) translate(-5.2360 0) scale(0.017000 -0.017000)"><path d="M308 727Q445 727 498.0 632.0Q551 537 551 365Q551 190 498.0 94.0Q445 -2 308 -2Q170 -2 117.5 94.0Q65 190 65 365Q65 537 118.0 632.0Q171 727 308 727ZM308 664Q236 664 198.0 625.0Q160 586 147.0 522.0Q134 458 134 365Q134 269 147.0 204.5Q160 140 198.0 101.0Q236 62 308 62Q380 62 418.0 101.0Q456 140 469.0 204.5Q482 269 482 365Q482 458 469.0 522.0Q456 586 418.0 625.0Q380 664 308 664Z"/></g><g transform="translate(200.0 200.0) rotate(159.1077) translate(0 -139) rotate(180) translate(-4.8620 0) scale(0.017000 -0.017000)"><path d="M436 517Q436 586 401.5 627.5Q367 669 289 669Q213 669 171.5 621.5Q130 574 125 495H57Q63 606 125.5 667.5Q188 729 289 729Q386 729 446.0 674.5Q506 620 506 520Q506 399 405.5 285.5Q305 172 158 64H528V5H51V55Q235 193 335.5 302.5Q436 412 436 517Z"/></g><g transform="translate(200.0 200.0) rotate(150.9838) translate(0 -139) rotate(180) translate(-5.3465 0) scale(0.017000 -0.017000)"><path d="M326 672Q228 672 179.0 596.0Q130 520 134 347Q154 407 210.5 441.5Q267 476 340 476Q445 476 506.5 411.5Q568 347 568 234Q568 168 542.5 114.5Q517 61 464.5 29.0Q412 -3 334 -3Q185 -3 128.5 92.0Q72 187 72 361Q72 731 326 731Q422 731 477.0 678.5Q532 626 542 542H477Q455 672 326 672ZM143 245Q143 164 191.0 110.0Q239 56 331 56Q408 56 454.0 103.0Q500 150 500 231Q500 318 455.0 367.0Q410 416 327 416Q280 416 238.0 397.0Q196 378 169.5 339.5Q143 301 143 245Z"/></g></g><circle cx="103.0" cy="200.0" r="2.4" fill="currentColor" opacity=".8"/><circle cx="297.0" cy="200.0" r="2.4" fill="currentColor" opacity=".8"/><g fill="currentColor"><g transform="translate(115.120 240.0)"><g transform="translate(0.000 0) scale(0.120000 -0.120000)"><path d="M682 657V683C659 681 633 681 608 681C584 681 543 681 520 683V657C570 654 572 619 572 613C572 602 569 595 566 587L369 74L163 613C160 620 158 625 158 630C158 657 198 657 219 657V683C187 681 140 681 107 681C81 681 34 681 10 683V657C68 657 79 653 91 621L329 0C334 -14 335 -16 346 -16C357 -16 358 -14 363 0L590 591C599 613 615 656 682 657Z"/></g><g transform="translate(88.160 0) scale(0.120000 -0.120000)"><path d="M682 84C682 90 682 97 673 97C665 97 664 91 664 87C659 22 630 0 599 0C544 0 538 63 532 124C529 145 527 160 525 182C519 232 511 305 392 341C487 360 567 424 567 504C567 598 461 683 321 683H52V657C121 657 132 657 132 612V71C132 26 121 26 52 26V0C81 2 133 2 164 2C195 2 247 2 276 0V26C207 26 196 26 196 71V334H313C370 334 402 311 416 298C456 259 456 232 456 164C456 97 456 63 486 29C524 -12 575 -16 597 -16C671 -16 682 67 682 84ZM491 504C491 375 385 350 310 350H196V618C196 652 198 657 238 657H311C394 657 491 628 491 504Z"/></g></g></g></svg>`;}
function renderFooter(){ $('#footer').innerHTML=`<div class="footer-main"><div class="wrap"><div class="footer-grid"><div class="footer-brand"><a class="footer-seal" href="#/" aria-label="VIRI home">${seal('VIRI \u2014 Vitality Ritual')}</a><a class="footer-logo" href="#/" aria-label="VIRI home">VIRI</a><p>Vitality Ritual</p><p>Build community around what moves you.</p><div class="socials"><a href="https://www.instagram.com/vitalityritual.co/" target="_blank" rel="noopener" aria-label="VIRI on Instagram, opens in a new tab"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/></svg>Instagram</a><a href="#/connect" aria-label="VIRI TikTok information"><svg viewBox="0 0 24 24"><path d="M14 3v13a4 4 0 1 1-4-4M14 3c0 4 3 6 7 6"/></svg>TikTok</a></div></div><div class="footer-links"><p class="footer-label">Your next ritual</p><a href="#/explore">Explore opportunities</a><a href="#/studios">Discover studios</a><a href="#/read">The VIRI edit</a><a href="#/login">Log in</a></div><div class="footer-links"><p class="footer-label">Our community</p><a href="#/about">About us</a><a href="#/connect">Connect with us</a><a href="#/signup">Join now</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} VIRI · Vitality Ritual</span><span>Interactive preview · <a href="#/privacy">Privacy</a> · <a href="#/terms">Terms</a> · <button class="plain-link" data-action="credits">Image credits</button></span></div></div></div>`;}
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
    <img src="${A}connect-kerb.jpg" alt="Two women sitting together on a curb after a class, one in a brown workout set" loading="lazy">
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
 {id:'saving-money',category:'Mindset',title:'13 Ways I Save Money as a Post-Grad Girl Living on My Own',titleLines:['13 Ways I Save Money as a','Post-Grad Girl Living on My Own'],img:'money-autumn.jpg',author:'Margaret Cole',date:'2026-10-01',desc:'How I rent a studio in DC on a lower-middle-class salary, from the emergency fund down to the free trials.',body:`<p>I graduated from college four months ago and was able to immediately start renting my own studio apartment in Washington, DC with no financial assistance.  A high-paying job is not what made this possible — in fact, by the most recent metrics, I am considered lower-middle class.  The way I was able to do it was by making conscious decisions to save money both before I moved here and after I started working full time.  Here are 13 small ways I save money as a post-grad girl living on my own.</p><p>Let’s start with the basics.</p><h2>1. High-yield savings account (emergency fund)</h2><p>If your savings aren’t currently in a high-yield savings account (HYSA), it is time for you to immediately find a new bank and transfer them.  HYSAs give you roughly 10 times the annual interest rate a traditional bank does, and most of these accounts are completely free to open and incur no annual fee.  If you have $1,000 in your account, your bank will give you an additional $30 to $35 a year just for keeping your money there.  And while $30 isn’t very much, let’s say you have $20,000 in your account — that’s an additional $600 to $700 a year.  My HYSA also functions as my “emergency fund.”  An emergency fund is exactly what it sounds like: money set aside for unanticipated emergencies such as unexpected medical bills, car repair expenses, family travel, getting laid off from a job, etc.  Generally, your emergency fund should cover 3 to 6 months of your essential living expenses and it is recommended that you do not touch this money.  If you start building an emergency fund, specifically in a HYSA, you’re setting yourself up for success later down the line and giving yourself free money through annual interest rates.</p><h2>2. Brokerage account &amp; Roth IRA / 401(k)</h2><p>Once you’ve gotten #1 under your belt, investments are how you grow your additional money and prevent yourself from overspending.  Many banks have a built-in investing feature, so you can invest your money in the stock market within seconds, just by transferring it from your savings to a brokerage account.  If you are just getting into investing for the first time, the most low-risk way to grow your money is by investing it into mutual funds, such as the S&amp;P 500 (sometimes traded as VOO).  If you are looking for detailed instructions on how to invest in the S&amp;P and what the S&amp;P 500 is, let me know and I’ll write up an article for you.</p><p>Along these same lines, either enrolling in your company’s 401(k) program or opening a separate Roth IRA is another great way to accumulate wealth over a long period of time.  I would recommend having both a brokerage account and a Roth IRA/401(k), as they have different benefits to your long-term wealth.  There are many ways you can choose to invest your money, but my general preference is that every month, any money that exceeds my emergency fund cap gets split 50/50 and goes directly into my two investment accounts.</p><h2>3. Paying off your credit card in full every month</h2><p>This one is short and sweet.  You should not be spending money that you don’t have, and so if you don’t feel comfortable paying off your full credit card bill in a given month, that’s a sign that you’re spending too much money.</p><h2>4. Consider getting a roommate if you can’t afford your lifestyle</h2><p>Most of the young 20-somethings at my corporate office live with roommates, and honestly, I believe this is an incredibly lucrative financial decision.  Before you decide to live on your own, you need to ask yourself how much living alone is really worth to you.  While it is certainly inconvenient at times to accommodate your living conditions with someone else’s, you will literally save tens of thousands of dollars per year by splitting the cost of rent with someone else.  My rent, which I pay on my own, consumes over 40% of my salary, a percentage I frankly do not recommend for anyone trying to save money in their early 20s, so this is a tip I would think about deeply before you tie yourself down to a lease.</p><h2>5. Meal prepping</h2><p>I meal prep all of my lunches and dinners.  In a given week, I might go out to eat once, but most normal weeks I try to cook every meal on my own.  Depending on ingredient costs, by choosing to meal prep instead of buying your lunch out, you could be saving $15+ per meal.  Another expense to consider when trying to save money by meal prepping is how expensive your protein of choice is.  In terms of meat, your cheapest options are likely chicken and ground beef, followed by red meat and then various types of fish.</p><h2>6. Avoiding meal and grocery delivery services</h2><p>I have completely deleted these apps off my phone, because when they are on my phone I become too tempted to use them.  Delivery fees and taxes sometimes make a given meal on a delivery service app double what it would have been before, so instead of spending $10 on a coffee and pastry you might be spending $20.  While this might seem like a negligible amount one time, the reality is that it’s rarely ever just one time once you start using these services.</p><h2>7. Consider using public transit if the time is similar to Ubering</h2><p>Again, choosing convenience over your wallet is a slippery slope, so before I choose to Uber anywhere, I always check the time it would take to get to the given location by both car and public transit — and if the difference is negligible, I opt for public transit.</p><h2>8. Take your cards off Apple Pay</h2><p>This is one I struggle with, but using Apple Pay 100% makes me spend money more easily.  The act of physically taking out your card to pay for something forces you to actually think about a purchase you are about to make before you simply tap your phone.  Even though the difference is only seconds, I saved thousands on credit card bills last year by removing my card from Apple Pay.</p><h2>9. Turn on your banking notifications</h2><p>If your banking app sends you alerts when you spend money, turn on your notifications.  Although it may be annoying to constantly be alerted any time you spend a few bucks on coffee, groceries, etc., physically seeing the number in your account go down is often enough to prompt you to reconsider spending more.</p><h2>10. Don’t buy new clothes before you’ve gone through your wardrobe first</h2><p>I make it a priority to go through my closet roughly once every two months to evaluate the necessity of each piece of clothing I own.  I also force myself to be strict with buying new clothes by only having a set number of hangers and never buying more.  If I don’t have the hanger or closet space, I certainly don’t need the new item.</p><h2>11. Before buying a new item of clothing, ask how many outfits you can make with it</h2><p>If an item can only be worn logically with one specific pair of pants or one shirt, you likely wouldn’t benefit very much from buying it.  I always try to make sure I have at least 3 to 4 different items of clothing that I can wear a given top or bottom with before I consider buying it.</p><h2>12. Learn how to do cosmetic expenses yourself</h2><p>Beauty expenses such as getting your nails done or dyeing and cutting your hair add up massively over time.  I used to get my nails done once every three weeks and I ended up spending over $1,000 in a year on nails alone.  I eventually taught myself how to do my nails myself.  While this may take you a few weeks to learn, it’s a skill you can pick up quickly and it will save you thousands.  The same goes for your hair.  I used to get my hair professionally cut and dyed at a salon and it would often cost well over $200 per visit.  However, roughly a year ago, I decided to learn how to cut my hair myself from a simple 10-minute YouTube video and I have been trimming my hair for free ever since.  The same goes with a basic dye job, however, this can be a little more risky.  If you do your research and are very careful, you can turn this into another very cheap expense.</p><h2>13. Take advantage of free trials</h2><p>This one is specifically related to fitness class free trials.  Often, studios will have a first visit free or one-week free promotion in order to convince people to sign up for their service.  ClassPass also has an incredible offer where you can get your first month completely for free and trial up to 10 different workout classes during the month.  Before you choose to start paying for a workout service regularly, check if they have any promotions and take advantage of them.  In the past three months, I have not paid for a single workout class I have taken, all because of this hack.</p>`},
 {id:'run-essentials',category:'Movement',title:'Starting Your Running Journey? Here Are Our Top Essentials to Get You Started.',img:'run-essentials.jpg',author:'Margaret Cole',date:'2026-09-30',desc:'The vest, the shoe, the headphones and the fuel that have carried me through years of running.',body:`<p>As someone who has been running for the majority of my life, I’m excited to bring you VIRI’s list of top running essentials.  Whether you are training for your first 5k or a marathon, these are the items that are sure to elevate your experience.</p><h2>1. Water carrier</h2><p>While it’s technically possible to survive your runs without bringing water, I certainly wouldn’t advise it.  Instead of viewing needing water as a weakness, water should be your aid, even if you’re only out for a 30-minute jog.  I’ve tried both a running vest and a handheld water bottle.  There are pros and cons to each, but here are my biggest takeaways that you might consider when deciding how to carry water on your runs.</p><h3><a href="https://www.amazon.com/SWIFTVEST-Waterproof-Reflective-Lightweight-Accessories/dp/B0CR8LKMVH/" target="_blank" rel="noopener">Amazon running vest</a> &middot; $37.99</h3><figure class="prod"><img src="${A}gear-vest.jpg" alt="A black SWIFTVEST running vest with a blue soft flask alongside it" loading="lazy"><figcaption>SWIFTVEST running vest &middot; $37.99</figcaption></figure><p>I have run hundreds of miles in this vest, and that is not an exaggeration.  The water pouch is 17 oz and is very spill proof.  17 oz of water will likely be enough for anyone running up to the half marathon distance, but if you’re training for a full marathon, in my experience, this is simply not enough water for your weekend long run.  Another thing to keep in mind is that this running vest has a pretty tight phone pocket, so it’s pretty challenging to take your phone in and out — I resort to holding my phone the majority of the time when using this vest.  The vest has adjustable straps and doesn’t move around when you wear it, but be prepared for your torso to feel damp based on how much you tend to sweat while running.  Overall, if you’re just beginning your running journey or are running on a budget, I’d say this vest is likely the best option you will find for its price.  If you’re willing to bring out the big bucks and upgrade to a more highly functional vest, I’d recommend the <a href="https://www.rei.com/product/230699/salomon-active-skin-4-hydration-vest" target="_blank" rel="noopener">Salomon Active Skin 4 hydration vest</a>, which retails for $100, but frankly, 99% of runners can do perfectly well with a basic Amazon vest.</p><h3><a href="https://www.amazon.com/Nathan-SpeedDraw-Insulated-Handheld-Metallic/dp/B08SJHK5LV/" target="_blank" rel="noopener">Handheld water bottle</a> &middot; $34.99</h3><figure class="prod"><img src="${A}gear-bottle.jpg" alt="A Nathan SpeedDraw handheld water bottle with a zip pocket" loading="lazy"><figcaption>Nathan SpeedDraw handheld &middot; $34.99</figcaption></figure><p>About a month ago, I switched from a running vest to a handheld water bottle.  This bottle holds 18 oz of water and you’d think that this would cause unnecessary strain on your arm while running, but that has not been my experience at all.  The bottle is easy to carry, has an adjustable strap so you can loosen or tighten it, and has a zipper pocket big enough to hold at least 6 running gels (which would get you through an entire marathon).  My only two warnings about this handheld water bottle are that the zipper pocket is not big enough to hold a phone, and your hand will likely get very sweaty depending on the intensity of your workout.  The sweatiness doesn’t make the water bottle any less functional and my hand doesn’t slip when it gets sweaty, but you may experience a mild discomfort from the feeling.</p><p>After having tried both, I prefer the water bottle simply because it is small and holds slightly more water.  Both are great options, but ultimately up to your personal preference.</p><h2>2. A high quality running shoe</h2><p>I have tried several different brands of running shoes, but my go-to for the past four years have been the <a href="https://www.hoka.com/en/us/womens-everyday-running-gear/clifton-10/1162031.html" target="_blank" rel="noopener">Hoka Clifton 10</a>, which tends to retail from $125 to $155.</p><figure class="prod"><img src="${A}gear-shoe.jpg" alt="A white Hoka Clifton 10 running shoe in profile" loading="lazy"><figcaption>Hoka Clifton 10 &middot; $125&ndash;$155</figcaption></figure><p>The shoe you pick is incredibly important and should be tailored to the structure of your foot.  Before you pick a shoe, determine if you need a shoe more suited to someone with flat or arched feet, because this will make a huge difference in injury prevention.  If you are more prone to injury, you may also want to consider a shoe with more cushioning on the bottom, which the Clifton 10 has.  Another thing to take into consideration is the size of the toe box — some shoes have a widened toe box, which, if you like more breathing room in your shoe, could be beneficial.  As someone with high arches, narrow feet, and leg sensitivity to switching running surfaces (e.g. going from gravel to pavement), the Clifton 10 is the best shoe for me.  Do your research before making the investment!</p><h2>3. <a href="https://shokz.com/products/openrunpro2?variant=45134507868360" target="_blank" rel="noopener">Shokz OpenRun 2 headphones</a> &middot; $179.95</h2><figure class="prod"><img src="${A}gear-headphones.jpg" alt="Shokz OpenRun open-ear bone conduction headphones in white" loading="lazy"><figcaption>Shokz OpenRun 2 &middot; $179.95</figcaption></figure><p>Yes, these headphones are quite an investment, but I swear by them.  I have run with AirPods, Beats, etc. and these are by far the best headphones I have found.  If you’re doing an intense running workout, I would 90% count on your AirPod falling out at some point, and if you’re wearing over-the-ear Beats, be ready for your ears (and headphones) to become sweaty and to not hear anything going on around you.  The Shokz OpenRun headphones (specifically the mini size) work perfectly for me because they stay in place while I run, the sound is high-quality, they don’t cause additional sweat, and they are built for you to be able to hear what’s going on around you while still listening to your music.  When I got these, I was skeptical that the sounds around me would make it difficult for me to hear my music at the volume I wanted (which is loud), but somehow they work perfectly.</p><p class="prose-break">And if you’re getting into longer distance running, such as half or full marathons, here are some additional product recommendations I would give you that have aided me in my training.</p><h2>4. <a href="https://www.amazon.com/Honey-Stinger-Exercise-Performance-Nutrition/dp/B0GWSDN2CR/" target="_blank" rel="noopener">Honey Stinger energy gels</a> &middot; price varies by quantity</h2><figure class="prod"><img src="${A}gear-gels.jpg" alt="A variety pack of Honey Stinger energy gels in several flavours" loading="lazy"><figcaption>Honey Stinger energy gels &middot; variety pack</figcaption></figure><p>When I started training for my first official half marathon, I was very suspicious of integrating running gels into my nutrition, and frankly, I avoided them for as long as possible.  However, once I started reaching 9+ mile long runs, I had to give in and try mid-run fueling.  Fueling while you’re in the middle of a long run is critical to your performance because your body’s stored carbohydrates (glycogen) run low after about 90 minutes, and taking in extra carbs prevents severe fatigue and keeps your energy steady.  There are tons of different types of energy gels, but my favorite has to be the Honey Stinger variety pack.  These gels have a similar consistency to honey, as opposed to Gu gels, which are much thicker.  They sit well in my stomach, are easy to open, quick to consume, and have several different delicious flavors to choose from.</p><h2>5. Electrolyte powder &middot; price varies by quantity</h2><p>I have tried several different types of electrolyte powders over the years, but my favorite has to be the classic <a href="https://liquid-iv.com" target="_blank" rel="noopener">Liquid I.V.</a>  While I do not recommend casually drinking electrolyte powder due to its high sodium concentration, replenishing with electrolytes during a high-intensity, heavily sweat-inducing, or long-distance run is crucial to runners’ health.  My rule of thumb for taking electrolytes is very similar to when I take gels.  I only consume electrolytes in my water when I am completing a run generally over 9 miles or if I’m planning on my run being high intensity.  You may also consider buying electrolyte tablets as opposed to powder, which I have done before.  The pro of an electrolyte tablet is it’s small and you just drop it in your water before you head out the door.  The primary con is that they’re hard to take with you if you plan on putting it in your water partway through your run, because you’d have to either bring one in a bag or bring the entire tube.</p><p class="prose-break">There are so many more running products I could talk to you about, but these are the basics that have carried me through my journey.  And now that it’s officially fall, you can enjoy each of these items in the perfectly crisp weather!</p>`},
 {id:'corporate-burnout',category:'Mindset',title:'Dealing With Corporate Burnout? Here’s How I Avoid it.',img:'coat-journal.jpg',author:'Margaret Cole',date:'2026-09-28',desc:'Three things that moved me from seeing myself as a product of my office work to a person defined by my passions.',body:`<p>For all my post-grad gals currently working a 9-5, I promise that you can get through this, and for those worried about joining the 9-5 grind in the future, perhaps you can avoid the burnout entirely.</p><p>I’m not sure about you, but before I started my first official big-girl job, I romanticized the heck out of it.  I was finally going to be a consultant—a title that nobody really understood, but that held a certain prestige that you wanted to possess regardless.  I would now be able to throw around corporate jargon about shareholder value, market cap, and optimizing for efficiency, and I’d look like a girlboss while I did it. And truth be told, the beginning was great.  I was living on my own, financially independent, and shaping every aspect of my life (outside of the 8 hours a day, minimum, that I had to spend at a desk).  But the romanticization ended quickly.  I became more worried about office politics and delivering results than my own personal happiness.  And once you enter this mindset, it’s extremely difficult to stop thinking this way and instead shift your focus onto the things that should actually matter in your life.</p><p>Here are some of the ways that I’ve been able to manage my corporate burnout that do not involve simply pivoting careers.</p><h2>1. Find a passion completely unrelated to work.</h2><p>This is, above all else, the best piece of advice I will offer you today.  If you wake up every day and don’t have anything consistent to look forward to outside of work, your life is going to revolve around your job.  The fact of the matter is that when you work in corporate, at least 60% of your day is spent working, and that percentage becomes much higher when you account for the time it takes to get ready, commute, and unwind from work every day.  So, if you aren’t being incredibly intentional with the few hours that you have outside of the office, you’re going to find that work is the only thing on your mind.</p><p>For me, I can confidently tell you that my main passion at the moment is running.  Roughly half a year ago, I signed up for a marathon (which I will be running in October!), and what they don’t tell you before you sign up for a marathon is that this kind of goal requires you to alter most of your lifestyle.  Not only will you average about an hour of running every day, but you will also have to change your sleep schedule, what you eat, how often you eat, how you cross-train, etc.  While my passion for running has ebbed and flowed as I’ve gone through the grueling summer training months, running has kept me focused on living a life for myself, completely separate from work.  And because I’ve found a passion that I’ve fully invested myself in, one that has to exist outside of the 9-5 hours, I am able to shift my mind (and lifestyle) away from work and wake up every morning with a sense of purpose and actions to go alongside it.</p><p>If you are currently struggling to figure out what that passion might be, check out this article for some potential ideas.</p><h2>2. Build a morning routine.</h2><p>One thing I noticed was that when my corporate burnout was at its worst, I had simultaneously let go of my morning routine.  I would set my alarm so I had just enough time to get ready for work, and I did nothing in the morning for my own enjoyment.  The (perhaps unfortunate) reality is that when I started waking up earlier, I finally regained much of the happiness I had lost to work.  As I’ve mentioned in “<a href="#/read/september-reset">The Truth About the September Wellness Reset</a>,” shifting your morning routine sustainably has to happen gradually, but once you’ve successfully made this shift, I guarantee your life will become so much more fulfilling.</p><p>Now, I’m not saying that you have to wake up and walk 10,000 steps, do red light therapy as you stand on your vibration plate, and then write in your journal for 30 minutes.  Instead, experiment with some different morning routine action items and decide for yourself what makes sense to keep and get rid of.  In my experience, roughly 2 to 2.5 hours is the perfect amount of time that I need in the mornings to get my day started on the right track.  This number is completely individual to your needs, but for reference, my morning routine looks something along the lines of:</p><ul><li>Wake up at 5:30am</li><li>Morning run or workout class (~1 hour)</li><li>Shower, stretch, and get ready for work</li><li>Breakfast and hydration</li><li>~1 hour of deep work, unrelated to my 9-5 (recently this has been building VIRI, but in the past this time may have been occupied by reading, skincare, playing with my kitten, or simply taking my sweet time when getting ready for the day).</li></ul><p>And because I have built a routine that brings me joy and allows me to focus on myself for several hours before working all day, I am able to wake up refreshed and actually excited to start the day.</p><h2>3. Adjust your Ego</h2><p>As hard as it may be to admit, your office survived before you were hired, and they will continue to survive after you find your next job.  And yes, your presence may be making a real impact on how your office and the people around you operate, but I promise the workplace will not burn down if you take a vacation, leave at 5 instead of 7, or tell a coworker that you don’t have the bandwidth to take on another task.  This mindset reframing walks a very careful line—you should absolutely continue to show up from 9-5 and produce excellent work, but you will reach a breaking point sooner or later if you don’t set boundaries with your work and you see yourself as an indispensable machine.</p><p>Ironically, my boss taught me this lesson.  Aside from my company’s CEO, he is arguably the most indispensable person at my firm.  While grabbing lunch, he said, “Margaret, even if I were to take a month-long vacation, the firm would be completely fine and everything would stay afloat.”  Hearing that from him specifically really put into perspective the importance of adjusting one’s ego in the workplace.  So, the last piece of advice I would give you in order to avoid corporate burnout is to do your job well, but within the confines of realistic work-life boundaries.</p><p>There are so many other factors I could tell you about that have helped make a difference in my recovery from corporate burnout, but these three steps have made the biggest difference in my transition from seeing myself as a product of my office work to seeing myself as a person defined by my passions and personal happiness.</p>`},
 {id:'september-reset',category:'Mindset',title:'The Truth About the September Wellness Reset',img:'reading.jpg',author:'Margaret Cole',date:'2026-09-19',desc:'Why the fresh start you are waiting for is one you can build yourself, any day you choose.',body:`<p>If you’ve been on social media in the last three weeks, you’ve likely seen dozens of videos framing September as the new January.  And in some ways, it can be.  We are two-thirds of the way through the year, which may seem daunting, but this leaves four whole months to start the habit or work toward the goal you’ve been telling your friends you were going to begin but just didn’t have the time or motivation to.  But if we’re being honest, there isn’t much about September that makes it the perfect month to turn your life around—the timing is fairly arbitrary.  It’s still summer for the first three weeks of the month, and most high schools and colleges have already started their academic years.</p><p>The real appeal of September that influencers have been pushing is the idea of having a new beginning.  The concept of new beginnings has been studied extensively by some of the world’s top academics, such as Dr. Katy Milkman, a professor of behavioral economics at the Wharton School at the University of Pennsylvania.  Dr. Milkman’s 2021 book <em>How to Change: The Science of Getting from Where You Are to Where You Want to Be</em>, discusses the concept of “the fresh start effect,” which she coined back in a <a href="https://static1.squarespace.com/static/5353b838e4b0e68461b517cf/t/53b17c1be4b09fe9f6e12f32/1404140571261/the-fresh-start-effect.pdf" target="_blank" rel="noopener">2014 study</a>.  I had the privilege of not only reading Dr. Milkman’s book but also speaking to her in February about the fresh start effect.  Simply put, her theory is that landmark moments—such as New Year’s, your birthday, the first day of a new month, or even a Monday—make us feel mentally separate from our past failures and give us a temporary boost in motivation to change.</p><p>This theory isn’t necessarily groundbreaking because we actually implement the fresh start effect in our own lives all the time.  When was the last time that you told yourself that Monday was going to be the day you finally started waking up early, going to the gym more consistently, etc.?  In my opinion, the key implication of Dr. Milkman’s research is not the finding itself, but what we can do with an awareness of our psychological tendencies.  By knowing that we are more likely, at least temporarily, to experience a boost in motivation during landmark moments, we can construct our own fresh starts to strategically accomplish our goals.</p><p>Here is an example of how I have implemented this concept in my own life. On Monday, August 24th, I made a commitment to myself to start becoming a morning person.  Throughout June and July, I had fallen into a habit of giving myself just enough time to do the bare essentials before working my 9-to-5.  As a result, I was left trying to squeeze everything non-work-related into the few hours I had after getting home each day.  And, surprise, it wasn’t working—I was living reactively, not proactively.</p><p>What finally sparked my desire to change was something completely unexpected.  On Saturday, August 22nd, my mom sent me a link to wellness influencer Michaela Allocca’s podcast, which primarily deals with becoming a productive, independent woman in your 20s.  Two days later, while on a run, I listened to her episode titled “<a href="https://podcasts.apple.com/us/podcast/dont-depend-on-daddy/id1473703898?l=zh-Hans-CN" target="_blank" rel="noopener">How to Become a Morning Person | 6 Tips to Make Your Mornings Better That Actually Stick</a>.”  During the episode, Michaela talked about how we often try to jump from 1 to 100 when making big life changes, and how unrealistic this is when trying to build sustainable habits.  Instead, she recommended starting small and gradually adjusting your routine.</p><p>I realized that I had been doing exactly the opposite.  There had been several mornings in the previous months when I had told myself, tomorrow is it—I’m waking up at 5 a.m. and going on a 10-mile run. But when my alarm went off in the morning, I would immediately snooze it and go back to sleep.  This time, I decided to take a more reasonable approach: I would start small, make Monday my fresh start, and gradually work toward the morning routine I actually wanted.</p><p>And it worked.  It’s now been almost a month, and I have successfully conditioned myself to naturally wake up at 5:30 a.m.  With three hours of time for myself before work, I’ve found a renewed sense of motivation to accomplish my personal goals and prioritize my wellness.  More importantly, though, I put Dr. Milkman’s research into practice.  I chose a landmark moment—a Monday—to separate myself from the routine that wasn’t working, paired it with a goal that felt attainable, and gave myself the motivation to finally make a change.</p><p>My Monday morning wasn’t inherently different from any other Monday.  What made it different was that I decided it was a fresh start.</p><p>This is exactly what the September reset has become: an artificially constructed new beginning that we can use to harness motivation and change for the better.  Here’s the good news: if you didn’t start your end-of-year lock-in on September 1st, that’s okay!  There are so many landmark moments in your day-to-day life just waiting for you to capitalize on.  Now, this doesn’t mean that you should wait until October 1st, the start of the next quarter, your birthday, etc., to finally commit to making a change.  You have the capability (and should absolutely use it) to construct your own fresh start right now, and once you have, you’ll be able to look back and see just how much you were able to accomplish by simply choosing to begin.</p>`},
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
  <p class="subscribe-note">Preview only &mdash; nothing is sent and no address leaves this device.</p>
</form>`;
function readPage(id){if(id){const a=allArticles().find(x=>x.id===id);if(!a)return notFound();
  return `<article class="article">
    <div class="wrap">
      <a href="#/read" class="text-link">${arrowLeft} All stories</a>
      <header class="article-head">
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
let ex={city:'dc',cat:'All',day:0,time:'All',members:false,query:'',venue:null,cls:null};
const exCity=()=>VIRI.cities.find(c=>c.id===ex.city)||VIRI.cities[0];
const exVenue=id=>VIRI.venues.find(v=>v.id===id);
const exPerson=id=>VIRI.people.find(p=>p.id===id);
let exAll=null;
const exClasses=()=>(exAll||(exAll=VIRI.buildClasses()));
const DAYBANDS={Early:[0,9],Midday:[9,16],Evening:[16,24]};

function exDays(){const out=[];for(let i=0;i<7;i++){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+i);
  out.push({i,label:i===0?'Today':i===1?'Tomorrow':d.toLocaleDateString('en-US',{weekday:'short'}),
    sub:d.toLocaleDateString('en-US',{month:'short',day:'numeric'})});}return out;}

function exMatch(c){
  if(c.city!==ex.city)return false;
  const d=new Date(c.start), t=new Date(); t.setHours(0,0,0,0); t.setDate(t.getDate()+ex.day);
  if(d.toDateString()!==t.toDateString())return false;
  if(ex.cat!=='All'&&c.cat!==ex.cat)return false;
  if(ex.venue&&c.venue!==ex.venue)return false;
  if(ex.members&&!c.going.length)return false;
  if(ex.time!=='All'){const h=d.getHours()+d.getMinutes()/60,b=DAYBANDS[ex.time];if(h<b[0]||h>=b[1])return false;}
  if(ex.query){const v=exVenue(c.venue),q=ex.query.toLowerCase();
    if(!((c.title+' '+v.brand+' '+c.area+' '+c.cat).toLowerCase().includes(q)))return false;}
  return true;
}
const exFiltered=()=>exClasses().filter(exMatch);

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
  return `<span class="av-stack">${shown.map(id=>{const p=exPerson(id);
    return `<span class="av" title="${escapeHTML(p?p.name:'')}">${escapeHTML(initials(p?p.name:'V'))}</span>`;}).join('')}${
    ids.length>shown.length?`<span class="av av-more">+${ids.length-shown.length}</span>`:''}</span>`;
}
const exLinked=id=>state.connections.includes(id)?'connected':(state.requests||[]).includes(id)?'requested':'none';
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
function exDetail(id){
  const c=exClasses().find(x=>x.id===id); if(!c)return exMap();
  const v=exVenue(c.venue), d=new Date(c.start);
  const going=c.going.map(exPerson).filter(Boolean);
  return `<div class="cls-detail">
    <button class="plain-link" data-action="ex-back">&larr; Back to the map</button>
    <p class="eyebrow">${escapeHTML(v.brand)} &middot; ${escapeHTML(c.area)}</p>
    <h2>${escapeHTML(c.title)}</h2>
    <p class="cls-when">${d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
      &middot; ${prettyTime(c.start)} &middot; ${c.dur} min &middot; with ${escapeHTML(c.coach)}</p>
    <p class="small">${c.spots} spot${c.spots===1?'':'s'} left of ${c.cap} &middot; sample availability</p>
    <div class="cls-actions">
      ${state.joined.includes(c.id)?`<button class="button small outline" data-action="join-event" data-id="${c.id}" aria-pressed="true">On your plan &#10003;</button>`
      :`<a class="button small" href="#/book/${c.id}">Add to my plan</a>`}
      <a class="text-link" href="#/studios">About ${escapeHTML(v.brand)} ${arrow}</a>
    </div>
    <div class="roster">
      <div class="roster-head">
        <h3>${going.length?`${going.length} VIRI member${going.length===1?'':'s'} going`:'No members going yet'}</h3>
        ${going.length?`<p class="small">Reach out before class so you already know a face.</p>`
          :`<p class="small">Add it to your plan and you will be the first &mdash; anyone browsing this class will see you here.</p>`}
      </div>
      ${going.map(p=>exPersonCard(p,c)).join('')}
    </div>
  </div>`;
}

function exPanel(){return ex.cls?exDetail(ex.cls):exMap();}

/* ---- class list ---- */
function exRow(c){
  const v=exVenue(c.venue);
  return `<button class="cls-row ${ex.cls===c.id?'is-on':''}" data-action="ex-class" data-id="${c.id}">
    <span class="cls-time"><b>${prettyTime(c.start)}</b><span>${c.dur} min</span></span>
    <span class="cls-main">
      <span class="cls-title">${escapeHTML(c.title)}</span>
      <span class="cls-sub">${escapeHTML(v.brand)} &middot; ${escapeHTML(c.area)} &middot; ${escapeHTML(c.coach)}</span>
    </span>
    <span class="cls-going">${c.going.length?exAvatars(c.going,3)+`<span class="cls-n">${c.going.length} going</span>`
      :`<span class="cls-n cls-none">Be the first</span>`}</span>
  </button>`;
}
function exList(){
  const list=exFiltered();
  const head=`<p class="small ex-count" role="status">${list.length} class${list.length===1?'':'es'}${
    ex.venue?` at ${escapeHTML(exVenue(ex.venue).brand)}, ${escapeHTML(exVenue(ex.venue).area)}`:''}
    ${ex.venue?`<button class="plain-link" data-action="ex-venue" data-id="">Clear studio</button>`:''}</p>`;
  if(!list.length)return head+`<div class="empty-state">
    <h3>Nothing on this day yet.</h3><p>Try another day, another activity, or clear the studio filter.</p>
    <button class="button small outline" data-action="ex-reset" style="margin-top:18px">Clear filters</button></div>`;
  return head+`<div class="cls-list">${list.map(exRow).join('')}</div>`;
}

/* ---- page ---- */
function explorePage(){
  return `<section class="page-head"><div class="wrap"><div class="page-head-row">
    <div>
    <h1>Add your classes. Find the people in them.</h1>
    <p>Every studio near you, every class this week, and who from VIRI is already going.</p></div>
  </div></div></section>
  <div class="wrap">
    ${note('Studio locations are approximate and every class time, instructor, roster and member profile in this preview is sample data. Adding a class saves a plan on this device; it does not book anything.')}
    <div class="ex-cities" role="tablist" aria-label="City">${VIRI.cities.map(c=>
      `<button role="tab" class="city-tab ${c.id===ex.city?'active':''}" data-action="ex-city" data-id="${c.id}"
        aria-selected="${c.id===ex.city}">${escapeHTML(c.name)}</button>`).join('')}</div>
    <div class="ex-days">${exDays().map(d=>
      `<button class="day-tab ${d.i===ex.day?'active':''}" data-action="ex-day" data-day="${d.i}"
        aria-pressed="${d.i===ex.day}"><b>${d.label}</b><span>${d.sub}</span></button>`).join('')}</div>
    <div class="toolbar">
      <label class="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg>
        <input type="search" id="ex-search" aria-label="Search classes" placeholder="Search a class, studio or neighborhood" value="${escapeHTML(ex.query)}"></label>
      <select id="ex-time" aria-label="Time of day">${['All','Early','Midday','Evening'].map(t=>
        `<option value="${t}" ${t===ex.time?'selected':''}>${t==='All'?'Any time':t==='Early'?'Before 9am':t==='Midday'?'9am – 4pm':'After 4pm'}</option>`).join('')}</select>
      <button class="chip ${ex.members?'active':''}" data-action="ex-members" aria-pressed="${ex.members}">Members going</button>
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
  const p=exPerson(id); if(!p)return;
  const upcoming=exClasses().filter(c=>c.going.includes(id)&&c.start>Date.now()).slice(0,4);
  openModal(escapeHTML(p.name),`<p class="modal-meta">${escapeHTML(p.area)} &middot; ${escapeHTML((VIRI.cities.find(c=>c.id===p.city)||{}).name||'')}</p>
    <p>${escapeHTML(p.line)}</p>
    <p class="person-cats">${p.cats.map(c=>`<span class="tag">${escapeHTML(c)}</span>`).join('')}</p>
    <p class="small">${p.months} month${p.months===1?'':'s'} on VIRI &middot; ${p.classes} classes logged &middot; illustrative profile</p>
    ${upcoming.length?`<h3 class="modal-sub">Also going to</h3><ul class="modal-list">${upcoming.map(c=>{
      const v=exVenue(c.venue);return `<li>${escapeHTML(c.title)} &middot; ${escapeHTML(v.brand)} &middot; ${prettyDate(c.start)} ${prettyTime(c.start)}</li>`;}).join('')}</ul>`:''}
    <div class="dialog-actions">${exConnectBtn(p)}
      <button class="button small outline" data-action="close-modal">Close</button></div>`);
}
function exConnect(id){
  const p=exPerson(id); if(!p)return;
  if(!state.profile){toast('Create your profile first so they know who is reaching out.');location.hash='#/signup';return;}
  state.requests=state.requests||[];
  if(state.connections.includes(id))return;
  if(state.requests.includes(id)){state.requests=state.requests.filter(x=>x!==id);toast('Request withdrawn.');}
  else{state.requests.push(id);toast(`Request sent to ${p.name}. They will see it before class.`);}
  save();exRefresh();if($('#modal').open)exPersonModal(id);
}


function eventDetails(id){const e=allEvents().find(x=>x.id===id);if(!e)return;const s=studios.find(s=>s.id===e.studio);openModal(escapeHTML(e.title),`<p class="eyebrow">${escapeHTML(e.category)} · ${e.type==='club'?'Community club':'Group activity'}</p><p class="dialog-copy">${prettyDate(e.date)} at ${prettyTime(e.date)}<br>${e.duration} minutes · ${escapeHTML(e.place)}</p>${e.description?`<p style="margin-top:20px">${escapeHTML(e.description)}</p>`:''}<div class="notice-box small">${e.custom?'This activity was created in your local preview. It has not been posted to a live network.':'Example activity and approximate location. This is not a real class schedule or a confirmed booking.'}</div>${s?`<p>Interested in ${s.name}? Check its official site for actual locations, schedules, and booking.</p><p style="margin-top:10px"><a class="text-link" href="${s.url}" target="_blank" rel="noopener">Visit ${s.name} ${arrow}</a></p>`:''}<div class="dialog-actions"><button class="button outline small" data-action="show-map" data-id="${e.id}">Show on map</button><button class="button small" data-action="join-event" data-id="${e.id}">${state.joined.includes(e.id)?'Leave activity':'Join activity'}</button></div>`);}
function toggleJoin(id){const known=allEvents().some(e=>e.id===id)||(typeof exClasses==='function'&&exClasses().some(c=>c.id===id));if(!known)return;const joined=state.joined.includes(id);state.joined=joined?state.joined.filter(x=>x!==id):[...state.joined,id];save();if($('#modal').open)closeModal();render(false);toast(joined?'Removed from your plans.':'Added to your plans. This preview does not make a booking.');}
function studiosPage(id){if(id){const s=studios.find(s=>s.id===id);if(!s)return notFound();return `<section class="page-head"><div class="wrap"><a class="text-link" href="#/studios">${arrowLeft} All studios</a><p class="eyebrow" style="margin-top:28px">${s.category}</p><h1>${s.name}</h1></div></section><div class="wrap studio-detail"><img src="${A+studioPhoto(s)}" alt="A studio space of the kind ${s.name} runs"><div class="studio-description"><h2>${s.intro}</h2><p>${s.description}</p><div class="studio-facts"><div><span class="small">The movement</span><br>${s.focus}</div></div><p class="small"><strong>Before you go</strong><br>${s.bring} Locations, formats, and amenities vary; confirm with the studio.</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px"><a class="button" href="${s.url}" target="_blank" rel="noopener">Visit studio website ${arrow}</a><button class="button outline" data-action="save-studio" data-id="${s.id}" aria-pressed="${state.saved.includes(s.id)}">${state.saved.includes(s.id)?'Saved ✓':'Save studio'}</button></div></div></div><div class="wrap">${note('Studio listings are for discovery. VIRI has no booking integration or confirmed partnership with these brands.')}<div class="community-banner"><div><h3>Find someone to go with.</h3><p>Explore shared plans and people who enjoy ${s.category.toLowerCase()}.</p></div><a href="#/explore" class="button" data-action="studio-explore" data-category="${s.category}">Explore ${s.category.toLowerCase()} ${arrow}</a></div></div>`;}return `<section class="page-head"><div class="wrap"><p class="eyebrow">Discover a new ritual</p><h1>A studio for every kind of you.</h1><p>Add your favorite places to move, then find your people.</p></div></section><section class="wrap" style="padding-bottom:80px"><div class="explore-grid">${studios.map(studioCard).join('')}</div></section>`;}
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
      <div class="letter-ph" role="img" aria-label="Annabel&rsquo;s letter, to come">
        <span class="ph-cap">Annabel&rsquo;s letter<br>to come</span>
      </div>
      <p class="founders-sign"><span class="founder-signature">Annabel</span>
        <span class="founders-role">Annabel Green &middot; Co-founder</span></p>
    </article>
    <figure class="founders-photo" aria-label="Photograph of Margaret and Annabel — to come">
      <span class="ph-mark">${phMark()}</span><span class="ph-cap">A photograph of<br>Margaret &amp; Annabel<br>to come</span>
    </figure>
  </div>
  <a class="button outline founders-cta" href="#/connect">Connect with us ${arrow}</a>
</div></section>${joinSection()}`;}
function contactPage(){return `<section class="page-head"><div class="wrap"><p class="eyebrow">Let’s connect</p><h1>Good things start<br>with a conversation.</h1><p>Meet the people behind VIRI.</p></div></section><div class="wrap"><div class="contact-grid">${[{name:'Margaret Cole',initials:'MC'},{name:'Annabel Green',initials:'AG'}].map(f=>`<article class="contact-card"><div class="founder-monogram">${f.initials}</div><h2>${f.name}</h2><p>Co-founder · Washington, DC</p><p>Building a community around movement, shared routines, and the people nearby.</p><div class="contact-actions"><button class="button small outline" data-action="contact-info" data-name="${f.name}" data-channel="Email">Email ${arrow}</button><button class="button small outline" data-action="contact-info" data-name="${f.name}" data-channel="LinkedIn">LinkedIn ${arrow}</button></div></article>`).join('')}</div><div class="notice-box" style="margin-top:-35px;margin-bottom:70px"><h3>Follow the next chapter.</h3><p style="margin-top:15px">VIRI is on Instagram at <a href="https://www.instagram.com/vitalityritual.co/" target="_blank" rel="noopener">@vitalityritual.co</a>. TikTok and founder contact links are coming soon.</p><p class="small" style="margin-top:12px">Contact details and social account URLs have not been supplied for this preview.</p></div></div>`;}
/* the sign-up screen takes the name only; the rest is asked one question at a
   time on #/join, which starts on the email step because the name is in hand */
function polaroidPage(){return `<section class="pola-page"><div class="pola-field" aria-hidden="true"><span class="pola" style="--l:0%;--t:2%;--r:-8deg;--d:1.0s"><span class="pola-shot"></span></span><span class="pola" style="--l:17%;--t:22%;--r:6deg;--d:3.0s"><span class="pola-shot"></span></span><span class="pola" style="--l:34%;--t:0%;--r:-5deg;--d:0.0s"><span class="pola-shot"></span></span><span class="pola" style="--l:52%;--t:20%;--r:7deg;--d:2.33s"><span class="pola-shot"></span></span><span class="pola" style="--l:70%;--t:2%;--r:-6deg;--d:1.67s"><span class="pola-shot"></span></span><span class="pola" style="--l:78%;--t:46%;--r:5deg;--d:0.67s"><span class="pola-shot"></span></span><span class="pola" style="--l:56%;--t:54%;--r:-7deg;--d:1.33s"><span class="pola-shot"></span></span><span class="pola" style="--l:34%;--t:44%;--r:6deg;--d:2.67s"><span class="pola-shot"></span></span><span class="pola" style="--l:13%;--t:56%;--r:-4deg;--d:0.33s"><span class="pola-shot"></span></span><span class="pola" style="--l:-3%;--t:38%;--r:8deg;--d:2.0s"><span class="pola-shot"></span></span></div><a class="pola-join" href="#/signup" aria-label="Join now"><span class="pola-word" aria-hidden="true"><span style="--i:0">J</span><span style="--i:1">O</span><span style="--i:2">I</span><span style="--i:3">N</span><span class="pola-sp"> </span><span style="--i:4">N</span><span style="--i:5">O</span><span style="--i:6">W</span></span></a><p class="pola-foot">Already have a profile? <a href="#/login">Log in</a></p></section>`;}
function signupPage(){return `<section class="signup-split">
  <figure class="signup-split-shot">
    <img src="${A}signup-viri.webp" alt="A woman in a standing bow pose against a warm wall, with the VIRI wordmark across the picture">
  </figure>
  <div class="signup-split-form">
    <div class="signup-split-inner">
      <p class="eyebrow">Join VIRI</p>
      <h1>Sign up now</h1>
      <p class="signup-split-lede">Start with your name. The rest takes a minute.</p>
      <form id="signup-form" novalidate>
        <div class="field"><label for="su-first">First name</label>
          <input id="su-first" name="first" autocomplete="given-name" maxlength="40"></div>
        <div class="field"><label for="su-last">Last name</label>
          <input id="su-last" name="last" autocomplete="family-name" maxlength="40"></div>
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
    location.hash='#/join';
  });
}
const JOIN_STEPS=[
  {key:'name',type:'text',q:'What should we call you?',hint:'However you introduce yourself in class.',placeholder:'First and last name',autocomplete:'name',required:true},
  {key:'email',type:'email',q:'Where can we reach you?',hint:'Only used to find this profile again in this browser. Nothing is sent.',placeholder:'you@example.com',autocomplete:'email',required:true},
  {key:'area',type:'select',q:'Where do you move?',hint:'The neighborhood you train in most.',options:['Dupont Circle','Georgetown','NoMa','Capitol Hill','Logan Circle','Elsewhere']},
  {key:'interests',type:'checks',q:'What moves you?',hint:'Choose as many as you like.',options:['Pilates','Yoga','Cycling','Running','Barre','Strength']}
];
let joinStep=0, joinData={name:'',email:'',area:'Dupont Circle',interests:[]};
function joinPage(){
  const s=JOIN_STEPS[joinStep], n=JOIN_STEPS.length;
  let control;
  if(s.type==='select')control=`<select id="join-input" name="${s.key}">${s.options.map(o=>`<option${joinData.area===o?' selected':''}>${o}</option>`).join('')}</select>`;
  else if(s.type==='checks')control=`<div class="interest-choices">${s.options.map(o=>`<label><input type="checkbox" name="interests" value="${o}"${joinData.interests.includes(o)?' checked':''}> ${o}</label>`).join('')}</div>`;
  else control=`<input id="join-input" name="${s.key}" type="${s.type}" placeholder="${s.placeholder}" autocomplete="${s.autocomplete}" value="${escapeHTML(joinData[s.key]||'')}" maxlength="80">`;
  return `<section class="join-flow"><div class="join-card">
    <p class="join-count">${String(joinStep+1).padStart(2,'0')} &nbsp;/&nbsp; ${String(n).padStart(2,'0')}</p>
    <h1>${s.q}</h1>
    <p class="join-hint">${s.hint}</p>
    <form id="join-form" class="join-field">${control}
      <p id="join-error" class="field-error" role="alert"></p>
      <div class="join-actions">
        ${joinStep>0?'<button type="button" class="button outline" data-action="join-back">Back</button>':'<a class="button outline" href="#/signup">Back</a>'}
        <button class="button" type="submit">${joinStep===n-1?'Create my profile':`Continue ${arrow}`}</button>
      </div>
    </form>
    <div class="join-progress" aria-hidden="true">${JOIN_STEPS.map((_,i)=>`<span class="${i<=joinStep?'is-on':''}"></span>`).join('')}</div>
    ${note('This creates a demo profile in this browser only. No real account is made and no email is sent.')}
  </div></section>`;}
function bindJoin(){
  const f=$('#join-form');if(!f)return;
  $('#join-input')?.focus();
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const s=JOIN_STEPS[joinStep], err=$('#join-error');
    if(s.type==='checks')joinData.interests=[...f.querySelectorAll('input[name="interests"]:checked')].map(i=>i.value);
    else joinData[s.key]=String(new FormData(f).get(s.key)||'').trim();
    if(s.required&&!joinData[s.key]){err.textContent=s.key==='email'?'Please enter an email address.':'Please enter your name.';return;}
    if(s.key==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(joinData.email)){err.textContent='Please enter a valid email address.';return;}
    if(joinStep<JOIN_STEPS.length-1){joinStep++;render(false);return;}
    state.profile={name:joinData.name,email:joinData.email.toLowerCase(),area:joinData.area,interests:joinData.interests};
    save();joinStep=0;toast('Account created. Two more questions.');location.hash='#/setup';
  });
}
function authPage(){return `<section class="auth-layout"><div class="auth-image"><img src="${A}studio-entry.jpg" alt="Two women arriving at the studio together"><h2>A new ritual.<br>A new circle.<br>A little more you.</h2></div><div class="auth-form"><p class="eyebrow">Welcome back</p><h1>Back to your circle.</h1><p>Open the profile saved on this device.</p>${note('This is a local demo login. No password or email is sent.')}<form id="auth-form"><div class="field"><label for="auth-email">Email address</label><input id="auth-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required></div><p id="auth-error" class="field-error" role="alert"></p><button class="button" type="submit" style="margin-top:18px">Open my profile</button></form><p class="small">New here? <a href="#/signup">Join VIRI</a></p></div></section>`;}
function bindAuth(){$('#auth-form')?.addEventListener('submit',e=>{e.preventDefault();const email=String(new FormData(e.target).get('email')).trim().toLowerCase();if(!state.profile||state.profile.email!==email){$('#auth-error').textContent='No profile with that email is saved in this browser. Create a demo profile to begin.';return;}toast('Welcome back to your circle.');location.hash='#/';});}

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
  if(!state.joined.includes(c.id)){state.joined=[...state.joined,c.id];save();}
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
function setupPage(){
  const p=state.profile;
  if(!p)return authPage();
  const areas=(VIRI.cities.find(c=>c.id==='dc')||VIRI.cities[0]).areas.map(a=>a.n);
  return `<div class="wrap handoff"><div class="handoff-card">
    <div class="setup-steps"><span class="setup-step">01 Account</span><span class="setup-rule"></span>
      <span class="setup-step is-on">02 Your profile</span><span class="setup-rule"></span>
      <span class="setup-step">03 Your circle</span></div>
    <p class="eyebrow">Welcome, ${escapeHTML(p.name.split(' ')[0])}</p>
    <h1>Tell people who they are meeting.</h1>
    <p>This is what someone sees when they find you on a class roster. Everything here can be changed later.</p>
    ${note('Draft fields — Margaret is still deciding what the real sign-up asks for. Saved to this device only.')}
    <form id="setup-form" style="margin-top:8px">
      <div class="setup-photo"><span class="av">${escapeHTML(initials(p.name))}</span>
        <span>A profile photo goes here. Upload is not wired up in the preview — your initials stand in for now.</span></div>
      <div class="field"><label for="su-area">Your neighborhood</label>
        <select id="su-area" name="area">${areas.concat(['Elsewhere']).map(x=>
          `<option ${x===p.area?'selected':''}>${escapeHTML(x)}</option>`).join('')}</select></div>
      <fieldset class="interest-fieldset"><legend>What you do</legend>
        <div class="interest-choices">${VIRI.categories.map(c=>
          `<label><input type="checkbox" name="interests" value="${c}" ${(p.interests||[]).includes(c)?'checked':''}> ${c}</label>`).join('')}</div>
      </fieldset>
      <fieldset class="interest-fieldset"><legend>When you usually go</legend>
        <div class="interest-choices">${SETUP_TIMES.map(t=>
          `<label><input type="checkbox" name="times" value="${t}" ${(p.times||[]).includes(t)?'checked':''}> ${t}</label>`).join('')}</div>
      </fieldset>
      <div class="field"><label for="su-line">One line about you</label>
        <input id="su-line" name="line" maxlength="120" placeholder="Signed up for a 10k and need people to run it with."
          value="${escapeHTML(p.line||'')}"></div>
      <p id="setup-error" class="field-error" role="alert"></p>
      <button class="button" type="submit" style="margin-top:6px">Save and see my circle</button>
    </form>
    <p class="handoff-foot"><a class="plain-link" href="#/">Skip for now</a></p>
  </div></div>`;
}
function bindSetup(){
  $('#setup-form')?.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const interests=fd.getAll('interests');
    if(!interests.length){$('#setup-error').textContent='Pick at least one thing you do — it is how people find you.';return;}
    state.profile={...state.profile,area:fd.get('area'),interests,times:fd.getAll('times'),
      line:String(fd.get('line')).trim()};
    save();toast('Your profile is set. This is what a class roster will show.');
    location.hash='#/';
  });
}
function eventCard(e){const joined=state.joined.includes(e.id);return `<article class="event-card">${e.img
  ?`<img src="${A+e.img}" alt="${escapeHTML(e.category)} community activity" loading="lazy">`
  :`<span class="card-ph" role="img" aria-label="Photograph to come"><span class="ph-mark">${phMark()}</span><span class="ph-cap">Photo<br>to come</span></span>`}<div class="event-info"><p class="event-meta">${escapeHTML(e.category)} · ${escapeHTML(e.area)}</p><h3>${escapeHTML(e.title)}</h3><p>${prettyDate(e.date)} · ${prettyTime(e.date)} · ${e.duration} min</p><p class="small">${escapeHTML(e.host)}</p><div class="event-bottom"><span class="small">${e.people+(joined?1:0)} ${e.type==='club'?'members':'people going'}</span><button class="button small ${joined?'outline':''}" data-action="join-event" data-id="${e.id}" aria-pressed="${joined}">${joined?'Joined ✓':e.type==='club'?'Join club':'Join activity'}</button></div><button class="plain-link small" style="margin-top:13px" data-action="event-details" data-id="${e.id}">View details & location</button></div></article>`;}
function postActivity(){openModal('How did you move today?',`<p class="small" style="margin-bottom:20px">Post to your local preview feed and earn 100 demo ritual points.</p><form id="post-form"><div class="field"><label for="post-title">Your activity</label><input id="post-title" name="title" required maxlength="70" placeholder="A lunchtime walk with a friend"></div><div class="field"><label for="post-duration">Minutes</label><input id="post-duration" name="duration" type="number" min="1" max="1440" value="45" required></div><div class="field"><label for="post-description">How was it?</label><textarea id="post-description" name="description" maxlength="400" placeholder="Share a little about your ritual."></textarea></div><div class="dialog-actions"><button class="button small" type="submit">Post activity</button></div></form>`,()=>$('#post-form').addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));if(!f.title.trim())return;state.posts.push({...f,title:f.title.trim(),duration:Number(f.duration),date:new Date().toISOString()});save();closeModal();render(false);toast('Activity added. You earned 100 demo ritual points.');}));}
function legalPage(privacy){return `<article class="article-detail"><p class="eyebrow">VIRI preview</p><h1>${privacy?'Your privacy':'About this preview'}</h1>${privacy?'<p>Your demo profile, saved studios, activities, connections, and posts are stored in this browser’s local storage. They are not sent to a VIRI account service.</p><p>The map loads from OpenStreetMap. Opening external studio and research links takes you to those websites, which have their own privacy practices.</p><p>This notice describes the prototype. A launch privacy policy will be provided before live accounts become available.</p><button class="button outline" data-action="clear-preview">Clear my preview data</button>':'<p>This website is an interactive preview of VIRI. Demo profiles, events, reviews, attendance counts, and rewards are illustrative. No class reservation, purchase, message, or live social connection is made through the preview.</p><p>Studio names and photographs identify the respective businesses. Listings do not imply a partnership or endorsement. Visit each studio’s official website to confirm schedules, prices, requirements, and bookings.</p><p>Launch terms will be provided before real accounts or bookings are available.</p>'}</article>`;}
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
function render(scroll=true){revealObserver?.disconnect();const [path,id]=(location.hash.replace(/^#\/?/,'')||'').split('/');let html;switch(path){case '':html=home();break;case 'explore':html=explorePage();break;case 'studios':html=studiosPage(id);break;case 'read':html=readPage(id);break;case 'about':html=aboutPage();break;case 'connect':html=contactPage();break;case 'signup':html=signupPage();break;case 'start':html=polaroidPage();break;case 'join':html=joinPage();break;case 'login':html=authPage();break;case 'profile':location.replace('#/signup');return;case 'setup':html=setupPage();break;case 'book':html=bookPage(id);break;case 'privacy':html=legalPage(true);break;case 'terms':html=legalPage(false);break;default:html=notFound();}$('#main').innerHTML=html;renderFooter();const names={'':'Vitality Ritual',explore:'Explore',studios:'Studios',read:'The VIRI edit',about:'About us',connect:'Connect',signup:'Sign up',start:'Join now',join:'Create your profile',login:'Welcome back',profile:'Your circle',setup:'Your profile',book:'Book this class',privacy:'Your privacy',terms:'Preview terms'};document.title=`VIRI — ${names[path]||'Find your way'}`;$$('.site-header nav a').forEach(a=>{if(a.getAttribute('href')===`#/${path}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});$('#menu-panel').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');if(scroll){window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true});}initPageMotion();if(path==='login')bindAuth();if(path==='signup')bindSignup();if(path==='join')bindJoin();if(path==='setup')bindSetup();
  $('#subscribe-form')?.addEventListener('submit',e=>{e.preventDefault();
    toast('Saved on this device only \u2014 the preview does not send email.');e.target.reset();});if(path==='explore'){$('#ex-search').addEventListener('input',e=>{ex.query=e.target.value;exRefresh();});$('#ex-time').addEventListener('change',e=>{ex.time=e.target.value;exRefresh();});exBindMap();}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-action]');if(!t)return;const {action,id,index,category,view,kind,name,channel}=t.dataset;switch(action){case 'video-toggle':{const v=$('#'+(t.dataset.video||'about-video'));if(v.paused)v.play().catch(()=>toast('Video playback is unavailable in this browser.'));else v.pause();break;}case 'close-modal':closeModal();break;case 'join-back':joinStep=Math.max(0,joinStep-1);render(false);break;case 'studio-prev':studioIndex=Math.max(0,studioIndex-1);$('#studio-grid').innerHTML=studioCards();syncStudioNav();break;case 'studio-next':studioIndex=Math.min(STUDIO_LAST(),studioIndex+1);$('#studio-grid').innerHTML=studioCards();syncStudioNav();break;case 'ex-city':ex={...ex,city:t.dataset.id,venue:null,cls:null};render(false);break;
case 'ex-day':ex={...ex,day:+t.dataset.day,cls:null};render(false);break;
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
case 'ex-reset':ex={...ex,cat:'All',time:'All',members:false,query:'',venue:null,cls:null};render(false);break;
case 'reset-filters':explore={...explore,query:'',category:'All',area:'All neighborhoods'};render(false);break;case 'event-details':eventDetails(id);break;case 'join-event':toggleJoin(id);break;case 'show-map':closeModal();const target=allEvents().find(x=>x.id===id);explore={...explore,selected:id,kind:target?.type==='club'?'clubs':'classes',view:'map',category:'All',area:'All neighborhoods',query:''};if(location.hash!=='#/explore')location.hash='#/explore';else render(false);break;case 'save-studio':state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];save();render(false);toast(state.saved.includes(id)?'Studio saved to your profile.':'Studio removed from your saved list.');break;case 'studio-explore':explore={...explore,category,kind:'classes'};break;case 'post-activity':postActivity();break;case 'connect-sample':state.connections=state.connections.includes('alex')?[]:['alex'];save();render(false);toast(state.connections.length?'Sample connection added to your preview.':'Sample connection removed.');break;case 'edit-profile':openModal('Make your profile yours',`<form id="edit-form"><div class="field"><label for="edit-name">Your name</label><input id="edit-name" name="name" value="${escapeHTML(state.profile?.name)}" required maxlength="60"></div><div class="field"><label for="edit-area">Your neighborhood</label><input id="edit-area" name="area" value="${escapeHTML(state.profile?.area)}" required maxlength="70"></div><div class="dialog-actions"><button class="button small" type="submit">Save profile</button></div></form>`,()=>$('#edit-form').addEventListener('submit',ev=>{ev.preventDefault();const f=Object.fromEntries(new FormData(ev.target));if(!f.name.trim()||!f.area.trim())return;state.profile={...state.profile,name:f.name.trim(),area:f.area.trim()};save();closeModal();render(false);toast('Profile updated.');}));break;case 'contact-info':openModal(`Connect with ${escapeHTML(name)}`,`<p class="dialog-copy">${escapeHTML(channel)} details will appear here when ${escapeHTML(name)}’s contact link is added.</p><p class="small" style="margin-top:18px">The website script did not include a verified ${escapeHTML(channel.toLowerCase())} address.</p><div class="dialog-actions"><button class="button small" data-action="close-modal">Got it</button></div>`);break;case 'clear-preview':openModal('Clear your preview?',`<p class="dialog-copy">This removes your demo profile, plans, posts, connections, and saved studios from this browser.</p><div class="dialog-actions"><button class="button outline small" data-action="close-modal">Keep my preview</button><button class="button small" data-action="confirm-clear">Clear preview</button></div>`);break;case 'confirm-clear':state={profile:null,joined:[],saved:[],created:[],posts:[],connections:[]};save();closeModal();render(false);toast('Your preview data has been cleared.');break;case 'credits':openModal('Photography',`<p class="dialog-copy">Images are shown for this design preview. Studio photography belongs to the respective brands and photographers.</p><p style="margin-top:18px">Running photograph: Tyler Nix / Unsplash, via Shape Republic. Pilates studio: Ohouse. Yoga class: Three Birds Yoga. Yoga mats: Mayo Clinic News Network. Brand imagery: CycleBar, [solidcore], Pure Barre, CorePower Yoga, SoulCycle, Orangetheory, Club Pilates, and Barry’s.</p><p class="small" style="margin-top:18px">Community photographs are AI-generated originals; the lifestyle photography was supplied for this preview.</p>`);break;}});
$('#menu-button').addEventListener('click',()=>{const open=$('#menu-panel').hidden;$('#menu-panel').hidden=!open;$('#menu-button').setAttribute('aria-expanded',String(open));});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header')){$('#menu-panel').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#menu-panel').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');}});
window.addEventListener('hashchange',()=>{if($('#modal').open)closeModal();render();});
initWordmark();
render(false);
