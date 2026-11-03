/* Tiny SVG chart library (no internet / CDN needed): bar, doughnut, radar, scatter */
var Charts = (function () {
  var NS = 'http://www.w3.org/2000/svg';
  var PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#3b82f6'];

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function root(id, w, h) {
    var box = document.getElementById(id);
    box.innerHTML = '';
    box.classList.add('chart');
    var s = el('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'xMidYMid meet' });
    box.appendChild(s);
    return { box: box, svg: s };
  }
  function legend(box, items) {
    var d = document.createElement('div'); d.className = 'legend-row';
    items.forEach(function (it) {
      var s = document.createElement('span');
      s.innerHTML = '<i style="background:' + it.color + '"></i>' + it.label;
      d.appendChild(s);
    });
    box.appendChild(d);
  }
  function text(parent, x, y, str, cls, anchor) {
    var t = el('text', { x: x, y: y, 'text-anchor': anchor || 'middle', 'class': cls || 'ax' }, parent);
    t.textContent = str; return t;
  }
  function tip(node, msg) { node.setAttribute('data-tip', msg); }
  function niceMax(v) { if (v <= 10) return 10; var p = Math.pow(10, Math.floor(Math.log10(v))); return Math.ceil(v / p) * p; }

  /* ---- grouped bar chart ----
     opts: {labels:[], datasets:[{label, data:[], color | colors:[]}], max, ticks, suffix} */
  function bar(id, o) {
    var W = 560, H = 290, L = 42, R = 12, T = 14, B = 34;
    var r = root(id, W, H), s = r.svg;
    var all = [];
    o.datasets.forEach(function (d) { all = all.concat(d.data); });
    var max = o.max || niceMax(Math.max.apply(null, all.concat([1])));
    var ticks = o.ticks || 5, plotW = W - L - R, plotH = H - T - B;
    for (var i = 0; i <= ticks; i++) {
      var v = max / ticks * i, y = T + plotH - plotH * i / ticks;
      el('line', { x1: L, x2: W - R, y1: y, y2: y, 'class': 'gridline' }, s);
      text(s, L - 8, y + 4, Math.round(v * 10) / 10, 'ax', 'end');
    }
    var n = o.labels.length, groupW = plotW / Math.max(n, 1), k = o.datasets.length;
    var barW = Math.min(38, (groupW * 0.72) / k);
    o.labels.forEach(function (lab, gi) {
      var gx = L + groupW * gi + groupW / 2;
      text(s, gx, H - 12, lab, 'ax');
      o.datasets.forEach(function (d, di) {
        var val = d.data[gi] || 0, h = plotH * Math.min(val, max) / max;
        var x = gx - (k * barW) / 2 + di * barW + 2, y = T + plotH - h;
        var col = d.colors ? d.colors[gi] : d.color;
        var rect = el('rect', { x: x, y: y, width: Math.max(barW - 4, 4), height: Math.max(h, 0), rx: 6, fill: col,
          'class': 'bar-anim', style: 'animation-delay:' + (gi * 70 + di * 40) + 'ms' }, s);
        tip(rect, (d.label ? d.label + ' · ' : '') + lab + ': ' + val + (o.suffix || ''));
        if (k === 1 && h > 16) text(s, x + (barW - 4) / 2, y - 5, val, 'val-label');
      });
    });
    if (o.limit !== undefined) {
      var ly = T + plotH - plotH * o.limit / max;
      el('line', { x1: L, x2: W - R, y1: ly, y2: ly, 'class': 'limit-line' }, s);
      text(s, W - R, ly - 5, o.limitLabel || 'limit', 'ax', 'end');
    }
    if (k > 1) legend(r.box, o.datasets.map(function (d) { return { label: d.label, color: d.color }; }));
  }

  /* ---- doughnut: items [{label, value, color}], centerText ---- */
  function doughnut(id, items, centerTop, centerBottom) {
    var W = 300, H = 270, cx = 150, cy = 125, rad = 80, sw = 34, C = 2 * Math.PI * rad;
    var r = root(id, W, H), s = r.svg, total = items.reduce(function (a, b) { return a + b.value; }, 0);
    el('circle', { cx: cx, cy: cy, r: rad, fill: 'none', 'class': 'ring-bg', 'stroke-width': sw }, s);
    var acc = 0;
    if (total > 0) items.forEach(function (it, i) {
      if (!it.value) return;
      var len = C * it.value / total;
      var c = el('circle', { cx: cx, cy: cy, r: rad, fill: 'none', stroke: it.color, 'stroke-width': sw,
        'stroke-dasharray': (len - 2) + ' ' + (C - len + 2), 'stroke-dashoffset': -acc,
        transform: 'rotate(-90 ' + cx + ' ' + cy + ')', 'class': 'arc-anim', style: 'animation-delay:' + i * 150 + 'ms' }, s);
      tip(c, it.label + ': ' + it.value + ' (' + Math.round(it.value / total * 100) + '%)');
      acc += len;
    });
    text(s, cx, cy + 4, centerTop || '', 'center-big');
    text(s, cx, cy + 26, centerBottom || '', 'ax');
    legend(r.box, items);
  }

  /* ---- radar: labels, series [{label,data,color}] (0-100) ---- */
  function radar(id, labels, series) {
    var W = 420, H = 300, cx = 210, cy = 150, rad = 100, n = labels.length;
    var r = root(id, W, H), s = r.svg;
    function pt(i, v) { var a = -Math.PI / 2 + 2 * Math.PI * i / n; return [cx + rad * v / 100 * Math.cos(a), cy + rad * v / 100 * Math.sin(a)]; }
    [25, 50, 75, 100].forEach(function (lv) {
      var pts = labels.map(function (_, i) { return pt(i, lv).join(','); }).join(' ');
      el('polygon', { points: pts, fill: 'none', 'class': 'gridline' }, s);
      if (lv < 100) text(s, cx + 4, cy - rad * lv / 100 + 3, lv, 'ax tiny', 'start');
    });
    labels.forEach(function (lab, i) {
      var p = pt(i, 100), q = pt(i, 118);
      el('line', { x1: cx, y1: cy, x2: p[0], y2: p[1], 'class': 'gridline' }, s);
      text(s, q[0], q[1] + 4, lab, 'ax', 'middle');
    });
    series.forEach(function (sr, si) {
      var pts = sr.data.map(function (v, i) { return pt(i, v).join(','); }).join(' ');
      el('polygon', { points: pts, fill: sr.color, 'fill-opacity': si ? 0.12 : 0.28, stroke: sr.color,
        'stroke-width': 2, 'stroke-dasharray': si ? '5 4' : '', 'class': 'fade-in' }, s);
      sr.data.forEach(function (v, i) {
        var p = pt(i, v), c = el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: sr.color }, s);
        tip(c, sr.label + ' · ' + labels[i] + ': ' + v + '%');
      });
    });
    legend(r.box, series);
  }

  /* ---- scatter: points [{x,y,name}] ---- */
  function scatter(id, pts, xTitle, yTitle) {
    var W = 560, H = 290, L = 46, R = 14, T = 14, B = 42;
    var r = root(id, W, H), s = r.svg, pw = W - L - R, ph = H - T - B;
    for (var i = 0; i <= 5; i++) {
      var v = i * 20, y = T + ph - ph * v / 100, x = L + pw * v / 100;
      el('line', { x1: L, x2: W - R, y1: y, y2: y, 'class': 'gridline' }, s);
      el('line', { x1: x, x2: x, y1: T, y2: T + ph, 'class': 'gridline' }, s);
      text(s, L - 8, y + 4, v, 'ax', 'end'); text(s, x, T + ph + 16, v, 'ax');
    }
    text(s, L + pw / 2, H - 6, xTitle, 'ax title');
    var yt = text(s, 12, T + ph / 2, yTitle, 'ax title'); yt.setAttribute('transform', 'rotate(-90 12 ' + (T + ph / 2) + ')');
    pts.forEach(function (p, i) {
      var c = el('circle', { cx: L + pw * p.x / 100, cy: T + ph - ph * p.y / 100, r: 8, fill: '#a855f7', 'fill-opacity': .75,
        stroke: '#fff', 'stroke-width': 1.5, 'class': 'pop-anim', style: 'animation-delay:' + i * 80 + 'ms' }, s);
      tip(c, p.name + ' · attendance ' + p.x + '%, marks ' + p.y + '%');
    });
  }

  /* ---- tooltip ---- */
  document.addEventListener('DOMContentLoaded', function () {
    var pop = document.createElement('div'); pop.className = 'chart-tip'; document.body.appendChild(pop);
    document.addEventListener('mousemove', function (e) {
      var t = e.target.closest ? e.target.closest('[data-tip]') : null;
      if (!t) { pop.style.opacity = 0; return; }
      pop.textContent = t.getAttribute('data-tip');
      pop.style.opacity = 1; pop.style.left = (e.clientX + 14) + 'px'; pop.style.top = (e.clientY + 14) + 'px';
    });
  });

  return { bar: bar, doughnut: doughnut, radar: radar, scatter: scatter, PALETTE: PALETTE };
})();
