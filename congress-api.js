/* congress-api.js — compatible, exposes window.searchMembersByName */
/* Update the WORKER_BASE to your Cloudflare Worker URL */

(function () {
  'use strict';

  // 1) CHANGE THIS to your Worker URL, e.g. "https://congress-proxy-xyz.workers.dev"
  var WORKER_BASE = 'https://congress-proxy.lawler.workers.dev/';

  // Defensive helpers (no optional chaining)
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

  function parseOfficeFromAddress(address) {
    if (!address) return { building: null, office: null, floor: null };
    var bldgs = [
      'Cannon House Office Building',
      'Longworth House Office Building',
      'Rayburn House Office Building',
      'Hart Senate Office Building',
      'Dirksen Senate Office Building',
      'Russell Senate Office Building'
    ];
    var building = null;
    for (var i = 0; i < bldgs.length; i++) {
      if (address.indexOf(bldgs[i]) !== -1) { building = bldgs[i]; break; }
    }
    var office = null;
    var roomMatch = address.match(/(\b[0-9]{2,5}\b)\s+(?:[A-Za-z.\- ]+)?(?:House|Senate) Office Building/i);
    if (roomMatch) office = roomMatch[1];

    var floor = null;
    if (office && /^[0-9]{3,4}$/.test(office)) {
      floor = parseInt(office.charAt(0), 10);
      if (!(floor >= 1 && floor <= 7)) floor = null;
    }
    return { building: building, office: office, floor: floor };
  }

  function mapCongressMember(m) {
    var name =
      [get(m, 'name.first'), get(m, 'name.middle'), get(m, 'name.last')]
        .filter(function (x) { return !!x; })
        .join(' ') ||
      get(m, 'name.officialFull', 'Unknown');

    var party = get(m, 'party', get(m, 'currentParty', ''));
    var state = get(m, 'state', get(m, 'stateCode', ''));
    var phone = get(m, 'phone', get(m, 'office.phone', ''));
    var address = get(m, 'address', get(m, 'office.address', ''));

    var place = parseOfficeFromAddress(address);

    return {
      name: name,
      chamber: (get(m, 'chamber', get(m, 'role', '')) + '').indexOf('Senate') !== -1 ? 'Senate' : 'House',
      state: state,
      party: party,
      building: place.building || 'Washington, DC',
      office: place.office || '',
      floor: place.floor != null ? place.floor : '',
      phone: phone || '',
      coordinates: null // no coordinates from API (yet)
    };
  }

  // Main search function your app calls
  function searchMembersByName(query) {
    var url = WORKER_BASE.replace(/\/+$/, '') + '/member?format=json&limit=10&name=' + encodeURIComponent(query);

    return fetch(url).then(function (resp) {
      if (!resp.ok) throw new Error('Congress.gov proxy error ' + resp.status);
      return resp.json();
    }).then(function (data) {
      // Try common result shapes
      var items = data && (data.members || data.member || data.results || data.data) || [];
      if (!Array.isArray(items)) items = [];
      return items.map(mapCongressMember);
    });
  }

  // Expose to global so app.js can call it
  window.searchMembersByName = searchMembersByName;
})();
