// app.js — clean working version wired to Congress.gov search

const SVG_NS = 'http://www.w3.org/2000/svg';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('member-name');
  const details = document.getElementById('member-details');
  const mapContainer = document.getElementById('map-container');
  const title = document.getElementById('map-title');
  const subtitle = document.getElementById('map-subtitle');

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

      renderMemberDetails(details, member);
      renderMap(mapContainer, title, subtitle, member);
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

function renderMemberDetails(container, member) {
  container.classList.remove('hidden');
  const tel = (member.phone || '').replace(/[^0-9]/g, '');

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
      <div>
        <dt>Phone</dt>
        <dd>${tel ? `<a href="tel:${escapeHtml(tel)}">${escapeHtml(member.phone)}</a>` : ''}</dd>
      </div>
      <div>
        <dt>Address</dt>
        <dd>${escapeHtml(BUILDING_PLANS[member.building]?.address ?? 'Washington, DC')}</dd>
      </div>
    </dl>
  `;
}

function renderMap(mapContainer, title, subtitle, member) {
  const building = BUILDING_PLANS[member.building];
  if (!building) {
    title.textContent = `${member.office ?? ''} ${member.building ?? ''}`.trim();
    subtitle.textContent = 'We do not have a floor plan for this building yet.';
    mapContainer.innerHTML = '<p class="placeholder">Map unavailable.</p>';
    return;
  }

  const floorPlan = building.floors[member.floor];
  if (!floorPlan) {
    title.textContent = `${member.office ?? ''} · ${member.building}`;
    subtitle.textContent = `Floor ${member.floor} map not available yet.`;
    mapContainer.innerHTML = '<p class="placeholder">Map unavailable for this floor.</p>';
    return;
  }

  title.textContent = `${member.office ?? ''} · ${member.building}`;
  subtitle.textContent = `Floor ${member.floor} | ${building.address}`;

  const svg = createSvgCanvas(floorPlan.width, floorPlan.height);

  // Draw schematic shapes
  floorPlan.shapes.forEach((shape) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', shape.d);
    path.setAttribute('fill', shape.fill);
    path.setAttribute('stroke', '#c7d6f5');
    path.setAttribute('stroke-width', 2);
    svg.append(path);

    if (shape.label) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.textContent = shape.label;
      text.setAttribute('x', shape.labelX);
      text.setAttribute('y', shape.labelY);
      text.setAttribute('class', 'map-label');
      svg.append(text);
    }
  });

  // If we don’t have coordinates yet, don’t attempt to place a marker
  if (!member.coordinates) {
    mapContainer.innerHTML = '<p class="placeholder">No coordinate data available for this office.</p>';
    return;
  }

  const marker = createMarker(member.coordinates.x, member.coordinates.y);
  svg.append(marker);

  const label = document.createElementNS(SVG_NS, 'text');
  label.textContent = `${member.office}`;
  label.setAttribute('x', member.coordinates.x);
  label.setAttribute('y', member.coordinates.y - 24);
  label.setAttribute('text-anchor', 'middle');
  label.setAttribute('class', 'map-label');
  label.setAttribute('fill', '#0b3d91');
  label.setAttribute('font-weight', '700');
  svg.append(label);

  const wrapper = document.createElement('div');
  wrapper.className = 'map-canvas';
  wrapper.append(svg);

  mapContainer.innerHTML = '';
  mapContainer.append(wrapper);
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



