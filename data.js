// data.js — building centers + wing/hall ranges (use last two digits of office number)
// IMPORTANT: Fill lat/lng for each building center (center of footprint)
// Then fill the ranges for each wing from your PDF (House: page 1; Senate: page 2).

const BUILDING_COORDS = {
  // ===== HOUSE =====
  'Rayburn House Office Building': {
    address: 'Rayburn House Office Building, Washington, DC 20515',
        lat: 38.886811,
    lng: -77.010568,
    zoom: 19,
    // Move star into correct wing/hall based on office number
    marker: {
      // We’ll compare officeNumber % 100 to these ranges:
      modulo: 100,
      field: 'hundreds', // we also compute an index from the hundreds digit if you prefer (not used in these ranges)
      sections: [
        // Example ranges below are placeholders — replace with the true ranges from your PDF.
        // NORTH hall
        { label: 'North Hall',  ranges: [[70, 99]], offset: { lat:  +0.00030, lng:  0.00000 }, zoom: 20,
          description: 'Star nudged toward Rayburn north corridor.' },
        // EAST hall
        { label: 'East Hall',   ranges: [[30, 49]], offset: { lat:  0.00000,  lng:  +0.00032 }, zoom: 20,
          description: 'Star nudged toward Rayburn east corridor.' },
        // SOUTH hall
        { label: 'South Hall',  ranges: [[00, 29]], offset: { lat:  -0.00030, lng:  0.00000 }, zoom: 20,
          description: 'Star nudged toward Rayburn south corridor.' },
        // WEST hall
        { label: 'West Hall',   ranges: [[50, 69]], offset: { lat:  0.00000,  lng:  -0.00032 }, zoom: 20,
          description: 'Star nudged toward Rayburn west corridor.' }
      ],
      // If no range matched:
      fallback: { label: 'Center', offset: { lat: 0, lng: 0 }, zoom: 19 }
    }
  },

  'Longworth House Office Building': {
    address: 'Longworth House Office Building, Washington, DC 20515',
       lat: 38.88651283713331,
    lng: -77.0083668319861, zoom: 19,
    marker: {
      modulo: 100,
      sections: [
        // Replace the ranges using your PDF (page 1 labels for Longworth)
        { label: 'North Hall', ranges: [[37, 43]], offset: { lat: +0.00025, lng:  0.00000 }, zoom: 20 },
        { label: 'East Hall',  ranges: [[10, 12],[14, 23]], offset: { lat:  0.00000, lng: +0.00028 }, zoom: 20 },
        { label: 'South Hall', ranges: [[30, 40]], offset: { lat: -0.00025, lng:  0.00000 }, zoom: 20 },
        { label: 'West Hall',  ranges: [[07, 16]], offset: { lat:  0.00000, lng: -0.00028 }, zoom: 20 },
      ],
      fallback: { label: 'Center', offset: { lat: 0, lng: 0 }, zoom: 19 }
    }
  },

  'Cannon House Office Building': {
    address: 'Cannon House Office Building, Washington, DC 20515',
        lat: 38.88668839987316,
    lng: -77.00694138122337, zoom: 19,
    marker: {
      modulo: 100,
      sections: [
        // Replace with Cannon ranges from page 1
        { label: 'North Hall', ranges: [[34, 41]], offset: { lat: +0.00025, lng:  0.00000 }, zoom: 20 },
        { label: 'East Hall',  ranges: [[10, 12]], offset: { lat:  0.00000, lng: +0.00028 }, zoom: 20 },
        { label: 'South Hall', ranges: [[13, 20]], offset: { lat: -0.00025, lng:  0.00000 }, zoom: 20 },
        { label: 'West Hall',  ranges: [[21, 34]], offset: { lat:  0.00000, lng: -0.00028 }, zoom: 20 },
      ],
      fallback: { label: 'Center', offset: { lat: 0, lng: 0 }, zoom: 19 }
    }
  },

  // ===== SENATE =====
  'Russell Senate Office Building': {
    address: '2 Constitution Ave NE, Washington, DC 20510',
     lat: 38.892636091955296,
    lng: -77.00691236828801,zoom: 19,
    marker: {
      modulo: 100,
      sections: [
        // Use page 2 ranges labeled SR##–SR## on each side
        { label: 'North Hall', ranges: [[60, 81]], offset: { lat: +0.00026, lng:  0.00000 }, zoom: 20 },
        { label: 'East Hall',  ranges: [[28, 58]], offset: { lat:  0.00000, lng: +0.00028 }, zoom: 20 },
        { label: 'South Hall', ranges: [[00, 29]], offset: { lat: -0.00026, lng:  0.00000 }, zoom: 20 },
        { label: 'West Hall',  ranges: [[31, 58]], offset: { lat:  0.00000, lng: -0.00028 }, zoom: 20 },
      ],
      fallback: { label: 'Center', offset: { lat: 0, lng: 0 }, zoom: 19 }
    }
  },

  'Dirksen Senate Office Building': {
    address: '50 Constitution Ave NE, Washington, DC 20510',
      lat: 38.893070317087286,
    lng: -77.00551761952482, zoom: 19,
    marker: {
      modulo: 100,
      sections: [
        // Use page 2 ranges labeled SD##–SD## on each side
        { label: 'North Hall', ranges: [[32, 48]], offset: { lat: +0.00024, lng:  0.00000 }, zoom: 20 },
        { label: 'East Hall',  ranges: [[19, 22]], offset: { lat:  0.00000, lng: +0.00026 }, zoom: 20 },
        { label: 'South Hall', ranges: [[49, 65]], offset: { lat: -0.00024, lng:  0.00000 }, zoom: 20 },
        { label: 'West Hall',  ranges: [[00, 31]], offset: { lat:  0.00000, lng: -0.00026 }, zoom: 20 },
      ],
      fallback: { label: 'Center', offset: { lat: 0, lng: 0 }, zoom: 19 }
    }
  },

  'Hart Senate Office Building': {
    address: '120 Constitution Ave NE, Washington, DC 20510',
       lat: 38.89287825629864,
    lng: -77.00483097397986, zoom: 19,
    marker: {
      modulo: 100,
      sections: [
        // Use page 2 ranges labeled SH##–SH## on each side
        { label: 'North Hall', ranges: [[23, 32]], offset: { lat: +0.00024, lng:  0.00000 }, zoom: 20 },
        { label: 'East Hall',  ranges: [[10, 14]], offset: { lat:  0.00000, lng: +0.00026 }, zoom: 20 },
        { label: 'South Hall', ranges: [[01, 10]], offset: { lat: -0.00024, lng:  0.00000 }, zoom: 20 },
        { label: 'West Hall',  ranges: [[14, 23]], offset: { lat:  0.00000, lng: -0.00026 }, zoom: 20 },
      ],
      fallback: { label: 'Center', offset: { lat: 0, lng: 0 }, zoom: 19 }
    }
  }
};

