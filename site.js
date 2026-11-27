/* ==================================================================
   AK Advisors: shared site script
   ------------------------------------------------------------------
   AK_CONFIG is the place to change contact details and the booking form.
   formEndpoint: paste a form-service URL (Formspree, Basin, Getform…)
   that accepts POST and emails you. Leave it empty and visitors send the
   completed form to you by WhatsApp or email in one tap instead.
   ================================================================== */
var AK_CONFIG = {
  formEndpoint: "web3forms",  // "web3forms" (GitHub Pages) | "netlify" | "send.php" (cPanel) | "" = WhatsApp/email only
  web3formsKey: "69e90a33-f31a-4fb2-8a40-db3fc9ed40e4",           // access key emailed by web3forms.com to queries@akadvisors.in (safe to be public)
  email: "queries@akadvisors.in",
  phoneDisplay: "+91 98715 88733",
  phoneE164: "+919871588733",
  whatsapp: "919871588733",
  loanTypes: [
    "Term loan or capex funding",
    "Working capital limits",
    "Refinance or rate reset",
    "NBFC or structured debt",
    "Debt resolution (restructuring or one-time settlement)",
    "Other advisory (corporate, tax, regulatory, M&A)",
    "Not sure yet: need advice"
  ],
  timings: ["Within 1 month", "1–3 months", "3–6 months", "Just exploring"],
  callTimes: ["Any time", "Morning (10am–1pm)", "Afternoon (1pm–4pm)", "Evening (4pm–7pm)"]
};

(function () {
  "use strict";
  var C = AK_CONFIG;

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav(focusToggle) {
    if (!nav) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (focusToggle) toggle.focus();
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeNav(false);
      else { nav.classList.add("is-open"); toggle.setAttribute("aria-expanded", "true"); }
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav(true);
    });
  }

  /* ---------- Year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Snapshot values from data/market-data.js ---------- */
  var D = window.AK_DATA;
  if (D) {
    var s = D.sbi.current.tenors.reduce(function (m, t) { m[t[0]] = t[1]; return m; }, {});
    var vals = {
      repo: D.rbi.rates[0].value.toFixed(2) + "%",
      repoDate: "from " + D.rbi.effective.replace(/ (\d{4})$/, " $1"),
      mclr1y: s["1 year"].toFixed(2) + "%",
      eblr: D.sbi.eblr.value,
      mpc: D.rbi.nextMpc,
      asof: D.asOf
    };
    if (D.asOfISO) {
      var ageDays = Math.floor((Date.now() - new Date(D.asOfISO + "T00:00:00+05:30").getTime()) / 86400000);
      if (ageDays > (D.reviewEveryDays || 14)) document.documentElement.classList.add("is-stale");
      document.querySelectorAll("[data-stale-age]").forEach(function (el) { el.textContent = ageDays; });
    }
    document.querySelectorAll("[data-snap]").forEach(function (el) {
      var k = el.getAttribute("data-snap");
      if (vals[k]) el.textContent = vals[k];
    });
  }

  /* ---------- Pre-filled email template (fallback panel) ---------- */
  var emailBody = [
    "Name:", "Company:", "Mobile:", "Loan requirement:", "Amount required:", "Expected timing:", "",
    "Please do not attach financial statements, identity documents or banking details."
  ].join("\n");
  document.querySelectorAll(".js-mailto-template").forEach(function (a) {
    a.href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Confidential financing discussion") + "&body=" + encodeURIComponent(emailBody);
  });

  /* ==================================================================
     Booking form
     ================================================================== */
  var uid = 0;
  function opts(list, placeholder) {
    return (placeholder ? '<option value="">' + placeholder + "</option>" : "") +
      list.map(function (o) { return "<option>" + o + "</option>"; }).join("");
  }

  function buildForm(context) {
    var p = "bk" + (++uid) + "-";
    var f = document.createElement("form");
    f.className = "enquiry";
    f.noValidate = true;
    f.setAttribute("aria-label", "Request a confidential callback");
    f.innerHTML =
      '<div class="form-step" data-step="form">' +
        (context === "dialog" ? "" : '<h3>Request a confidential callback</h3><p class="form-sub">Tell us what you need. A partner will call you to arrange a confidential discussion.</p>') +
        '<div class="field-row">' +
          field(p, "name", "Full name", '<input id="' + p + 'name" name="name" type="text" autocomplete="name" required>') +
          field(p, "company", "Company", '<input id="' + p + 'company" name="company" type="text" autocomplete="organization" required>') +
        "</div>" +
        '<div class="field-row">' +
          field(p, "mobile", "Mobile number", '<div class="input-prefix"><span aria-hidden="true">+91</span><input id="' + p + 'mobile" name="mobile" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" required aria-describedby="' + p + 'mobile-hint"></div><span class="field-hint" id="' + p + 'mobile-hint">10-digit Indian mobile number</span>') +
          field(p, "email", 'Work email <span class="optional">(optional)</span>', '<input id="' + p + 'email" name="email" type="email" autocomplete="email">') +
        "</div>" +
        field(p, "loan_type", "Loan requirement", '<select id="' + p + 'loan_type" name="loan_type" required>' + opts(C.loanTypes, "Select one") + "</select>") +
        '<div class="field-row">' +
          field(p, "amount", "Amount required", '<div class="amount-wrap"><span class="amount-rupee" aria-hidden="true">₹</span><input id="' + p + 'amount" name="amount" type="number" inputmode="decimal" min="0" step="any" required><select name="amount_unit" aria-label="Amount unit"><option>crore</option><option>lakh</option></select></div>') +
          field(p, "timing", "When do you need it?", '<select id="' + p + 'timing" name="timing" required>' + opts(C.timings, "Select") + "</select>") +
        "</div>" +
        '<details class="more-details"><summary>Add more details <span class="optional">(optional)</span></summary>' +
        field(p, "details", "Brief details", '<textarea id="' + p + 'details" name="details" rows="3" maxlength="600" placeholder="Purpose of the funding, existing lenders, anything we should know"></textarea>') +
        field(p, "call_time", "Best time to call", '<select id="' + p + 'call_time" name="call_time">' + opts(C.callTimes) + "</select>") +
        "</details>" +
        '<div class="hp" aria-hidden="true"><label for="' + p + 'web">Website</label><input id="' + p + 'web" name="_gotcha" type="text" tabindex="-1" autocomplete="off"></div>' +
        '<div class="field field-check"><input id="' + p + 'consent" name="consent" type="checkbox" required><label for="' + p + 'consent">I agree to be contacted by AK Advisors about this enquiry. <a href="privacy.html" target="_blank" rel="noopener">How we use your details</a></label></div>' +
        '<p class="form-hint">Please do not include financial statements, ID or banking details. If documents are needed, we will share a secure upload link.</p>' +
        '<button class="btn btn-block" type="submit">Request a confidential callback</button>' +
        '<p class="form-status" role="status" aria-live="polite"></p>' +
      "</div>" +
      '<div class="form-step form-done" data-step="send" hidden tabindex="-1">' +
        '<h3>Almost done: send us your details</h3>' +
        '<p>Choose how to send your request. Your details are already filled in.</p>' +
        '<div class="send-actions">' +
          '<a class="btn btn-block" data-send="whatsapp" target="_blank" rel="noopener">Send on WhatsApp</a>' +
          '<a class="btn btn-outline btn-block" data-send="email">Send by email</a>' +
        "</div>" +
        '<p class="form-hint">Or call us on <a href="tel:' + C.phoneE164 + '">' + C.phoneDisplay + "</a>.</p>" +
        '<button type="button" class="text-link link-btn" data-back>Edit details</button>' +
      "</div>" +
      '<div class="form-step form-done" data-step="thanks" hidden tabindex="-1">' +
        "<h3>Thank you</h3><p>We have received your request and will call you to arrange a confidential discussion.</p>" +
      "</div>";
    wire(f);
    return f;
  }

  function field(p, name, label, control) {
    return '<div class="field"><label for="' + p + name + '">' + label + "</label>" + control + "</div>";
  }

  function setError(el, msg) {
    var wrap = el.closest(".field");
    var err = wrap.querySelector(".field-error");
    if (msg) {
      el.setAttribute("aria-invalid", "true");
      if (!err) { err = document.createElement("span"); err.className = "field-error"; err.id = el.id + "-err"; wrap.appendChild(err); }
      err.textContent = msg;
      var d = (el.getAttribute("aria-describedby") || "").replace(err.id, "").trim();
      el.setAttribute("aria-describedby", (d + " " + err.id).trim());
    } else {
      el.removeAttribute("aria-invalid");
      if (err) {
        var d2 = (el.getAttribute("aria-describedby") || "").replace(err.id, "").trim();
        if (d2) el.setAttribute("aria-describedby", d2); else el.removeAttribute("aria-describedby");
        err.remove();
      }
    }
  }

  function validate(f) {
    var first = null;
    f.querySelectorAll("[required]").forEach(function (el) {
      var v = el.type === "checkbox" ? el.checked : el.value.trim();
      var msg = "";
      if (!v) msg = el.type === "checkbox" ? "Please confirm to continue." : "Please complete this field.";
      else if (el.name === "mobile" && !/^[6-9]\d{9}$/.test(el.value.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, ""))) msg = "Enter a valid 10-digit mobile number.";
      else if (el.name === "amount" && !(parseFloat(el.value) > 0)) msg = "Enter an amount greater than zero.";
      setError(el, msg);
      if (msg && !first) first = el;
    });
    var em = f.querySelector('[name="email"]');
    if (em.value.trim() && !em.checkValidity()) { setError(em, "Enter a valid email address."); first = first || em; }
    else setError(em, "");
    if (first) first.focus();
    return !first;
  }

  function summary(f) {
    var g = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
    var mobile = g("mobile").replace(/\D/g, "").slice(-10);
    var lines = [
      "Confidential financing discussion request",
      "Name: " + g("name"),
      "Company: " + g("company"),
      "Mobile: +91 " + mobile,
      g("email") ? "Email: " + g("email") : "",
      "Loan requirement: " + g("loan_type"),
      "Amount required: ₹" + g("amount") + " " + g("amount_unit"),
      "Timing: " + g("timing"),
      g("details") ? "Details: " + g("details") : "",
      g("call_time") ? "Best time to call: " + g("call_time") : ""
    ];
    return lines.filter(Boolean).join("\n");
  }

  function show(f, step) {
    f.querySelectorAll(".form-step").forEach(function (s) { s.hidden = s.getAttribute("data-step") !== step; });
    var cur = f.querySelector('[data-step="' + step + '"]');
    if (step !== "form") cur.focus();
  }

  function wire(f) {
    var status = f.querySelector(".form-status");
    f.addEventListener("input", function (e) { if (e.target.hasAttribute("aria-invalid")) setError(e.target, ""); });
    f.addEventListener("change", function (e) { if (e.target.hasAttribute("aria-invalid")) setError(e.target, ""); });
    f.querySelector("[data-back]").addEventListener("click", function () { show(f, "form"); f.querySelector("input").focus(); });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      if (!validate(f)) { status.textContent = "Please check the highlighted fields."; return; }
      if (f.querySelector('[name="_gotcha"]').value) return;
      var text = summary(f);

      function fallback() {
        f.querySelector('[data-send="whatsapp"]').href = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text);
        f.querySelector('[data-send="email"]').href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Financing discussion: " + f.querySelector('[name="company"]').value.trim()) + "&body=" + encodeURIComponent(text);
        status.textContent = "";
        show(f, "send");
      }
      if (!C.formEndpoint) { fallback(); return; }
      var btn = f.querySelector('button[type="submit"]');
      btn.disabled = true; btn.setAttribute("aria-busy", "true"); status.textContent = "Sending…";
      var fd = new FormData(f);
      fd.set("consent", f.querySelector('[name="consent"]').checked ? "yes" : "");
      var req;
      if (C.formEndpoint === "web3forms") {
        if (!C.web3formsKey) { fallback(); return; }
        var g = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
        var payload = {
          access_key: C.web3formsKey,
          subject: "Website enquiry: " + g("company") + " (₹" + g("amount") + " " + g("amount_unit") + ")",
          from_name: "AK Advisors website",
          replyto: g("email") || undefined,
          botcheck: g("_gotcha") ? true : "",
          "Name": g("name"),
          "Company": g("company"),
          "Mobile": "+91 " + g("mobile").replace(/\D/g, "").slice(-10),
          "Email": g("email") || "(not given)",
          "Loan requirement": g("loan_type"),
          "Amount required": "₹" + g("amount") + " " + g("amount_unit"),
          "Timing": g("timing"),
          "Details": g("details") || "(none)",
          "Best time to call": g("call_time") || "(not given)",
          "Consent to be contacted": f.querySelector('[name="consent"]').checked ? "Yes" : "No",
          "Page": location.href
        };
        req = fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.success) throw new Error(r.status); }); });
      } else if (C.formEndpoint === "netlify") {
        fd.set("form-name", "booking");
        fd.set("summary", text);
        req = fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fd).toString() })
          .then(function (r) { if (!r.ok) throw new Error(r.status); });
      } else {
        req = fetch(C.formEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(r.status); }); });
      }
      req
        .then(function () { status.textContent = ""; f.reset(); show(f, "thanks"); })
        .catch(fallback)   // server unavailable (e.g. local preview): let the visitor send by WhatsApp or email
        .finally(function () { btn.disabled = false; btn.removeAttribute("aria-busy"); });
    });
  }

  /* Inline form (contact section) */
  var mount = document.getElementById("enquiry-mount");
  if (mount) {
    mount.appendChild(buildForm("inline"));
    var panel = document.getElementById("email-panel");
    if (panel) panel.hidden = true;
  }

  /* Dialog form: every [data-book] link opens it */
  var dialog = null, lastFocus = null;
  function getDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.className = "book-dialog";
    dialog.setAttribute("aria-labelledby", "book-title");
    dialog.innerHTML =
      '<div class="book-head"><div><p class="eyebrow">Confidential</p><h2 id="book-title">Request a confidential callback</h2>' +
      '<p class="form-sub">Share a few details and a partner will call you back.</p></div>' +
      '<button type="button" class="book-close" aria-label="Close"><span aria-hidden="true">×</span></button></div>';
    dialog.appendChild(buildForm("dialog"));
    document.body.appendChild(dialog);
    dialog.querySelector(".book-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", function () { document.documentElement.classList.remove("dialog-open"); if (lastFocus) lastFocus.focus(); });
    return dialog;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-book]");
    if (!a) return;
    var d = getDialog();
    if (typeof d.showModal !== "function") return; // old browsers follow the link to #contact
    e.preventDefault();
    lastFocus = a;
    d.showModal();
    document.documentElement.classList.add("dialog-open");
    var first = d.querySelector('.form-step:not([hidden]) input, .form-step:not([hidden]) a');
    if (first) first.focus();
  });

  /* ---------- Mobile sticky action bar ---------- */
  var bar = document.createElement("div");
  bar.className = "mobile-cta";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Quick contact");
  bar.innerHTML =
    '<a class="btn mobile-cta-book" href="' + (mount ? "#contact" : "index.html#contact") + '" data-book>Request a callback</a>' +
    '<a class="mobile-cta-icon" href="tel:' + C.phoneE164 + '" aria-label="Call ' + C.phoneDisplay + '">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg></a>' +
    '<a class="mobile-cta-icon" href="https://wa.me/' + C.whatsapp + '" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg></a>';
  document.body.appendChild(bar);
  document.documentElement.classList.add("has-mobile-cta");
  var contactSec = document.getElementById("contact"), footer = document.querySelector(".site-footer");
  if ("IntersectionObserver" in window) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target === footer ? "f" : "c"] = en.isIntersecting; });
      bar.classList.toggle("is-hidden", !!(visible.f || visible.c));
    }, { threshold: 0.05 });
    if (contactSec) io.observe(contactSec);
    if (footer) io.observe(footer);
  }
  /* ---------- Wide tables: show a scroll cue above any table that overflows ---------- */
  function markScrollables() {
    document.querySelectorAll(".table-scroll").forEach(function (t) {
      var can = t.scrollWidth > t.clientWidth + 2;
      t.classList.toggle("can-scroll", can);
      var hint = t.previousElementSibling;
      if (!hint || !hint.classList.contains("scroll-hint")) {
        if (!can) return;
        hint = document.createElement("p");
        hint.className = "scroll-hint";
        hint.textContent = "Scroll sideways to see all columns";
        t.parentNode.insertBefore(hint, t);
      }
      hint.classList.toggle("show", can);
    });
  }
  window.addEventListener("load", markScrollables);
  window.addEventListener("resize", markScrollables);
  document.addEventListener("toggle", function () { setTimeout(markScrollables, 30); }, true);
  document.addEventListener("input", function () { setTimeout(markScrollables, 30); });
})();
