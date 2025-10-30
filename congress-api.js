/* congress-api.js — Congress.gov proxy client for the Office Locator */

(function () {
  'use strict';

  // === CONFIG ===
  var WORKER_BASE = 'https://congress-proxy.lawler.workers.dev';
  var PAGE_SIZE = 250;
  var MAX_FETCH_ROUNDS = 12; // ~3,000 records

  var MEMBER_CACHE = [];
  var MEMBER_OFFSET = 0;
  var MEMBER_EXHAUSTED = false;
  var MEMBER_INFLIGHT = null;
  var DETAIL_CACHE = {};
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
function safeString(value) {
    return value == null ? '' : String(value);
  }

  function stripDiacritics(value) {
    if (value && value.normalize) {
      return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return value;
  }

  function normalizeText(value) {
    return stripDiacritics(safeString(value))
      .toLowerCase()
      .replace(/[^a-z0-9\s.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function displayNameFromSummary(summary) {
    var raw = coalesce(get(summary, 'directOrderName'), get(summary, 'name'));
    if (!raw) return '';
    var str = safeString(raw);
    if (str.indexOf(',') !== -1) {
      var parts = str.split(',');
      var last = parts[0].trim();
      var first = parts.slice(1).join(',').trim();
      if (first && last) return first + ' ' + last;
    }
    return str.trim();
  }

  function displayNameFromDetail(detail) {
    var direct = coalesce(get(detail, 'directOrderName'), get(detail, 'name'));
    if (direct) return safeString(direct);
    var first = safeString(get(detail, 'firstName')).trim();
    var middle = safeString(get(detail, 'middleName')).trim();
    var last = safeString(get(detail, 'lastName')).trim();
    var nameParts = [];
    if (first) nameParts.push(first);
    if (middle) nameParts.push(middle);
    if (last) nameParts.push(last);
    return nameParts.join(' ');
  }

  function lastNameFromNormalized(normalizedName) {
    if (!normalizedName) return '';
    var parts = normalizedName.split(' ').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
  }

  function summaryMatchesQuery(summary, normQuery, normLast) {
    var display = displayNameFromSummary(summary);
    var normalizedDisplay = normalizeText(display);
    if (normalizedDisplay && normalizedDisplay.indexOf(normQuery) !== -1) return true;

    var normalizedInverted = normalizeText(coalesce(get(summary, 'name'), get(summary, 'invertedOrderName')));
    if (normalizedInverted && normalizedInverted.indexOf(normQuery) !== -1) return true;

    if (normLast) {
      var last = lastNameFromNormalized(normalizedDisplay || normalizedInverted);
      if (last && last.indexOf(normLast) !== -1) return true;
    }
    return false;
  }

  function collectMatches(normQuery, normLast, pool) {
    var matches = [];
    for (var i = 0; i < pool.length; i++) {
      if (summaryMatchesQuery(pool[i], normQuery, normLast)) {
        matches.push(pool[i]);
      }
    }
    return matches;
  }

  function loadMoreSummaries() {
    if (MEMBER_EXHAUSTED) return Promise.resolve([]);
    if (MEMBER_INFLIGHT) return MEMBER_INFLIGHT;

    var url = WORKER_BASE.replace(/\/+$/, '') +
      '/member?format=json&limit=' + PAGE_SIZE + '&offset=' + MEMBER_OFFSET;

    MEMBER_INFLIGHT = fetch(url)
      .then(function (resp) {
        if (!resp.ok) throw new Error('Congress.gov proxy error ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        var items = extractItems(json);
        if (!items || !items.length) {
          MEMBER_EXHAUSTED = true;
          return [];
        }
        MEMBER_OFFSET += items.length;
        MEMBER_CACHE = MEMBER_CACHE.concat(items);
        return items;
      })
      .catch(function (err) {
        MEMBER_EXHAUSTED = true;
        throw err;
      });

    return MEMBER_INFLIGHT.then(function (items) {
      MEMBER_INFLIGHT = null;
      return items;
    }, function (err) {
      MEMBER_INFLIGHT = null;
      throw err;
    });
  }

  function ensureMatches(normQuery, normLast, roundsRemaining) {
    var current = collectMatches(normQuery, normLast, MEMBER_CACHE);
    if (current.length || MEMBER_EXHAUSTED || roundsRemaining <= 0) {
      return Promise.resolve(current);
    }
    return loadMoreSummaries().then(function () {
      return ensureMatches(normQuery, normLast, roundsRemaining - 1);
    });
  }

  function fetchMemberDetail(id) {
    if (!id) return Promise.resolve(null);
    if (DETAIL_CACHE[id]) return DETAIL_CACHE[id];

    var url = WORKER_BASE.replace(/\/+$/, '') + '/member/' + encodeURIComponent(id) + '?format=json';

    DETAIL_CACHE[id] = fetch(url)
      .then(function (resp) {
        if (!resp.ok) throw new Error('Congress.gov proxy detail error ' + resp.status);
        return resp.json();
      })
      .then(function (json) {
        return get(json, 'member', json);
      })
      .catch(function () {
        DETAIL_CACHE[id] = null;
        return null;
      });

    return DETAIL_CACHE[id];
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
  function mapCongressMember(summary, detail) {
    var record = detail || {};
    var displayName = coalesce(
      displayNameFromDetail(record),
      displayNameFromSummary(summary),
      'Unknown'
    );

    var party = coalesce(
      get(record, 'partyHistory.0.partyName'),
      get(record, 'partyName'),
      get(summary, 'partyName'),
      ''
    );

    var chamberSource = coalesce(
      get(record, 'terms.0.chamber'),
      get(summary, 'terms.item.0.chamber'),
      get(summary, 'terms[0].chamber'),
      ''
    );

    var state = coalesce(
      get(record, 'state'),
      get(record, 'terms.0.stateName'),
      get(summary, 'state'),
      ''
    );

    var phone = coalesce(
      get(record, 'addressInformation.phoneNumber'),
      get(record, 'phoneNumber'),
      get(summary, 'phone'),
      ''
    );

    var address = coalesce(
      get(record, 'addressInformation.officeAddress'),
      get(record, 'officeAddress'),
      ''
    );
    
    var place = parseOfficeFromAddress(address);

    return {
      id: coalesce(get(record, 'bioguideId'), get(summary, 'bioguideId'), ''),
      name: displayName,
      chamber: /senate/i.test(safeString(chamberSource)) ? 'Senate' : 'House',
      state: state,
      party: party,
      building: place.building,
      office: place.office,
      floor: place.floor,
      phone: phone,
      address: address
    };
  }

  // ---------- main fetch ----------
  function searchMembersByName(query) {
       var normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return Promise.resolve([]);

     var parts = normalizedQuery.split(' ').filter(Boolean);
    var normalizedLast = parts.length ? parts[parts.length - 1] : '';

    return ensureMatches(normalizedQuery, normalizedLast, MAX_FETCH_ROUNDS)
      .then(function () {
        var candidates = collectMatches(normalizedQuery, normalizedLast, MEMBER_CACHE);
        if (!candidates.length) return [];

        var unique = [];
        var seen = {};
        for (var i = 0; i < candidates.length; i++) {
          var candidate = candidates[i];
          var id = candidate && candidate.bioguideId;
          if (id) {
            if (seen[id]) continue;
            seen[id] = true;
          }
          unique.push(candidate);
        }

        var limited = unique.slice(0, 8);

        return Promise.all(limited.map(function (summary) {
          var summaryId = summary && summary.bioguideId;
          var detailPromise = summaryId ? fetchMemberDetail(summaryId) : Promise.resolve(null);
          return detailPromise
            .then(function (detail) { return mapCongressMember(summary, detail); })
            .catch(function () { return mapCongressMember(summary, null); });
        }));
      });
  }

  // expose to app.js
  window.searchMembersByName = searchMembersByName;
})();

