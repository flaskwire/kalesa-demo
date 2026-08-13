/* ============================================================
   Kalesa Group — cms-content.js  v2
   - Loads settings on every page
   - Loads page-specific JSON automatically
   - data-cms="file:key.path"      → sets textContent
   - data-cms-html="file:key.path" → sets innerHTML
   - data-cms-href="file:key.path" → sets href
   - data-cms-phone                → sets phone text + href
   - data-cms-email                → sets email text + href
   - data-cms-year                 → sets current year
   ============================================================ */

(function () {

  /* ── Resolve dot-notation path ── */
  function get(obj, path) {
    return path.split('.').reduce(function (o, k) {
      return o && o[k] !== undefined ? o[k] : null;
    }, obj);
  }

  /* ── Populate all tagged elements ── */
  function populate(data) {

    // data-cms="file:key.path" → textContent
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var parts = el.getAttribute('data-cms').split(':');
      var val   = get(data[parts[0]], parts[1]);
      if (val !== null && val !== '') el.textContent = val;
    });

    // data-cms-html="file:key.path" → innerHTML
    document.querySelectorAll('[data-cms-html]').forEach(function (el) {
      var parts = el.getAttribute('data-cms-html').split(':');
      var val   = get(data[parts[0]], parts[1]);
      if (val !== null && val !== '') el.innerHTML = val;
    });

    // data-cms-href="file:key.path" → href
    document.querySelectorAll('[data-cms-href]').forEach(function (el) {
      var parts = el.getAttribute('data-cms-href').split(':');
      var val   = get(data[parts[0]], parts[1]);
      if (val) el.setAttribute('href', val);
    });

    // data-cms-phone → phone text + tel: href from settings.phone
    document.querySelectorAll('[data-cms-phone]').forEach(function (el) {
      var phone = get(data['settings'], 'phone');
      if (!phone) return;
      el.textContent = phone;
      el.setAttribute('href', 'tel:' + phone.replace(/[^+\d]/g, ''));
    });

    // data-cms-email → email text + mailto: href from settings.email
    document.querySelectorAll('[data-cms-email]').forEach(function (el) {
      var email = get(data['settings'], 'email');
      if (!email) return;
      el.textContent = email;
      el.setAttribute('href', 'mailto:' + email);
    });

    // data-cms-year → current year (no JSON needed)
    document.querySelectorAll('[data-cms-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    // data-cms-taglist="file:key.path" → renders array of {text, primary}
    // as <span class="agency-tag [primary]">text</span> inside the container
    document.querySelectorAll('[data-cms-taglist]').forEach(function (el) {
      var parts = el.getAttribute('data-cms-taglist').split(':');
      var arr   = get(data[parts[0]], parts[1]);
      if (!Array.isArray(arr)) return;
      el.innerHTML = arr.map(function (item) {
        var cls = 'agency-tag' + (item.primary ? ' primary' : '');
        return '<span class="' + cls + '">' + item.text + '</span>';
      }).join('\n');
    });
  }

  /* ── Determine which JSON files to load ── */
  var page  = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  var files = ['settings'];   // always load settings

  var pageMap = {
    'index':            'home',
    '':                 'home',
    'services':         'services',
    'government':       'government',
    'about':            'about',
    'past-performance': 'performance',
    'contact':          'settings'   // settings only
  };

  if (pageMap[page] && pageMap[page] !== 'settings') {
    files.push(pageMap[page]);
  }

  /* ── Fetch all files in parallel ── */
  var data = {};

  Promise.all(files.map(function (name) {
    return fetch('/_data/' + name + '.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) { if (json) data[name] = json; })
      .catch(function () {});
  })).then(function () {
    populate(data);
    document.dispatchEvent(new CustomEvent('cms:ready', { detail: data }));
  });

})();
