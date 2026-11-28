// Admin panel: sign-in gate, then edit the districts and species collections.
// Firestore Security Rules are what actually stop non-admins from writing.

import { loginWithPassword, logout, isAdmin, watchAuth, db } from "../js/auth.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const loginView = $("login-view");
const adminView = $("admin-view");
const loginForm = $("loginForm");
const err = $("err");
const status = $("status");

let districts = [];
let species = [];

// ---------- Helpers ----------
const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const num = (v) => Number(v) || 0;

function say(text, ok = true) {
  status.textContent = text;
  status.className = `status ${ok ? "ok" : "bad"}`;
}

function readRow(tr) {
  const out = {};
  tr.querySelectorAll("[data-field]").forEach((el) => {
    const f = el.dataset.field;
    out[f] = el.type === "number" ? num(el.value) : el.value.trim();
  });
  return out;
}

// Turns a Firebase Auth error code into a message the admin can act on
function loginErrorText(code) {
  const map = {
    "auth/invalid-email": "The email address is not valid.",
    "auth/user-not-found": "No user with this email. Add it in Firebase → Authentication → Users.",
    "auth/wrong-password": "Wrong password.",
    "auth/invalid-credential": "Email or password is wrong. Check both, or reset the password in Firebase.",
    "auth/operation-not-allowed": "Email/Password sign-in is turned off. Enable it in Firebase → Authentication → Sign-in method.",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection."
  };
  return map[code] || `Sign-in failed (${code || "unknown error"}).`;
}

// ---------- Views ----------
function showLogin(message = "") {
  err.textContent = message;
  adminView.hidden = true;
  loginView.hidden = false;
}

function showAdmin(user) {
  err.textContent = "";
  loginView.hidden = true;
  adminView.hidden = false;
  $("who").textContent = `Signed in as ${user.email}`;
  loadAll();
}

// ---------- Load ----------
async function loadCollection(name) {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function loadAll() {
  try {
    [districts, species] = await Promise.all([loadCollection("districts"), loadCollection("species")]);
    renderDistricts();
    renderSpecies();
  } catch (e) {
    console.error(e);
    say("Could not load data. Check your Firestore rules.", false);
  }
}

// ---------- Render ----------
function districtRow(r) {
  return `<tr data-id="${esc(r.id)}" data-coll="districts">
    <td><input data-field="division_en" value="${esc(r.division_en)}"></td>
    <td><input data-field="name_en" value="${esc(r.name_en)}"></td>
    <td class="num"><input class="n" type="number" min="0" data-field="planted" value="${esc(r.planted)}"></td>
    <td class="num"><input class="n" type="number" min="0" data-field="surviving" value="${esc(r.surviving)}"></td>
    <td class="num"><input class="n" type="number" min="0" step="0.1" data-field="co2PerTree" value="${esc(r.co2PerTree)}"></td>
    <td class="actions">
      <button class="btn small pri" data-act="save" type="button">Save</button>
      <button class="btn small del" data-act="delete" type="button">Delete</button>
    </td>
  </tr>`;
}

function speciesRow(s) {
  return `<tr data-id="${esc(s.id)}" data-coll="species">
    <td><input data-field="name" value="${esc(s.name)}"></td>
    <td><input data-field="type" value="${esc(s.type)}"></td>
    <td class="num"><input class="n" type="number" min="0" data-field="planted" value="${esc(s.planted)}"></td>
    <td class="num"><input class="n" type="number" min="0" data-field="surviving" value="${esc(s.surviving)}"></td>
    <td class="num"><input class="n" type="number" min="0" step="0.1" data-field="co2PerTree" value="${esc(s.co2PerTree)}"></td>
    <td class="actions">
      <button class="btn small pri" data-act="save" type="button">Save</button>
      <button class="btn small del" data-act="delete" type="button">Delete</button>
    </td>
  </tr>`;
}

function renderDistricts() {
  const q = $("d-search").value.trim().toLowerCase();
  const rows = districts
    .filter((r) => !q || `${r.division_en} ${r.name_en}`.toLowerCase().includes(q))
    .sort((a, b) => `${a.division_en} ${a.name_en}`.localeCompare(`${b.division_en} ${b.name_en}`));
  $("districts-body").innerHTML = rows.length
    ? rows.map(districtRow).join("")
    : `<tr><td colspan="6" class="note center">No districts yet. Add one below.</td></tr>`;
}

function renderSpecies() {
  const rows = [...species].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  $("species-body").innerHTML = rows.length
    ? rows.map(speciesRow).join("")
    : `<tr><td colspan="6" class="note center">No species yet. Add one below.</td></tr>`;
}

// ---------- Save / delete (edit rows) ----------
async function handleRowAction(e) {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const tr = btn.closest("tr");
  const coll = tr.dataset.coll;
  const id = tr.dataset.id;

  try {
    if (btn.dataset.act === "save") {
      const data = readRow(tr);
      await updateDoc(doc(db, coll, id), data);
      Object.assign((coll === "districts" ? districts : species).find((x) => x.id === id) || {}, data);
      say("Saved.");
    }
    if (btn.dataset.act === "delete") {
      if (!confirm("Delete this row? This cannot be undone.")) return;
      await deleteDoc(doc(db, coll, id));
      if (coll === "districts") districts = districts.filter((x) => x.id !== id);
      else species = species.filter((x) => x.id !== id);
      say("Deleted.");
      coll === "districts" ? renderDistricts() : renderSpecies();
    }
  } catch (e2) {
    console.error(e2);
    say("Action failed. Check your connection or admin rights.", false);
  }
}

// ---------- Add ----------
function formData(form) {
  const out = {};
  new FormData(form).forEach((v, k) => { out[k] = k === "planted" || k === "surviving" || k === "co2PerTree" ? num(v) : String(v).trim(); });
  return out;
}

async function addRecord(coll, form) {
  const data = formData(form);
  const ref = await addDoc(collection(db, coll), data);
  (coll === "districts" ? districts : species).push({ id: ref.id, ...data });
  form.reset();
  say("Added.");
  coll === "districts" ? renderDistricts() : renderSpecies();
}

// ---------- Wiring ----------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("loginBtn");
  btn.disabled = true;
  err.textContent = "";
  try {
    const user = await loginWithPassword($("email").value.trim(), $("password").value);
    if (!(await isAdmin(user))) {
      await logout();
      showLogin("This account is not approved as an admin.");
    }
  } catch (e2) {
    console.error(e2.code, e2.message);
    showLogin(loginErrorText(e2.code));
  } finally {
    btn.disabled = false;
  }
});

$("logoutBtn").addEventListener("click", async () => {
  await logout();
  showLogin("You have been logged out.");
});

document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("on", x === t));
  $("tab-districts").hidden = t.dataset.tab !== "districts";
  $("tab-species").hidden = t.dataset.tab !== "species";
}));

$("districts-body").addEventListener("click", handleRowAction);
$("species-body").addEventListener("click", handleRowAction);
$("d-search").addEventListener("input", renderDistricts);

$("district-form").addEventListener("submit", (e) => {
  e.preventDefault();
  addRecord("districts", e.target).catch((er) => { console.error(er); say("Could not add. Check rights.", false); });
});
$("species-form").addEventListener("submit", (e) => {
  e.preventDefault();
  addRecord("species", e.target).catch((er) => { console.error(er); say("Could not add. Check rights.", false); });
});

// Load seed.json and write every district and species (merge keeps existing counts)
async function importSeed(file) {
  const data = JSON.parse(await file.text());
  let n = 0;
  for (const coll of ["districts", "species"]) {
    for (const item of data[coll] || []) {
      const { id, ...rest } = item;
      await setDoc(doc(db, coll, id), rest, { merge: true });
      n++;
    }
  }
  return n;
}

$("import-btn").addEventListener("click", async () => {
  const f = $("import-file").files[0];
  if (!f) return say("Choose the seed.json file first.", false);
  try {
    const n = await importSeed(f);
    say(`Imported ${n} records.`);
    await loadAll();
  } catch (e) {
    console.error(e);
    say("Import failed. Check the file and your admin rights.", false);
  }
});

// Delete every record marked sample: true, in both collections
async function removeSample() {
  if (!confirm("Remove all sample records? Real records are not affected.")) return 0;
  let n = 0;
  for (const coll of ["districts", "species"]) {
    const snap = await getDocs(query(collection(db, coll), where("sample", "==", true)));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
      n++;
    }
  }
  return n;
}

$("remove-sample-btn").addEventListener("click", async () => {
  try {
    const n = await removeSample();
    say(`Removed ${n} sample records.`);
    await loadAll();
  } catch (e) {
    console.error(e);
    say("Could not remove sample data. Check your admin rights.", false);
  }
});

watchAuth(async (user) => {
  if (!user) return showLogin();
  if (await isAdmin(user)) {
    showAdmin(user);
  } else {
    await logout();
    showLogin("This Google account is not approved as an admin.");
  }
});