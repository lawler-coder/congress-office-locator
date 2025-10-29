- const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
+ const CONGRESS_API_BASE = 'https://YOUR-WORKER-SUBDOMAIN.workers.dev';

 // ...


- });
+ const resp = await fetch(url); // key is added in the Worker


// Utility: pick building & office number out of an address string
function parseOfficeFromAddress(address) {
  if (!address) return { building: null, office: null, floor: null };
  const bldgs = [
    'Cannon House Office Building',
    'Longworth House Office Building',
    'Rayburn House Office Building',
    'Hart Senate Office Building',
    'Dirksen Senate Office Building',
    'Russell Senate Office Building'
  ];
  let building = null;
  for (const b of bldgs) {
    if (address.includes(b)) { building = b; break; }
  }
  // Try to capture a room/office number before the building name, e.g., "2433 Rayburn ..."
  let office = null;
  const roomMatch = address.match(/(\b[0-9]{2,5}\b)\s+(?:[A-Za-z.\- ]+)?(?:House|Senate) Office Building/i);
  if (roomMatch) office = roomMatch[1];

  // Heuristic for floor from office number (not perfect, but useful)
  let floor = null;
  if (office && /^\d{3,4}$/.test(office)) {
    floor = parseInt(office[0], 10);
    if (!(floor >= 1 && floor <= 7)) floor = null;
  }
  return { building, office, floor };
}

// Convert Congress.gov member JSON into the shape app.js expects
function mapCongressMember(m) {
  // These fields’ exact names come from the API; if a field is missing, we fall back safely.
  const name = [m?.name?.first, m?.name?.middle, m?.name?.last].filter(Boolean).join(' ') || m?.name?.officialFull || 'Unknown';
  const party = m?.party || m?.currentParty || '';
  const state = m?.state || m?.stateCode || '';
  const phone = m?.phone || m?.office?.phone || '';
  const address = m?.address || m?.office?.address || '';

  const { building, office, floor } = parseOfficeFromAddress(address);

  return {
    name,
    chamber: (m?.chamber || m?.role || '').includes('Senate') ? 'Senate' : 'House',
    state,
    party,
    building: building || 'Washington, DC',
    office: office || '',
    floor: floor ?? '',
    phone: phone || '',
    // No coordinates from the API; we can add these later for the map star:
    coordinates: null
  };
}

// Search by name using the Congress.gov API.
// We send your API key as a header. If the API ever prefers a query param, we can switch.
async function searchMembersByName(query) {
  const url = `${CONGRESS_API_BASE}/member?format=json&limit=10&name=${encodeURIComponent(query)}`;
  const resp = await fetch(url, {
    headers: { 'X-API-Key': CONGRESS_API_KEY }
  });
  if (!resp.ok) {
    throw new Error(`Congress.gov error ${resp.status}`);
  }
  const data = await resp.json();

  // The exact path to results can vary; try common shapes and flatten.
  const items =
    data?.members ||
    data?.member ||
    data?.results ||
    data?.data ||
    [];

  // Map and return results
  return items.map(mapCongressMember);
}
