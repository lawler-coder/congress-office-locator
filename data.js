const BUILDING_PLANS = {
  'Cannon House Office Building': {
    address: '27 Independence Ave SE, Washington, DC 20515',
    floors: {
      2: {
        width: 620,
        height: 360,
        shapes: [
          {
            d: 'M30 30 H590 V160 H30 Z',
            fill: '#f0f4ff',
            label: 'South Corridor',
            labelX: 110,
            labelY: 95
          },
          {
            d: 'M30 200 H280 V330 H30 Z',
            fill: '#e9efff',
            label: 'Center Corridor',
            labelX: 100,
            labelY: 280
          },
          {
            d: 'M330 200 H590 V330 H330 Z',
            fill: '#f0f4ff',
            label: 'North Corridor',
            labelX: 460,
            labelY: 280
          }
        ]
      },
      4: {
        width: 620,
        height: 360,
        shapes: [
          {
            d: 'M30 40 H590 V150 H30 Z',
            fill: '#f7faff',
            label: 'South Corridor',
            labelX: 120,
            labelY: 100
          },
          {
            d: 'M30 190 H280 V320 H30 Z',
            fill: '#edf2ff',
            label: 'Center Corridor',
            labelX: 100,
            labelY: 260
          },
          {
            d: 'M330 190 H590 V320 H330 Z',
            fill: '#f7faff',
            label: 'North Corridor',
            labelX: 455,
            labelY: 260
          }
        ]
      }
    }
  },
  'Longworth House Office Building': {
    address: '15 Independence Ave SE, Washington, DC 20515',
    floors: {
      1: {
        width: 620,
        height: 360,
        shapes: [
          {
            d: 'M40 50 H580 V140 H40 Z',
            fill: '#f5f9ff',
            label: 'East Wing',
            labelX: 180,
            labelY: 105
          },
          {
            d: 'M40 180 H300 V320 H40 Z',
            fill: '#e8f0ff',
            label: 'Center Atrium',
            labelX: 160,
            labelY: 260
          },
          {
            d: 'M340 180 H580 V320 H340 Z',
            fill: '#f5f9ff',
            label: 'West Wing',
            labelX: 460,
            labelY: 260
          }
        ]
      }
    }
  },
  'Rayburn House Office Building': {
    address: '45 Independence Ave SW, Washington, DC 20515',
    floors: {
      2: {
        width: 640,
        height: 360,
        shapes: [
          {
            d: 'M40 40 H600 V120 H40 Z',
            fill: '#f0f7ff',
            label: 'South Hall',
            labelX: 180,
            labelY: 90
          },
          {
            d: 'M40 160 H280 V320 H40 Z',
            fill: '#e5efff',
            label: 'Center Hall',
            labelX: 150,
            labelY: 250
          },
          {
            d: 'M320 160 H600 V320 H320 Z',
            fill: '#f0f7ff',
            label: 'North Hall',
            labelX: 470,
            labelY: 250
          }
        ]
      }
    }
  },
  'Hart Senate Office Building': {
    address: '120 Constitution Ave NE, Washington, DC 20510',
    floors: {
      3: {
        width: 620,
        height: 360,
        shapes: [
          {
            d: 'M50 60 H570 V140 H50 Z',
            fill: '#eef5ff',
            label: 'South Atrium',
            labelX: 200,
            labelY: 105
          },
          {
            d: 'M50 180 H300 V320 H50 Z',
            fill: '#dde9ff',
            label: 'Center Hall',
            labelX: 170,
            labelY: 260
          },
          {
            d: 'M340 180 H570 V320 H340 Z',
            fill: '#eef5ff',
            label: 'North Hall',
            labelX: 460,
            labelY: 260
          }
        ]
      },
      5: {
        width: 620,
        height: 360,
        shapes: [
          {
            d: 'M60 50 H560 V150 H60 Z',
            fill: '#f4f8ff',
            label: 'South Atrium',
            labelX: 210,
            labelY: 105
          },
          {
            d: 'M60 190 H300 V320 H60 Z',
            fill: '#e7f0ff',
            label: 'Center Hall',
            labelX: 170,
            labelY: 260
          },
          {
            d: 'M340 190 H560 V320 H340 Z',
            fill: '#f4f8ff',
            label: 'North Hall',
            labelX: 460,
            labelY: 260
          }
        ]
      }
    }
  },
  'Dirksen Senate Office Building': {
    address: '50 Constitution Ave NE, Washington, DC 20510',
    floors: {
      3: {
        width: 620,
        height: 360,
        shapes: [
          {
            d: 'M40 50 H580 V140 H40 Z',
            fill: '#edf3ff',
            label: 'South Corridor',
            labelX: 200,
            labelY: 100
          },
          {
            d: 'M40 180 H300 V320 H40 Z',
            fill: '#dee8ff',
            label: 'Center Corridor',
            labelX: 170,
            labelY: 260
          },
          {
            d: 'M340 180 H580 V320 H340 Z',
            fill: '#edf3ff',
            label: 'North Corridor',
            labelX: 460,
            labelY: 260
          }
        ]
      }
    }
  },
  'Russell Senate Office Building': {
    address: '2 Constitution Ave NE, Washington, DC 20510',
    floors: {
      3: {
        width: 620,
        height: 360,
        shapes: [
          {
            d: 'M50 60 H570 V140 H50 Z',
            fill: '#f2f6ff',
            label: 'Constitution Ave',
            labelX: 240,
            labelY: 105
          },
          {
            d: 'M50 180 H300 V320 H50 Z',
            fill: '#e0eaff',
            label: 'Center Wing',
            labelX: 170,
            labelY: 260
          },
          {
            d: 'M340 180 H570 V320 H340 Z',
            fill: '#f2f6ff',
            label: 'Inner Wing',
            labelX: 460,
            labelY: 260
          }
        ]
      }
    }
  }
};

const MEMBERS = [
  {
    name: 'Hakeem Jeffries',
    chamber: 'House',
    state: 'NY',
    party: 'Democrat',
    building: 'Rayburn House Office Building',
    office: '2433',
    floor: 2,
    phone: '(202) 225-5936',
    coordinates: { x: 470, y: 250 }
  },
  {
    name: 'Alexandria Ocasio-Cortez',
    chamber: 'House',
    state: 'NY',
    party: 'Democrat',
    building: 'Cannon House Office Building',
    office: '229',
    floor: 2,
    phone: '(202) 225-3965',
    coordinates: { x: 180, y: 110 }
  },
  {
    name: 'Nancy Pelosi',
    chamber: 'House',
    state: 'CA',
    party: 'Democrat',
    building: 'Longworth House Office Building',
    office: '1236',
    floor: 1,
    phone: '(202) 225-4965',
    coordinates: { x: 450, y: 250 }
  },
  {
    name: 'Jim Jordan',
    chamber: 'House',
    state: 'OH',
    party: 'Republican',
    building: 'Rayburn House Office Building',
    office: '2056',
    floor: 2,
    phone: '(202) 225-2676',
    coordinates: { x: 220, y: 230 }
  },
  {
    name: 'Pramila Jayapal',
    chamber: 'House',
    state: 'WA',
    party: 'Democrat',
    building: 'Rayburn House Office Building',
    office: '2346',
    floor: 2,
    phone: '(202) 225-3106',
    coordinates: { x: 350, y: 190 }
  },
  {
    name: 'Ayanna Pressley',
    chamber: 'House',
    state: 'MA',
    party: 'Democrat',
    building: 'Cannon House Office Building',
    office: '410',
    floor: 4,
    phone: '(202) 225-5111',
    coordinates: { x: 360, y: 240 }
  },
  {
    name: 'Dan Crenshaw',
    chamber: 'House',
    state: 'TX',
    party: 'Republican',
    building: 'Cannon House Office Building',
    office: '413',
    floor: 4,
    phone: '(202) 225-6565',
    coordinates: { x: 500, y: 250 }
  },
  {
    name: 'Chuck Schumer',
    chamber: 'Senate',
    state: 'NY',
    party: 'Democrat',
    building: 'Hart Senate Office Building',
    office: '322',
    floor: 3,
    phone: '(202) 224-6542',
    coordinates: { x: 420, y: 230 }
  },
  {
    name: 'Mitch McConnell',
    chamber: 'Senate',
    state: 'KY',
    party: 'Republican',
    building: 'Russell Senate Office Building',
    office: '317',
    floor: 3,
    phone: '(202) 224-2541',
    coordinates: { x: 260, y: 220 }
  },
  {
    name: 'Bernie Sanders',
    chamber: 'Senate',
    state: 'VT',
    party: 'Independent',
    building: 'Dirksen Senate Office Building',
    office: '332',
    floor: 3,
    phone: '(202) 224-5141',
    coordinates: { x: 470, y: 240 }
  },
  {
    name: 'Elizabeth Warren',
    chamber: 'Senate',
    state: 'MA',
    party: 'Democrat',
    building: 'Hart Senate Office Building',
    office: '309',
    floor: 3,
    phone: '(202) 224-4543',
    coordinates: { x: 220, y: 240 }
  },
  {
    name: 'John Cornyn',
    chamber: 'Senate',
    state: 'TX',
    party: 'Republican',
    building: 'Hart Senate Office Building',
    office: '517',
    floor: 5,
    phone: '(202) 224-2934',
    coordinates: { x: 360, y: 230 }
  }
];

const MEMBER_INDEX = new Map(
  MEMBERS.map((member) => [member.name.toLowerCase(), member])
);