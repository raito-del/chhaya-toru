// Species page: survival and CO₂ by tree species.
// Reads the public "species" collection (see the Firestore rules).

import { db } from "../../js/auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const DEFAULT_CO2 = 14; // kg per surviving tree per year, used when a record has none
const PALETTE = ["#7ee04a", "#2fbf4a", "#1a9e3a", "#eab308", "#14b8a6", "#a3e635", "#f97316", "#38bdf8"];

const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n).toLocaleString("en-US");
const toNum = (v) => Number(v) || 0;
const pct = (a, p) => (p ? (a / p) * 100 : 0);
const pctText = (v) => `${v.toFixed(1)}%`;
const co2Of = (surviving, perTree) => (toNum(surviving) * (toNum(perTree) || DEFAULT_CO2)) / 1000;

let species = [];
let survivalChart = null;
let shareChart = null;

async function loadSpecies() {
  const snap = await getDocs(collection(db, "species"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------- Charts ----------
function drawSurvival(rows) {
  const labels = rows.map((r) => r.name || r.id);
  const values = rows.map((r) => Number(pct(toNum(r.surviving), toNum(r.planted)).toFixed(1)));

  if (!survivalChart) {
    survivalChart = new Chart($("chart-survival"), {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Survival %", data: values, backgroundColor: PALETTE, borderRadius: 6 }]
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
    survivalChart.data.labels = labels;
    survivalChart.data.datasets[0].data = values;
    survivalChart.update();
  }
}

function drawShare(rows) {
  const data = rows.map((r) => toNum(r.surviving));

  if (!shareChart) {
    shareChart = new Chart($("chart-share"), {
      type: "doughnut",
      data: {
        labels: rows.map((r) => r.name || r.id),
        datasets: [{ data, backgroundColor: PALETTE, borderColor: "#08110a", borderWidth: 3 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        animation: { animateRotate: true, duration: 1300 },
        plugins: { legend: { position: "bottom", labels: { color: "#eafbe7", padding: 14, usePointStyle: true } } }
      }
    });
  } else {
    shareChart.data.labels = rows.map((r) => r.name || r.id);
    shareChart.data.datasets[0].data = data;
    shareChart.update();
  }
}

// ---------- Table ----------
function renderTable(rows) {
  const body = $("species-rows");
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="6" class="note center">No species found.</td></tr>`;
    return;
  }
  body.innerHTML = rows
    .map((r) => `<tr>
      <td>${r.name || r.id}</td>
      <td>${r.type || "—"}</td>
      <td class="num">${fmt(toNum(r.planted))}</td>
      <td class="num">${fmt(toNum(r.surviving))}</td>
      <td class="num pill">${pctText(pct(toNum(r.surviving), toNum(r.planted)))}</td>
      <td class="num">${fmt(Math.round(co2Of(r.surviving, r.co2PerTree)))}</td>
    </tr>`)
    .join("");
}

function applySearch() {
  const q = $("search").value.trim().toLowerCase();
  const rows = q
    ? species.filter((r) => `${r.name || ""} ${r.type || ""}`.toLowerCase().includes(q))
    : species;
  renderTable(rows);
}

// ---------- Init ----------
async function init() {
  try {
    species = await loadSpecies();
    species.sort((a, b) => toNum(b.surviving) - toNum(a.surviving));

    if (!species.length) {
      $("chart-survival").parentElement.innerHTML = `<p class="note center">No species data yet.</p>`;
      $("chart-share").parentElement.innerHTML = `<p class="note center">No species data yet.</p>`;
      renderTable([]);
      return;
    }

    drawSurvival(species);
    drawShare(species);
    applySearch();
    $("search").addEventListener("input", applySearch);
  } catch (err) {
    console.error(err);
    $("species-rows").innerHTML = `<tr><td colspan="6" class="note center">Could not load data. Check your connection and Firestore rules.</td></tr>`;
  }
}

init();
