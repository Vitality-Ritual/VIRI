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
    V('dc-cb-nm', 'CycleBar', 'dc', 'NoMa', -77.0033, 38.9046, 'Cycling'),
    /* New York */
    V('ny-cb-fl', 'CycleBar', 'nyc', 'Flatiron', -73.9925, 40.7412, 'Cycling'),
    V('ny-cb-nd', 'CycleBar', 'nyc', 'NoMad', -73.9841, 40.7439, 'Cycling'),
    V('ny-cb-ue', 'CycleBar', 'nyc', 'Upper East Side', -73.9625, 40.7665, 'Cycling'),
    V('ny-cb-nh', 'CycleBar', 'nyc', 'NoHo', -73.9902, 40.7299, 'Cycling'),
    /* Los Angeles */
    V('la-cb-so', 'CycleBar', 'la', 'Sherman Oaks', -118.4526, 34.1512, 'Cycling'),
    V('la-cb-cc', 'CycleBar', 'la', 'Culver City', -118.4122, 34.0065, 'Cycling'),
    /* Miami */
    /* Boston */
    V('bo-cb-ar', 'CycleBar', 'bos', 'Somerville', -71.0791, 42.3916, 'Cycling'),
    /* Chicago */
    V('ch-cb-rn', 'CycleBar', 'chi', 'River North', -87.6329, 41.8954, 'Cycling'),
    /* Philadelphia */
    V('ph-cb-cc', 'CycleBar', 'phl', 'Center City', -75.1673, 39.9487, 'Cycling'),
    /* Atlanta */
    /* Barre3: every studio Barre3 lists inside these cities, read off its own
       finder at barre3.com/studio-locations on 4 Oct 2026. These replaced one
       invented studio per city, placed only so pins would not stack; none of
       the eight was real. Barre3 has no Miami studio. Williamsburg (Brooklyn)
       is listed as coming soon and left out until it opens. Coordinates are from
       the Census geocoder on each address, except Long Island City and Atlanta's
       Peachtree St studio, where it matched the wrong street and they were placed
       by hand. Barre3 calls 1745 Peachtree St "Buckhead"; it sits nearer Midtown. */
    V('dc-b3-us', 'Barre3', 'dc', 'Union Station', -77.0034, 38.8990, 'Barre'),
    V('dc-b3-14', 'Barre3', 'dc', 'U Street', -77.0320, 38.9150, 'Barre'),
    V('ny-b3-wv', 'Barre3', 'nyc', 'West Village', -73.9987, 40.7333, 'Barre'),
    V('ny-b3-li', 'Barre3', 'nyc', 'Long Island City', -73.9443, 40.7478, 'Barre'),
    V('la-b3-sc', 'Barre3', 'la', 'Studio City', -118.3926, 34.1435, 'Barre'),
    V('bo-b3-bl', 'Barre3', 'bos', 'Brookline', -71.1351, 42.3397, 'Barre'),
    V('ch-b3-wl', 'Barre3', 'chi', 'West Loop', -87.6544, 41.8848, 'Barre'),
    V('ch-b3-lv', 'Barre3', 'chi', 'Lakeview', -87.6536, 41.9399, 'Barre'),
    V('ph-b3-rt', 'Barre3', 'phl', 'Rittenhouse', -75.1659, 39.9503, 'Barre'),
    V('at-b3-bh', 'Barre3', 'atl', 'Buckhead', -84.3898, 33.8025, 'Barre'),
    V('at-b3-bk', 'Barre3', 'atl', 'Brookhaven', -84.3316, 33.8270, 'Barre'),
    /* Club Pilates: every open studio it lists inside these cities, 4 Oct 2026, read
       off its studio pages and geocoded by the Census from each published address
       (three it could not match were placed by hand). Left out: studios whose pages
       say "coming soon", two just outside New York City, and one whose address the
       geocoder put in the wrong ZIP. Earlier entries for the same studio kept their ids. */
    /* Washington, DC */
    V('dc-cl-georgetown', 'Club Pilates', 'dc', 'Georgetown', -77.0627, 38.9045, 'Pilates'),
    V('dc-cl-logancircl', 'Club Pilates', 'dc', 'Logan Circle', -77.0320, 38.9120, 'Pilates'),
    V('dc-cl-mountverno', 'Club Pilates', 'dc', 'Mount Vernon Triangle', -77.0161, 38.9014, 'Pilates'),
    V('dc-cl-nv', 'Club Pilates', 'dc', 'Navy Yard', -77.0054, 38.8765, 'Pilates'),
    V('dc-cl-tenleytown', 'Club Pilates', 'dc', 'Tenleytown', -77.0793, 38.9474, 'Pilates'),
    /* New York */
    V('ny-cl-astoria', 'Club Pilates', 'nyc', 'Astoria', -73.9255, 40.7616, 'Pilates'),
    V('ny-cl-bayridge', 'Club Pilates', 'nyc', 'Bay Ridge', -74.0251, 40.6207, 'Pilates'),
    V('ny-cl-clintonhil', 'Club Pilates', 'nyc', 'Clinton Hill', -73.9632, 40.6937, 'Pilates'),
    V('ny-cl-cobblehill', 'Club Pilates', 'nyc', 'Cobble Hill', -73.9935, 40.6893, 'Pilates'),
    V('ny-cl-downtownbr', 'Club Pilates', 'nyc', 'Downtown Brooklyn', -73.9791, 40.6855, 'Pilates'),
    V('ny-cl-gramercy', 'Club Pilates', 'nyc', 'Gramercy', -73.9813, 40.7374, 'Pilates'),
    V('ny-cl-harlem', 'Club Pilates', 'nyc', 'Harlem', -73.9542, 40.8039, 'Pilates'),
    V('ny-cl-harlem2', 'Club Pilates', 'nyc', 'Harlem', -73.9419, 40.8063, 'Pilates'),
    V('ny-cl-kingshighw', 'Club Pilates', 'nyc', 'Kings Highway', -73.9719, 40.6043, 'Pilates'),
    V('ny-cl-midtowneas', 'Club Pilates', 'nyc', 'Midtown East', -73.9707, 40.7518, 'Pilates'),
    V('ny-cl-midtownwes', 'Club Pilates', 'nyc', 'Midtown West', -73.9914, 40.7704, 'Pilates'),
    V('ny-cl-millbasin', 'Club Pilates', 'nyc', 'Mill Basin', -73.9233, 40.6092, 'Pilates'),
    V('ny-cl-parkslope', 'Club Pilates', 'nyc', 'Park Slope', -73.9719, 40.6763, 'Pilates'),
    V('ny-cl-pennstatio', 'Club Pilates', 'nyc', 'Penn Station', -73.9891, 40.7529, 'Pilates'),
    V('ny-cl-sheepshead', 'Club Pilates', 'nyc', 'Sheepshead Bay', -73.9525, 40.5868, 'Pilates'),
    V('ny-cl-southslope', 'Club Pilates', 'nyc', 'South Slope', -73.9897, 40.6652, 'Pilates'),
    V('ny-cl-tribeca', 'Club Pilates', 'nyc', 'Tribeca', -74.0094, 40.7141, 'Pilates'),
    V('ny-cl-uppereasts', 'Club Pilates', 'nyc', 'Upper East Side', -73.9535, 40.7714, 'Pilates'),
    V('ny-cl-uppereasts3', 'Club Pilates', 'nyc', 'Upper East Side', -73.9629, 40.7627, 'Pilates'),
    V('ny-cl-uppereasts2', 'Club Pilates', 'nyc', 'Upper East Side', -73.9482, 40.7787, 'Pilates'),
    V('ny-cl-upperwests', 'Club Pilates', 'nyc', 'Upper West Side', -73.9712, 40.7879, 'Pilates'),
    V('ny-cl-westchelse', 'Club Pilates', 'nyc', 'West Chelsea', -74.0057, 40.7509, 'Pilates'),
    V('ny-cl-wb', 'Club Pilates', 'nyc', 'Williamsburg', -73.9632, 40.7174, 'Pilates'),
    /* Los Angeles */
    V('la-cl-baldwinhil', 'Club Pilates', 'la', 'Baldwin Hills', -118.3557, 34.0199, 'Pilates'),
    V('la-cl-brentwood', 'Club Pilates', 'la', 'Brentwood', -118.4650, 34.0539, 'Pilates'),
    V('la-cl-burbank', 'Club Pilates', 'la', 'Burbank', -118.3097, 34.1818, 'Pilates'),
    V('la-cl-culvercity', 'Club Pilates', 'la', 'Culver City', -118.3937, 34.0034, 'Pilates'),
    V('la-cl-echopark', 'Club Pilates', 'la', 'Echo Park', -118.2587, 34.0773, 'Pilates'),
    V('la-cl-glassellpa', 'Club Pilates', 'la', 'Glassell Park', -118.2348, 34.1123, 'Pilates'),
    V('la-cl-glendale', 'Club Pilates', 'la', 'Glendale', -118.2551, 34.1505, 'Pilates'),
    V('la-cl-lacienega', 'Club Pilates', 'la', 'La Cienega', -118.3762, 34.0908, 'Pilates'),
    V('la-cl-littletoky', 'Club Pilates', 'la', 'Little Tokyo', -118.2433, 34.0502, 'Pilates'),
    V('la-cl-marinadelr', 'Club Pilates', 'la', 'Marina Del Rey', -118.4377, 33.9845, 'Pilates'),
    V('la-cl-miraclemil', 'Club Pilates', 'la', 'Miracle Mile', -118.3441, 34.0617, 'Pilates'),
    V('la-cl-northholly', 'Club Pilates', 'la', 'North Hollywood', -118.3733, 34.1626, 'Pilates'),
    V('la-cl-pacificpal', 'Club Pilates', 'la', 'Pacific Palisades', -118.5248, 34.0465, 'Pilates'),
    V('la-cl-shermanoak', 'Club Pilates', 'la', 'Sherman Oaks', -118.4321, 34.1482, 'Pilates'),
    V('la-cl-southpasad', 'Club Pilates', 'la', 'South Pasadena', -118.1504, 34.1134, 'Pilates'),
    V('la-cl-tarzana', 'Club Pilates', 'la', 'Tarzana', -118.5415, 34.1711, 'Pilates'),
    V('la-cl-valleyglen', 'Club Pilates', 'la', 'Valley Glen', -118.4166, 34.1867, 'Pilates'),
    V('la-cl-westhollyw', 'Club Pilates', 'la', 'West Hollywood', -118.3495, 34.0907, 'Pilates'),
    V('la-cl-westla', 'Club Pilates', 'la', 'West LA', -118.4313, 34.0388, 'Pilates'),
    /* Miami */
    V('mi-cl-brickell', 'Club Pilates', 'mia', 'Brickell', -80.1960, 25.7644, 'Pilates'),
    V('mi-cl-coralgable', 'Club Pilates', 'mia', 'Coral Gables', -80.2575, 25.7498, 'Pilates'),
    V('mi-cl-miamishore', 'Club Pilates', 'mia', 'Miami Shores', -80.1934, 25.8629, 'Pilates'),
    V('mi-cl-wy', 'Club Pilates', 'mia', 'Midtown Miami', -80.1935, 25.8070, 'Pilates'),
    V('mi-cl-southbeach', 'Club Pilates', 'mia', 'South Beach', -80.1414, 25.7939, 'Pilates'),
    V('mi-cl-southmiami', 'Club Pilates', 'mia', 'South Miami', -80.2884, 25.7044, 'Pilates'),
    /* Boston */
    V('bo-cl-assemblyro', 'Club Pilates', 'bos', 'Assembly Row', -71.0778, 42.3921, 'Pilates'),
    V('bo-cl-backbay', 'Club Pilates', 'bos', 'Back Bay', -71.0711, 42.3509, 'Pilates'),
    V('bo-cl-brookline', 'Club Pilates', 'bos', 'Brookline', -71.1229, 42.3419, 'Pilates'),
    V('bo-cl-newton', 'Club Pilates', 'bos', 'Newton', -71.1927, 42.3297, 'Pilates'),
    /* Chicago */
    V('ch-cl-edgebrook', 'Club Pilates', 'chi', 'Edgebrook', -87.7693, 42.0119, 'Pilates'),
    V('ch-cl-lakeview', 'Club Pilates', 'chi', 'Lakeview', -87.6457, 41.9339, 'Pilates'),
    V('ch-cl-lincolnpar', 'Club Pilates', 'chi', 'Lincoln Park', -87.6601, 41.9186, 'Pilates'),
    V('ch-cl-logansquar', 'Club Pilates', 'chi', 'Logan Square', -87.7102, 41.9309, 'Pilates'),
    V('ch-cl-northcente', 'Club Pilates', 'chi', 'North Center', -87.6791, 41.9548, 'Pilates'),
    V('ch-cl-oakpark', 'Club Pilates', 'chi', 'Oak Park', -87.7929, 41.8886, 'Pilates'),
    V('ch-cl-ravenswood', 'Club Pilates', 'chi', 'Ravenswood', -87.6763, 41.9689, 'Pilates'),
    V('ch-cl-rivernorth', 'Club Pilates', 'chi', 'River North', -87.6328, 41.8956, 'Pilates'),
    V('ch-cl-southloop', 'Club Pilates', 'chi', 'South Loop', -87.6307, 41.8730, 'Pilates'),
    V('ch-cl-westloop', 'Club Pilates', 'chi', 'West Loop', -87.6510, 41.8817, 'Pilates'),
    V('ch-cl-wp', 'Club Pilates', 'chi', 'Wicker Park', -87.6712, 41.9063, 'Pilates'),
    /* Philadelphia */
    V('ph-cl-rittenhous', 'Club Pilates', 'phl', 'Rittenhouse', -75.1678, 39.9497, 'Pilates'),
    /* Atlanta */
    V('at-cl-brookhaven', 'Club Pilates', 'atl', 'Brookhaven', -84.3154, 33.8856, 'Pilates'),
    V('at-cl-buckhead', 'Club Pilates', 'atl', 'Buckhead', -84.3880, 33.8207, 'Pilates'),
    V('at-cl-chastain', 'Club Pilates', 'atl', 'Chastain', -84.3809, 33.8740, 'Pilates'),
    V('at-cl-inmanpark', 'Club Pilates', 'atl', 'Inman Park', -84.3492, 33.7568, 'Pilates'),
    V('at-cl-tocohills', 'Club Pilates', 'atl', 'Toco Hills', -84.3101, 33.8153, 'Pilates'),
    V('at-cl-vinings', 'Club Pilates', 'atl', 'Vinings', -84.4822, 33.8383, 'Pilates'),
    /* Pure Barre: every studio it lists inside these cities, 4 Oct 2026, from its studio
       pages and, where those were rate-limited, its own studio finder (Census-geocoded).
       Five earlier entries were the same studio and kept their ids; three matched none. */
    /* Washington, DC */
    V('dc-pb-capitolhil', 'Pure Barre', 'dc', 'Capitol Hill', -76.9952, 38.8834, 'Barre'),
    V('dc-pb-cathedralc', 'Pure Barre', 'dc', 'Cathedral Commons', -77.0727, 38.9338, 'Barre'),
    V('dc-pb-du', 'Pure Barre', 'dc', 'Dupont Circle', -77.0482, 38.9094, 'Barre'),
    /* New York */
    V('ny-pb-centralpar', 'Pure Barre', 'nyc', 'Central Park South', -73.9796, 40.7667, 'Barre'),
    V('ny-pb-cobblehill', 'Pure Barre', 'nyc', 'Cobble Hill', -73.9949, 40.6850, 'Barre'),
    V('ny-pb-financiald', 'Pure Barre', 'nyc', 'Financial District', -74.0069, 40.7064, 'Barre'),
    V('ny-pb-flatiron', 'Pure Barre', 'nyc', 'Flatiron', -73.9924, 40.7412, 'Barre'),
    V('ny-pb-longisland', 'Pure Barre', 'nyc', 'Long Island City', -73.9533, 40.7460, 'Barre'),
    V('ny-pb-parkslope', 'Pure Barre', 'nyc', 'Park Slope', -73.9800, 40.6775, 'Barre'),
    V('ny-pb-unionsquar', 'Pure Barre', 'nyc', 'Union Square', -73.9938, 40.7358, 'Barre'),
    V('ny-pb-ue', 'Pure Barre', 'nyc', 'Upper East Side', -73.9620, 40.7642, 'Barre'),
    V('ny-pb-uppereasts', 'Pure Barre', 'nyc', 'Upper East Side', -73.9542, 40.7810, 'Barre'),
    V('ny-pb-uppereasts2', 'Pure Barre', 'nyc', 'Upper East Side', -73.9626, 40.7666, 'Barre'),
    V('ny-pb-upperwests', 'Pure Barre', 'nyc', 'Upper West Side', -73.9753, 40.7825, 'Barre'),
    V('ny-pb-williamsbu', 'Pure Barre', 'nyc', 'Williamsburg', -73.9619, 40.7184, 'Barre'),
    /* Los Angeles */
    V('la-pb-beverlyhil', 'Pure Barre', 'la', 'Beverly Hills', -118.3766, 34.0642, 'Barre'),
    V('la-pb-brentwood', 'Pure Barre', 'la', 'Brentwood', -118.4630, 34.0478, 'Barre'),
    V('la-pb-cc', 'Pure Barre', 'la', 'Culver City', -118.3928, 34.0271, 'Barre'),
    V('la-pb-encino', 'Pure Barre', 'la', 'Encino', -118.4841, 34.1563, 'Barre'),
    V('la-pb-marinadelr', 'Pure Barre', 'la', 'Marina Del Rey', -118.4385, 33.9842, 'Barre'),
    V('la-pb-northholly', 'Pure Barre', 'la', 'North Hollywood', -118.3723, 34.1605, 'Barre'),
    V('la-pb-santamonic', 'Pure Barre', 'la', 'Santa Monica', -118.5001, 34.0180, 'Barre'),
    V('la-pb-woodlandhi', 'Pure Barre', 'la', 'Woodland Hills', -118.6017, 34.1681, 'Barre'),
    /* Miami */
    V('mi-pb-coralgable', 'Pure Barre', 'mia', 'Coral Gables', -80.2618, 25.7496, 'Barre'),
    V('mi-pb-midtown', 'Pure Barre', 'mia', 'Midtown', -80.1923, 25.8064, 'Barre'),
    /* Boston */
    V('bo-pb-arsenalyar', 'Pure Barre', 'bos', 'Arsenal Yards', -71.1598, 42.3623, 'Barre'),
    V('bo-pb-assemblyro', 'Pure Barre', 'bos', 'Assembly Row', -71.0792, 42.3917, 'Barre'),
    V('bo-pb-backbay', 'Pure Barre', 'bos', 'Back Bay', -71.0871, 42.3481, 'Barre'),
    V('bo-pb-brookline', 'Pure Barre', 'bos', 'Brookline', -71.1189, 42.3346, 'Barre'),
    V('bo-pb-harvardsqu', 'Pure Barre', 'bos', 'Harvard Square', -71.1224, 42.3730, 'Barre'),
    V('bo-pb-newton', 'Pure Barre', 'bos', 'Newton', -71.1946, 42.3291, 'Barre'),
    /* Chicago */
    V('ch-pb-edgewater', 'Pure Barre', 'chi', 'Edgewater', -87.6605, 41.9926, 'Barre'),
    V('ch-pb-hydepark', 'Pure Barre', 'chi', 'Hyde Park', -87.5889, 41.8000, 'Barre'),
    V('ch-pb-lakeview', 'Pure Barre', 'chi', 'Lakeview', -87.6683, 41.9410, 'Barre'),
    V('ch-pb-lincolnpar', 'Pure Barre', 'chi', 'Lincoln Park', -87.6488, 41.9199, 'Barre'),
    V('ch-pb-lincolnsqu', 'Pure Barre', 'chi', 'Lincoln Square', -87.6866, 41.9686, 'Barre'),
    V('ch-pb-logansquar', 'Pure Barre', 'chi', 'Logan Square', -87.7039, 41.9267, 'Barre'),
    V('ch-pb-gc', 'Pure Barre', 'chi', 'Old Town', -87.6348, 41.9070, 'Barre'),
    V('ch-pb-rivernorth', 'Pure Barre', 'chi', 'River North', -87.6369, 41.8932, 'Barre'),
    V('ch-pb-southloop', 'Pure Barre', 'chi', 'South Loop', -87.6243, 41.8648, 'Barre'),
    V('ch-pb-streetervi', 'Pure Barre', 'chi', 'Streeterville', -87.6198, 41.8934, 'Barre'),
    V('ch-pb-westloop', 'Pure Barre', 'chi', 'West Loop', -87.6568, 41.8817, 'Barre'),
    V('ch-pb-wickerpark', 'Pure Barre', 'chi', 'Wicker Park', -87.6740, 41.9104, 'Barre'),
    /* Philadelphia */
    V('ph-pb-rittenhous', 'Pure Barre', 'phl', 'Rittenhouse', -75.1692, 39.9500, 'Barre'),
    /* Atlanta */
    V('at-pb-brookhaven', 'Pure Barre', 'atl', 'Brookhaven', -84.3303, 33.8607, 'Barre'),
    V('at-pb-bu', 'Pure Barre', 'atl', 'Buckhead', -84.3776, 33.8402, 'Barre'),
    V('at-pb-chastain', 'Pure Barre', 'atl', 'Chastain', -84.3815, 33.8895, 'Barre'),
    V('at-pb-inmanpark', 'Pure Barre', 'atl', 'Inman Park', -84.3600, 33.7620, 'Barre'),
    V('at-pb-vinings', 'Pure Barre', 'atl', 'Vinings', -84.4664, 33.8648, 'Barre'),
    V('at-pb-virginiahi', 'Pure Barre', 'atl', 'Virginia-Highland', -84.3525, 33.7928, 'Barre'),
    V('at-pb-westside', 'Pure Barre', 'atl', 'Westside', -84.4123, 33.7846, 'Barre'),
    /* [solidcore], CorePower Yoga, SoulCycle, Orangetheory Fitness and Barry's: every
       studio each lists inside these cities, read off its own site on 4 Oct 2026, at
       the coordinates it publishes. This replaced one or two approximate entries per
       city; where one of those was the same studio under a neighbouring name it kept
       its id, and eight that matched no real studio were dropped. Left out: an
       Orangetheory whose page put a South San Francisco studio in Los Angeles, a
       Long Island one, and SoulCycle's streaming studio. Names are each brand's own. */
    /* Washington, DC */
    V('dc-br-dupontcirc', 'Barry’s', 'dc', 'Dupont Circle', -77.0432, 38.9082, 'Strength'),
    V('dc-br-navyyard', 'Barry’s', 'dc', 'Navy Yard', -77.0015, 38.8751, 'Strength'),
    V('dc-cp-adamsmorga', 'CorePower Yoga', 'dc', 'Adams Morgan', -77.0421, 38.9234, 'Yoga'),
    V('dc-cp-citycenter', 'CorePower Yoga', 'dc', 'CityCenterDC', -77.0242, 38.9000, 'Yoga'),
    V('dc-cp-du', 'CorePower Yoga', 'dc', 'Dupont Circle', -77.0413, 38.9054, 'Yoga'),
    V('dc-cp-georgetown', 'CorePower Yoga', 'dc', 'Georgetown', -77.0600, 38.9037, 'Yoga'),
    V('dc-cp-gloverpark', 'CorePower Yoga', 'dc', 'Glover Park', -77.0709, 38.9200, 'Yoga'),
    V('dc-cp-hstreet', 'CorePower Yoga', 'dc', 'H Street', -76.9990, 38.9001, 'Yoga'),
    V('dc-cp-shaw', 'CorePower Yoga', 'dc', 'Shaw', -77.0252, 38.9193, 'Yoga'),
    V('dc-cp-tenleytown', 'CorePower Yoga', 'dc', 'Tenleytown', -77.0807, 38.9501, 'Yoga'),
    V('dc-ot-14thstreet', 'Orangetheory Fitness', 'dc', '14th Street', -77.0320, 38.9165, 'Strength'),
    V('dc-ot-ch', 'Orangetheory Fitness', 'dc', 'Capitol Hill', -76.9959, 38.8857, 'Strength'),
    V('dc-ot-clevelandp', 'Orangetheory Fitness', 'dc', 'Cleveland Park', -77.0582, 38.9346, 'Strength'),
    V('dc-ot-foggybotto', 'Orangetheory Fitness', 'dc', 'Foggy Bottom', -77.0520, 38.9034, 'Strength'),
    V('dc-ot-hstreet', 'Orangetheory Fitness', 'dc', 'H Street', -76.9979, 38.9001, 'Strength'),
    V('dc-ot-mountverno', 'Orangetheory Fitness', 'dc', 'Mount Vernon Triangle', -77.0172, 38.9015, 'Strength'),
    V('dc-ot-navyyard', 'Orangetheory Fitness', 'dc', 'Navy Yard', -77.0054, 38.8798, 'Strength'),
    V('dc-ot-tenleytown', 'Orangetheory Fitness', 'dc', 'Tenleytown', -77.0808, 38.9499, 'Strength'),
    V('dc-ot-unionmarke', 'Orangetheory Fitness', 'dc', 'Union Market', -77.0015, 38.9079, 'Strength'),
    V('dc-sc-14', '[solidcore]', 'dc', '14th & U', -77.0335, 38.9173, 'Strength'),
    V('dc-sc-adamsmorga', '[solidcore]', 'dc', 'Adams Morgan', -77.0396, 38.9245, 'Strength'),
    V('dc-sc-cathedralc', '[solidcore]', 'dc', 'Cathedral Commons', -77.0732, 38.9341, 'Strength'),
    V('dc-sc-hstreet', '[solidcore]', 'dc', 'H Street', -76.9933, 38.9001, 'Strength'),
    V('dc-sc-mtvernonsq', '[solidcore]', 'dc', 'Mt. Vernon Square', -77.0203, 38.9037, 'Strength'),
    V('dc-sc-navyyard', '[solidcore]', 'dc', 'Navy Yard', -77.0061, 38.8756, 'Strength'),
    V('dc-sc-unionmarke', '[solidcore]', 'dc', 'Union Market', -76.9976, 38.9094, 'Strength'),
    V('dc-sc-westend', '[solidcore]', 'dc', 'West End', -77.0498, 38.9063, 'Strength'),
    /* New York */
    V('ny-br-brooklynhe', 'Barry’s', 'nyc', 'Brooklyn Heights', -73.9912, 40.6938, 'Strength'),
    V('ny-br-ch', 'Barry’s', 'nyc', 'Chelsea', -73.9955, 40.7419, 'Strength'),
    V('ny-br-longisland', 'Barry’s', 'nyc', 'Long Island City', -73.9392, 40.7487, 'Strength'),
    V('ny-br-noho', 'Barry’s', 'nyc', 'NoHo', -73.9922, 40.7287, 'Strength'),
    V('ny-br-parkavenue', 'Barry’s', 'nyc', 'Park Avenue South', -73.9840, 40.7427, 'Strength'),
    V('ny-br-tribeca', 'Barry’s', 'nyc', 'Tribeca', -74.0055, 40.7212, 'Strength'),
    V('ny-br-uppereasts', 'Barry’s', 'nyc', 'Upper East Side', -73.9524, 40.7784, 'Strength'),
    V('ny-br-uppereasts2', 'Barry’s', 'nyc', 'Upper East Side', -73.9619, 40.7635, 'Strength'),
    V('ny-br-upperwests', 'Barry’s', 'nyc', 'Upper West Side', -73.9799, 40.7752, 'Strength'),
    V('ny-br-wallstreet', 'Barry’s', 'nyc', 'Wall Street', -74.0098, 40.7062, 'Strength'),
    V('ny-br-williamsbu', 'Barry’s', 'nyc', 'Williamsburg', -73.9556, 40.7181, 'Strength'),
    V('ny-cp-bryantpark', 'CorePower Yoga', 'nyc', 'Bryant Park', -73.9833, 40.7525, 'Yoga'),
    V('ny-cp-downtownbr', 'CorePower Yoga', 'nyc', 'Downtown Brooklyn', -73.9835, 40.6912, 'Yoga'),
    V('ny-cp-eastvillag', 'CorePower Yoga', 'nyc', 'East Village', -73.9798, 40.7300, 'Yoga'),
    V('ny-cp-flatiron', 'CorePower Yoga', 'nyc', 'Flatiron', -73.9938, 40.7391, 'Yoga'),
    V('ny-cp-greenwichv', 'CorePower Yoga', 'nyc', 'Greenwich Village', -73.9989, 40.7330, 'Yoga'),
    V('ny-cp-midtowneas', 'CorePower Yoga', 'nyc', 'Midtown East', -73.9670, 40.7597, 'Yoga'),
    V('ny-cp-noho', 'CorePower Yoga', 'nyc', 'NoHo', -73.9948, 40.7262, 'Yoga'),
    V('ny-cp-nomad', 'CorePower Yoga', 'nyc', 'NoMad', -73.9879, 40.7468, 'Yoga'),
    V('ny-cp-parkslope', 'CorePower Yoga', 'nyc', 'Park Slope', -73.9719, 40.6760, 'Yoga'),
    V('ny-cp-rockefelle', 'CorePower Yoga', 'nyc', 'Rockefeller Center', -73.9791, 40.7576, 'Yoga'),
    V('ny-cp-tribeca', 'CorePower Yoga', 'nyc', 'Tribeca', -74.0093, 40.7167, 'Yoga'),
    V('ny-cp-uppereasts', 'CorePower Yoga', 'nyc', 'Upper East Side', -73.9561, 40.7785, 'Yoga'),
    V('ny-cp-uw', 'CorePower Yoga', 'nyc', 'Upper West Side', -73.9818, 40.7767, 'Yoga'),
    V('ny-cp-williamsbu', 'CorePower Yoga', 'nyc', 'Williamsburg', -73.9587, 40.7159, 'Yoga'),
    V('ny-ot-astoria', 'Orangetheory Fitness', 'nyc', 'Astoria', -73.9123, 40.7751, 'Strength'),
    V('ny-ot-astoria2', 'Orangetheory Fitness', 'nyc', 'Astoria', -73.9247, 40.7626, 'Strength'),
    V('ny-ot-bayridge', 'Orangetheory Fitness', 'nyc', 'Bay Ridge', -74.0255, 40.6214, 'Strength'),
    V('ny-ot-bayridge2', 'Orangetheory Fitness', 'nyc', 'Bay Ridge', -74.0286, 40.6287, 'Strength'),
    V('ny-ot-bayside', 'Orangetheory Fitness', 'nyc', 'Bayside', -73.7703, 40.7631, 'Strength'),
    V('ny-ot-brooklynhe', 'Orangetheory Fitness', 'nyc', 'Brooklyn Heights', -73.9916, 40.6939, 'Strength'),
    V('ny-ot-financiald', 'Orangetheory Fitness', 'nyc', 'Financial District', -74.0072, 40.7084, 'Strength'),
    V('ny-ot-foresthill', 'Orangetheory Fitness', 'nyc', 'Forest Hills', -73.8456, 40.7210, 'Strength'),
    V('ny-ot-hellx27ski', 'Orangetheory Fitness', 'nyc', 'Hell&#x27;s Kitchen', -73.9889, 40.7631, 'Strength'),
    V('ny-ot-longisland', 'Orangetheory Fitness', 'nyc', 'Long Island City', -73.9470, 40.7478, 'Strength'),
    V('ny-ot-midwood', 'Orangetheory Fitness', 'nyc', 'Midwood', -73.9715, 40.6045, 'Strength'),
    V('ny-ot-murrayhill', 'Orangetheory Fitness', 'nyc', 'Murray Hill', -73.9752, 40.7490, 'Strength'),
    V('ny-ot-parkslope', 'Orangetheory Fitness', 'nyc', 'Park Slope', -73.9745, 40.6795, 'Strength'),
    V('ny-ot-rockawaybe', 'Orangetheory Fitness', 'nyc', 'Rockaway Beach', -73.8368, 40.5785, 'Strength'),
    V('ny-ot-uppereasts', 'Orangetheory Fitness', 'nyc', 'Upper East Side', -73.9532, 40.7782, 'Strength'),
    V('ny-ot-upperwests', 'Orangetheory Fitness', 'nyc', 'Upper West Side', -73.9688, 40.7901, 'Strength'),
    V('ny-ot-upperwests2', 'Orangetheory Fitness', 'nyc', 'Upper West Side', -73.9797, 40.7775, 'Strength'),
    V('ny-ot-westharlem', 'Orangetheory Fitness', 'nyc', 'West Harlem', -73.9576, 40.8011, 'Strength'),
    V('ny-ot-westvillag', 'Orangetheory Fitness', 'nyc', 'West Village', -74.0001, 40.7333, 'Strength'),
    V('ny-ot-williamsbu', 'Orangetheory Fitness', 'nyc', 'Williamsburg', -73.9634, 40.7186, 'Strength'),
    V('ny-sl-brooklynhe', 'SoulCycle', 'nyc', 'Brooklyn Heights', -73.9911, 40.6921, 'Cycling'),
    V('ny-sl-bryantpark', 'SoulCycle', 'nyc', 'Bryant Park', -73.9857, 40.7540, 'Cycling'),
    V('ny-sl-financiald', 'SoulCycle', 'nyc', 'Financial District', -74.0068, 40.7070, 'Cycling'),
    V('ny-sl-flatiron', 'SoulCycle', 'nyc', 'Flatiron', -73.9919, 40.7393, 'Cycling'),
    V('ny-sl-hudsonyard', 'SoulCycle', 'nyc', 'Hudson Yards', -74.0023, 40.7546, 'Cycling'),
    V('ny-sl-midtowneas', 'SoulCycle', 'nyc', 'Midtown East', -73.9675, 40.7575, 'Cycling'),
    V('ny-sl-noho', 'SoulCycle', 'nyc', 'NoHo', -73.9934, 40.7276, 'Cycling'),
    V('ny-sl-nomad', 'SoulCycle', 'nyc', 'NoMad', -73.9893, 40.7445, 'Cycling'),
    V('ny-sl-tribeca', 'SoulCycle', 'nyc', 'Tribeca', -74.0127, 40.7161, 'Cycling'),
    V('ny-sl-uppereasts', 'SoulCycle', 'nyc', 'Upper East Side', -73.9556, 40.7771, 'Cycling'),
    V('ny-sl-uppereasts2', 'SoulCycle', 'nyc', 'Upper East Side', -73.9661, 40.7645, 'Cycling'),
    V('ny-sl-upperwests', 'SoulCycle', 'nyc', 'Upper West Side', -73.9797, 40.7816, 'Cycling'),
    V('ny-sl-wv', 'SoulCycle', 'nyc', 'West Village', -74.0081, 40.7303, 'Cycling'),
    V('ny-sl-williamsbu', 'SoulCycle', 'nyc', 'Williamsburg', -73.9642, 40.7180, 'Cycling'),
    V('ny-sc-fl', '[solidcore]', 'nyc', 'Chelsea', -73.9946, 40.7439, 'Strength'),
    V('ny-sc-dumbo', '[solidcore]', 'nyc', 'DUMBO', -73.9882, 40.7005, 'Strength'),
    V('ny-sc-downtownbr', '[solidcore]', 'nyc', 'Downtown Brooklyn', -73.9850, 40.6895, 'Strength'),
    V('ny-sc-eastvillag', '[solidcore]', 'nyc', 'East Village', -73.9797, 40.7300, 'Strength'),
    V('ny-sc-financiald', '[solidcore]', 'nyc', 'Financial District', -74.0098, 40.7076, 'Strength'),
    V('ny-sc-gramercy', '[solidcore]', 'nyc', 'Gramercy', -73.9843, 40.7367, 'Strength'),
    V('ny-sc-grandcentr', '[solidcore]', 'nyc', 'Grand Central', -73.9717, 40.7500, 'Strength'),
    V('ny-sc-greenpoint', '[solidcore]', 'nyc', 'Greenpoint', -73.9529, 40.7271, 'Strength'),
    V('ny-sc-greenwichv', '[solidcore]', 'nyc', 'Greenwich Village', -73.9982, 40.7331, 'Strength'),
    V('ny-sc-longisland', '[solidcore]', 'nyc', 'Long Island City', -73.9445, 40.7471, 'Strength'),
    V('ny-sc-manhattanw', '[solidcore]', 'nyc', 'Manhattan West', -73.9972, 40.7528, 'Strength'),
    V('ny-sc-midtownwes', '[solidcore]', 'nyc', 'Midtown West', -73.9922, 40.7705, 'Strength'),
    V('ny-sc-nomad', '[solidcore]', 'nyc', 'NoMad', -73.9835, 40.7457, 'Strength'),
    V('ny-sc-nolita', '[solidcore]', 'nyc', 'Nolita', -73.9933, 40.7231, 'Strength'),
    V('ny-sc-soho', '[solidcore]', 'nyc', 'SoHo', -74.0078, 40.7250, 'Strength'),
    V('ny-sc-uppereasts', '[solidcore]', 'nyc', 'Upper East Side', -73.9632, 40.7666, 'Strength'),
    V('ny-sc-upperwests', '[solidcore]', 'nyc', 'Upper West Side', -73.9803, 40.7838, 'Strength'),
    V('ny-sc-williamsbu', '[solidcore]', 'nyc', 'Williamsburg', -73.9623, 40.7168, 'Strength'),
    /* Los Angeles */
    V('la-br-brentwood', 'Barry’s', 'la', 'Brentwood', -118.4651, 34.0542, 'Strength'),
    V('la-br-pasadena', 'Barry’s', 'la', 'Pasadena', -118.1320, 34.1401, 'Strength'),
    V('la-br-santamonic', 'Barry’s', 'la', 'Santa Monica', -118.4916, 34.0151, 'Strength'),
    V('la-br-studiocity', 'Barry’s', 'la', 'Studio City', -118.4152, 34.1451, 'Strength'),
    V('la-br-venice', 'Barry’s', 'la', 'Venice', -118.4597, 33.9977, 'Strength'),
    V('la-br-wh', 'Barry’s', 'la', 'West Hollywood', -118.3724, 34.0909, 'Strength'),
    V('la-cp-beverlygro', 'CorePower Yoga', 'la', 'Beverly Grove', -118.3690, 34.0635, 'Yoga'),
    V('la-cp-br', 'CorePower Yoga', 'la', 'Brentwood', -118.4669, 34.0532, 'Yoga'),
    V('la-cp-culvercity', 'CorePower Yoga', 'la', 'Culver City', -118.3932, 34.0247, 'Yoga'),
    V('la-cp-downtownla', 'CorePower Yoga', 'la', 'Downtown LA', -118.2599, 34.0460, 'Yoga'),
    V('la-cp-encino', 'CorePower Yoga', 'la', 'Encino', -118.5079, 34.1608, 'Yoga'),
    V('la-cp-hollywood', 'CorePower Yoga', 'la', 'Hollywood', -118.3444, 34.1011, 'Yoga'),
    V('la-cp-marinadelr', 'CorePower Yoga', 'la', 'Marina Del Rey', -118.4394, 33.9844, 'Yoga'),
    V('la-cp-pasadena', 'CorePower Yoga', 'la', 'Pasadena', -118.1537, 34.1444, 'Yoga'),
    V('la-cp-santamonic', 'CorePower Yoga', 'la', 'Santa Monica', -118.4945, 34.0124, 'Yoga'),
    V('la-cp-shermanoak', 'CorePower Yoga', 'la', 'Sherman Oaks', -118.4357, 34.1485, 'Yoga'),
    V('la-cp-studiocity', 'CorePower Yoga', 'la', 'Studio City', -118.3580, 34.1337, 'Yoga'),
    V('la-cp-uscvillage', 'CorePower Yoga', 'la', 'USC Village', -118.2850, 34.0257, 'Yoga'),
    V('la-cp-westwood', 'CorePower Yoga', 'la', 'Westwood', -118.4444, 34.0619, 'Yoga'),
    V('la-cp-wilshire', 'CorePower Yoga', 'la', 'Wilshire', -118.4630, 34.0483, 'Yoga'),
    V('la-ot-brentwood', 'Orangetheory Fitness', 'la', 'Brentwood', -118.4647, 34.0542, 'Strength'),
    V('la-ot-burbank', 'Orangetheory Fitness', 'la', 'Burbank', -118.3096, 34.1814, 'Strength'),
    V('la-ot-centurycit', 'Orangetheory Fitness', 'la', 'Century City', -118.4175, 34.0585, 'Strength'),
    V('la-ot-culvercity', 'Orangetheory Fitness', 'la', 'Culver City', -118.3853, 34.0283, 'Strength'),
    V('la-ot-downtownla', 'Orangetheory Fitness', 'la', 'Downtown LA', -118.2578, 34.0524, 'Strength'),
    V('la-ot-hollywood', 'Orangetheory Fitness', 'la', 'Hollywood', -118.3104, 34.1016, 'Strength'),
    V('la-ot-koreatown', 'Orangetheory Fitness', 'la', 'Koreatown', -118.3057, 34.0616, 'Strength'),
    V('la-ot-marvista', 'Orangetheory Fitness', 'la', 'Mar Vista', -118.4207, 33.9977, 'Strength'),
    V('la-ot-marinadelr', 'Orangetheory Fitness', 'la', 'Marina Del Rey', -118.4587, 33.9774, 'Strength'),
    V('la-ot-melrose', 'Orangetheory Fitness', 'la', 'Melrose', -118.3439, 34.0831, 'Strength'),
    V('la-ot-northholly', 'Orangetheory Fitness', 'la', 'North Hollywood', -118.3745, 34.1651, 'Strength'),
    V('la-ot-pasadena', 'Orangetheory Fitness', 'la', 'Pasadena', -118.1072, 34.1464, 'Strength'),
    V('la-ot-playavista', 'Orangetheory Fitness', 'la', 'Playa Vista', -118.4163, 33.9771, 'Strength'),
    V('la-ot-shermanoak', 'Orangetheory Fitness', 'la', 'Sherman Oaks', -118.4386, 34.1566, 'Strength'),
    V('la-ot-silverlake', 'Orangetheory Fitness', 'la', 'Silver Lake', -118.2555, 34.1469, 'Strength'),
    V('la-ot-woodlandhi', 'Orangetheory Fitness', 'la', 'Woodland Hills', -118.6035, 34.1695, 'Strength'),
    V('la-sl-brentwood', 'SoulCycle', 'la', 'Brentwood', -118.4632, 34.0535, 'Cycling'),
    V('la-sl-pasadena', 'SoulCycle', 'la', 'Pasadena', -118.1318, 34.1436, 'Cycling'),
    V('la-sl-santamonic', 'SoulCycle', 'la', 'Santa Monica', -118.4969, 34.0153, 'Cycling'),
    V('la-sl-wh', 'SoulCycle', 'la', 'West Hollywood', -118.3782, 34.0927, 'Cycling'),
    V('la-sc-culvercity', '[solidcore]', 'la', 'Culver City', -118.3887, 34.0287, 'Strength'),
    V('la-sc-encino', '[solidcore]', 'la', 'Encino', -118.4905, 34.1575, 'Strength'),
    V('la-sc-hollywood', '[solidcore]', 'la', 'Hollywood', -118.3360, 34.0911, 'Strength'),
    V('la-sc-marinadelr', '[solidcore]', 'la', 'Marina Del Rey', -118.4388, 33.9798, 'Strength'),
    V('la-sc-pasadena', '[solidcore]', 'la', 'Pasadena', -118.1507, 34.1483, 'Strength'),
    V('la-sc-sm', '[solidcore]', 'la', 'Santa Monica', -118.4887, 34.0066, 'Strength'),
    V('la-sc-westhollyw', '[solidcore]', 'la', 'West Hollywood', -118.3873, 34.0830, 'Strength'),
    V('la-sc-westla', '[solidcore]', 'la', 'West LA', -118.4546, 34.0327, 'Strength'),
    V('la-sc-woodlandhi', '[solidcore]', 'la', 'Woodland Hills', -118.5895, 34.1675, 'Strength'),
    /* Miami */
    V('mi-br-sb', 'Barry’s', 'mia', 'Miami Beach', -80.1442, 25.7942, 'Strength'),
    V('mi-br-midtown', 'Barry’s', 'mia', 'Midtown', -80.1930, 25.8078, 'Strength'),
    V('mi-cp-br', 'CorePower Yoga', 'mia', 'Brickell', -80.1948, 25.7648, 'Yoga'),
    V('mi-cp-coralgable', 'CorePower Yoga', 'mia', 'Coral Gables', -80.2573, 25.7460, 'Yoga'),
    V('mi-cp-midtown', 'CorePower Yoga', 'mia', 'Midtown', -80.1941, 25.8073, 'Yoga'),
    V('mi-ot-coralgable', 'Orangetheory Fitness', 'mia', 'Coral Gables', -80.2608, 25.7511, 'Strength'),
    V('mi-ot-designdist', 'Orangetheory Fitness', 'mia', 'Design District', -80.1936, 25.8120, 'Strength'),
    V('mi-ot-downtownmi', 'Orangetheory Fitness', 'mia', 'Downtown Miami', -80.1888, 25.7770, 'Strength'),
    V('mi-ot-miamishore', 'Orangetheory Fitness', 'mia', 'Miami Shores', -80.1830, 25.8581, 'Strength'),
    V('mi-sl-brickell', 'SoulCycle', 'mia', 'Brickell', -80.1937, 25.7654, 'Cycling'),
    V('mi-sl-coralgable', 'SoulCycle', 'mia', 'Coral Gables', -80.2602, 25.7323, 'Cycling'),
    V('mi-sl-sb', 'SoulCycle', 'mia', 'South Beach', -80.1331, 25.7750, 'Cycling'),
    V('mi-sc-br', '[solidcore]', 'mia', 'Brickell', -80.1906, 25.7648, 'Strength'),
    V('mi-sc-coralgable', '[solidcore]', 'mia', 'Coral Gables', -80.2571, 25.7458, 'Strength'),
    V('mi-sc-midtownmia', '[solidcore]', 'mia', 'Midtown Miami', -80.1925, 25.8068, 'Strength'),
    V('mi-sc-sunsetharb', '[solidcore]', 'mia', 'Sunset Harbour', -80.1429, 25.7934, 'Strength'),
    /* Boston */
    V('bo-br-bb', 'Barry’s', 'bos', 'Back Bay', -71.0771, 42.3485, 'Strength'),
    V('bo-br-chestnuthi', 'Barry’s', 'bos', 'Chestnut Hill', -71.1705, 42.3225, 'Strength'),
    V('bo-br-downtowncr', 'Barry’s', 'bos', 'Downtown Crossing', -71.0595, 42.3540, 'Strength'),
    V('bo-cp-backbay', 'CorePower Yoga', 'bos', 'Back Bay', -71.0721, 42.3518, 'Yoga'),
    V('bo-cp-charlestow', 'CorePower Yoga', 'bos', 'Charlestown', -71.0653, 42.3759, 'Yoga'),
    V('bo-cp-commave', 'CorePower Yoga', 'bos', 'Comm Ave', -71.1260, 42.3517, 'Yoga'),
    V('bo-cp-downtowncr', 'CorePower Yoga', 'bos', 'Downtown Crossing', -71.0586, 42.3535, 'Yoga'),
    V('bo-cp-fenway', 'CorePower Yoga', 'bos', 'Fenway', -71.0969, 42.3446, 'Yoga'),
    V('bo-cp-freshpond', 'CorePower Yoga', 'bos', 'Fresh Pond', -71.1395, 42.3910, 'Yoga'),
    V('bo-cp-inkblock', 'CorePower Yoga', 'bos', 'Ink Block', -71.0631, 42.3445, 'Yoga'),
    V('bo-cp-ca', 'CorePower Yoga', 'bos', 'Kendall Square', -71.0890, 42.3649, 'Yoga'),
    V('bo-cp-medford', 'CorePower Yoga', 'bos', 'Medford', -71.0996, 42.4042, 'Yoga'),
    V('bo-cp-newton', 'CorePower Yoga', 'bos', 'Newton', -71.1848, 42.3579, 'Yoga'),
    V('bo-cp-seaport', 'CorePower Yoga', 'bos', 'Seaport', -71.0408, 42.3517, 'Yoga'),
    V('bo-cp-southbosto', 'CorePower Yoga', 'bos', 'South Boston', -71.0535, 42.3316, 'Yoga'),
    V('bo-ot-backbay', 'Orangetheory Fitness', 'bos', 'Back Bay', -71.0710, 42.3504, 'Strength'),
    V('bo-ot-belmont', 'Orangetheory Fitness', 'bos', 'Belmont', -71.1816, 42.3835, 'Strength'),
    V('bo-ot-brighton', 'Orangetheory Fitness', 'bos', 'Brighton', -71.1527, 42.3506, 'Strength'),
    V('bo-ot-fenway', 'Orangetheory Fitness', 'bos', 'Fenway', -71.0995, 42.3448, 'Strength'),
    V('bo-ot-kendallsqu', 'Orangetheory Fitness', 'bos', 'Kendall Square', -71.0820, 42.3660, 'Strength'),
    V('bo-ot-so', 'Orangetheory Fitness', 'bos', 'Somerville', -71.0791, 42.3918, 'Strength'),
    V('bo-sl-bb', 'SoulCycle', 'bos', 'Back Bay', -71.0743, 42.3503, 'Cycling'),
    V('bo-sl-chestnuthi', 'SoulCycle', 'bos', 'Chestnut Hill', -71.1769, 42.3198, 'Cycling'),
    V('bo-sl-seaport', 'SoulCycle', 'bos', 'Seaport', -71.0454, 42.3515, 'Cycling'),
    V('bo-sc-arsenalyar', '[solidcore]', 'bos', 'Arsenal Yards', -71.1589, 42.3627, 'Strength'),
    V('bo-sc-chestnuthi', '[solidcore]', 'bos', 'Chestnut Hill', -71.1943, 42.3192, 'Strength'),
    V('bo-sc-fenway', '[solidcore]', 'bos', 'Fenway', -71.0997, 42.3448, 'Strength'),
    V('bo-sc-northstati', '[solidcore]', 'bos', 'North Station', -71.0597, 42.3654, 'Strength'),
    V('bo-sc-seaport', '[solidcore]', 'bos', 'Seaport', -71.0446, 42.3490, 'Strength'),
    V('bo-sc-se', '[solidcore]', 'bos', 'South End', -71.0644, 42.3451, 'Strength'),
    /* Chicago */
    V('ch-br-lincolnpar', 'Barry’s', 'chi', 'Lincoln Park', -87.6483, 41.9172, 'Strength'),
    V('ch-br-rivernorth', 'Barry’s', 'chi', 'River North', -87.6287, 41.8939, 'Strength'),
    V('ch-br-wickerpark', 'Barry’s', 'chi', 'Wicker Park', -87.6741, 41.9085, 'Strength'),
    V('ch-cp-bucktown', 'CorePower Yoga', 'chi', 'Bucktown', -87.6815, 41.9125, 'Yoga'),
    V('ch-cp-goldcoast', 'CorePower Yoga', 'chi', 'Gold Coast', -87.6289, 41.9020, 'Yoga'),
    V('ch-cp-lakeview', 'CorePower Yoga', 'chi', 'Lakeview', -87.6533, 41.9342, 'Yoga'),
    V('ch-cp-lp', 'CorePower Yoga', 'chi', 'Lincoln Park', -87.6532, 41.9216, 'Yoga'),
    V('ch-cp-oakpark', 'CorePower Yoga', 'chi', 'Oak Park', -87.7971, 41.8795, 'Yoga'),
    V('ch-cp-oldtown', 'CorePower Yoga', 'chi', 'Old Town', -87.6322, 41.9106, 'Yoga'),
    V('ch-cp-rivernorth', 'CorePower Yoga', 'chi', 'River North', -87.6363, 41.8958, 'Yoga'),
    V('ch-cp-roscoevill', 'CorePower Yoga', 'chi', 'Roscoe Village', -87.6697, 41.9407, 'Yoga'),
    V('ch-cp-sauganash', 'CorePower Yoga', 'chi', 'Sauganash', -87.7323, 41.9904, 'Yoga'),
    V('ch-cp-southloop', 'CorePower Yoga', 'chi', 'South Loop', -87.6415, 41.8668, 'Yoga'),
    V('ch-cp-streetervi', 'CorePower Yoga', 'chi', 'Streeterville', -87.6216, 41.8932, 'Yoga'),
    V('ch-cp-theloop', 'CorePower Yoga', 'chi', 'The Loop', -87.6329, 41.8834, 'Yoga'),
    V('ch-cp-uptown', 'CorePower Yoga', 'chi', 'Uptown', -87.6559, 41.9622, 'Yoga'),
    V('ch-cp-westloop', 'CorePower Yoga', 'chi', 'West Loop', -87.6594, 41.8838, 'Yoga'),
    V('ch-ot-andersonvi', 'Orangetheory Fitness', 'chi', 'Andersonville', -87.6683, 41.9729, 'Strength'),
    V('ch-ot-edgebrook', 'Orangetheory Fitness', 'chi', 'Edgebrook', -87.7589, 42.0124, 'Strength'),
    V('ch-ot-hydepark', 'Orangetheory Fitness', 'chi', 'Hyde Park', -87.5890, 41.8021, 'Strength'),
    V('ch-ot-lakeview', 'Orangetheory Fitness', 'chi', 'Lakeview', -87.6695, 41.9363, 'Strength'),
    V('ch-ot-lincolnpar', 'Orangetheory Fitness', 'chi', 'Lincoln Park', -87.6483, 41.9222, 'Strength'),
    V('ch-ot-lincolnsqu', 'Orangetheory Fitness', 'chi', 'Lincoln Square', -87.6879, 41.9674, 'Strength'),
    V('ch-ot-logansquar', 'Orangetheory Fitness', 'chi', 'Logan Square', -87.6949, 41.9221, 'Strength'),
    V('ch-ot-millennium', 'Orangetheory Fitness', 'chi', 'Millennium Park', -87.6241, 41.8851, 'Strength'),
    V('ch-ot-rivernorth', 'Orangetheory Fitness', 'chi', 'River North', -87.6343, 41.8933, 'Strength'),
    V('ch-ot-riverwest', 'Orangetheory Fitness', 'chi', 'River West', -87.6535, 41.8952, 'Strength'),
    V('ch-ot-roscoevill', 'Orangetheory Fitness', 'chi', 'Roscoe Village', -87.6895, 41.9414, 'Strength'),
    V('ch-ot-sl', 'Orangetheory Fitness', 'chi', 'South Loop', -87.6273, 41.8698, 'Strength'),
    V('ch-ot-taylorstre', 'Orangetheory Fitness', 'chi', 'Taylor Street', -87.6406, 41.8693, 'Strength'),
    V('ch-ot-westloop', 'Orangetheory Fitness', 'chi', 'West Loop', -87.6485, 41.8818, 'Strength'),
    V('ch-ot-wickerpark', 'Orangetheory Fitness', 'chi', 'Wicker Park', -87.6692, 41.9109, 'Strength'),
    V('ch-ot-wrigleyvil', 'Orangetheory Fitness', 'chi', 'Wrigleyville', -87.6496, 41.9505, 'Strength'),
    V('ch-sl-oldtown', 'SoulCycle', 'chi', 'Old Town', -87.6341, 41.9047, 'Cycling'),
    V('ch-sl-rn', 'SoulCycle', 'chi', 'The Loop', -87.6315, 41.8866, 'Cycling'),
    V('ch-sc-boystown', '[solidcore]', 'chi', 'Boystown', -87.6446, 41.9423, 'Strength'),
    V('ch-sc-lincolnpar', '[solidcore]', 'chi', 'Lincoln Park', -87.6490, 41.9221, 'Strength'),
    V('ch-sc-rn', '[solidcore]', 'chi', 'River North', -87.6397, 41.8964, 'Strength'),
    V('ch-sc-streetervi', '[solidcore]', 'chi', 'Streeterville', -87.6189, 41.8908, 'Strength'),
    V('ch-sc-westloop', '[solidcore]', 'chi', 'West Loop', -87.6472, 41.8816, 'Strength'),
    V('ch-sc-wickerpark', '[solidcore]', 'chi', 'Wicker Park', -87.6692, 41.9035, 'Strength'),
    /* Philadelphia */
    V('ph-br-rittenhous', 'Barry’s', 'phl', 'Rittenhouse', -75.1727, 39.9515, 'Strength'),
    V('ph-cp-northernli', 'CorePower Yoga', 'phl', 'Northern Liberties', -75.1411, 39.9638, 'Yoga'),
    V('ph-cp-ri', 'CorePower Yoga', 'phl', 'Rittenhouse', -75.1685, 39.9498, 'Yoga'),
    V('ph-ot-centercity', 'Orangetheory Fitness', 'phl', 'Center City', -75.1680, 39.9519, 'Strength'),
    V('ph-ot-nl', 'Orangetheory Fitness', 'phl', 'Northern Liberties', -75.1391, 39.9664, 'Strength'),
    V('ph-ot-university', 'Orangetheory Fitness', 'phl', 'University City', -75.1965, 39.9566, 'Strength'),
    V('ph-sl-ri', 'SoulCycle', 'phl', 'Rittenhouse', -75.1671, 39.9507, 'Cycling'),
    V('ph-sc-centercity', '[solidcore]', 'phl', 'Center City', -75.1597, 39.9494, 'Strength'),
    V('ph-sc-northernli', '[solidcore]', 'phl', 'Northern Liberties', -75.1391, 39.9688, 'Strength'),
    V('ph-sc-ri', '[solidcore]', 'phl', 'Rittenhouse', -75.1765, 39.9522, 'Strength'),
    /* Atlanta */
    V('at-br-buckhead', 'Barry’s', 'atl', 'Buckhead', -84.3781, 33.8391, 'Strength'),
    V('at-br-mi', 'Barry’s', 'atl', 'Midtown', -84.3865, 33.7847, 'Strength'),
    V('at-cp-buckhead', 'CorePower Yoga', 'atl', 'Buckhead', -84.3656, 33.8462, 'Yoga'),
    V('at-cp-midtown', 'CorePower Yoga', 'atl', 'Midtown', -84.3844, 33.7782, 'Yoga'),
    V('at-cp-northdruid', 'CorePower Yoga', 'atl', 'North Druid Hills', -84.3319, 33.8280, 'Yoga'),
    V('at-cp-of', 'CorePower Yoga', 'atl', 'Ponce City Market', -84.3672, 33.7715, 'Yoga'),
    V('at-ot-brookhaven', 'Orangetheory Fitness', 'atl', 'Brookhaven', -84.3357, 33.8675, 'Strength'),
    V('at-ot-chastainpa', 'Orangetheory Fitness', 'atl', 'Chastain Park', -84.3793, 33.8706, 'Strength'),
    V('at-ot-emorypoint', 'Orangetheory Fitness', 'atl', 'Emory Point', -84.3256, 33.8000, 'Strength'),
    V('at-ot-howellmill', 'Orangetheory Fitness', 'atl', 'Howell Mill', -84.4156, 33.8103, 'Strength'),
    V('at-ot-inmanpark', 'Orangetheory Fitness', 'atl', 'Inman Park', -84.3585, 33.7620, 'Strength'),
    V('at-ot-madisonyar', 'Orangetheory Fitness', 'atl', 'Madison Yards', -84.3564, 33.7459, 'Strength'),
    V('at-ot-midtown', 'Orangetheory Fitness', 'atl', 'Midtown', -84.3840, 33.7803, 'Strength'),
    V('at-ot-smyrna', 'Orangetheory Fitness', 'atl', 'Smyrna', -84.4903, 33.8446, 'Strength'),
    V('at-ot-southbuckh', 'Orangetheory Fitness', 'atl', 'South Buckhead', -84.3904, 33.8158, 'Strength'),
    V('at-ot-vinings', 'Orangetheory Fitness', 'atl', 'Vinings', -84.4669, 33.8658, 'Strength'),
    V('at-ot-westmidtow', 'Orangetheory Fitness', 'atl', 'West Midtown', -84.4112, 33.7810, 'Strength'),
    V('at-sl-buckhead', 'SoulCycle', 'atl', 'Buckhead', -84.3649, 33.8459, 'Cycling'),
    V('at-sc-buckhead', '[solidcore]', 'atl', 'Buckhead', -84.3813, 33.8415, 'Strength'),
    V('at-sc-madisonyar', '[solidcore]', 'atl', 'Madison Yards', -84.3571, 33.7464, 'Strength'),
    V('at-sc-mi', '[solidcore]', 'atl', 'Midtown', -84.3865, 33.7802, 'Strength'),
    /* Gyms: Equinox, Life Time, Gold's Gym, Crunch Fitness and VIDA Fitness (DC).
       Locations are the clubs each chain lists on its own site, inside the city or its
       immediate neighbourhoods; suburbs, New Jersey and Long Island are left out, as is
       a Gold's not yet open. Coordinates are from the US Census geocoder on each club's
       published street address, except seven placed by hand. Neighbourhood names are the
       nearest recognised one and are labels, not boundaries. */
    /* Washington, DC */
    V('dc-gg-buzzardpoi', 'Gold’s Gym', 'dc', 'Buzzard Point', -77.0118, 38.8702, 'Gym'),
    V('dc-vd-cityvista', 'VIDA Fitness', 'dc', 'City Vista', -77.0179, 38.9026, 'Gym'),
    V('dc-eq-downtown', 'Equinox', 'dc', 'Downtown', -77.0230, 38.9020, 'Gym'),
    V('dc-gg-dupontcirc', 'Gold’s Gym', 'dc', 'Dupont Circle', -77.0406, 38.9081, 'Gym'),
    V('dc-eq-friendship', 'Equinox', 'dc', 'Friendship Heights', -77.0856, 38.9606, 'Gym'),
    V('dc-gg-georgetown', 'Gold’s Gym', 'dc', 'Georgetown', -77.0852, 38.9169, 'Gym'),
    V('dc-vd-logancircl', 'VIDA Fitness', 'dc', 'Logan Circle', -77.0345, 38.9102, 'Gym'),
    V('dc-vd-navyyard', 'VIDA Fitness', 'dc', 'Navy Yard', -77.0005, 38.8763, 'Gym'),
    V('dc-gg-noma', 'Gold’s Gym', 'dc', 'NoMa', -77.0062, 38.9035, 'Gym'),
    V('dc-vd-ustreet', 'VIDA Fitness', 'dc', 'U Street', -77.0368, 38.9169, 'Gym'),
    V('dc-gg-vanness', 'Gold’s Gym', 'dc', 'Van Ness', -77.0650, 38.9458, 'Gym'),
    V('dc-eq-westend', 'Equinox', 'dc', 'West End', -77.0489, 38.9048, 'Gym'),
    /* New York */
    V('nyc-eq-batterypar', 'Equinox', 'nyc', 'Battery Park City', -74.0149, 40.7113, 'Gym'),
    V('nyc-lt-batterypar', 'Life Time', 'nyc', 'Battery Park City', -74.0150, 40.7060, 'Gym'),
    V('nyc-cr-bensonhurs', 'Crunch Fitness', 'nyc', 'Bensonhurst', -73.9971, 40.5937, 'Gym'),
    V('nyc-eq-brooklynhe', 'Equinox', 'nyc', 'Brooklyn Heights', -73.9912, 40.6925, 'Gym'),
    V('nyc-cr-chelsea', 'Crunch Fitness', 'nyc', 'Chelsea', -73.9981, 40.7419, 'Gym'),
    V('nyc-eq-chelsea', 'Equinox', 'nyc', 'Chelsea', -74.0053, 40.7514, 'Gym'),
    V('nyc-eq-chelsea2', 'Equinox', 'nyc', 'Chelsea', -74.0071, 40.7436, 'Gym'),
    V('nyc-eq-columbusci', 'Equinox', 'nyc', 'Columbus Circle', -73.9821, 40.7689, 'Gym'),
    V('nyc-cr-crownheigh', 'Crunch Fitness', 'nyc', 'Crown Heights', -73.9333, 40.6634, 'Gym'),
    V('nyc-eq-dumbo', 'Equinox', 'nyc', 'DUMBO', -73.9886, 40.7025, 'Gym'),
    V('nyc-lt-dumbo', 'Life Time', 'nyc', 'DUMBO', -73.9872, 40.7024, 'Gym'),
    V('nyc-lt-downtownbr', 'Life Time', 'nyc', 'Downtown Brooklyn', -73.9825, 40.6900, 'Gym'),
    V('nyc-cr-eastvillag', 'Crunch Fitness', 'nyc', 'East Village', -73.9904, 40.7290, 'Gym'),
    V('nyc-cr-financiald', 'Crunch Fitness', 'nyc', 'Financial District', -74.0105, 40.7091, 'Gym'),
    V('nyc-eq-financiald', 'Equinox', 'nyc', 'Financial District', -74.0108, 40.7073, 'Gym'),
    V('nyc-lt-financiald', 'Life Time', 'nyc', 'Financial District', -74.0119, 40.7066, 'Gym'),
    V('nyc-cr-flatbush', 'Crunch Fitness', 'nyc', 'Flatbush', -73.9581, 40.6458, 'Gym'),
    V('nyc-eq-flatiron', 'Equinox', 'nyc', 'Flatiron', -73.9899, 40.7389, 'Gym'),
    V('nyc-lt-flatiron', 'Life Time', 'nyc', 'Flatiron', -73.9915, 40.7423, 'Gym'),
    V('nyc-cr-fortgreene', 'Crunch Fitness', 'nyc', 'Fort Greene', -73.9777, 40.6877, 'Gym'),
    V('nyc-cr-garmentdis', 'Crunch Fitness', 'nyc', 'Garment District', -73.9875, 40.7525, 'Gym'),
    V('nyc-eq-gramercy', 'Equinox', 'nyc', 'Gramercy', -73.9860, 40.7406, 'Gym'),
    V('nyc-cr-greenpoint', 'Crunch Fitness', 'nyc', 'Greenpoint', -73.9535, 40.7285, 'Gym'),
    V('nyc-lt-hellskitch', 'Life Time', 'nyc', 'Hell\'s Kitchen', -73.9984, 40.7609, 'Gym'),
    V('nyc-eq-hudsonsqua', 'Equinox', 'nyc', 'Hudson Square', -74.0063, 40.7232, 'Gym'),
    V('nyc-eq-hudsonsqua2', 'Equinox', 'nyc', 'Hudson Square', -74.0070, 40.7301, 'Gym'),
    V('nyc-eq-hudsonyard', 'Equinox', 'nyc', 'Hudson Yards', -74.0010, 40.7537, 'Gym'),
    V('nyc-cr-inwood', 'Crunch Fitness', 'nyc', 'Inwood', -73.9173, 40.8639, 'Gym'),
    V('nyc-eq-lowereasts', 'Equinox', 'nyc', 'Lower East Side', -73.9883, 40.7217, 'Gym'),
    V('nyc-cr-midtown', 'Crunch Fitness', 'nyc', 'Midtown', -73.9831, 40.7642, 'Gym'),
    V('nyc-eq-midtown', 'Equinox', 'nyc', 'Midtown', -73.9782, 40.7592, 'Gym'),
    V('nyc-eq-midtown2', 'Equinox', 'nyc', 'Midtown', -73.9852, 40.7545, 'Gym'),
    V('nyc-lt-midtown', 'Life Time', 'nyc', 'Midtown', -73.9781, 40.7637, 'Gym'),
    V('nyc-lt-midtown2', 'Life Time', 'nyc', 'Midtown', -73.9832, 40.7504, 'Gym'),
    V('nyc-cr-midtowneas', 'Crunch Fitness', 'nyc', 'Midtown East', -73.9732, 40.7552, 'Gym'),
    V('nyc-eq-midtowneas', 'Equinox', 'nyc', 'Midtown East', -73.9801, 40.7544, 'Gym'),
    V('nyc-eq-midtowneas2', 'Equinox', 'nyc', 'Midtown East', -73.9678, 40.7578, 'Gym'),
    V('nyc-eq-midtowneas3', 'Equinox', 'nyc', 'Midtown East', -73.9753, 40.7601, 'Gym'),
    V('nyc-eq-midtowneas4', 'Equinox', 'nyc', 'Midtown East', -73.9756, 40.7522, 'Gym'),
    V('nyc-cr-murrayhill', 'Crunch Fitness', 'nyc', 'Murray Hill', -73.9773, 40.7453, 'Gym'),
    V('nyc-eq-murrayhill', 'Equinox', 'nyc', 'Murray Hill', -73.9818, 40.7453, 'Gym'),
    V('nyc-eq-noho', 'Equinox', 'nyc', 'NoHo', -73.9926, 40.7260, 'Gym'),
    V('nyc-lt-noho', 'Life Time', 'nyc', 'NoHo', -73.9913, 40.7281, 'Gym'),
    V('nyc-eq-nomad', 'Equinox', 'nyc', 'NoMad', -73.9892, 40.7447, 'Gym'),
    V('nyc-cr-norwood', 'Crunch Fitness', 'nyc', 'Norwood', -73.8753, 40.8725, 'Gym'),
    V('nyc-cr-parkslope', 'Crunch Fitness', 'nyc', 'Park Slope', -73.9726, 40.6773, 'Gym'),
    V('nyc-lt-pennstatio', 'Life Time', 'nyc', 'Penn Station', -73.9927, 40.7511, 'Gym'),
    V('nyc-lt-prospecthe', 'Life Time', 'nyc', 'Prospect Heights', -73.9740, 40.6825, 'Gym'),
    V('nyc-cr-richmondhi', 'Crunch Fitness', 'nyc', 'Richmond Hill', -73.8339, 40.6987, 'Gym'),
    V('nyc-cr-rochdale', 'Crunch Fitness', 'nyc', 'Rochdale', -73.7771, 40.6796, 'Gym'),
    V('nyc-eq-soho', 'Equinox', 'nyc', 'SoHo', -73.9970, 40.7240, 'Gym'),
    V('nyc-cr-southslope', 'Crunch Fitness', 'nyc', 'South Slope', -73.9892, 40.6656, 'Gym'),
    V('nyc-eq-theaterdis', 'Equinox', 'nyc', 'Theater District', -73.9840, 40.7616, 'Gym'),
    V('nyc-cr-tribeca', 'Crunch Fitness', 'nyc', 'Tribeca', -74.0050, 40.7173, 'Gym'),
    V('nyc-eq-tribeca', 'Equinox', 'nyc', 'Tribeca', -74.0093, 40.7139, 'Gym'),
    V('nyc-cr-unionsquar', 'Crunch Fitness', 'nyc', 'Union Square', -73.9899, 40.7328, 'Gym'),
    V('nyc-cr-uppereasts', 'Crunch Fitness', 'nyc', 'Upper East Side', -73.9629, 40.7665, 'Gym'),
    V('nyc-cr-uppereasts2', 'Crunch Fitness', 'nyc', 'Upper East Side', -73.9562, 40.7759, 'Gym'),
    V('nyc-cr-uppereasts3', 'Crunch Fitness', 'nyc', 'Upper East Side', -73.9644, 40.7606, 'Gym'),
    V('nyc-eq-uppereasts', 'Equinox', 'nyc', 'Upper East Side', -73.9664, 40.7645, 'Gym'),
    V('nyc-eq-uppereasts2', 'Equinox', 'nyc', 'Upper East Side', -73.9622, 40.7613, 'Gym'),
    V('nyc-eq-uppereasts3', 'Equinox', 'nyc', 'Upper East Side', -73.9511, 40.7826, 'Gym'),
    V('nyc-eq-uppereasts4', 'Equinox', 'nyc', 'Upper East Side', -73.9573, 40.7704, 'Gym'),
    V('nyc-eq-uppereasts5', 'Equinox', 'nyc', 'Upper East Side', -73.9543, 40.7781, 'Gym'),
    V('nyc-cr-upperwests', 'Crunch Fitness', 'nyc', 'Upper West Side', -73.9754, 40.7852, 'Gym'),
    V('nyc-eq-upperwests', 'Equinox', 'nyc', 'Upper West Side', -73.9740, 40.7917, 'Gym'),
    V('nyc-eq-upperwests2', 'Equinox', 'nyc', 'Upper West Side', -73.9796, 40.7815, 'Gym'),
    V('nyc-eq-upperwests3', 'Equinox', 'nyc', 'Upper West Side', -73.9811, 40.7744, 'Gym'),
    V('nyc-eq-westvillag', 'Equinox', 'nyc', 'West Village', -74.0018, 40.7375, 'Gym'),
    V('nyc-eq-williamsbu', 'Equinox', 'nyc', 'Williamsburg', -73.9663, 40.7166, 'Gym'),
    V('nyc-eq-williamsbu2', 'Equinox', 'nyc', 'Williamsburg', -73.9599, 40.7159, 'Gym'),
    /* Los Angeles */
    V('la-eq-beverlyhil', 'Equinox', 'la', 'Beverly Hills', -118.4035, 34.0671, 'Gym'),
    V('la-cr-burbank', 'Crunch Fitness', 'la', 'Burbank', -118.3154, 34.1856, 'Gym'),
    V('la-eq-burbank', 'Equinox', 'la', 'Burbank', -118.3358, 34.1523, 'Gym'),
    V('la-eq-centurycit', 'Equinox', 'la', 'Century City', -118.4198, 34.0600, 'Gym'),
    V('la-eq-culvercity', 'Equinox', 'la', 'Culver City', -118.3982, 34.0211, 'Gym'),
    V('la-eq-downtownla', 'Equinox', 'la', 'Downtown LA', -118.2553, 34.0523, 'Gym'),
    V('la-eq-encino', 'Equinox', 'la', 'Encino', -118.5002, 34.1590, 'Gym'),
    V('la-eq-glendale', 'Equinox', 'la', 'Glendale', -118.2554, 34.1568, 'Gym'),
    V('la-eq-hollywood', 'Equinox', 'la', 'Hollywood', -118.3266, 34.0989, 'Gym'),
    V('la-eq-marinadelr', 'Equinox', 'la', 'Marina del Rey', -118.4417, 33.9866, 'Gym'),
    V('la-eq-miraclemil', 'Equinox', 'la', 'Miracle Mile', -118.3543, 34.0623, 'Gym'),
    V('la-eq-pacificpal', 'Equinox', 'la', 'Pacific Palisades', -118.5547, 34.0396, 'Gym'),
    V('la-eq-pasadena', 'Equinox', 'la', 'Pasadena', -118.1437, 34.1458, 'Gym'),
    V('la-eq-playavista', 'Equinox', 'la', 'Playa Vista', -118.3974, 33.9825, 'Gym'),
    V('la-eq-santamonic', 'Equinox', 'la', 'Santa Monica', -118.4903, 34.0185, 'Gym'),
    V('la-eq-santamonic2', 'Equinox', 'la', 'Santa Monica', -118.4965, 34.0158, 'Gym'),
    V('la-eq-sawtelle', 'Equinox', 'la', 'Sawtelle', -118.4425, 34.0454, 'Gym'),
    V('la-eq-studiocity', 'Equinox', 'la', 'Studio City', -118.4125, 34.1450, 'Gym'),
    V('la-cr-vannuys', 'Crunch Fitness', 'la', 'Van Nuys', -118.4488, 34.1928, 'Gym'),
    V('la-gg-venice', 'Gold’s Gym', 'la', 'Venice', -118.4753, 33.9954, 'Gym'),
    V('la-eq-westhollyw', 'Equinox', 'la', 'West Hollywood', -118.3791, 34.0925, 'Gym'),
    V('la-eq-westwood', 'Equinox', 'la', 'Westwood', -118.4462, 34.0581, 'Gym'),
    V('la-eq-woodlandhi', 'Equinox', 'la', 'Woodland Hills', -118.5993, 34.1791, 'Gym'),
    /* Miami */
    V('mia-eq-brickell', 'Equinox', 'mia', 'Brickell', -80.1926, 25.7587, 'Gym'),
    V('mia-eq-brickell2', 'Equinox', 'mia', 'Brickell', -80.1938, 25.7655, 'Gym'),
    V('mia-eq-coralgable', 'Equinox', 'mia', 'Coral Gables', -80.2617, 25.7321, 'Gym'),
    V('mia-lt-coralgable', 'Life Time', 'mia', 'Coral Gables', -80.2596, 25.7281, 'Gym'),
    V('mia-eq-edgewater', 'Equinox', 'mia', 'Edgewater', -80.1901, 25.8022, 'Gym'),
    V('mia-cr-southbeach', 'Crunch Fitness', 'mia', 'South Beach', -80.1321, 25.7837, 'Gym'),
    V('mia-eq-southbeach', 'Equinox', 'mia', 'South Beach', -80.1330, 25.7748, 'Gym'),
    /* Boston */
    V('bos-cr-allston', 'Crunch Fitness', 'bos', 'Allston', -71.1329, 42.3489, 'Gym'),
    V('bos-eq-backbay', 'Equinox', 'bos', 'Back Bay', -71.0756, 42.3467, 'Gym'),
    V('bos-lt-backbay', 'Life Time', 'bos', 'Back Bay', -71.0821, 42.3487, 'Gym'),
    V('bos-eq-chestnuthi', 'Equinox', 'bos', 'Chestnut Hill', -71.1772, 42.3197, 'Gym'),
    V('bos-lt-chestnuthi', 'Life Time', 'bos', 'Chestnut Hill', -71.1791, 42.3193, 'Gym'),
    V('bos-eq-downtowncr', 'Equinox', 'bos', 'Downtown Crossing', -71.0628, 42.3532, 'Gym'),
    V('bos-eq-fenway', 'Equinox', 'bos', 'Fenway', -71.1046, 42.3458, 'Gym'),
    V('bos-eq-financiald', 'Equinox', 'bos', 'Financial District', -71.0544, 42.3563, 'Gym'),
    V('bos-eq-seaport', 'Equinox', 'bos', 'Seaport', -71.0485, 42.3540, 'Gym'),
    /* Chicago */
    V('chi-eq-goldcoast', 'Equinox', 'chi', 'Gold Coast', -87.6509, 41.9109, 'Gym'),
    V('chi-eq-lincolnpar', 'Equinox', 'chi', 'Lincoln Park', -87.6336, 41.9143, 'Gym'),
    V('chi-eq-lincolnpar2', 'Equinox', 'chi', 'Lincoln Park', -87.6476, 41.9247, 'Gym'),
    V('chi-lt-rivernorth', 'Life Time', 'chi', 'River North', -87.6288, 41.8966, 'Gym'),
    V('chi-eq-theloop', 'Equinox', 'chi', 'The Loop', -87.6339, 41.8807, 'Gym'),
    V('chi-eq-westloop', 'Equinox', 'chi', 'West Loop', -87.6502, 41.8867, 'Gym'),
    /* Philadelphia */
    V('phl-eq-rittenhous', 'Equinox', 'phl', 'Rittenhouse', -75.1728, 39.9505, 'Gym'),
    /* Atlanta */
    V('atl-lt-buckhead', 'Life Time', 'atl', 'Buckhead', -84.3615, 33.8513, 'Gym'),
    V('atl-lt-northdruid', 'Life Time', 'atl', 'North Druid Hills', -84.3376, 33.8247, 'Gym')
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
  var CATS = ['Pilates','Yoga','Cycling','Barre','Strength','Gym','Running'];

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
