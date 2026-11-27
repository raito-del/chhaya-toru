// Divisions page: shows planting data for one division at a time.
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

let districts = [];
let chart = null;

// ---------- Data ----------
async function loadDistricts() {
  const snap = await getDocs(collection(db, "districts"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Unique division names, in the order they first appear
function divisionNames(rows) {
  const seen = new Set();
  const names = [];
  for (const r of rows) {
    const name = r.division_en || "Unknown";
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

// ---------- Renderers ----------
function fillSelector(names) {
  $("division-select").innerHTML = names
    .map((n) => `<option value="${n}">${n} Division</option>`)
    .join("");
}

function renderStats(rows) {
  const planted = rows.reduce((s, r) => s + toNum(r.planted), 0);
  const surviving = rows.reduce((s, r) => s + toNum(r.surviving), 0);
  const co2 = Math.round(rows.reduce((s, r) => s + co2Of(r.surviving, r.co2PerTree), 0));

  $("d-planted").textContent = fmt(planted);
  $("d-surviving").textContent = fmt(surviving);
  $("d-rate").textContent = pctText(pct(surviving, planted));
  $("d-co2").innerHTML = `${fmt(co2)}<span class="unit"> t</span>`;
}

function renderTable(rows) {
  const body = $("district-rows");
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="5" class="note center">No districts found for this division.</td></tr>`;
    return;
  }
  body.innerHTML = rows
    .map((r) => {
      const rate = pct(r.surviving, r.planted);
      return `<tr>
        <td>${r.name_en || r.id}</td>
        <td class="num">${fmt(toNum(r.planted))}</td>
        <td class="num">${fmt(toNum(r.surviving))}</td>
        <td class="num pill">${pctText(rate)}</td>
        <td class="num">${fmt(Math.round(co2Of(r.surviving, r.co2PerTree)))}</td>
      </tr>`;
    })
    .join("");
}

function renderChart(rows, divisionName) {
  $("chart-title").textContent = `Survival rate by district · ${divisionName}`;
  const labels = rows.map((r) => r.name_en || r.id);
  const values = rows.map((r) => Number(pct(r.surviving, r.planted).toFixed(1)));
  const colors = rows.map((_, i) => ["#7ee04a", "#2fbf4a", "#1a9e3a", "#14b8a6", "#a3e635"][i % 5]);

  if (!chart) {
    chart = new Chart($("chart-districts"), {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Survival %", data: values, backgroundColor: colors, borderRadius: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        animation: { duration: 1000, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#06140df2",
            borderColor: "#2fbf4a66",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: { label: (c) => ` ${c.parsed.x}% survival` }
          }
        },
        scales: {
          x: { min: 0, max: 100, grid: { color: "#1d3a24" }, ticks: { callback: (v) => v + "%" } },
          y: { grid: { display: false }, ticks: { color: "#eafbe7" } }
        }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update();
  }
}

// ---------- State ----------
let currentRows = [];

function showDivision(name) {
  const rows = districts
    .filter((r) => (r.division_en || "Unknown") === name)
    .sort((a, b) => (a.name_en || "").localeCompare(b.name_en || ""));

  currentRows = rows;
  renderStats(rows);
  applySearch();
  renderChart(rows, name);
}

function applySearch() {
  const q = $("search").value.trim().toLowerCase();
  const rows = q
    ? currentRows.filter((r) => (r.name_en || r.id).toLowerCase().includes(q))
    : currentRows;
  renderTable(rows);
}

// ---------- Init ----------
async function init() {
  try {
    districts = await loadDistricts();
    if (!districts.length) {
      $("division-select").innerHTML = `<option>No data yet</option>`;
      renderTable([]);
      $("chart-title").textContent = "No district data yet. Add districts from the admin panel.";
      return;
    }

    const names = divisionNames(districts);
    fillSelector(names);
    showDivision(names[0]);

    $("division-select").addEventListener("change", (e) => showDivision(e.target.value));
    $("search").addEventListener("input", applySearch);
  } catch (err) {
    console.error(err);
    $("chart-title").textContent = "Could not load data. Check your connection and Firestore rules.";
  }
}

init();
