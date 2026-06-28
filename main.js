/* ============================================
   Kalesa Group — main.js
   Progressive enhancement:
   1) Add js-ready to <body> immediately so
      CSS can safely hide elements for animation
   2) Set up all animations / interactions
   ============================================ */

(function () {
  // Mark body as JS-capable so CSS animations activate
  document.body.classList.add('js-ready');

  /* ---- Mobile nav ---- */
  var toggle   = document.querySelector('.nav-toggle');
  var navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('nav-open');
    });
  }

  /* ---- Particle canvas ---- */
  var canvas = document.getElementById('heroCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var particles = [];
    for (var i = 0; i < 52; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - .5) * .3,
        dy: (Math.random() - .5) * .3,
        alpha: Math.random() * .4 + .1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,160,99,' + p.alpha + ')';
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      // connecting lines
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dist = Math.hypot(particles[a].x - particles[b].x, particles[a].y - particles[b].y);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = 'rgba(201,160,99,' + (.09 * (1 - dist / 115)) + ')';
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---- Animated counters ---- */
  function animateCounter(el) {
    var target   = parseFloat(el.dataset.target);
    var suffix   = el.dataset.suffix || '';
    var isFloat  = String(target).includes('.');
    var duration = 1800;
    var start    = performance.now();
    function step(now) {
      var t    = Math.min((now - start) / duration, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      var val  = target * ease;
      el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---- Intersection Observer for reveal + counters ---- */
  var seen = new Set();

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: 0.12 });

  var counterIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  document.querySelectorAll('.service-card').forEach(function (el) { io.observe(el); });
  document.querySelectorAll('.why-item').forEach(function (el) { io.observe(el); });
  document.querySelectorAll('.fact-item').forEach(function (el) { io.observe(el); });
  document.querySelectorAll('.counter').forEach(function (el) { counterIO.observe(el); });

  /* ---- Ticker duplicate for seamless loop ---- */
  var ticker = document.querySelector('.ticker-inner');
  if (ticker) ticker.innerHTML += ticker.innerHTML;

  /* ---- Live timestamp ---- */
  var ts   = document.getElementById('liveTimestamp');
  var mins = 0;
  if (ts) {
    setInterval(function () { ts.textContent = (++mins) + 'm ago'; }, 60000);
  }

})();