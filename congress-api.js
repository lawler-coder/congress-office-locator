/* congress-api.js — Congress.gov proxy client for the Office Locator */

(function () {
  'use strict';

  // === CONFIG ===
  var WORKER_BASE = 'https://congress-proxy.lawler.workers.dev';

  // ---------- helpers ----------
  function get(obj, path, fallback) {
    try {
      var parts = path.split('.');
      var cur = obj;
      for (var i = 0; i < parts.length; i++) {
        if (cur == null) return fallback;
        cur = cur[parts[i]];
      }
      return cur == null ? fallback : cur;
    } catch (e) {
      return fallback;
    }
  }

  function coalesce() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  }

  // ---------- address → building/office/floor ----------
  function parseOfficeFromAddress(address) {
    if (!address) return { building: 'Washington, DC', office: '', floor: '' };

    var txt = String(address || '').toLowerCase();
    txt = txt.replace(/\./g, '').replace(/\s+/g, ' ').trim();

    // office/room number (e.g., “2433 Rayburn HOB”)
    var office = '';
    var m = txt.match(/\b([0-9]{2,5})\b\s+(?:[a-z\- ]+)?(?:house|senate)\s+office\s+building/);
    if (m) office = m[1];

    // building synonyms
    var patterns = [
      { key: 'Rayburn House Office Building',  pats: ['rayburn', 'rhob'] },
      { key: 'Longworth House Office Building',pats: ['longworth', 'lhob'] },
      { key: 'Cannon House Office Building',   pats: ['cannon', 'chob'] },
      { key: 'Hart Senate Office Building',    pats: ['hart', 'hsob'] },
      { key: 'Dirksen Senate Office Building', pats: ['dirksen', 'dsob'] },
      { key: 'Russell Senate Office Building', pats: ['russell', 'rsob'] }
    ];
    var building = 'Washington, DC';
    outer: for (var i = 0; i < patterns.length; i++) {
      for (var j = 0; j < patterns[i].pats.length; j++) {
        if (txt.indexOf(patterns[i].pats[j]) !== -1) { building = patterns[i].key; break outer; }
      }
    }

    // heuristic floor from office number
    var floor = '';
    if (/^[0-9]{3,4}$/.test(office)) {
      var f = parseInt(office.charAt(0), 10);
      if (f >= 1 && f <= 7) floor = String(f);
    }
    return { building: building, office: office, floor: floor };
  }

  // ---------- extract array from Congress.gov response (robust) ----------
  function extractItems(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.members)) return json.members;
    if (Array.isArray(json.member)) return json.member;
    if (Array.isArray(json.results)) return json.results;
    if (json.data && Array.isArray(json.data)) return json.data;
    if (json.results && json.results[0] && Array.isArray(json.results[0].members)) {
      return json.results[0].members;
    }

    // breadth-first search for first array of objects
    var queue = [json], seen = new Set();
    while (queue.length) {
      var node = queue.shift();
      if (!node || typeof node !== 'object') continue;
      if (seen.has(node)) continue;
      seen.add(node);

      for (var k in node) {
        var v = node[k];
        if (Array.isArray(v) && v.length && typeof v[0] === 'object') return v;
      }
      for (var k2 in node) {
        var v2 = node[k2];
        if (v2 && typeof v2 === 'object') queue.push(v2);
      }
    }
    return [];
  }

  // ---------- map one member ----------
  function mapCongressMember(m) {
    var name = coalesce(
      get(m, 'name.officialFull'),
      [get(m, 'name.first'), get(m, 'name.middle'), get(m, 'name.last')].filter(Boolean).join(' '),
      get(m, 'fullName'),
      get(m, 'officialName'),
      get(m, 'memberName'),
      'Unknown'
    );
    var party = coalesce(get(m, 'party'), get(m, 'currentParty'), get(m, 'partyName'), '');
    var state = coalesce(get(m, 'state'), get(m, 'stateCode'), get(m, 'stateTerritory'), '');
    var phone = coalesce(get(m, 'phone'), get(m, 'office.phone'), get(m, 'dcPhone'), '');
    var address = coalesce(
      get(m, 'address'),
      get(m, 'office.address'),
      get(m, 'washingtonOffice.address'),
      get(m, 'dcAddress'),
      ''
    );
    var place = parseOfficeFromAddress(address);

    return {
      name: name,
      chamber: String(coalesce(get(m, 'chamber'), get(m, 'role'), '')).toLowerCase().indexOf('senate') !== -1
        ? 'Senate' : 'House',
      state: state,
      party: party,
      building: place.building,
      office: place.office,
      floor: place.floor,
      phone: phone,
      coordinates: null
    };
  }

  // ---------- main fetch ----------
  function searchMembersByName(query) {
    var url = WORKER_BASE.replace(/\/+$/, '') +
      '/member?format=json&limit=10&name=' + encodeURIComponent(query);

    return fetch(url)
      .then(function (resp) {
        if (!resp.ok) throw new Error('Congress.gov proxy error ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        var items = extractItems(json);
        return items.map(mapCongressMember);
      });
  }

  // expose to app.js
  window.searchMembersByName = searchMembersByName;
})();

