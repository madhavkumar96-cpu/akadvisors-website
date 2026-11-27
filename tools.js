/* Tools page: five calculators. All amounts in ₹ crore unless stated. */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function cr(v) { // format a ₹ crore figure
    if (!isFinite(v)) return "–";
    var a = Math.abs(v), sign = v < 0 ? "−" : "";
    if (a >= 1) return sign + "₹" + a.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + " cr";
    return sign + "₹" + (a * 100).toLocaleString("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + " lakh";
  }
  function x2(v) { return isFinite(v) ? v.toFixed(2) + "x" : "–"; }
  function num(form, name) { var v = parseFloat(form.elements[name].value); return isFinite(v) ? v : 0; }
  function pmt(rate, n, pv) { return rate === 0 ? pv / n : pv * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1); }
  function pvAnnuity(rate, n, payment) { return rate === 0 ? payment * n : payment * (1 - Math.pow(1 + rate, -n)) / rate; }
  function result(label, value, sub, key) {
    return '<div class="result' + (key ? " result-key" : "") + '"><span class="result-label">' + label + '</span><span class="result-value">' + value + "</span>" + (sub ? '<span class="result-sub">' + sub + "</span>" : "") + "</div>";
  }
  function verdict(kind, html) { return '<div class="verdict ' + kind + '">' + html + "</div>"; }

  /* ---------- EMI ---------- */
  function emi(f) {
    var P = num(f, "p"), R = num(f, "r"), N = Math.max(1, Math.round(num(f, "n"))), m = Math.max(0, num(f, "m"));
    var fr = +f.elements.f.value, type = f.elements.t.value;
    var total = N * fr, mor = Math.min(Math.round(m * fr / 12), total - 1), A = total - mor, r = R / 100 / fr;
    if (P <= 0) return "<p>Enter a loan amount.</p>";
    var bal = P, rows = [], totInt = 0, inst0 = 0, instLast = 0, emiAmt = pmt(r, A, P);
    for (var k = 0; k < total; k++) {
      var interest = bal * r, principal = 0;
      if (k >= mor) principal = type === "emi" ? emiAmt - interest : P / A;
      if (k === total - 1) principal = bal;
      var paid = interest + principal;
      if (k === mor) inst0 = paid;
      instLast = paid;
      var yr = Math.floor(k / fr);
      if (!rows[yr]) rows[yr] = { open: bal, int: 0, prin: 0 };
      rows[yr].int += interest; rows[yr].prin += principal;
      bal -= principal; rows[yr].close = Math.max(bal, 0);
      totInt += interest;
    }
    var per = fr === 12 ? "month" : "quarter";
    var head = type === "emi"
      ? result("Instalment per " + per, cr(emiAmt), "from " + (fr === 12 ? "month " : "quarter ") + (mor + 1), true)
      : result("First / last instalment", cr(inst0), "falling to " + cr(instLast), true);
    var intPct = totInt / (totInt + P) * 100;
    var html = '<div class="results-grid">' + head +
      (mor ? result("Interest during moratorium", cr(P * r), "per " + per + " for " + mor + " " + per + "s") : "") +
      result("Total interest", cr(totInt)) +
      result("Total repayment", cr(totInt + P)) + "</div>" +
      '<p class="result-label">Principal vs interest</p><div class="stack-bar" aria-hidden="true"><span style="width:' + (100 - intPct) + '%"></span><span style="width:' + intPct + '%"></span></div>' +
      '<p class="tool-note" style="margin-top:0">Principal ' + (100 - intPct).toFixed(0) + "% · Interest " + intPct.toFixed(0) + "% of total repayment.</p>" +
      '<div class="table-scroll" tabindex="0" role="region" aria-label="Year-by-year repayment schedule"><table><caption class="visually-hidden">Repayment schedule by year</caption>' +
      '<thead><tr><th scope="col">Year</th><th scope="col" class="num">Opening</th><th scope="col" class="num">Interest</th><th scope="col" class="num">Principal</th><th scope="col" class="num">Closing</th></tr></thead><tbody>' +
      rows.map(function (rw, i) { return "<tr><td>" + (i + 1) + '</td><td class="num">' + cr(rw.open) + '</td><td class="num">' + cr(rw.int) + '</td><td class="num">' + cr(rw.prin) + '</td><td class="num">' + cr(rw.close) + "</td></tr>"; }).join("") +
      "</tbody></table></div>" +
      '<p class="tool-note">Assumes a fixed rate for the full tenor and interest serviced during the moratorium. A floating-rate loan will change at each reset.</p>';
    return html;
  }

  /* ---------- Borrowing capacity ---------- */
  function cap(f) {
    var e = num(f, "e"), t = num(f, "t"), d = num(f, "d"), s = num(f, "s"), R = num(f, "r"), n = Math.max(1, num(f, "n"));
    var dscr = num(f, "dscr"), lev = num(f, "lev");
    var cfads = e - t;
    if (e <= 0) return "<p>Enter your EBITDA.</p>";
    var maxDS = cfads / dscr, avail = Math.max(0, maxDS - s), r = R / 1200, nm = n * 12;
    var byDscr = pvAnnuity(r, nm, avail / 12);
    var byLev = Math.max(0, lev * e - d);
    var capv = Math.min(byDscr, byLev);
    var binding = byDscr <= byLev ? "cash flow cover (DSCR)" : "leverage (debt to EBITDA)";
    var newDS = pmt(r, nm, capv) * 12;
    var postDscr = cfads / (s + newDS), postLev = (d + capv) / e, nowDscr = s ? cfads / s : Infinity;
    var html = '<div class="results-grid">' +
      result("Indicative new borrowing", cr(capv), "binding test: " + binding, true) +
      result("Limit from DSCR test", cr(byDscr), "at " + x2(dscr) + " minimum") +
      result("Limit from leverage test", cr(byLev), "at " + x2(lev) + " debt to EBITDA") +
      result("Cash available for debt service", cr(cfads), "EBITDA less tax and maintenance capex") + "</div>";
    if (capv <= 0) html += verdict("bad", "<strong>No headroom on these inputs.</strong> Existing debt service already uses the cash flow cover your lender requires" + (byLev <= 0 ? ", and leverage is at or above the limit." : "."));
    else html += verdict("ok", "After the new loan, DSCR would be about <strong>" + x2(postDscr) + "</strong> (currently " + x2(nowDscr) + ") and debt to EBITDA about <strong>" + x2(postLev) + "</strong>.");
    html += '<p class="tool-note">Lenders also test total outside liabilities to tangible net worth, fixed asset cover, promoter contribution and security cover. These are not modelled here. DSCR uses EBITDA less tax and maintenance capex as a proxy for cash available for debt service.</p>';
    return html;
  }

  /* ---------- Refinancing ---------- */
  function refi(f) {
    var o = num(f, "o"), n = Math.max(1, num(f, "n")), c = num(f, "c"), nr = num(f, "nr");
    var pp = num(f, "pp"), pf = num(f, "pf"), xL = num(f, "x");
    if (o <= 0) return "<p>Enter the outstanding amount.</p>";
    var nm = Math.round(n * 12), oldE = pmt(c / 1200, nm, o), newE = pmt(nr / 1200, nm, o);
    var save = oldE - newE, totSave = save * nm;
    var costs = o * pp / 100 + o * pf / 100 + xL / 100;
    var be = save > 0 ? costs / save : Infinity;
    var npv = pvAnnuity(c / 1200, nm, save) - costs;
    var html = '<div class="results-grid">' +
      result("Break-even", isFinite(be) ? Math.ceil(be) + " months" : "Not reached", isFinite(be) ? "of " + nm + " months remaining" : "", true) +
      result("Monthly saving", cr(save), "EMI " + cr(oldE) + " → " + cr(newE)) +
      result("Switching costs", cr(costs), "foreclosure, fees and other costs") +
      result("Net saving over tenor", cr(totSave - costs), "undiscounted") +
      result("Net present value", cr(npv), "savings discounted at the current rate") + "</div>";
    if (save <= 0) html += verdict("bad", "<strong>The new rate is not lower.</strong> Refinancing would only make sense for other reasons, such as a higher limit, longer tenor or lighter covenants.");
    else if (be > nm) html += verdict("bad", "<strong>Costs are not recovered</strong> within the remaining tenor on these inputs.");
    else if (be > nm / 3) html += verdict("warn", "<strong>Costs are recovered in " + Math.ceil(be) + " months.</strong> That is a long payback. Check whether the current lender will reprice instead.");
    else html += verdict("ok", "<strong>Costs are recovered in " + Math.ceil(be) + " months</strong>, with a net present value of " + cr(npv) + ". This is worth exploring.");
    html += '<p class="tool-note">Assumes monthly EMIs, the same remaining tenor and switching costs paid upfront. Many lenders waive prepayment charges on floating-rate loans to MSEs. Check your sanction letter. Also compare covenants, security and reset terms, not just the rate.</p>';
    return html;
  }

  /* ---------- Stress test ---------- */
  function risk(f) {
    var e = num(f, "e"), t = num(f, "t"), d = num(f, "d"), R = num(f, "r"), p = num(f, "p"), cov = num(f, "c");
    if (e <= 0 || (d <= 0 && p <= 0)) return "<p>Enter EBITDA and debt figures.</p>";
    var interest = d * R / 100, ds = interest + p, cfads = e - t, base = cfads / ds, icr = interest ? e / interest : Infinity;
    var ebitdaHead = 1 - (cov * ds + t) / e;
    var rateHead = d ? ((cfads / cov - p) / d * 100 - R) * 100 : Infinity;
    var shocks = [0, 50, 100, 150, 200, 300], drops = [0, -10, -20, -30, -40];
    var cls = function (v) { return v < 1 ? "h-bad" : v < cov ? "h-warn" : "h-ok"; };
    var grid = '<div class="table-scroll" tabindex="0" role="region" aria-label="DSCR stress grid"><table class="heat"><caption class="visually-hidden">DSCR under combined EBITDA falls and rate rises</caption>' +
      '<thead><tr><th scope="col">Rate rise</th>' + drops.map(function (dr) { return '<th scope="col">EBITDA ' + (dr ? dr + "%" : "as is") + "</th>"; }).join("") + "</tr></thead><tbody>" +
      shocks.map(function (sh) {
        return '<tr><th scope="row">' + (sh ? "+" + sh + " bps" : "Current") + "</th>" + drops.map(function (dr) {
          var v = (e * (1 + dr / 100) - t) / (d * (R + sh / 100) / 100 + p);
          return '<td class="' + cls(v) + (sh === 0 && dr === 0 ? " h-base" : "") + '">' + x2(v) + "</td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="heat-legend"><span><i style="background:#E3EFE8"></i>At or above covenant (' + x2(cov) + ')</span><span><i style="background:#F6EDD9"></i>Below covenant</span><span><i style="background:#F6DEDC"></i>Below 1.00x: cash flow does not cover debt service</span></div>';
    var html = '<div class="results-grid">' +
      result("Current DSCR", x2(base), "covenant " + x2(cov), true) +
      result("Interest cover", x2(icr), "EBITDA to interest") +
      result("EBITDA headroom", ebitdaHead > 0 ? (ebitdaHead * 100).toFixed(0) + "%" : "None", "fall before covenant breach") +
      result("Rate headroom", rateHead > 0 ? (isFinite(rateHead) ? Math.round(rateHead) + " bps" : "Not rate-sensitive") : "None", "rise before covenant breach") + "</div>";
    if (base < 1) html += verdict("bad", "<strong>Cash flow does not cover debt service today.</strong> Lenders would expect a restructuring or fresh promoter funds.");
    else if (base < cov) html += verdict("warn", "<strong>DSCR is below the covenant.</strong> Expect lender scrutiny. Consider re-profiling repayments.");
    else if (ebitdaHead < 0.2 || rateHead < 100) html += verdict("warn", "<strong>Headroom is thin.</strong> A modest fall in earnings or rise in rates would breach the covenant.");
    else html += verdict("ok", "<strong>Comfortable headroom.</strong> Coverage holds under moderate combined shocks.");
    return html + grid + '<p class="tool-note">Applies the rate rise to all floating-rate debt for a full year and keeps principal repayments unchanged. DSCR = (EBITDA − tax − maintenance capex) ÷ (interest + principal).</p>';
  }

  /* ---------- Working capital ---------- */
  function wc(f) {
    var s = num(f, "s"), c = num(f, "c"), i = num(f, "i"), r = num(f, "r"), p = num(f, "p"), oca = num(f, "oca"), ocl = num(f, "ocl");
    if (s <= 0) return "<p>Enter projected sales.</p>";
    var cogs = s * c / 100, inv = cogs * i / 365, rec = s * r / 365, pay = cogs * p / 365;
    var tca = inv + rec + oca, cl = pay + ocl, gap = tca - cl;
    var mpbf = Math.max(0, 0.75 * tca - cl), margin = tca - cl - mpbf;
    var turnReq = 0.25 * s, turnBank = 0.20 * s;
    var cycle = i + r - p;
    var html = '<div class="results-grid">' +
      result("Working capital gap", cr(gap), "current assets less non-bank current liabilities", true) +
      result("Operating cycle", Math.round(cycle) + " days", "inventory + receivables − payables") +
      result("Bank finance: MPBF method II", cr(mpbf), "borrower margin " + cr(margin)) +
      result("Bank finance: turnover method", cr(turnBank), "20% of sales; requirement " + cr(turnReq)) + "</div>" +
      '<div class="table-scroll" tabindex="0" role="region" aria-label="Working capital build-up"><table><caption class="visually-hidden">Working capital build-up</caption><tbody>' +
      "<tr><td>Inventory</td><td class=\"num\">" + cr(inv) + "</td></tr>" +
      "<tr><td>Receivables</td><td class=\"num\">" + cr(rec) + "</td></tr>" +
      "<tr><td>Other current assets</td><td class=\"num\">" + cr(oca) + "</td></tr>" +
      '<tr><th scope="row">Total current assets</th><td class="num"><strong>' + cr(tca) + "</strong></td></tr>" +
      "<tr><td>Less: trade payables</td><td class=\"num\">" + cr(pay) + "</td></tr>" +
      "<tr><td>Less: other current liabilities</td><td class=\"num\">" + cr(ocl) + "</td></tr>" +
      '<tr><th scope="row">Working capital gap</th><td class="num"><strong>' + cr(gap) + "</strong></td></tr>" +
      "</tbody></table></div>" +
      '<p class="tool-note">MPBF method II, from the Tandon Committee, requires the borrower to fund 25% of total current assets from long-term sources. The turnover method (Nayak Committee) assesses the requirement at 25% of projected sales, of which 20% is bank finance. Banks often use it for smaller limits. Actual drawing power depends on stock and book debt statements less the lender\'s margins.</p>';
    return html;
  }

  var calcs = { emi: emi, cap: cap, refi: refi, risk: risk, wc: wc };
  document.querySelectorAll("form[data-calc]").forEach(function (f) {
    var key = f.getAttribute("data-calc"), out = document.getElementById(key + "-out");
    function run() {
      f.querySelectorAll("output").forEach(function (o) { var inp = document.getElementById(o.getAttribute("for")); o.textContent = parseFloat(inp.value).toFixed(2) + "x"; });
      out.innerHTML = calcs[key](f);
    }
    f.addEventListener("input", run);
    f.addEventListener("change", run);
    run();
  });

  /* ---------- Tabs (ARIA, arrow keys, deep links) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tool-tabs [role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    var bar = tab.parentNode;
    if (bar.scrollWidth > bar.clientWidth) bar.scrollLeft = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
    try { history.replaceState(null, "", "#" + tab.getAttribute("aria-controls").replace("tool-", "")); } catch (e) {}
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t, false); });
    t.addEventListener("keydown", function (e) {
      var j = null;
      if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
  });
  window.addEventListener("hashchange", function () {
    var hh = location.hash.replace("#", "");
    var tt = tabs.filter(function (t) { return t.getAttribute("aria-controls") === "tool-" + hh; })[0];
    if (tt) { select(tt, false); tt.scrollIntoView({ block: "center" }); }
  });

  /* ---------- Print a single calculator ---------- */
  document.querySelectorAll("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () {
      var panel = document.getElementById("tool-" + b.getAttribute("data-print"));
      document.getElementById("print-tool").textContent = panel.querySelector("h2").textContent;
      document.getElementById("print-date").textContent = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      window.print();
    });
  });

  var h = location.hash.replace("#", "");
  var initial = tabs.filter(function (t) { return t.getAttribute("aria-controls") === "tool-" + h; })[0];
  if (initial) select(initial, false);
})();
