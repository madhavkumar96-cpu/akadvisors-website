/* Rates & News page: renders everything from window.AK_DATA */
(function () {
  "use strict";
  var D = window.AK_DATA;
  if (!D) return;
  var $ = function (id) { return document.getElementById(id); };
  var pct = function (v) { return v.toFixed(2) + "%"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var src = function (o) { return 'Source: <a href="' + o.url + '" rel="noopener">' + esc(o.label) + "</a>"; };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var fmtDate = function (iso) { var p = iso.split("-"); return +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0]; };

  document.querySelectorAll("[data-asof]").forEach(function (el) { el.textContent = D.asOf; });

  /* ---------- RBI tiles ---------- */
  $("rbi-tiles").innerHTML = D.rbi.rates.map(function (r) {
    return '<div class="rate-tile"><span class="snap-label">' + esc(r.name) + '</span><span class="snap-value">' + pct(r.value) + "</span>" +
      (r.note ? '<span class="snap-meta">' + esc(r.note) + "</span>" : "") + "</div>";
  }).join("");
  $("rbi-source").innerHTML = "Effective " + esc(D.rbi.effective) + ". Stance: " + esc(D.rbi.stance) + ". Next MPC meeting: " + esc(D.rbi.nextMpc) + ". " + src(D.rbi.source) + ".";

  /* ---------- SBI MCLR + EBLR ---------- */
  $("mclr-effective").textContent = "Effective " + D.sbi.current.effective + ".";
  $("mclr-table").querySelector("tbody").innerHTML = D.sbi.current.tenors.map(function (t) {
    return "<tr><td>" + t[0] + '</td><td class="num">' + pct(t[1]) + "</td></tr>";
  }).join("");
  $("mclr-source").innerHTML = src(D.sbi.source) + ".";
  $("eblr-table").innerHTML =
    '<tr><th scope="row">EBLR</th><td>' + esc(D.sbi.eblr.value) + '<span class="result-sub">from ' + esc(D.sbi.eblr.effective) + ", previously " + esc(D.sbi.eblr.previous) + "</span></td></tr>" +
    '<tr><th scope="row">RLLR</th><td>' + esc(D.sbi.rllr.value) + '<span class="result-sub">from ' + esc(D.sbi.rllr.effective) + "</span></td></tr>";
  $("eblr-source").innerHTML = src(D.sbi.eblr.source) + ".";

  /* ---------- History chart ---------- */
  var hist = D.sbi.history, repo = D.repoHistory;
  function valueAt(series, iso, col) { // step lookup: last entry on or before iso
    var v = null;
    for (var i = 0; i < series.length; i++) { if (series[i][0] <= iso) v = series[i][col]; else break; }
    return v;
  }
  function monthly(fromIso, toIso) {
    var out = [], d = new Date(fromIso + "T00:00:00"), end = new Date(toIso + "T00:00:00");
    d.setDate(1);
    while (d <= end) {
      var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-28";
      out.push(iso);
      d.setMonth(d.getMonth() + 1);
    }
    return out;
  }
  var state = { tenor: 4, years: 0 };
  var lastIso = hist[hist.length - 1][0];
  var allMonths = monthly("2016-04-01", lastIso);

  function render() {
    var col = state.tenor + 1;
    var months = allMonths;
    if (state.years) months = allMonths.slice(Math.max(0, allMonths.length - state.years * 12));
    var pts = months.map(function (m) { return { m: m, a: valueAt(hist, m, col), b: valueAt(repo, m, 1) }; });

    var W = 900, H = 340, L = 44, R = 92, T = 16, B = 34;
    var vals = pts.reduce(function (acc, p) { acc.push(p.a, p.b); return acc; }, []);
    var lo = Math.floor(Math.min.apply(null, vals) - 0.5), hi = Math.ceil(Math.max.apply(null, vals) + 0.5);
    var x = function (i) { return L + (i / (pts.length - 1)) * (W - L - R); };
    var yv = function (v) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); };
    var step = function (key) {
      return pts.map(function (p, i) { return (i ? "H" + x(i).toFixed(1) + "V" : "M" + x(i).toFixed(1) + ",") + yv(p[key]).toFixed(1); }).join("");
    };
    var area = "M" + x(0) + "," + yv(pts[0].a);
    pts.forEach(function (p, i) { if (i) area += "H" + x(i).toFixed(1) + "V" + yv(p.a).toFixed(1); });
    area += "V" + yv(pts[pts.length - 1].b).toFixed(1);
    for (var i = pts.length - 1; i >= 1; i--) area += "V" + yv(pts[i - 1].b).toFixed(1) + "H" + x(i - 1).toFixed(1);
    area += "Z";

    var grid = "";
    for (var g = lo; g <= hi; g++) grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yv(g) + '" y2="' + yv(g) + '"/><text x="' + (L - 8) + '" y="' + (yv(g) + 4) + '" text-anchor="end">' + g + "%</text>";
    var xt = "", seen = {};
    var everyYears = pts.length > 80 ? 2 : 1;
    pts.forEach(function (p, i) {
      var yr = +p.m.slice(0, 4), mo = +p.m.slice(5, 7);
      if (mo === 1 && !seen[yr] && yr % everyYears === 0) { seen[yr] = 1; xt += '<line x1="' + x(i) + '" x2="' + x(i) + '" y1="' + (H - B) + '" y2="' + (H - B + 5) + '"/><text x="' + x(i) + '" y="' + (H - B + 19) + '" text-anchor="middle">' + yr + "</text>"; }
    });
    if (!xt) pts.forEach(function (p, i) { if (i % 6 === 0) xt += '<text x="' + x(i) + '" y="' + (H - B + 19) + '" text-anchor="middle">' + MONTHS[+p.m.slice(5, 7) - 1] + " " + p.m.slice(2, 4) + "</text>"; });

    var lastP = pts[pts.length - 1];
    var tenorName = D.sbi.columns[state.tenor];
    var lab1y = yv(lastP.a), lab2y = yv(lastP.b);
    if (Math.abs(lab1y - lab2y) < 16) lab2y = lab1y + 16;
    var svg =
      '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-labelledby="hc-title hc-desc" tabindex="0">' +
      '<title id="hc-title">SBI ' + tenorName + " MCLR and RBI repo rate</title>" +
      '<desc id="hc-desc">Monthly step chart from ' + MONTHS[+pts[0].m.slice(5, 7) - 1] + " " + pts[0].m.slice(0, 4) + " to " + MONTHS[+lastP.m.slice(5, 7) - 1] + " " + lastP.m.slice(0, 4) + ". Latest MCLR " + pct(lastP.a) + ", repo " + pct(lastP.b) + ".</desc>" +
      '<g class="grid">' + grid + "</g>" +
      '<g class="axis"><line class="domain" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' + xt + "</g>" +
      '<path class="spread" d="' + area + '"/>' +
      '<path class="s2" d="' + step("b") + '"/>' +
      '<path class="s1" d="' + step("a") + '"/>' +
      '<text class="lbl lbl-1" x="' + (W - R + 8) + '" y="' + (lab1y + 4) + '">MCLR ' + pct(lastP.a) + "</text>" +
      '<text class="lbl lbl-2" x="' + (W - R + 8) + '" y="' + (lab2y + 4) + '">Repo ' + pct(lastP.b) + "</text>" +
      '<line class="hover-line" id="hc-hover" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" visibility="hidden"/>' +
      '<rect id="hc-hit" x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '" fill="transparent"/>' +
      "</svg>" + '<div class="chart-tip" id="hc-tip" hidden></div>';
    $("history-chart").innerHTML = svg;
    $("legend-mclr").textContent = "SBI " + tenorName + " MCLR";

    // hover / keyboard
    var svgEl = $("history-chart").querySelector("svg"), tip = $("hc-tip"), line = $("hc-hover"), idx = pts.length - 1;
    function showAt(i) {
      idx = Math.max(0, Math.min(pts.length - 1, i));
      var p = pts[idx], px = x(idx);
      line.setAttribute("x1", px); line.setAttribute("x2", px); line.setAttribute("visibility", "visible");
      var r = svgEl.getBoundingClientRect(), sc = r.width / W;
      tip.hidden = false;
      tip.style.left = Math.min(Math.max(px * sc, 80), r.width - 80) + "px";
      tip.style.top = (yv(Math.max(p.a, p.b)) * sc) + "px";
      tip.innerHTML = "<strong>" + MONTHS[+p.m.slice(5, 7) - 1] + " " + p.m.slice(0, 4) + "</strong><br>MCLR " + pct(p.a) + " · Repo " + pct(p.b) + "<br>Spread " + Math.round((p.a - p.b) * 100) + " bps";
    }
    function hide() { tip.hidden = true; line.setAttribute("visibility", "hidden"); }
    svgEl.addEventListener("mousemove", function (e) {
      var r = svgEl.getBoundingClientRect(), vx = (e.clientX - r.left) * (W / r.width);
      showAt(Math.round(((vx - L) / (W - L - R)) * (pts.length - 1)));
    });
    svgEl.addEventListener("mouseleave", hide);
    svgEl.addEventListener("blur", hide);
    svgEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); showAt(idx - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); showAt(idx + 1); }
      else if (e.key === "Home") { e.preventDefault(); showAt(0); }
      else if (e.key === "End") { e.preventDefault(); showAt(pts.length - 1); }
    });
    svgEl.addEventListener("focus", function () { showAt(idx); });

    var first = pts[0];
    $("history-summary").className = "tool-note";
    $("history-summary").textContent = "Over this period the " + tenorName + " MCLR moved from " + pct(first.a) + " to " + pct(lastP.a) +
      " and the repo rate from " + pct(first.b) + " to " + pct(lastP.b) + ". The spread is now " + Math.round((lastP.a - lastP.b) * 100) + " bps. Use the arrow keys on the chart to step through months.";
  }

  $("tenor-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    state.tenor = +b.getAttribute("data-tenor");
    this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    render();
  });
  $("period-seg").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    state.years = +b.getAttribute("data-years");
    this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    render();
  });
  render();
  window.addEventListener("resize", function () { var t = $("hc-tip"); if (t) t.hidden = true; });

  // data table: SBI change points + repo at that date
  var ht = $("history-table");
  ht.querySelector("thead").innerHTML = '<tr><th scope="col">Effective</th>' + D.sbi.columns.map(function (c) { return '<th scope="col" class="num">' + c + "</th>"; }).join("") + '<th scope="col" class="num">Repo</th></tr>';
  ht.querySelector("tbody").innerHTML = hist.slice().reverse().map(function (r) {
    return "<tr><td>" + fmtDate(r[0]) + "</td>" + r.slice(1).map(function (v) { return '<td class="num">' + v.toFixed(2) + "</td>"; }).join("") + '<td class="num">' + valueAt(repo, r[0], 1).toFixed(2) + "</td></tr>";
  }).join("");
  $("history-source").innerHTML = 'Sources: <a href="' + D.sbi.historySource.url + '" rel="noopener">' + esc(D.sbi.historySource.label) + '</a>; RBI monetary policy statements. The table lists the dates SBI changed its MCLR.';

  /* ---------- Ladder ---------- */
  var s1y = D.sbi.current.tenors.filter(function (t) { return t[0] === "1 year"; })[0][1];
  var items = D.rbi.marketRanges.map(function (r) { return { name: r.name, low: r.low, high: r.high, kind: r.kind }; });
  items.push({ name: "RBI repo rate", low: D.rbi.rates[0].value, high: D.rbi.rates[0].value, kind: "policy" });
  items.push({ name: "SBI 1-year MCLR", low: s1y, high: s1y, kind: "borrow" });
  items.sort(function (a, b) { return a.low - b.low; });
  var MAX = 12;
  var tagText = { save: "Savers earn", borrow: "Borrowers pay", policy: "Policy rate" };
  $("rate-ladder").innerHTML = items.map(function (it) {
    var l = (it.low / MAX) * 100, w = Math.max(((it.high - it.low) / MAX) * 100, 0.8);
    var val = it.low === it.high ? pct(it.low) : it.low.toFixed(2) + "–" + it.high.toFixed(2) + "%";
    return '<li class="' + it.kind + '"><span><span class="tag">' + tagText[it.kind] + "</span>" + esc(it.name) + '</span><span class="track" aria-hidden="true"><span class="bar" style="left:' + l + "%;width:" + w + '%"></span></span><span class="val">' + val + "</span></li>";
  }).join("");

  /* ---------- World ---------- */
  var gp = D.global.policyRates;
  var pmax = Math.max.apply(null, gp.rows.map(function (r) { return r.value; }));
  $("policy-world-asof").textContent = "Headline policy rates, " + gp.asOf + ".";
  $("world-policy").innerHTML = gp.rows.map(function (r) {
    return '<li class="' + (r.highlight ? "hl" : "") + '"><span>' + esc(r.country) + '<span class="hb-year" style="display:block">' + esc(r.bank) + '</span></span><span class="hb-track"><span class="hb-bar" style="width:' + (r.value / pmax) * 75 + '%"></span><span class="hb-val">' + pct(r.value) + "</span></span></li>";
  }).join("");
  $("world-policy-source").innerHTML = src(gp.source) + ".";

  var sv = D.global.savingsVsCredit;
  var cmax = Math.max.apply(null, sv.rows.map(function (r) { return Math.max(r.savings, r.credit); }));
  $("world-savings").innerHTML = sv.rows.map(function (r) {
    return '<li class="' + (r.highlight ? "hl" : "") + '"><span>' + esc(r.country) + "</span><span>" +
      '<span class="hb-track"><span class="hb-bar b-save" style="width:' + (r.savings / cmax) * 78 + '%"></span><span class="hb-val">' + r.savings.toFixed(1) + '% <span class="hb-year">' + r.sYear + "</span></span></span>" +
      '<span class="hb-track"><span class="hb-bar b-credit" style="width:' + (r.credit / cmax) * 78 + '%"></span><span class="hb-val">' + r.credit.toFixed(1) + '% <span class="hb-year">' + r.cYear + "</span></span></span>" +
      "</span></li>";
  }).join("");
  $("world-savings-source").innerHTML = src(sv.source) + ". Small year labels show the data year.";

  /* ---------- News ---------- */
  var news = D.news.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var tags = ["All"].concat(news.map(function (n) { return n.tag; }).filter(function (t, i, a) { return a.indexOf(t) === i; }));
  var nf = $("news-filter");
  nf.innerHTML = tags.map(function (t, i) { return '<button type="button" aria-pressed="' + (i === 0) + '" data-tag="' + esc(t) + '">' + esc(t) + "</button>"; }).join("");
  function renderNews(tag) {
    $("news-list").innerHTML = news.filter(function (n) { return tag === "All" || n.tag === tag; }).map(function (n) {
      return '<li class="news-item"><div><time class="news-date" datetime="' + n.date + '">' + fmtDate(n.date) + '</time><br><span class="news-tag">' + esc(n.tag) + "</span></div>" +
        "<div><h3>" + esc(n.title) + "</h3><p>" + esc(n.summary) + '</p><p class="news-src">Source: <a href="' + n.url + '" rel="noopener">' + esc(n.source) + "</a></p></div></li>";
    }).join("");
  }
  nf.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    nf.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    renderNews(b.getAttribute("data-tag"));
  });
  renderNews("All");
})();

/* ---------- Recent deals (window.AK_DEALS from data/deals.js) ---------- */
(function () {
  "use strict";
  var X = window.AK_DEALS;
  if (!X || !X.items || !X.items.length) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var fd = function (iso) { var p = iso.split("-"); return +p[2] + " " + M[+p[1] - 1] + " " + p[0]; };
  var amt = function (d) { return d.amountCr != null ? "₹" + d.amountCr.toLocaleString("en-IN", { maximumFractionDigits: 0 }) + " cr" : esc(d.amountText || "–"); };

  $("deals").hidden = false;
  document.querySelectorAll("[data-deals-link]").forEach(function (el) { el.hidden = false; });
  var items = X.items.slice();

  // summary stats
  var withAmt = items.filter(function (d) { return d.amountCr != null; }).map(function (d) { return d.amountCr; }).sort(function (a, b) { return a - b; });
  var median = withAmt.length ? withAmt[Math.floor(withAmt.length / 2)] : null;
  var total = withAmt.reduce(function (s, v) { return s + v; }, 0);
  var lenderCount = {};
  items.forEach(function (d) {
    (d.lenders || "").split(/;\s*/).forEach(function (l) { l = l.trim(); if (l) lenderCount[l] = (lenderCount[l] || 0) + 1; });
  });
  var top = Object.keys(lenderCount).sort(function (a, b) { return lenderCount[b] - lenderCount[a]; })[0];
  var range = items.length ? fd(items[items.length - 1].date) + " – " + fd(items[0].date) : "";
  $("deal-stats").innerHTML =
    '<div class="snap"><span class="snap-label">Deals listed</span><span class="snap-value">' + items.length + '</span><span class="snap-meta">' + esc(range) + "</span></div>" +
    '<div class="snap"><span class="snap-label">Total value</span><span class="snap-value">' + (total ? "₹" + Math.round(total).toLocaleString("en-IN") + " cr" : "–") + '</span><span class="snap-meta">rupee deals only</span></div>' +
    '<div class="snap"><span class="snap-label">Median ticket</span><span class="snap-value">' + (median != null ? "₹" + Math.round(median).toLocaleString("en-IN") + " cr" : "–") + '</span><span class="snap-meta">half of deals are smaller</span></div>' +
    '<div class="snap"><span class="snap-label">Most active lender</span><span class="snap-value snap-value-sm">' + esc(top || "–") + '</span><span class="snap-meta">' + (top ? lenderCount[top] + (lenderCount[top] === 1 ? " deal" : " deals") + " in this list" : "") + "</span></div>";

  // filters
  var state = { fac: "All", lt: "All", q: "", sort: "date", dir: -1 };
  function seg(el, values, key) {
    el.innerHTML = values.map(function (v, i) { return '<button type="button" aria-pressed="' + (i === 0) + '" data-v="' + esc(v) + '">' + esc(v) + "</button>"; }).join("");
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      el.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      state[key] = b.getAttribute("data-v"); render();
    });
  }
  var uniq = function (arr) { return arr.filter(function (v, i, a) { return v && a.indexOf(v) === i; }); };
  seg($("deal-facility"), ["All"].concat(uniq(items.map(function (d) { return d.facility; }))), "fac");
  seg($("deal-lender"), ["All"].concat(uniq([].concat.apply([], items.map(function (d) { return d.lenderTypes || []; })))), "lt");
  $("deal-q").addEventListener("input", function () { state.q = this.value.trim().toLowerCase(); render(); });
  document.querySelectorAll(".deals-table [data-sort]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-sort");
      state.dir = state.sort === k ? -state.dir : -1; state.sort = k; render();
    });
  });

  function render() {
    var rows = items.filter(function (d) {
      if (state.fac !== "All" && d.facility !== state.fac) return false;
      if (state.lt !== "All" && (d.lenderTypes || []).indexOf(state.lt) < 0) return false;
      if (state.q && (d.borrower + " " + d.lenders + " " + d.sector).toLowerCase().indexOf(state.q) < 0) return false;
      return true;
    }).sort(function (a, b) {
      var va = a[state.sort], vb = b[state.sort];
      if (va == null) return 1; if (vb == null) return -1;
      return (va > vb ? 1 : va < vb ? -1 : 0) * state.dir;
    });
    document.querySelectorAll(".deals-table [data-sort]").forEach(function (b) {
      var th = b.parentNode; if (b.getAttribute("data-sort") === state.sort) th.setAttribute("aria-sort", state.dir < 0 ? "descending" : "ascending"); else th.removeAttribute("aria-sort");
    });
    $("deal-count").textContent = rows.length + " of " + items.length + " deals shown";
    $("deal-rows").innerHTML = rows.length ? rows.map(function (d) {
      var tp = [d.tenor, d.pricing].filter(Boolean).join(" · ");
      return "<tr><td>" + fd(d.date) + "</td>" +
        '<td><span class="deal-borrower">' + (d.url ? '<a href="' + esc(d.url) + '" rel="noopener">' + esc(d.borrower) + "</a>" : esc(d.borrower)) + '</span><span class="deal-sub">' + esc(d.sector) + "</span></td>" +
        '<td><span class="deal-chip">' + esc(d.facility) + "</span>" + (d.purpose ? '<span class="deal-sub">' + esc(d.purpose) + "</span>" : "") + "</td>" +
        "<td>" + esc(d.lenders || "Not disclosed") + "</td>" +
        '<td class="num">' + amt(d) + "</td>" +
        "<td>" + esc(tp || "–") + "</td></tr>";
    }).join("") : '<tr><td colspan="6" style="padding:24px 20px;color:var(--muted)">No deals match these filters. <button type="button" class="text-link link-btn" style="margin:0" id="deal-reset">Clear filters</button></td></tr>';
    var rs = $("deal-reset");
    if (rs) rs.addEventListener("click", function () { location.hash = "deals"; state.fac = state.lt = "All"; state.q = ""; $("deal-q").value = "";
      document.querySelectorAll("#deal-facility button, #deal-lender button").forEach(function (b, i, all) { b.setAttribute("aria-pressed", b.getAttribute("data-v") === "All" ? "true" : "false"); }); render(); });
  }
  render();
  $("deal-source").innerHTML = esc(X.attribution) + (X.asOf ? ". Data as of " + esc(X.asOf) + "." : ".");
})();
