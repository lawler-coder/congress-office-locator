// app.js — clean working version wired to Congress.gov search

const SVG_NS = 'http://www.w3.org/2000/svg';
// Google Map handles
let GMAP = null;
let GMARKER = null;

if (typeof window !== 'undefined' && typeof window.initGMap !== 'function') {
  window.__googleMapsReady = false;
  window.__googleMapsInitQueue = window.__googleMapsInitQueue || [];
  window.initGMap = function initGMapFallback() {
    window.__googleMapsReady = true;
    const queue = window.__googleMapsInitQueue || [];
    window.__googleMapsInitQueue = [];
    for (let i = 0; i < queue.length; i++) {
      try {
        queue[i]();
      } catch (err) {
        console.error('Google Maps init callback failed', err);
      }
    }
  };
}

function onGoogleMapsReady(callback) {
  if (typeof callback !== 'function') return;

  const mapsReady = typeof window !== 'undefined' && window.__googleMapsReady;
  if (mapsReady && typeof google !== 'undefined' && google.maps) {
    callback();
    return;
  }

  const queue = (typeof window !== 'undefined' && window.__googleMapsInitQueue)
    ? window.__googleMapsInitQueue
    : [];

  if (queue.push) {
    queue.push(callback);
  }

  if (typeof window !== 'undefined' && !window.__googleMapsInitQueue) {
    window.__googleMapsInitQueue = queue;
  }
}

function createGoogleMapIfNeeded() {
  if (GMAP) return GMAP;
  if (typeof google === 'undefined' || !google.maps) return null;

  const el = document.getElementById('gmap');
  if (!el) return null;

  GMAP = new google.maps.Map(el, {
    center: { lat: 38.8899, lng: -77.0091 },
    zoom: 17,
    mapTypeId: 'roadmap',
    clickableIcons: false,
    gestureHandling: 'greedy',
  });

  return GMAP;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('member-name');
    const details = document.getElementById('member-details');
  const mapContainer = document.getElementById('map-container');
  const title = document.getElementById('map-title');
  const subtitle = document.getElementById('map-subtitle');

  onGoogleMapsReady(() => {
    createGoogleMapIfNeeded();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    try {
      // Calls the function from congress-api.js
      const matches = await searchMembersByName(query);

      if (!matches || matches.length === 0) {
        renderNotFound(details, mapContainer, title, subtitle, query);
        return;
      }

      // Prefer last-name matches, then fall back
      const member = pickBestMatch(query, matches);

      const location = resolveOfficeLocation(member);
      renderMemberDetails(details, member, location);
      renderMap(mapContainer, title, subtitle, member, location);
    } catch (err) {
      console.error(err);
      renderNotFound(details, mapContainer, title, subtitle, query);
    }
  });
});

/* ---------- Matching helpers (last-name friendly) ---------- */

function normalize(s) {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lastNameOf(fullName) {
  const parts = normalize(fullName).split(' ').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

function pickBestMatch(query, matches) {
  const q = normalize(query);
  const qLast = lastNameOf(query);
  let best = null, bestScore = -1;

  for (const m of matches) {
    const name = normalize(m.name);
    const mLast = lastNameOf(m.name);
    let score = 0;

    if (qLast && mLast === qLast) score = Math.max(score, 100);
    if (qLast && mLast.startsWith(qLast)) score = Math.max(score, 90);

    if (name === q) score = Math.max(score, 95);
    else if (name.startsWith(q)) score = Math.max(score, 85);
    else if (name.includes(q)) score = Math.max(score, 70);

    if (score > bestScore) { bestScore = score; best = m; }
  }
  return bestScore >= 70 ? best : (matches[0] ?? null);
}

/* ---------- UI renderers ---------- */

function renderNotFound(details, mapContainer, title, subtitle, query) {
  details.classList.remove('hidden');
  details.innerHTML = `
    <h2>No results</h2>
    <p>We couldn't find a match for "${escapeHtml(query)}". Try the full name of the member.</p>
  `;

  title.textContent = 'Member not found';
  subtitle.textContent = 'Double-check the spelling or try another name.';
  mapContainer.innerHTML = '<p class="placeholder">No map to display.</p>';
}

function renderMemberDetails(container, member, location) {
  container.classList.remove('hidden');
  const tel = (member.phone || '').replace(/[^0-9]/g, '');
  const buildingInfo = BUILDING_COORDS[member.building] || null;
  const section = location && location.section ? location.section : null;
  const addressText = member.address && member.address.trim()
    ? member.address
    : (buildingInfo && buildingInfo.address) || 'Washington, DC';

  container.innerHTML = `
    <header>
      <h2>${escapeHtml(member.name)}</h2>
      <div class="badge">${escapeHtml(member.chamber)} · ${escapeHtml(member.party)}</div>

  container.innerHTML = `
    <header>
      <h2>${escapeHtml(member.name)}</h2>
      <div class="badge">${escapeHtml(member.chamber)} · ${escapeHtml(member.party)}</div>
    </header>
    <dl>
      <div>
        <dt>State</dt>
        <dd>${escapeHtml(member.state ?? '')}</dd>
      </div>
    <div>
        <dt>Office</dt>
        <dd>${escapeHtml(member.office ?? '')} ${escapeHtml(member.building ?? '')}</dd>
      </div>
      <div>
        <dt>Floor</dt>
        <dd>${escapeHtml((member.floor ?? '').toString())}</dd>
      </div>
      ${section && section.label ? `
      <div>
        <dt>Wing / Hall</dt>
        <dd>${escapeHtml(section.label)}</dd>
      </div>` : ''}
      <div>
        <dt>Phone</dt>
        <dd>${tel ? `<a href="tel:${escapeHtml(tel)}">${escapeHtml(member.phone)}</a>` : ''}</dd>
      </div>
      <div>
        <dt>Address</dt>
        <dd>${escapeHtml(addressText)}</dd>
      </div>
    </dl>
    ${section && section.description ? `<p class="wing-note">${escapeHtml(section.description)}</p>` : ''}
  `;
}

function renderMap(mapContainer, title, subtitle, member, location) {
  const info = (location && location.building) || BUILDING_COORDS[member.building];
  const fallbackAddress = member.address || 'Building not recognized.';

  title.textContent = member.building || 'Washington, DC';
  if (location && location.section && location.section.label) {
    const lines = [location.section.label];
    if (info && info.address) lines.push(info.address);
    subtitle.textContent = lines.join(' · ');
  } else {
    subtitle.textContent = info ? info.address : fallbackAddress;
  }
  // Ensure a map DIV exists
  if (!document.getElementById('gmap')) {
    mapContainer.innerHTML = '<div id="gmap" style="width:100%;height:420px;"></div>';
    if (typeof google !== 'undefined' && !GMAP) initGMap();
  }

  // If Maps isn’t ready yet, try again shortly
 if (typeof google === 'undefined' || !GMAP) {␊
    setTimeout(() => renderMap(mapContainer, title, subtitle, member, location), 150);
    return;
  }

  if (!info || info.lat == null || info.lng == null) {␊
    GMAP.setCenter({ lat: 38.8899, lng: -77.0091 }); // fallback near the Capitol␊
    GMAP.setZoom(15);␊
    return;␊
  }␊
␊
  const pos = (location && location.position) || { lat: info.lat, lng: info.lng };
  GMAP.setCenter(pos);␊
  GMAP.setZoom((location && location.zoom) || 19);

  if (!GMARKER) {
    GMARKER = new google.maps.Marker({
      map: GMAP,
      position: pos,
      label: { text: '★', color: '#0b3d91', fontSize: '30px' }
    });
  } else {
    GMARKER.setPosition(pos);
  }
  }

function resolveOfficeLocation(member) {
  const buildingInfo = BUILDING_COORDS[member.building] || null;
  if (!buildingInfo) {
    return { building: null, section: null, position: null, zoom: 17 };
  }

  const section = findBuildingSection(buildingInfo, member.office);
  const offset = section && section.offset ? section.offset : null;
  const lat = buildingInfo.lat + (offset && offset.lat ? offset.lat : 0);
  const lng = buildingInfo.lng + (offset && offset.lng ? offset.lng : 0);

  return {
    building: buildingInfo,
    section: section || null,
    position: { lat, lng },
    zoom: (section && section.zoom) || buildingInfo.zoom || 19
  };
}

function findBuildingSection(buildingInfo, officeValue) {
  if (!buildingInfo || !buildingInfo.marker || !officeValue) return null;

  const digits = String(officeValue || '').match(/\d+/g);
  if (!digits || !digits.length) return buildingInfo.marker.fallback || null;

  const numeric = parseInt(digits.join(''), 10);
  if (!Number.isFinite(numeric)) return buildingInfo.marker.fallback || null;

  const marker = buildingInfo.marker;
  const index = computeMarkerIndex(marker.field, numeric);

  const sections = marker.sections || [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (sectionMatches(section, marker, numeric, index)) return section;
  }

  return marker.fallback || null;
}

function computeMarkerIndex(field, numeric) {
  switch (field) {
    case 'tens':
      return Math.floor((numeric % 100) / 10);
    case 'hundreds':
      return Math.floor((numeric % 1000) / 100);
    case 'hundredsAbsolute':
      return Math.floor(numeric / 100);
    default:
      return null;
  }
}

function sectionMatches(section, marker, numeric, index) {
  if (!section) return false;

  if (section.match != null) {
    const values = Array.isArray(section.match) ? section.match : [section.match];
    if (values.some((value) => value === index)) return true;
  }

  const ranges = section.ranges || [];
  if (ranges.length) {
    const modulo = section.modulo != null ? section.modulo : marker.modulo;
    const base = modulo ? (numeric % modulo) : numeric;
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      if (!range || range.length < 2) continue;
      const min = range[0];
      const max = range[1];
      if (base >= min && base <= max) return true;
    }
  }

  return false;
}
/* ---------- SVG helpers ---------- */

function createSvgCanvas(width, height) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'map-svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'presentation');
  svg.setAttribute('aria-hidden', 'true');
  return svg;
}

function createMarker(x, y) {
  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('class', 'office-marker');

  const halo = document.createElementNS(SVG_NS, 'circle');
  halo.setAttribute('cx', x);
  halo.setAttribute('cy', y);
  halo.setAttribute('r', 18);
  halo.setAttribute('opacity', '0.75');
  group.append(halo);

  const star = document.createElementNS(SVG_NS, 'polygon');
  star.setAttribute('points', createStarPoints(x, y - 2, 12, 5));
  group.append(star);

  return group;
}

function createStarPoints(cx, cy, outerRadius, innerRadius) {
  const points = [];
  const spikes = 5;
  const step = Math.PI / spikes;
  let rotation = -Math.PI / 2;

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(rotation) * radius;
    const y = cy + Math.sin(rotation) * radius;
    points.push(`${x},${y}`);
    rotation += step;
  }
  return points.join(' ');
}

/* ---------- Utilities ---------- */

function escapeHtml(value) {
  const safeValue = value ?? '';
  return String(safeValue)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}












