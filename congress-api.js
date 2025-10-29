/* congress-api.js — robust mapper + global export for app.js */

(function () {
  'use strict';

  // CHANGE THIS to your Worker URL
  var WORKER_BASE = 'https://congress-proxy.lawler.workers.dev';

  // Defensive getters (no optional chaining)
  function get(obj, path, fallback) {
    try {
      var parts = path.split('.');
      var cur = obj;
      for (var i = 0; i < parts.length; i++) {
        if (cur == null) return fallback;
        cur = cur[parts[i]];
      }
      return (cur == null ? fallback : cur);
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

  // Pull building / office # / floor from a DC address string
  function parseOfficeFromAddress(address) {
    if (!address) return { building: 'Washington, DC', office: '', floor: '' };

    var bldgs = [
      'Cannon House Office Building',
      'Longworth House Office Building',
      'Rayburn House Office Building',
      'Hart Senate Office Building',
      'Dirksen Senate Office Building',
      'Russell Senate Office Building'
    ];

    var building = 'Washington, DC';
    for (var i = 0; i < bldgs.length; i++) {
      if (address.indexOf(bldgs[i]) !== -1) { building = bldgs[i]; break; }
    }

    // Try to capture a room number before “… House/Senate Office Building”
    var office = '';
    var m = address.match(/(\b[0-9]{2,5}\b)\s+(?:[A-Za-z.\- ]+)?(?:House|Senate) Office Building/i);
    if (m) office = m[1];

    var floor = '';
    if (/^[0-9]{3,4}$/.test(office)) {
      var f = parseInt(office.charAt(0), 10);
      if (f >= 1 && f <= 7) floor = String(f);
    }

    return { building: building, office: office, floor: floor };
  }

  // Map one Congress.gov member into the app’s shape
  function mapCongressMember(m) {
    // Names (try many shapes)
    var fullName = coalesce(
      get(m, 'name.officialFull'),
      [get(m, 'name.first'), get(m, 'name.middle'), get(m, 'name.last')].filter(Boolean).join(' '),
      get(m, 'fullName'),
      get(m, 'officialName'),
      get(m, 'memberName'),
      'Unknown'
    );

    // House/Senate (varies by feed)
    var chamberRaw = coalesce(get(m, 'chamber'), get(m, 'role'), get(m, 'roles.0.chamber'), '');
    var chamber = (String(chamberRaw).toLowerCase().indexOf('senate') !== -1) ? 'Senate' : 'House';

    // Party
    var party = coalesce(get(m, 'party'), get(m, 'currentParty'), get(m, 'partyName'), '');

    // State
    var state = coalesce(get(m, 'state'), get(m, 'stateCode'), get(m, 'stateTerritory'), '');

    // Phones / addresses show up in a few places
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
      name: fullName,
      chamber: chamber,
      state: state,
      party: party,
      building: place.building,
      office: place.office,
      floor: place.floor,
      phone: phone,
      coordinates: null // we’ll handle building schematic separately
    };
  }

  // Extract list from many possible response shapes
  function extractItems(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;

    // Common containers
    if (Array.isArray(json.members)) return json.members;
    if (Array.isArray(json.member)) return json.member;
    if (Array.isArray(json.results)) return json.results;
    if (json.data && Array.isArray(json.data)) return json.data;

    // Some feeds nest one level down
    if (json.results && json.results[0] && Array.isArray(json.results[0].members)) {
      return json.results[0].members;
    }

    // Last resort: find first array in object
    for (var k in json) {
      if (Array.isArray(json[k])) return json[k];
    }
    return [];
  }

  // Main search used by app.js
  function searchMembersByName(query) {
    var url = WORKER_BASE.replace(/\/+$/, '') + '/member?format=json&limit=10&name=' + encodeURIComponent(query);
    return fetch(url).then(function (resp) {
      if (!resp.ok) throw new Error('Proxy error ' + resp.status);
      return resp.json();
    }).then(function (json) {
      var items = extractItems(json);
      return items.map(mapCongressMember);
    });
  }

  // Expose globally so app.js can call it
  window.searchMembersByName = searchMembersByName;
})();

