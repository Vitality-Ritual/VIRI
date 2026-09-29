/* VIRI — explore dataset.
   Studio names are real brands; the coordinates are approximate and every class time,
   instructor, roster and member profile below is invented sample data for this prototype.
   See README-explore.md for where the real versions of each field would come from. */
(function (root) {
  'use strict';

  /* ---------- deterministic pseudo-random, so the schedule is stable ---------- */
  function hash(str) {
    var h = 2166136261, i;
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = hash(String(seed));
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

  /* ---------- cities ----------------------------------------------------------
     `water` and `green` are deliberately coarse polylines — enough to orient the
     eye, not a survey. The map is drawn from these, not from a tile service. */
  var CITIES = [
    { id: 'dc', name: 'Washington, DC', short: 'DC',
      water: [
        [[-77.128,38.936],[-77.098,38.918],[-77.070,38.902],[-77.056,38.895],[-77.045,38.876],[-77.035,38.856],[-77.021,38.838]],
        [[-76.948,38.905],[-76.972,38.888],[-76.995,38.868],[-77.009,38.852],[-77.015,38.838]]
      ],
      green: [
        [[-77.050,38.8885],[-77.015,38.8885],[-77.015,38.8945],[-77.050,38.8945]],
        [[-77.057,38.962],[-77.049,38.940],[-77.052,38.922],[-77.058,38.906]]
      ],
      areas: [
        { n: 'Georgetown', lon: -77.0640, lat: 38.9080 },
        { n: 'Dupont Circle', lon: -77.0434, lat: 38.9096 },
        { n: 'Logan Circle', lon: -77.0295, lat: 38.9096 },
        { n: 'U Street', lon: -77.0300, lat: 38.9170 },
        { n: 'Adams Morgan', lon: -77.0420, lat: 38.9215 },
        { n: 'Capitol Hill', lon: -76.9950, lat: 38.8890 },
        { n: 'Navy Yard', lon: -77.0030, lat: 38.8760 },
        { n: 'Foggy Bottom', lon: -77.0500, lat: 38.9000 }
      ] },
    { id: 'nyc', name: 'New York City', short: 'NYC',
      water: [
        [[-74.019,40.702],[-74.014,40.726],[-74.009,40.750],[-74.000,40.775],[-73.991,40.798]],
        [[-73.972,40.708],[-73.968,40.732],[-73.958,40.756],[-73.944,40.778]]
      ],
      green: [ [[-73.982,40.768],[-73.949,40.797],[-73.958,40.801],[-73.990,40.772]] ],
      areas: [
        { n: 'West Village', lon: -74.0030, lat: 40.7350 },
        { n: 'SoHo', lon: -74.0000, lat: 40.7240 },
        { n: 'Tribeca', lon: -74.0090, lat: 40.7170 },
        { n: 'Chelsea', lon: -74.0000, lat: 40.7460 },
        { n: 'Flatiron', lon: -73.9900, lat: 40.7410 },
        { n: 'Upper East Side', lon: -73.9600, lat: 40.7740 },
        { n: 'Upper West Side', lon: -73.9780, lat: 40.7840 },
        { n: 'Williamsburg', lon: -73.9570, lat: 40.7140 }
      ] },
    { id: 'la', name: 'Los Angeles', short: 'LA',
      water: [ [[-118.520,34.035],[-118.500,34.012],[-118.485,33.995],[-118.460,33.978],[-118.430,33.955]] ],
      green: [ [[-118.320,34.118],[-118.283,34.118],[-118.283,34.152],[-118.320,34.152]] ],
      areas: [
        { n: 'Santa Monica', lon: -118.4900, lat: 34.0190 },
        { n: 'Venice', lon: -118.4700, lat: 33.9910 },
        { n: 'Brentwood', lon: -118.4720, lat: 34.0520 },
        { n: 'West Hollywood', lon: -118.3810, lat: 34.0900 },
        { n: 'Culver City', lon: -118.3960, lat: 34.0210 },
        { n: 'Silver Lake', lon: -118.2700, lat: 34.0870 },
        { n: 'Downtown LA', lon: -118.2500, lat: 34.0450 },
        { n: 'Pasadena', lon: -118.1440, lat: 34.1470 }
      ] },
    { id: 'mia', name: 'Miami', short: 'MIA',
      water: [
        [[-80.131,25.762],[-80.124,25.788],[-80.122,25.812],[-80.120,25.840]],
        [[-80.192,25.756],[-80.187,25.784],[-80.182,25.808],[-80.178,25.834]]
      ],
      green: [ [[-80.176,25.740],[-80.164,25.740],[-80.164,25.752],[-80.176,25.752]] ],
      areas: [
        { n: 'South Beach', lon: -80.1320, lat: 25.7810 },
        { n: 'Mid-Beach', lon: -80.1250, lat: 25.8130 },
        { n: 'Brickell', lon: -80.1930, lat: 25.7600 },
        { n: 'Downtown', lon: -80.1930, lat: 25.7760 },
        { n: 'Wynwood', lon: -80.1990, lat: 25.8010 },
        { n: 'Design District', lon: -80.1930, lat: 25.8130 },
        { n: 'Edgewater', lon: -80.1870, lat: 25.7930 },
        { n: 'Coconut Grove', lon: -80.2420, lat: 25.7280 }
      ] },
    { id: 'bos', name: 'Boston', short: 'BOS',
      water: [
        [[-71.118,42.358],[-71.096,42.353],[-71.075,42.355],[-71.058,42.361],[-71.045,42.366]],
        [[-71.040,42.345],[-71.028,42.352],[-71.020,42.360]]
      ],
      green: [ [[-71.0710,42.3525],[-71.0620,42.3525],[-71.0620,42.3585],[-71.0710,42.3585]] ],
      areas: [
        { n: 'Back Bay', lon: -71.0800, lat: 42.3500 },
        { n: 'South End', lon: -71.0740, lat: 42.3410 },
        { n: 'Beacon Hill', lon: -71.0660, lat: 42.3580 },
        { n: 'Seaport', lon: -71.0430, lat: 42.3520 },
        { n: 'Fenway', lon: -71.0970, lat: 42.3450 },
        { n: 'Cambridge', lon: -71.1050, lat: 42.3730 },
        { n: 'Somerville', lon: -71.0990, lat: 42.3870 },
        { n: 'North End', lon: -71.0540, lat: 42.3650 }
      ] },
    { id: 'chi', name: 'Chicago', short: 'CHI',
      water: [ [[-87.605,41.855],[-87.608,41.885],[-87.615,41.905],[-87.627,41.930],[-87.644,41.960]] ],
      green: [ [[-87.622,41.870],[-87.612,41.870],[-87.612,41.890],[-87.622,41.890]] ],
      areas: [
        { n: 'West Loop', lon: -87.6470, lat: 41.8830 },
        { n: 'River North', lon: -87.6340, lat: 41.8920 },
        { n: 'Gold Coast', lon: -87.6280, lat: 41.9050 },
        { n: 'Lincoln Park', lon: -87.6470, lat: 41.9220 },
        { n: 'Lakeview', lon: -87.6530, lat: 41.9400 },
        { n: 'Wicker Park', lon: -87.6760, lat: 41.9080 },
        { n: 'Logan Square', lon: -87.7070, lat: 41.9280 },
        { n: 'South Loop', lon: -87.6270, lat: 41.8670 }
      ] },
    { id: 'phl', name: 'Philadelphia', short: 'PHL',
      water: [
        [[-75.186,39.985],[-75.182,39.962],[-75.178,39.948],[-75.170,39.938],[-75.155,39.930]],
        [[-75.132,39.968],[-75.138,39.948],[-75.143,39.930],[-75.148,39.916]]
      ],
      green: [ [[-75.1760,39.9490],[-75.1700,39.9490],[-75.1700,39.9530],[-75.1760,39.9530]] ],
      areas: [
        { n: 'Rittenhouse', lon: -75.1720, lat: 39.9490 },
        { n: 'Graduate Hospital', lon: -75.1780, lat: 39.9400 },
        { n: 'Old City', lon: -75.1440, lat: 39.9520 },
        { n: 'Northern Liberties', lon: -75.1400, lat: 39.9650 },
        { n: 'Fishtown', lon: -75.1300, lat: 39.9720 },
        { n: 'University City', lon: -75.1940, lat: 39.9530 },
        { n: 'Fairmount', lon: -75.1720, lat: 39.9680 },
        { n: 'Queen Village', lon: -75.1470, lat: 39.9380 }
      ] },
    { id: 'atl', name: 'Atlanta', short: 'ATL',
      water: [],
      green: [ [[-84.3760,33.7830],[-84.3630,33.7830],[-84.3630,33.7930],[-84.3760,33.7930]] ],
      areas: [
        { n: 'Midtown', lon: -84.3850, lat: 33.7830 },
        { n: 'Old Fourth Ward', lon: -84.3660, lat: 33.7620 },
        { n: 'Inman Park', lon: -84.3530, lat: 33.7610 },
        { n: 'Virginia-Highland', lon: -84.3540, lat: 33.7790 },
        { n: 'West Midtown', lon: -84.4130, lat: 33.7860 },
        { n: 'Buckhead', lon: -84.3800, lat: 33.8380 },
        { n: 'Downtown', lon: -84.3880, lat: 33.7550 },
        { n: 'Grant Park', lon: -84.3700, lat: 33.7360 }
      ] }
  ];

  /* ---------- studios ---------------------------------------------------------
     Placed near the named neighborhood. Approximate — not surveyed addresses. */
  function V(id, brand, city, area, lon, lat, cat) {
    return { id: id, brand: brand, city: city, area: area, lon: lon, lat: lat, cat: cat };
  }
  var VENUES = [
    /* Washington, DC */
    V('dc-sc-14', '[solidcore]', 'dc', 'Logan Circle', -77.0318, 38.9092, 'Strength'),
    V('dc-sc-gt', '[solidcore]', 'dc', 'Georgetown', -77.0625, 38.9052, 'Strength'),
    V('dc-pb-du', 'Pure Barre', 'dc', 'Dupont Circle', -77.0448, 38.9112, 'Barre'),
    V('dc-cp-du', 'CorePower Yoga', 'dc', 'Dupont Circle', -77.0412, 38.9078, 'Yoga'),
    V('dc-sl-gt', 'SoulCycle', 'dc', 'Georgetown', -77.0668, 38.9042, 'Cycling'),
    V('dc-br-cc', 'Barry’s', 'dc', 'U Street', -77.0316, 38.9172, 'Strength'),
    V('dc-cl-nv', 'Club Pilates', 'dc', 'Navy Yard', -77.0022, 38.8772, 'Pilates'),
    V('dc-ot-ch', 'Orangetheory Fitness', 'dc', 'Capitol Hill', -76.9962, 38.8902, 'Strength'),
    V('dc-cb-am', 'CycleBar', 'dc', 'Adams Morgan', -77.0428, 38.9208, 'Cycling'),
    /* New York */
    V('ny-sl-wv', 'SoulCycle', 'nyc', 'West Village', -74.0038, 40.7340, 'Cycling'),
    V('ny-br-ch', 'Barry’s', 'nyc', 'Chelsea', -74.0016, 40.7448, 'Strength'),
    V('ny-sc-fl', '[solidcore]', 'nyc', 'Flatiron', -73.9906, 40.7402, 'Strength'),
    V('ny-pb-ue', 'Pure Barre', 'nyc', 'Upper East Side', -73.9588, 40.7752, 'Barre'),
    V('ny-cp-uw', 'CorePower Yoga', 'nyc', 'Upper West Side', -73.9790, 40.7828, 'Yoga'),
    V('ny-cl-wb', 'Club Pilates', 'nyc', 'Williamsburg', -73.9580, 40.7150, 'Pilates'),
    V('ny-cb-so', 'CycleBar', 'nyc', 'SoHo', -74.0012, 40.7236, 'Cycling'),
    V('ny-ot-tr', 'Orangetheory Fitness', 'nyc', 'Tribeca', -74.0082, 40.7180, 'Strength'),
    /* Los Angeles */
    V('la-sl-wh', 'SoulCycle', 'la', 'West Hollywood', -118.3798, 34.0902, 'Cycling'),
    V('la-br-wh', 'Barry’s', 'la', 'West Hollywood', -118.3848, 34.0880, 'Strength'),
    V('la-sc-sm', '[solidcore]', 'la', 'Santa Monica', -118.4912, 34.0202, 'Strength'),
    V('la-cp-br', 'CorePower Yoga', 'la', 'Brentwood', -118.4712, 34.0532, 'Yoga'),
    V('la-pb-cc', 'Pure Barre', 'la', 'Culver City', -118.3948, 34.0222, 'Barre'),
    V('la-cl-sl', 'Club Pilates', 'la', 'Silver Lake', -118.2716, 34.0862, 'Pilates'),
    V('la-cb-pa', 'CycleBar', 'la', 'Pasadena', -118.1452, 34.1462, 'Cycling'),
    V('la-ot-ve', 'Orangetheory Fitness', 'la', 'Venice', -118.4686, 33.9922, 'Strength'),
    /* Miami */
    V('mi-br-sb', 'Barry’s', 'mia', 'South Beach', -80.1306, 25.7862, 'Strength'),
    V('mi-sl-sb', 'SoulCycle', 'mia', 'South Beach', -80.1332, 25.7902, 'Cycling'),
    V('mi-sc-br', '[solidcore]', 'mia', 'Brickell', -80.1936, 25.7612, 'Strength'),
    V('mi-cp-br', 'CorePower Yoga', 'mia', 'Brickell', -80.1918, 25.7648, 'Yoga'),
    V('mi-pb-cg', 'Pure Barre', 'mia', 'Coconut Grove', -80.2424, 25.7288, 'Barre'),
    V('mi-cl-wy', 'Club Pilates', 'mia', 'Wynwood', -80.1988, 25.8022, 'Pilates'),
    V('mi-ot-ed', 'Orangetheory Fitness', 'mia', 'Edgewater', -80.1874, 25.7942, 'Strength'),
    /* Boston */
    V('bo-br-bb', 'Barry’s', 'bos', 'Back Bay', -71.0806, 42.3486, 'Strength'),
    V('bo-sl-bb', 'SoulCycle', 'bos', 'Back Bay', -71.0832, 42.3494, 'Cycling'),
    V('bo-sc-se', '[solidcore]', 'bos', 'South End', -71.0736, 42.3418, 'Strength'),
    V('bo-cp-ca', 'CorePower Yoga', 'bos', 'Cambridge', -71.1048, 42.3722, 'Yoga'),
    V('bo-pb-bh', 'Pure Barre', 'bos', 'Beacon Hill', -71.0668, 42.3576, 'Barre'),
    V('bo-cl-sp', 'Club Pilates', 'bos', 'Seaport', -71.0438, 42.3516, 'Pilates'),
    V('bo-ot-so', 'Orangetheory Fitness', 'bos', 'Somerville', -71.0982, 42.3868, 'Strength'),
    /* Chicago */
    V('ch-sl-rn', 'SoulCycle', 'chi', 'River North', -87.6348, 41.8928, 'Cycling'),
    V('ch-br-wl', 'Barry’s', 'chi', 'West Loop', -87.6462, 41.8842, 'Strength'),
    V('ch-sc-rn', '[solidcore]', 'chi', 'River North', -87.6312, 41.8946, 'Strength'),
    V('ch-cp-lp', 'CorePower Yoga', 'chi', 'Lincoln Park', -87.6468, 41.9226, 'Yoga'),
    V('ch-pb-gc', 'Pure Barre', 'chi', 'Gold Coast', -87.6282, 41.9046, 'Barre'),
    V('ch-cl-wp', 'Club Pilates', 'chi', 'Wicker Park', -87.6752, 41.9082, 'Pilates'),
    V('ch-cb-lv', 'CycleBar', 'chi', 'Lakeview', -87.6524, 41.9398, 'Cycling'),
    V('ch-ot-sl', 'Orangetheory Fitness', 'chi', 'South Loop', -87.6266, 41.8672, 'Strength'),
    /* Philadelphia */
    V('ph-sc-ri', '[solidcore]', 'phl', 'Rittenhouse', -75.1728, 39.9494, 'Strength'),
    V('ph-sl-ri', 'SoulCycle', 'phl', 'Rittenhouse', -75.1748, 39.9478, 'Cycling'),
    V('ph-cp-ri', 'CorePower Yoga', 'phl', 'Rittenhouse', -75.1706, 39.9506, 'Yoga'),
    V('ph-pb-gh', 'Pure Barre', 'phl', 'Graduate Hospital', -75.1784, 39.9406, 'Barre'),
    V('ph-cl-fi', 'Club Pilates', 'phl', 'Fishtown', -75.1306, 39.9724, 'Pilates'),
    V('ph-ot-nl', 'Orangetheory Fitness', 'phl', 'Northern Liberties', -75.1404, 39.9652, 'Strength'),
    V('ph-cb-uc', 'CycleBar', 'phl', 'University City', -75.1944, 39.9534, 'Cycling'),
    /* Atlanta */
    V('at-br-mi', 'Barry’s', 'atl', 'Midtown', -84.3846, 33.7836, 'Strength'),
    V('at-sc-mi', '[solidcore]', 'atl', 'Midtown', -84.3822, 33.7862, 'Strength'),
    V('at-cp-of', 'CorePower Yoga', 'atl', 'Old Fourth Ward', -84.3664, 33.7624, 'Yoga'),
    V('at-pb-bu', 'Pure Barre', 'atl', 'Buckhead', -84.3804, 33.8384, 'Barre'),
    V('at-cl-wm', 'Club Pilates', 'atl', 'West Midtown', -84.4126, 33.7864, 'Pilates'),
    V('at-cb-ip', 'CycleBar', 'atl', 'Inman Park', -84.3534, 33.7614, 'Cycling'),
    V('at-ot-vh', 'Orangetheory Fitness', 'atl', 'Virginia-Highland', -84.3544, 33.7794, 'Strength'),
    /* Barre3 — one in every city. Neighbourhoods chosen to sit away from the
       existing barre studio in each, so the map does not stack two pins. */
    V('dc-b3-sh', 'Barre3', 'dc', 'Shaw', -77.0220, 38.9134, 'Barre'),
    V('ny-b3-bh', 'Barre3', 'nyc', 'Brooklyn Heights', -73.9936, 40.6960, 'Barre'),
    V('la-b3-lr', 'Barre3', 'la', 'Larchmont', -118.3244, 34.0760, 'Barre'),
    V('mi-b3-gb', 'Barre3', 'mia', 'Coral Gables', -80.2588, 25.7506, 'Barre'),
    V('bo-b3-fw', 'Barre3', 'bos', 'Fenway', -71.0972, 42.3448, 'Barre'),
    V('ch-b3-ot', 'Barre3', 'chi', 'Old Town', -87.6382, 41.9106, 'Barre'),
    V('ph-b3-oc', 'Barre3', 'phl', 'Old City', -75.1450, 39.9510, 'Barre'),
    V('at-b3-vh', 'Barre3', 'atl', 'Poncey-Highland', -84.3596, 33.7716, 'Barre')
  ];

  /* ---------- sample members --------------------------------------------------
     Invented people. Names, lines and histories are illustrative. */
  var FIRST = ['Amara','Nadia','Priya','Sloane','Tessa','Imani','Farah','Devon','Rosa','Maeve',
    'Camille','Noor','Yuki','Bex','Georgia','Simone','Leila','Anais','Jordan','Talia',
    'Océane','Ingrid','Marisol','Bridget','Kiara','Elodie','Hana','Sasha','Wren','Delphine',
    'Naomi','Carys','Zaria','Margot','Sunniva','Lucia','Rhea','Etta','Paloma','Solveig'];
  var LAST = ['A.','B.','C.','D.','E.','F.','G.','H.','K.','L.','M.','N.','O.','P.','R.','S.','T.','V.','W.','Z.'];
  var LINES = [
    'Signed up for a 10k and now I need people to run it with.',
    'Reformer four mornings a week. Coffee after is non-negotiable.',
    'New to the city and rebuilding a routine from scratch.',
    'I will take any class that starts before 7am.',
    'Trading marathon training for something my knees agree with.',
    'Looking for one standing class a week with the same faces.',
    'Barre convert. Still bad at it. Going anyway.',
    'Back after a long break and starting gently.',
    'I go harder when someone is expecting me.',
    'Weekend long runs, weekday reformer, no in-between.',
    'Moved for work and my whole circle is still back home.',
    'Cycling is the only cardio I have ever actually enjoyed.',
    'Trying to make fitness the social thing, not the solo thing.',
    'Two kids, two mornings a week, fiercely protected.'
  ];
  var CATS = ['Pilates','Yoga','Cycling','Barre','Strength','Running'];

  var PEOPLE = (function () {
    var out = [], ci, k;
    for (ci = 0; ci < CITIES.length; ci++) {
      var city = CITIES[ci];
      for (k = 0; k < 14; k++) {
        var r = rng(city.id + ':person:' + k);
        var first = FIRST[Math.floor(r() * FIRST.length)];
        var last = LAST[Math.floor(r() * LAST.length)];
        var nCats = 1 + Math.floor(r() * 2);
        var cats = [], guard = 0;
        while (cats.length < nCats && guard++ < 20) {
          var c = pick(r, CATS);
          if (cats.indexOf(c) < 0) cats.push(c);
        }
        out.push({
          id: city.id + '-p' + k,
          name: first + ' ' + last,
          city: city.id,
          area: pick(r, city.areas).n,
          cats: cats,
          line: pick(r, LINES),
          months: 1 + Math.floor(r() * 22),
          classes: 4 + Math.floor(r() * 90)
        });
      }
    }
    return out;
  })();

  /* ---------- classes ---------------------------------------------------------
     Generated for the next 7 days, deterministically per studio per day. */
  var TITLES = {
    Pilates:  ['Reformer Flow','Full Body 50','Core & Restore','Slow Burn','Reformer 45'],
    Yoga:     ['Vinyasa Flow','Slow Flow','Power Hour','Candlelight Yin','Sculpt'],
    Cycling:  ['Theme Ride 45','Climb & Sprint','Rhythm Ride','Sunrise 45','Ride & Restore'],
    Barre:    ['Classic Barre','Barre Cardio','Express 45','Barre & Burn','Reform'],
    Strength: ['Full Body','Lower Body 50','Upper & Core','Total Body','Run + Lift'],
    Running:  ['Track Tuesday','Easy Miles','Tempo Run','Long Run Sunday','Bridge Loop']
  };
  var COACHES = ['Ivy','Reese','Dani','Moira','Priya','Joss','Talia','Nell','Sabine','Kit',
    'Roma','June','Vida','Esme','Lark','Nour','Cleo','Mika'];
  var SLOTS = [[6,0],[6,45],[7,30],[8,15],[9,0],[12,10],[16,45],[17,30],[18,15],[19,0]];

  function midnight(offset) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d;
  }

  function buildClasses() {
    var out = [], v, day, i;
    var byCity = {};
    PEOPLE.forEach(function (p) { (byCity[p.city] = byCity[p.city] || []).push(p); });

    for (v = 0; v < VENUES.length; v++) {
      var venue = VENUES[v];
      var roster = byCity[venue.city] || [];
      for (day = 0; day < 7; day++) {
        var r = rng(venue.id + ':' + day);
        var count = 2 + Math.floor(r() * 3);            /* 2–4 classes a day */
        var used = [];
        for (i = 0; i < count; i++) {
          var slot, guard = 0;
          do { slot = Math.floor(r() * SLOTS.length); } while (used.indexOf(slot) >= 0 && guard++ < 30);
          used.push(slot);
          var when = midnight(day);
          when.setHours(SLOTS[slot][0], SLOTS[slot][1], 0, 0);
          if (when.getTime() < Date.now()) continue;     /* no classes in the past */

          var cap = 16 + Math.floor(r() * 26);
          var going = [];
          var want = Math.floor(Math.pow(r(), 1.7) * 7); /* skewed: most classes have a few */
          var g = 0;
          while (going.length < want && g++ < 40 && roster.length) {
            var person = roster[Math.floor(r() * roster.length)];
            if (going.indexOf(person.id) < 0 &&
                (person.cats.indexOf(venue.cat) >= 0 || r() < 0.35)) going.push(person.id);
          }
          out.push({
            id: venue.id + '-' + day + '-' + slot,
            venue: venue.id,
            city: venue.city,
            area: venue.area,
            cat: venue.cat,
            title: pick(r, TITLES[venue.cat] || TITLES.Strength),
            coach: pick(r, COACHES),
            start: when.getTime(),
            dur: [45, 45, 50, 55, 60][Math.floor(r() * 5)],
            cap: cap,
            spots: 1 + Math.floor(r() * 9),
            going: going
          });
        }
      }
    }
    return out.sort(function (a, b) { return a.start - b.start; });
  }

  root.VIRI = {
    cities: CITIES,
    venues: VENUES,
    people: PEOPLE,
    categories: CATS,
    buildClasses: buildClasses
  };
})(window);
