// Overview page: loads plantation data from Firestore and renders stats, gauge, charts and bars.
//
// Firestore collections used (read-only on the public site):
//   districts/{id}  { division_en, division_bn, name_en, name_bn, planted, surviving, co2PerTree }
//   species/{id}    { name, type, planted, surviving, co2PerTree }
//   yearly/{id}     { year, planted, surviving }            (optional, for the trend chart)
//
// co2PerTree is kg of CO₂ absorbed per surviving tree per year.

import { db } from "./auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const DEFAULT_CO2 = 14;          // kg per tree per year, used when a record has no value
const GAUGE_LEN = 339.29;        // circumference of the gauge circle (2πr, r = 54)
const PALETTE = ["#7ee04a", "#2fbf4a", "#1a9e3a", "#eab308", "#14b8a6", "#a3e635", "#f97316", "#38bdf8"];

const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n).toLocaleString("en-US");
const pct = (a, p) => (p ? (a / p) * 100 : 0);
const pctText = (v) => `${v.toFixed(1)}%`;
const toNum = (v) => Number(v) || 0;
const co2Of = (surviving, perTree) => (toNum(surviving) * (toNum(perTree) || DEFAULT_CO2)) / 1000;

// ---------- Chart.js global style, matching the site palette ----------
function applyChartDefaults() {
  Chart.defaults.color = "#9cc7a6";
  Chart.defaults.borderColor = "#1d3a24";
  Chart.defaults.font.family = "'Outfit', system-ui, sans-serif";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.tooltip.backgroundColor = "#06140df2";
  Chart.defaults.plugins.tooltip.borderColor = "#2fbf4a66";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
}

// ---------- Firestore reads ----------
async function loadCollection(name) {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------- Animated number ----------
function countUp(el, to, suffix = "") {
  const start = performance.now();
  const dur = 1000;
  (function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const v = Math.round(to * (1 - Math.pow(1 - t, 3)));
    el.innerHTML = fmt(v) + suffix;
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

// ---------- Aggregates ----------
function totalsOf(districts) {
  let planted = 0, surviving = 0, co2 = 0;
  for (const d of districts) {
    planted += toNum(d.planted);
    surviving += toNum(d.surviving);
    co2 += co2Of(d.surviving, d.co2PerTree);
  }
  return { planted, surviving, co2: Math.round(co2) };
}

function byDivision(districts) {
  const map = new Map();
  for (const d of districts) {
    const key = d.division_en || "Unknown";
    if (!map.has(key)) map.set(key, { name: key, planted: 0, surviving: 0 });
    const row = map.get(key);
    row.planted += toNum(d.planted);
    row.surviving += toNum(d.surviving);
  }
  return [...map.values()];
}

// ---------- Renderers ----------
function renderStats(t) {
  countUp($("stat-planted"), t.planted);
  countUp($("stat-alive"), t.surviving);
  $("stat-co2").innerHTML = `${fmt(t.co2)}<span class="unit"> t</span>`;
  $("stat-cars").textContent = `≈ ${fmt(Math.round(t.co2 / 4.6))} cars off the road for a year`;
}

function renderGauge(rate, target = 80) {
  $("gauge-fill").style.strokeDashoffset = GAUGE_LEN * (1 - Math.min(rate, 100) / 100);
  $("gauge-text").textContent = pctText(rate);
  $("gauge-note").textContent = rate >= target
    ? `On target (${target}% goal)`
    : `Below the ${target}% goal`;
}

function renderDivisionBars(divs) {
  const box = $("division-bars");
  if (!divs.length) {
    box.innerHTML = `<p class="note">No division data yet.</p>`;
    return;
  }
  box.innerHTML = divs.map((d) => {
    const r = pct(d.surviving, d.planted);
    return `<div class="bar-row">
      <span>${d.name}</span>
      <div class="bar"><i data-w="${r}"></i></div>
      <span class="bar-value">${pctText(r)}</span>
    </div>`;
  }).join("");
  // Animate after the browser paints the zero-width bars
  requestAnimationFrame(() => {
    box.querySelectorAll(".bar i").forEach((i) => { i.style.width = `${i.dataset.w}%`; });
  });
}

function renderTrend(yearly) {
  const rows = [...yearly].sort((a, b) => toNum(a.year) - toNum(b.year));
  return new Chart($("chart-trend"), {
    type: "line",
    data: {
      labels: rows.map((r) => r.year),
      datasets: [
        { label: "Planted", data: rows.map((r) => toNum(r.planted)), borderColor: "#eab308", backgroundColor: "#eab30822", fill: true, tension: .4, borderWidth: 3, pointRadius: 4 },
        { label: "Surviving", data: rows.map((r) => toNum(r.surviving)), borderColor: "#2fbf4a", backgroundColor: "#2fbf4a22", fill: true, tension: .4, borderWidth: 3, pointRadius: 4 }
      ]
    },
    options: axisOptions()
  });
}

function renderSpecies(species) {
  return new Chart($("chart-species"), {
    type: "doughnut",
    data: {
      labels: species.map((s) => s.name),
      datasets: [{ data: species.map((s) => toNum(s.surviving)), backgroundColor: PALETTE, borderColor: "#08110a", borderWidth: 3 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      animation: { animateRotate: true, duration: 1300 },
      plugins: { legend: { position: "bottom", labels: { color: "#eafbe7", padding: 16 } } }
    }
  });
}

function renderDivisionChart(divs) {
  return new Chart($("chart-division"), {
    type: "bar",
    data: {
      labels: divs.map((d) => d.name),
      datasets: [
        { label: "Planted", data: divs.map((d) => d.planted), backgroundColor: "#1a9e3a66", borderColor: "#2fbf4a", borderWidth: 1, borderRadius: 6 },
        { label: "Surviving", data: divs.map((d) => d.surviving), backgroundColor: "#7ee04a", borderRadius: 6 }
      ]
    },
    options: { ...axisOptions(), plugins: { legend: { position: "bottom", labels: { color: "#eafbe7" } } } }
  });
}

function axisOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    animation: { duration: 1200, easing: "easeOutQuart" },
    plugins: { legend: { position: "bottom", labels: { color: "#eafbe7" } } },
    scales: {
      x: { grid: { color: "#1d3a24" } },
      y: { grid: { color: "#1d3a24" }, beginAtZero: true }
    }
  };
}

// Shows a message in each chart box when there is nothing to draw
function emptyState(canvasId, message) {
  const box = $(canvasId).parentElement;
  box.innerHTML = `<p class="note center">${message}</p>`;
}

// ---------- Main ----------
async function init() {
  applyChartDefaults();
  try {
    const [districts, species, yearly] = await Promise.all([
      loadCollection("districts"),
      loadCollection("species"),
      loadCollection("yearly")
    ]);

    $("sample-note").hidden = !districts.some((d) => d.sample);
    const totals = totalsOf(districts);
    renderStats(totals);
    renderGauge(pct(totals.surviving, totals.planted));

    const divs = byDivision(districts);
    renderDivisionBars(divs);

    if (divs.length) renderDivisionChart(divs);
    else emptyState("chart-division", "No division data yet.");

    if (species.length) renderSpecies(species);
    else emptyState("chart-species", "No species data yet.");

    if (yearly.length) renderTrend(yearly);
    else emptyState("chart-trend", "Yearly trend data will appear here.");

    if (!districts.length) {
      $("stat-cars").textContent = "No data yet. Add districts from the admin panel.";
    }
  } catch (err) {
    console.error(err);
    $("stat-cars").textContent = "Could not load data. Check your connection and Firestore rules.";
  }
}

init();
