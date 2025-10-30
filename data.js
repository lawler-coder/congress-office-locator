// Minimal building info: we’ll use Google Maps for the actual shapes.
// (These addresses are used for the details card; the map uses lat/lng below.)
const BUILDING_COORDS = {
   'Cannon House Office Building': {
    address: 'Cannon House Office Building, Washington, DC 20515',
    lat: 38.88668839987316,
    lng: -77.00694138122337,
    zoom: 19,
    marker: {
      field: 'tens',
      modulo: 100,
      sections: [
        {
          label: 'Independence Ave SE (South Hall)',
          description: 'Rooms in the 00s and 50s run along Independence Avenue toward the Capitol.',
          match: [0, 5],
          offset: { lat: -0.00018, lng: 0 }
        },
        {
          label: 'New Jersey Ave SE (West Hall)',
          description: 'Offices in the 10s and 60s face New Jersey Avenue SE.',
          match: [1, 6],
          offset: { lat: -0.00002, lng: -0.00018 }
        },
        {
          label: 'C Street SE (North Hall)',
          description: 'Numbers in the 20s and 70s line the C Street side of the building.',
          match: [2, 7],
          offset: { lat: 0.0002, lng: -0.00002 }
        },
        {
          label: 'First Street SE (East Hall)',
          description: 'Rooms in the 30s and 80s are closest to First Street SE.',
          match: [3, 8],
          offset: { lat: 0.00002, lng: 0.00018 }
        },
        {
          label: 'Southeast Corner Corridor',
          description: 'High 40s and 90s numbers sit on the Independence Avenue & First Street corner.',
          match: [4, 9],
          offset: { lat: -0.00014, lng: 0.00016 }
        }
      ]
    }
  },
  'Longworth House Office Building': {
    address: 'Longworth House Office Building, Washington, DC 20515',
    lat: 38.88651283713331,
    lng: -77.0083668319861,
    zoom: 19,
    marker: {
      field: 'hundreds',
      modulo: 1000,
      sections: [
        {
          label: 'Independence Ave SE (South Hall)',
          description: '1000-1099 and 1500-1599 offices line Independence Avenue SE.',
          ranges: [[0, 99], [500, 599]],
          offset: { lat: -0.00024, lng: 0 }
        },
        {
          label: 'South Capitol St SE (Southwest Hall)',
          description: '1100-1199 and 1600-1699 rooms are nearest South Capitol Street.',
          ranges: [[100, 199], [600, 699]],
          offset: { lat: -0.00002, lng: -0.00023 }
        },
        {
          label: 'C Street SE (North Hall)',
          description: '1200-1299 and 1700-1799 suites back onto C Street SE.',
          ranges: [[200, 299], [700, 799]],
          offset: { lat: 0.00025, lng: -0.00004 }
        },
        {
          label: 'New Jersey Ave SE (Northeast Hall)',
          description: '1300-1399 and 1800-1899 numbers sit along New Jersey Avenue.',
          ranges: [[300, 399], [800, 899]],
          offset: { lat: 0.00004, lng: 0.00024 }
        },
        {
          label: 'First Street SE (Southeast Hall)',
          description: '1400-1499 and 1900-1999 offices wrap toward First Street SE.',
          ranges: [[400, 499], [900, 999]],
          offset: { lat: -0.00018, lng: 0.00022 }
        }
      ]
    }
  },
  'Rayburn House Office Building': {
    address: 'Rayburn House Office Building, Washington, DC 20515',
    lat: 38.886811,
    lng: -77.010568,
    zoom: 19,
    marker: {
      field: 'hundreds',
      modulo: 1000,
      sections: [
        {
          label: 'Independence Ave SW (South Hall)',
          description: '2000-2099 and 2500-2599 rooms run along Independence Avenue SW.',
          ranges: [[0, 99], [500, 599]],
          offset: { lat: -0.00026, lng: 0 }
        },
        {
          label: 'South Capitol St SW (Southwest Hall)',
          description: '2100-2199 and 2600-2699 suites line South Capitol Street.',
          ranges: [[100, 199], [600, 699]],
          offset: { lat: -0.00004, lng: -0.00028 }
        },
        {
          label: 'C Street SW (North Hall)',
          description: '2200-2299 and 2700-2799 numbers face C Street SW.',
          ranges: [[200, 299], [700, 799]],
          offset: { lat: 0.00027, lng: -0.00004 }
        },
        {
          label: 'First Street SW (Northeast Hall)',
          description: '2300-2399 and 2800-2899 rooms are closest to First Street SW.',
          ranges: [[300, 399], [800, 899]],
          offset: { lat: 0.00004, lng: 0.00027 }
        },
        {
          label: 'SE Corner Corridor',
          description: '2400-2499 and 2900-2999 offices curve toward Independence & First Streets.',
          ranges: [[400, 499], [900, 999]],
          offset: { lat: -0.00016, lng: 0.00025 }
        }
      ]
    }
  },
  'Hart Senate Office Building': {
    address: '120 Constitution Ave NE, Washington, DC 20510',
    lat: 38.89287825629864,
    lng: -77.00483097397986,
    zoom: 19,
    marker: {
      field: 'hundreds',
      modulo: 1000,
      sections: [
        {
          label: 'Constitution Ave NE (South Hall)',
          description: '100-149 and 500-549 suites open toward Constitution Avenue.',
          ranges: [[100, 149], [300, 349], [500, 549], [700, 749]],
          offset: { lat: -0.0002, lng: 0 }
        },
        {
          label: '2nd Street NE (West Hall)',
          description: '150-199 and 550-599 rooms line the 2nd Street side.',
          ranges: [[150, 199], [350, 399], [550, 599], [750, 799]],
          offset: { lat: -0.00003, lng: -0.00016 }
        },
        {
          label: 'C Street NE (North Hall)',
          description: '200-249 and 600-649 numbers face C Street NE.',
          ranges: [[200, 249], [400, 449], [600, 649], [800, 849]],
          offset: { lat: 0.0002, lng: -0.00002 }
        },
        {
          label: '1st Street NE (East Hall)',
          description: '250-299 and 650-699 suites look toward 1st Street NE.',
          ranges: [[250, 299], [450, 499], [650, 699], [850, 899]],
          offset: { lat: 0.00002, lng: 0.00016 }
        },
        // Connector rooms use the nearest primary hall offsets.
      ]
    }
  },
  'Dirksen Senate Office Building': {
    address: '50 Constitution Ave NE, Washington, DC 20510',
    lat: 38.893070317087286,
    lng: -77.00551761952482,
    zoom: 19,
    marker: {
      field: 'hundreds',
      modulo: 1000,
      sections: [
        {
          label: 'Constitution Ave NE (South Hall)',
          description: '100-149 and 500-549 offices front Constitution Avenue.',
          ranges: [[100, 149], [300, 349], [500, 549], [700, 749]],
          offset: { lat: -0.00022, lng: 0 }
        },
        {
          label: '1st Street NE (West Hall)',
          description: '150-199 and 550-599 suites face 1st Street NE.',
          ranges: [[150, 199], [350, 399], [550, 599], [750, 799]],
          offset: { lat: -0.00002, lng: -0.00018 }
        },
        {
          label: 'C Street NE (North Hall)',
          description: '200-249 and 600-649 numbers sit along C Street NE.',
          ranges: [[200, 249], [400, 449], [600, 649], [800, 849]],
          offset: { lat: 0.00022, lng: -0.00002 }
        },
        {
          label: '2nd Street NE (East Hall)',
          description: '250-299 and 650-699 rooms run along 2nd Street NE.',
          ranges: [[250, 299], [450, 499], [650, 699], [850, 899]],
          offset: { lat: 0.00002, lng: 0.00018 }
        },
        // Connector rooms use the nearest primary hall offsets.
      ]
    }
  },
  'Russell Senate Office Building': {
    address: '2 Constitution Ave NE, Washington, DC 20510',
    lat: 38.892636091955296,
    lng: -77.00691236828801,
    zoom: 19,
    marker: {
      field: 'hundreds',
      modulo: 1000,
      sections: [
        {
          label: 'Constitution Ave NE (South Hall)',
          description: '100-149 and 500-549 suites face Constitution Avenue.',
          ranges: [[100, 149], [300, 349], [500, 549], [700, 749]],
          offset: { lat: -0.00022, lng: 0 }
        },
        {
          label: '1st Street NE (West Hall)',
          description: '150-199 and 550-599 offices run along 1st Street NE.',
          ranges: [[150, 199], [350, 399], [550, 599], [750, 799]],
          offset: { lat: -0.00002, lng: -0.00018 }
        },
        {
          label: 'C Street NE (North Hall)',
          description: '200-249 and 600-649 rooms align with C Street NE.',
          ranges: [[200, 249], [400, 449], [600, 649], [800, 849]],
          offset: { lat: 0.00022, lng: -0.00002 }
        },
        {
          label: 'Delaware Ave NE (East Hall)',
          description: '250-299 and 650-699 suites sit toward Delaware Avenue NE.',
          ranges: [[250, 299], [450, 499], [650, 699], [850, 899]],
          offset: { lat: 0.00002, lng: 0.00018 }
        },
        // Rotunda-adjacent rooms inherit the surrounding hall offset.
      ]
    }
  }
};




