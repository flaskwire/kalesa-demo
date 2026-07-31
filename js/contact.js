/* ============================================
   Kalesa Group — contact.js
   EmailJS-powered contact form
   Same account as Flaskwire (publicKey preserved)
   Needs a new template in EmailJS dashboard:
     → service_g9au0xu  (reuse existing service)
     → template_XXXXXXX  (create new for Kalesa)
   ============================================ */

(function () {

  // ── CONFIG ─────────────────────────────────
  var EMAILJS_PUBLIC_KEY  = 'eKbesk7hql0zsWAg5';   // your existing key
  var EMAILJS_SERVICE_ID  = 'service_g9au0xu';       // your existing service
  var EMAILJS_TEMPLATE_ID = 'template_t8c9j4m'; // create new template → see README
  // ────────────────────────────────────────────

  // Init EmailJS
  if (window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  } else {
    console.warn('EmailJS not loaded — check the CDN script in contact.html');
    return;
  }

  var form       = document.getElementById('contactForm');
  var submitBtn  = document.getElementById('submitBtn');
  var formWrap   = document.getElementById('formWrap');
  var successMsg = document.getElementById('formSuccess');
  var errorMsg   = document.getElementById('formError');

  if (!form) return;

  // ── Validation rules ─────────────────────
  var rules = {
    fname:   { required: true, label: 'First name' },
    lname:   { required: true, label: 'Last name' },
    email:   {
      required: true, label: 'Email address',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMsg: 'Please enter a valid email address'
    },
    subject: { required: true, label: 'Subject' },
    message: {
      required: true, label: 'Message',
      minLength: 10,
      minLengthMsg: 'Please include at least a sentence (10+ characters) so we can help you better'
    }
  };
  var MESSAGE_MIN = rules.message.minLength;

  function getField(name) { return form.querySelector('[name="' + name + '"]'); }

  function showFieldError(name, msg) {
    var field = getField(name);
    if (!field) return;
    field.classList.add('field-error');
    var errEl = document.getElementById('err-' + name);
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
  }

  function clearFieldError(name) {
    var field = getField(name);
    if (!field) return;
    field.classList.remove('field-error');
    var errEl = document.getElementById('err-' + name);
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
  }

  function validateAll() {
    var valid = true;
    Object.keys(rules).forEach(function (name) {
      clearFieldError(name);
      var rule  = rules[name];
      var field = getField(name);
      if (!field) return;
      var val = field.value.trim();

      if (rule.required && !val) {
        showFieldError(name, rule.label + ' is required.');
        valid = false; return;
      }
      if (rule.pattern && val && !rule.pattern.test(val)) {
        showFieldError(name, rule.patternMsg);
        valid = false; return;
      }
      if (rule.minLength && val.length < rule.minLength) {
        showFieldError(name, rule.minLengthMsg);
        valid = false;
      }
    });
    return valid;
  }

  // Live validation on blur + clear on input
  Object.keys(rules).forEach(function (name) {
    var field = getField(name);
    if (!field) return;
    field.addEventListener('blur', function () {
      clearFieldError(name);
      var rule = rules[name];
      var val  = field.value.trim();
      if (rule.required && !val) { showFieldError(name, rule.label + ' is required.'); return; }
      if (rule.pattern && val && !rule.pattern.test(val)) { showFieldError(name, rule.patternMsg); return; }
      if (rule.minLength && val && val.length < rule.minLength) showFieldError(name, rule.minLengthMsg);
    });
    field.addEventListener('input', function () {
      if (field.classList.contains('field-error')) clearFieldError(name);
    });
  });

  // ── Live character counter for message field ─
  var messageField = getField('message');
  var charCountEl   = document.getElementById('messageCharCount');
  function updateCharCount() {
    if (!messageField || !charCountEl) return;
    var len = messageField.value.trim().length;
    charCountEl.textContent = len + ' / ' + MESSAGE_MIN;
    charCountEl.classList.toggle('ok', len >= MESSAGE_MIN);
  }
  if (messageField) {
    messageField.addEventListener('input', updateCharCount);
    updateCharCount();
  }

  // ── Submit ───────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    hideMessages();
    if (!validateAll()) { scrollToFirstError(); return; }

    // Guard: warn if template not configured yet
    if (EMAILJS_TEMPLATE_ID.indexOf('REPLACE_WITH') !== -1) {
      showGlobalError('⚠ EmailJS template not yet configured. See js/contact.js line 10 and the EmailJS setup guide.');
      return;
    }

    setLoading(true);

    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
      .then(function () {
        setLoading(false);
        resetFormFully();
        showSuccess();
      })
      .catch(function (err) {
        setLoading(false);
        var msg = (err && err.text) ? err.text : 'Something went wrong. Please try emailing us directly at sales@kalesagroup.com';
        showGlobalError(msg);
        console.error('EmailJS error:', err);
      });
  });

  // Clear the form completely: native reset, plus explicit per-field
  // clearing as a fallback (covers select elements and any lingering
  // browser form-restore behavior), plus clear all validation state.
  function resetFormFully() {
    form.reset();
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.tagName === 'SELECT') { el.selectedIndex = 0; }
      else if (el.type !== 'submit' && el.type !== 'button') { el.value = ''; }
    });
    Object.keys(rules).forEach(clearFieldError);
    updateCharCount();
  }

  // Guard against browsers restoring old field values when the page is
  // loaded from bfcache (e.g. hitting Back after a successful submit).
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && successMsg && successMsg.style.display === 'flex') {
      resetFormFully();
    }
  });

  // ── UI helpers ───────────────────────────
  var SEND_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.innerHTML = on
      ? '<span class="btn-spinner"></span> Sending…'
      : 'Send Message ' + SEND_ICON;
  }

  function hideMessages() {
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg)   errorMsg.style.display   = 'none';
  }

  function showSuccess() {
    if (formWrap)   formWrap.style.display   = 'none';
    if (successMsg) successMsg.style.display = 'flex';
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showGlobalError(msg) {
    if (!errorMsg) return;
    errorMsg.querySelector('.error-text').textContent = msg;
    errorMsg.style.display = 'flex';
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function scrollToFirstError() {
    var first = form.querySelector('.field-error');
    if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); first.focus(); }
  }

})();