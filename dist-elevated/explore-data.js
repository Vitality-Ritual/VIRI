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
    V('dc-cb-nm', 'CycleBar', 'dc', 'NoMa', -77.0033, 38.9046, 'Cycling'),
    /* New York */
    V('ny-sl-wv', 'SoulCycle', 'nyc', 'West Village', -74.0038, 40.7340, 'Cycling'),
    V('ny-br-ch', 'Barry’s', 'nyc', 'Chelsea', -74.0016, 40.7448, 'Strength'),
    V('ny-sc-fl', '[solidcore]', 'nyc', 'Flatiron', -73.9906, 40.7402, 'Strength'),
    V('ny-pb-ue', 'Pure Barre', 'nyc', 'Upper East Side', -73.9588, 40.7752, 'Barre'),
    V('ny-cp-uw', 'CorePower Yoga', 'nyc', 'Upper West Side', -73.9790, 40.7828, 'Yoga'),
    V('ny-cl-wb', 'Club Pilates', 'nyc', 'Williamsburg', -73.9580, 40.7150, 'Pilates'),
    V('ny-cb-fl', 'CycleBar', 'nyc', 'Flatiron', -73.9925, 40.7412, 'Cycling'),
    V('ny-cb-nd', 'CycleBar', 'nyc', 'NoMad', -73.9841, 40.7439, 'Cycling'),
    V('ny-cb-ue', 'CycleBar', 'nyc', 'Upper East Side', -73.9625, 40.7665, 'Cycling'),
    V('ny-cb-nh', 'CycleBar', 'nyc', 'NoHo', -73.9902, 40.7299, 'Cycling'),
    V('ny-ot-tr', 'Orangetheory Fitness', 'nyc', 'Tribeca', -74.0082, 40.7180, 'Strength'),
    /* Los Angeles */
    V('la-sl-wh', 'SoulCycle', 'la', 'West Hollywood', -118.3798, 34.0902, 'Cycling'),
    V('la-br-wh', 'Barry’s', 'la', 'West Hollywood', -118.3848, 34.0880, 'Strength'),
    V('la-sc-sm', '[solidcore]', 'la', 'Santa Monica', -118.4912, 34.0202, 'Strength'),
    V('la-cp-br', 'CorePower Yoga', 'la', 'Brentwood', -118.4712, 34.0532, 'Yoga'),
    V('la-pb-cc', 'Pure Barre', 'la', 'Culver City', -118.3948, 34.0222, 'Barre'),
    V('la-cl-sl', 'Club Pilates', 'la', 'Silver Lake', -118.2716, 34.0862, 'Pilates'),
    V('la-cb-so', 'CycleBar', 'la', 'Sherman Oaks', -118.4526, 34.1512, 'Cycling'),
    V('la-cb-cc', 'CycleBar', 'la', 'Culver City', -118.4122, 34.0065, 'Cycling'),
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
    V('bo-cb-ar', 'CycleBar', 'bos', 'Somerville', -71.0791, 42.3916, 'Cycling'),
    /* Chicago */
    V('ch-sl-rn', 'SoulCycle', 'chi', 'River North', -87.6348, 41.8928, 'Cycling'),
    V('ch-br-wl', 'Barry’s', 'chi', 'West Loop', -87.6462, 41.8842, 'Strength'),
    V('ch-sc-rn', '[solidcore]', 'chi', 'River North', -87.6312, 41.8946, 'Strength'),
    V('ch-cp-lp', 'CorePower Yoga', 'chi', 'Lincoln Park', -87.6468, 41.9226, 'Yoga'),
    V('ch-pb-gc', 'Pure Barre', 'chi', 'Gold Coast', -87.6282, 41.9046, 'Barre'),
    V('ch-cl-wp', 'Club Pilates', 'chi', 'Wicker Park', -87.6752, 41.9082, 'Pilates'),
    V('ch-cb-rn', 'CycleBar', 'chi', 'River North', -87.6329, 41.8954, 'Cycling'),
    V('ch-ot-sl', 'Orangetheory Fitness', 'chi', 'South Loop', -87.6266, 41.8672, 'Strength'),
    /* Philadelphia */
    V('ph-sc-ri', '[solidcore]', 'phl', 'Rittenhouse', -75.1728, 39.9494, 'Strength'),
    V('ph-sl-ri', 'SoulCycle', 'phl', 'Rittenhouse', -75.1748, 39.9478, 'Cycling'),
    V('ph-cp-ri', 'CorePower Yoga', 'phl', 'Rittenhouse', -75.1706, 39.9506, 'Yoga'),
    V('ph-pb-gh', 'Pure Barre', 'phl', 'Graduate Hospital', -75.1784, 39.9406, 'Barre'),
    V('ph-cl-fi', 'Club Pilates', 'phl', 'Fishtown', -75.1306, 39.9724, 'Pilates'),
    V('ph-ot-nl', 'Orangetheory Fitness', 'phl', 'Northern Liberties', -75.1404, 39.9652, 'Strength'),
    V('ph-cb-cc', 'CycleBar', 'phl', 'Center City', -75.1673, 39.9487, 'Cycling'),
    /* Atlanta */
    V('at-br-mi', 'Barry’s', 'atl', 'Midtown', -84.3846, 33.7836, 'Strength'),
    V('at-sc-mi', '[solidcore]', 'atl', 'Midtown', -84.3822, 33.7862, 'Strength'),
    V('at-cp-of', 'CorePower Yoga', 'atl', 'Old Fourth Ward', -84.3664, 33.7624, 'Yoga'),
    V('at-pb-bu', 'Pure Barre', 'atl', 'Buckhead', -84.3804, 33.8384, 'Barre'),
    V('at-cl-wm', 'Club Pilates', 'atl', 'West Midtown', -84.4126, 33.7864, 'Pilates'),
    V('at-ot-vh', 'Orangetheory Fitness', 'atl', 'Virginia-Highland', -84.3544, 33.7794, 'Strength'),
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
