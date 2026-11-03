/* theme, sidebar, toasts, counters, sorting, filtering, live marks preview */
(function () {
  var root = document.documentElement;
  var saved = localStorage.getItem('theme');
  if (!saved) saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', saved);

  window.chartColors = function () {
    var dark = root.getAttribute('data-theme') === 'dark';
    return { text: dark ? '#a5abd0' : '#5b6180', grid: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)' };
  };

  document.addEventListener('DOMContentLoaded', function () {
    var tbtn = document.getElementById('themeBtn');
    if (tbtn) {
      tbtn.textContent = saved === 'dark' ? '☀️' : '🌙';
      tbtn.addEventListener('click', function () {
        localStorage.setItem('theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        location.reload();
      });
    }
    var menu = document.getElementById('menuBtn'), side = document.getElementById('sidebar');
    if (menu && side) menu.addEventListener('click', function () { side.classList.toggle('open'); });

    document.querySelectorAll('.toast').forEach(function (t) {
      t.addEventListener('click', function () { t.remove(); });
      setTimeout(function () { t.style.transition = '.5s'; t.style.opacity = 0; setTimeout(function () { t.remove(); }, 500); }, 6000);
    });

    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, t0 = null;
      if (isNaN(end)) return;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 900, 1), v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    document.querySelectorAll('table[data-sortable]').forEach(function (table) {
      table.querySelectorAll('th').forEach(function (th, idx) {
        th.addEventListener('click', function () {
          var asc = !th.classList.contains('asc');
          table.querySelectorAll('th').forEach(function (h) { h.classList.remove('asc', 'desc'); });
          th.classList.add(asc ? 'asc' : 'desc');
          var body = table.tBodies[0];
          var rows = Array.prototype.slice.call(body.rows);
          rows.sort(function (a, b) {
            var x = a.cells[idx].innerText.trim(), y = b.cells[idx].innerText.trim();
            var nx = parseFloat(x), ny = parseFloat(y);
            var r = (!isNaN(nx) && !isNaN(ny)) ? nx - ny : x.localeCompare(y);
            return asc ? r : -r;
          });
          rows.forEach(function (r) { body.appendChild(r); });
        });
      });
    });

    document.querySelectorAll('[data-filter]').forEach(function (input) {
      var table = document.querySelector(input.dataset.filter);
      input.addEventListener('input', function () {
        var q = input.value.toLowerCase();
        Array.prototype.forEach.call(table.tBodies[0].rows, function (r) {
          r.style.display = r.innerText.toLowerCase().indexOf(q) > -1 ? '' : 'none';
        });
      });
    });

    document.querySelectorAll('[data-fill]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.dataset.fill.split('|');
        document.getElementById('username').value = p[0];
        document.getElementById('password').value = p[1];
      });
    });
    var eye = document.getElementById('eye');
    if (eye) eye.addEventListener('click', function () {
      var f = document.getElementById('password'); f.type = f.type === 'password' ? 'text' : 'password';
    });

    document.querySelectorAll('tr[data-maxi]').forEach(function (row) {
      var ins = row.querySelectorAll('input'), out = row.querySelector('.live');
      var mi = +row.dataset.maxi, me = +row.dataset.maxe;
      function upd() {
        var i = ins[0].value, e = ins[1].value;
        if (i === '' || e === '') { out.textContent = ''; return; }
        i = +i; e = +e;
        if (i < 0 || e < 0 || i > mi || e > me) { out.textContent = 'out of range'; out.style.color = '#f43f5e'; return; }
        var pct = (i + e) / (mi + me) * 100;
        var g = pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
        out.textContent = (i + e) + ' • ' + g + (pct < 40 ? ' • Fail' : '');
        out.style.color = pct < 40 ? '#f43f5e' : '#10b981';
      }
      ins.forEach(function (x) { x.addEventListener('input', upd); }); upd();
    });
    document.querySelectorAll('tr[data-held]').forEach(function (row) {
      var input = row.querySelector('input'), out = row.querySelector('.live');
      var heldInput = document.querySelector('input[name=classes_held]');
      function upd() {
        var held = +heldInput.value, a = input.value;
        if (!held || a === '') { out.textContent = ''; return; }
        var p = a / held * 100;
        out.textContent = p.toFixed(1) + '%' + (+a > held ? ' (too high)' : '');
        out.style.color = (p < 75 || +a > held) ? '#f43f5e' : '#10b981';
      }
      input.addEventListener('input', upd); heldInput.addEventListener('input', upd); upd();
    });
  });
})();
