/* ============================================
   Kalesa Group — main.js
   Progressive enhancement via .js-ready body class
   ============================================ */
(function () {

  // Activate animations immediately
  document.body.classList.add('js-ready');

  // ---- Active nav link ----
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // ---- Mobile nav ----
  var toggle = document.querySelector('.nav-toggle');
  var navEl   = document.getElementById('navLinks');
  if (toggle && navEl) {
    toggle.addEventListener('click', function () { navEl.classList.toggle('nav-open'); });
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navEl.contains(e.target)) navEl.classList.remove('nav-open');
    });
  }

  // ---- Particle canvas (hero only) ----
  var canvas = document.getElementById('heroCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    function resize() {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var pts = [];
    for (var i = 0; i < 55; i++) {
      pts.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.4 + 0.4,
        dx: (Math.random() - .5) * .28,
        dy: (Math.random() - .5) * .28,
        a:  Math.random() * .35 + .08
      });
    }

    function drawCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(196,30,42,' + p.a + ')';
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          var d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.lineTo(pts[b].x, pts[b].y);
            ctx.strokeStyle = 'rgba(196,30,42,' + (.07 * (1 - d / 120)) + ')';
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawCanvas);
    }
    drawCanvas();
  }

  // ---- Intersection Observer ----
  var seen = new Set();

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1 });

  // Counter observer
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || seen.has(e.target)) return;
      seen.add(e.target);
      var el = e.target;
      var target  = parseFloat(el.dataset.target);
      var suffix  = el.dataset.suffix || '';
      var isFloat = String(target).includes('.');
      var dur = 1800, start = performance.now();
      (function step(now) {
        var t = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        el.textContent = (isFloat ? (target * ease).toFixed(1) : Math.floor(target * ease)) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      })(start);
    });
  }, { threshold: .5 });

  document.querySelectorAll('.reveal, .svc-card, .diff-item, .pillar, .agency-tag').forEach(function (el) { io.observe(el); });
  document.querySelectorAll('.counter').forEach(function (el) { cio.observe(el); });

  // ---- Ticker duplicate ----
  var ticker = document.querySelector('.ticker-inner');
  if (ticker) ticker.innerHTML += ticker.innerHTML;

  // ---- Live timestamp ----
  var ts = document.getElementById('liveTs');
  var mins = 0;
  if (ts) setInterval(function () { ts.textContent = (++mins) + 'm ago'; }, 60000);

  // ---- Contact form (basic prevent default) ----
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type=submit]');
      btn.textContent = 'Message sent ✓';
      btn.disabled = true;
      btn.style.background = '#059669';
    });
  }

  // ---- Dark mode toggle ----
  var THEME_KEY = 'kalesa-theme';
  var htmlEl = document.documentElement;

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀' : '🌙';
  }

  // Load saved preference, fall back to OS preference
  var savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = htmlEl.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Also respond to OS-level changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

})();
