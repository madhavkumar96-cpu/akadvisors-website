/* Resources page: interactive document checklists from data/checklists.js */
(function () {
  "use strict";
  var C = window.AK_CHECKLISTS, D = window.AK_DATA;
  if (D) document.querySelectorAll("[data-asof]").forEach(function (el) { el.textContent = D.asOf; });
  if (!C) return;
  var KEY = "ak-checklist-v1";
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} }
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  document.getElementById("docs-note").textContent = C.note;
  var tabs = document.getElementById("doc-tabs"), lists = document.getElementById("doc-lists"), prog = document.getElementById("doc-progress");

  tabs.innerHTML = C.lists.map(function (l, i) { return '<button type="button" data-id="' + l.id + '" aria-pressed="' + (i === 0) + '">' + esc(l.label) + "</button>"; }).join("");
  lists.innerHTML = C.lists.map(function (l, i) {
    return '<div class="doc-list" data-id="' + l.id + '"' + (i ? " hidden" : "") + ">" + l.groups.map(function (g, gi) {
      return '<div class="check-group"><h3>' + esc(g.title) + '</h3><ul class="check-list">' + g.items.map(function (it, ii) {
        var id = l.id + "-" + gi + "-" + ii;
        return '<li><label><input type="checkbox" data-key="' + id + '"' + (saved[id] ? " checked" : "") + "><span>" + esc(it[0]) + (it[1] ? "<small>" + esc(it[1]) + "</small>" : "") + "</span></label></li>";
      }).join("") + "</ul></div>";
    }).join("") + "</div>";
  }).join("");

  function current() { return lists.querySelector(".doc-list:not([hidden])"); }
  function updateProgress() {
    var box = current(), all = box.querySelectorAll("input"), done = box.querySelectorAll("input:checked");
    prog.textContent = done.length + " of " + all.length + " ready";
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    tabs.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    lists.querySelectorAll(".doc-list").forEach(function (d) { d.hidden = d.getAttribute("data-id") !== b.getAttribute("data-id"); });
    updateProgress();
  });
  lists.addEventListener("change", function (e) {
    var k = e.target.getAttribute("data-key"); if (!k) return;
    if (e.target.checked) saved[k] = 1; else delete saved[k];
    persist(); updateProgress();
  });
  updateProgress();
})();
