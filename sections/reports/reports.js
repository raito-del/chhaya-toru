// Reports page: area-wise plantation report across all divisions and districts.
// Reads the public "districts" collection (see the Firestore rules).

import { db } from "../../js/auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const DEFAULT_CO2 = 14; // kg per surviving tree per year, used when a record has none

const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n).toLocaleString("en-US");
const toNum = (v) => Number(v) || 0;
const pct = (a, p) => (p ? (a / p) * 100 : 0);
const pctText = (v) => `${v.toFixed(1)}%`;
const co2Of = (surviving, perTree) => (toNum(surviving) * (toNum(perTree) || DEFAULT_CO2)) / 1000;
const divName = (r) => r.division_en || "Unknown";

let rows = [];

async function loadDistricts() {
  const snap = await getDocs(collection(db, "districts"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Sort by division, then district name
function sortRows(list) {
  return [...list].sort((a, b) => {
    const d = divName(a).localeCompare(divName(b));
    return d !== 0 ? d : (a.name_en || a.id).localeCompare(b.name_en || b.id);
  });
}

function fillDivisionFilter(names) {
  const sel = $("division-filter");
  sel.insertAdjacentHTML(
    "beforeend",
    names.map((n) => `<option value="${n}">${n}</option>`).join("")
  );
}

// Filters by division and search text, then draws the table and totals
function render() {
  const division = $("division-filter").value;
  const q = $("search").value.trim().toLowerCase();

  const visible = rows.filter((r) => {
    if (division && divName(r) !== division) return false;
    if (q && !`${divName(r)} ${r.name_en || r.id}`.toLowerCase().includes(q)) return false;
    return true;
  });

  $("report-rows").innerHTML = visible.length
    ? visible.map((r) => `<tr>
        <td>${divName(r)}</td>
        <td>${r.name_en || r.id}</td>
        <td class="num">${fmt(toNum(r.planted))}</td>
        <td class="num">${fmt(toNum(r.surviving))}</td>
        <td class="num pill">${pctText(pct(toNum(r.surviving), toNum(r.planted)))}</td>
        <td class="num">${fmt(Math.round(co2Of(r.surviving, r.co2PerTree)))}</td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="note center">No districts match this filter.</td></tr>`;

  const planted = visible.reduce((s, r) => s + toNum(r.planted), 0);
  const surviving = visible.reduce((s, r) => s + toNum(r.surviving), 0);
  const co2 = Math.round(visible.reduce((s, r) => s + co2Of(r.surviving, r.co2PerTree), 0));

  $("report-foot").innerHTML = visible.length
    ? `<tr class="total-row">
        <td colspan="2">Total (${visible.length} districts)</td>
        <td class="num">${fmt(planted)}</td>
        <td class="num">${fmt(surviving)}</td>
        <td class="num pill">${pctText(pct(surviving, planted))}</td>
        <td class="num">${fmt(co2)}</td>
      </tr>`
    : "";

  $("report-meta").textContent = `Showing ${visible.length} of ${rows.length} districts`;
}

async function init() {
  try {
    rows = sortRows(await loadDistricts());

    if (!rows.length) {
      $("report-meta").textContent = "No district data yet. Add districts from the admin panel.";
      $("report-rows").innerHTML = `<tr><td colspan="6" class="note center">Nothing to report yet.</td></tr>`;
      return;
    }

    const names = [...new Set(rows.map(divName))];
    fillDivisionFilter(names);
    $("division-filter").addEventListener("change", render);
    $("search").addEventListener("input", render);
    render();
  } catch (err) {
    console.error(err);
    $("report-meta").textContent = "Could not load data. Check your connection and Firestore rules.";
  }
}

init();
