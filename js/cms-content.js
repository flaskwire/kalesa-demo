/* ============================================================
   Kalesa Group — cms-content.js
   Fetches _data/*.json and populates elements that have
   a [data-cms="key.path"] attribute.
   Runs on every page — only populates fields present on
   the current page, so safe to include everywhere.
   ============================================================ */

(function () {

  /* ── helpers ─────────────────────────────────────────────── */

  // Resolve a dot-notation path in an object
  // e.g. get(data, "hero.headline_1") → data.hero.headline_1
  function get(obj, path) {
    return path.split('.').reduce(function (o, k) {
      return o && o[k] !== undefined ? o[k] : null;
    }, obj);
  }

  // Set text or href on an element based on [data-cms] attribute
  // Attribute format:  data-cms="file:key.path"
  // e.g.              data-cms="home:hero.headline_1"
  //                   data-cms="settings:phone"         (sets text)
  //                   data-cms-href="settings:booking_url" (sets href)
  function populate(data) {
    // Text content
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var attr  = el.getAttribute('data-cms');
      var parts = attr.split(':');
      var file  = parts[0];
      var path  = parts[1];
      if (!data[file]) return;
      var value = get(data[file], path);
      if (value !== null && value !== '') el.textContent = value;
    });

    // HTML content (rich text)
    document.querySelectorAll('[data-cms-html]').forEach(function (el) {
      var attr  = el.getAttribute('data-cms-html');
      var parts = attr.split(':');
      var file  = parts[0];
      var path  = parts[1];
      if (!data[file]) return;
      var value = get(data[file], path);
      if (value !== null && value !== '') el.innerHTML = value;
    });

    // href attribute
    document.querySelectorAll('[data-cms-href]').forEach(function (el) {
      var attr  = el.getAttribute('data-cms-href');
      var parts = attr.split(':');
      var file  = parts[0];
      var path  = parts[1];
      if (!data[file]) return;
      var value = get(data[file], path);
      if (value) el.setAttribute('href', value);
    });

    // Populate phone links (href + text)
    document.querySelectorAll('[data-cms-phone]').forEach(function (el) {
      var phone = get(data['settings'], 'phone');
      if (!phone) return;
      el.textContent = phone;
      el.setAttribute('href', 'tel:' + phone.replace(/[^+\d]/g, ''));
    });

    // Populate email links
    document.querySelectorAll('[data-cms-email]').forEach(function (el) {
      var email = get(data['settings'], 'email');
      if (!email) return;
      el.textContent = email;
      el.setAttribute('href', 'mailto:' + email);
    });
  }

  /* ── figure out which JSON files this page needs ─────────── */
  var page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

  // Every page loads settings (phone, email, location)
  var files = ['settings'];

  if (page === 'index' || page === '')  files.push('home');
  if (page === 'services')              files.push('services');
  if (page === 'government')            files.push('government');
  // past-performance, about, contact use settings only for now

  /* ── fetch all needed files in parallel ──────────────────── */
  var data = {};
  var base = '/';   // adjust if site is not at root

  var fetches = files.map(function (name) {
    return fetch(base + '_data/' + name + '.json')
      .then(function (r) { return r.json(); })
      .then(function (json) { data[name] = json; })
      .catch(function () { /* file not found or network error — skip */ });
  });

  Promise.all(fetches).then(function () {
    populate(data);

    // Dispatch event so other scripts can react
    document.dispatchEvent(new CustomEvent('cms:ready', { detail: data }));
  });

})();
