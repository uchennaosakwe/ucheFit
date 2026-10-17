// ============================================================
//  App logic. Data is saved on your phone only (localStorage).
// ============================================================

const KEY = "ucheFitData_v1";
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

let S = load();
let tab = "today";
let trainSel = "upperA";
let eatSel = new Date().getDay();

function load() {
  const base = { profile: null, checks: {}, shifts: {}, logs: [], photoDate: null };
  try { return Object.assign(base, JSON.parse(localStorage.getItem(KEY)) || {}); }
  catch (e) { return base; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

const pad = n => String(n).padStart(2, "0");
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
const $ = s => document.querySelector(s);

function targets() {
  const p = S.profile;
  if (!p || !p.weight || !p.height || !p.age) return null;
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
  const tdee = bmr * 1.55;                 // long standing shifts + 4 training days
  const kcal = Math.round((tdee - 450) / 50) * 50;
  const protein = Math.round(Math.min(1.6 * p.weight, 170));
  return { kcal, protein, tdee: Math.round(tdee) };
}

function equip() { return (S.profile && S.profile.equip) || "gym"; }
function exName(ex) { return equip() === "home" ? ex.home : ex.gym; }

// ---------- TODAY ----------
function viewToday() {
  const now = new Date();
  const d = now.getDay();
  const k = dkey(now);
  const day = WEEK[d];
  const checks = S.checks[k] || {};
  const extra = S.shifts[k] || "none";
  const w = day.workout ? WORKOUTS[day.workout] : null;
  const isShiftDay = d === 0 || d === 1;
  const busy = extra === "8h";
  const t = targets();
  const meals = MEALS[d];

  let eatenK = 0, eatenP = 0, planK = 0, planP = 0;
  meals.forEach((m, i) => { planK += m.kcal; planP += m.p; if (checks["m" + i]) { eatenK += m.kcal; eatenP += m.p; } });

  let html = `
  <section class="card hero">
    <span class="pill">${esc(day.shift)}</span>${w ? `<span class="pill gold">${esc(w.name.split(" — ")[0])}</span>` : `<span class="pill">Rest from gym</span>`}
    <h2 style="margin-top:12px">${esc(day.label)}</h2>
    <p style="margin:0">${esc(day.note)}</p>
    ${!isShiftDay ? `
      <label style="color:#cfe">Got an extra shift today?</label>
      <div class="seg" id="extraSeg" style="margin:0;background:rgba(0,0,0,.25)">
        ${[["none","No"],["4h","4 hr"],["8h","8 hr"]].map(([v,l]) => `<button data-v="${v}" class="${extra===v?"on":""}">${l}</button>`).join("")}
      </div>` : ""}
  </section>`;

  if (!S.profile) {
    html += `<section class="card warn"><h3>Set up your targets</h3>
      <p class="muted">Add your height, weight and age in the <b>Me</b> tab so the app can work out your daily calories and protein.</p></section>`;
  }

  if (w) {
    const list = busy && day.workout !== "walk" ? w.exercises.slice(0, 3) : w.exercises;
    html += `<section class="card"><h2>${esc(w.name)}</h2>
      ${busy ? `<p class="muted" style="margin-bottom:8px">Shift day, so do the 30-minute version: first 3 exercises only. Train before your shift if it starts late; otherwise do it tomorrow morning.</p>`
             : extra === "4h" ? `<p class="muted" style="margin-bottom:8px">Short shift. Train before or after it, whichever suits you.</p>`
             : `<p class="muted" style="margin-bottom:8px">About ${w.mins} min · ${equip() === "home" ? "home version" : "gym version"}</p>`}
      ${list.map((ex, i) => row("w" + i, checks["w" + i], "", exName(ex), `${ex.sets} × ${ex.reps} · rest ${ex.rest}`)).join("")}
    </section>`;
  } else {
    html += `<section class="card"><h2>No gym today</h2>
      <p class="muted">Long shift. Stand tall, stay active at the door, and drink water through the day (aim for 2.5–3 litres). Do 5 minutes of stretching when you get home.</p></section>`;
  }

  html += `<section class="card"><h2>Today's food</h2>
    ${t ? `<div class="stats" style="margin-bottom:6px">
      <div class="stat"><small class="muted">Calories</small><b>${eatenK} <span class="muted" style="font-size:14px">/ ${t.kcal}</span></b><div class="bar"><i style="width:${Math.min(100, eatenK / t.kcal * 100)}%"></i></div></div>
      <div class="stat"><small class="muted">Protein</small><b>${eatenP}g <span class="muted" style="font-size:14px">/ ${t.protein}g</span></b><div class="bar"><i style="width:${Math.min(100, eatenP / t.protein * 100)}%;background:var(--gold)"></i></div></div>
    </div>` : ""}
    ${meals.map((m, i) => row("m" + i, checks["m" + i], m.time, m.name, `${m.food} · ~${m.kcal} kcal, ${m.p}g protein`)).join("")}
    ${t ? adjustTip(planK, planP, t) : ""}
  </section>`;

  if (now.getHours() >= 19 || now.getHours() < 4) {
    html += `<section class="card warn"><h2>Evening rules</h2><ul class="tips">${NIGHT_RULES.map(r => `<li>${esc(r)}</li>`).join("")}</ul></section>`;
  }

  const due = photoDue();
  if (due) html += `<section class="card warn"><h3>Progress photo day</h3><p class="muted">Take front, side and back photos in the same spot and lighting as your first ones, then log it in Progress.</p></section>`;

  $("#view").innerHTML = html;

  document.querySelectorAll("#view .check").forEach(c => c.addEventListener("change", () => {
    S.checks[k] = S.checks[k] || {};
    S.checks[k][c.dataset.id] = c.checked;
    save(); render();
  }));
  document.querySelectorAll("#extraSeg button").forEach(b => b.addEventListener("click", () => {
    S.shifts[k] = b.dataset.v; save(); render();
  }));
}

function row(id, on, time, title, sub) {
  return `<div class="row ${on ? "done" : ""}">
    ${time ? `<span class="time">${esc(time)}</span>` : ""}
    <div class="grow"><b>${esc(title)}</b><small><span>${esc(sub)}</span></small></div>
    <input type="checkbox" class="check" data-id="${id}" ${on ? "checked" : ""} aria-label="Done">
  </div>`;
}

function adjustTip(planK, planP, t) {
  const tips = [];
  const dk = t.kcal - planK;
  if (dk > 150) {
    const adds = [["½ cup more rice/spaghetti at lunch", 120], ["a banana at your snack", 105], ["½ cup more rice at dinner", 120], ["1 tbsp peanut butter or a handful of peanuts", 95], ["an extra slice of wholemeal bread at breakfast", 80]];
    const pick = []; let sum = 0;
    for (const [txt, k] of adds) { if (sum >= dk - 60) break; pick.push(txt); sum += k; }
    tips.push(`Your target is ~${dk} kcal above this plan. Add: ${pick.join(", ")} (≈ +${sum}).`);
  }
  if (dk < -150) tips.push(`This plan is ~${-dk} kcal above your target: cut lunch rice to 1 cup (−120) and skip the 'if hungry' snack.`);
  const dp = t.protein - planP;
  if (dp > 10) tips.push(`To reach ${t.protein}g protein, add 2 boiled eggs (+12g) or an extra yoghurt (+20g).`);
  return tips.length ? `<p class="muted" style="margin-top:10px">${tips.map(esc).join("<br>")}</p>` : "";
}

// ---------- TRAIN ----------
function viewTrain() {
  const keys = ["upperA","lowerA","upperB","lowerB"];
  const w = WORKOUTS[trainSel];
  $("#view").innerHTML = `
  <div class="seg" id="trSeg">${keys.map(k => `<button data-k="${k}" class="${k===trainSel?"on":""}">${WORKOUTS[k].name.split(" — ")[0]}</button>`).join("")}</div>
  <section class="card"><h2>${esc(w.name)}</h2>
    <p class="muted" style="margin-bottom:6px">About ${w.mins} min · showing ${equip()} version (change in Me)</p>
    ${w.exercises.map(ex => `<div class="row"><div class="grow"><b>${esc(exName(ex))}</b><small>${ex.sets} sets × ${esc(ex.reps)} · rest ${esc(ex.rest)}</small></div></div>`).join("")}
  </section>
  <section class="card"><h2>Your week</h2>
    <table>${[0,1,2,3,4,5,6].map(d => `<tr><td><b>${SHORT[d]}</b></td><td>${esc(WEEK[d].shift)}</td><td class="r">${WEEK[d].workout ? esc(WORKOUTS[WEEK[d].workout].name.split(" — ")[0]) : "Rest"}</td></tr>`).join("")}</table>
  </section>
  <section class="card"><h2>Rules that make it work</h2><ul class="tips">${TRAINING_RULES.map(r => `<li>${esc(r)}</li>`).join("")}</ul></section>`;
  document.querySelectorAll("#trSeg button").forEach(b => b.addEventListener("click", () => { trainSel = b.dataset.k; render(); }));
}

// ---------- EAT ----------
function viewEat() {
  const meals = MEALS[eatSel];
  const totK = meals.reduce((a, m) => a + m.kcal, 0);
  const totP = meals.reduce((a, m) => a + m.p, 0);
  const shopTot = SHOPPING.reduce((a, s) => a + s.cost, 0);
  const t = targets();
  const order = [1,2,3,4,5,6,0];
  $("#view").innerHTML = `
  <div class="seg" id="eatSeg">${order.map(d => `<button data-d="${d}" class="${d===eatSel?"on":""}">${SHORT[d]}</button>`).join("")}</div>
  <section class="card"><h2>${DAYS[eatSel]} <span class="muted" style="font-size:14px;font-weight:400">· ${esc(WEEK[eatSel].shift)}</span></h2>
    ${meals.map(m => `<div class="row"><span class="time">${esc(m.time)}</span><div class="grow"><b>${esc(m.name)}</b><small>${esc(m.food)}</small></div><small class="muted" style="text-align:right">${m.kcal}<br>${m.p}g</small></div>`).join("")}
    <div class="stats" style="margin-top:10px">
      <div class="stat"><small class="muted">Day total</small><b>~${totK}</b><small class="muted">kcal${t ? ` · target ${t.kcal}` : ""}</small></div>
      <div class="stat"><small class="muted">Protein</small><b>~${totP}g</b><small class="muted">${t ? `target ${t.protein}g` : "aim high"}</small></div>
    </div>
    ${t ? adjustTip(totK, totP, t) : ""}
  </section>
  <section class="card"><h2>Portion guide</h2><table>${PORTIONS.map(([a,b]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`).join("")}</table></section>
  <section class="card warn"><h2>The late-night fix</h2><ul class="tips">${NIGHT_RULES.map(r => `<li>${esc(r)}</li>`).join("")}</ul></section>
  <section class="card"><h2>Cooking plan</h2><table>${COOK_PLAN.map(([a,b]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`).join("")}</table></section>
  <section class="card"><h2>Weekly shop · about £${shopTot.toFixed(0)}</h2>
    <p class="muted" style="margin-bottom:6px">Rough prices; they change, so check in store. Rice, beans, poundo and egusi are bought in big bags, so only the weekly share is counted.</p>
    <table>${SHOPPING.map(s => `<tr><td>${esc(s.item)}<br><small class="muted">${esc(s.where)}</small></td><td class="r">£${s.cost.toFixed(2)}</td></tr>`).join("")}</table>
    <p class="muted" style="margin-top:10px">Tighter week? Swap yoghurt for extra eggs and use tinned fish instead of frozen. Use Too Good To Go and yellow-sticker chicken (freeze it the same day).</p>
  </section>`;
  document.querySelectorAll("#eatSeg button").forEach(b => b.addEventListener("click", () => { eatSel = +b.dataset.d; render(); }));
}

// ---------- PROGRESS ----------
function photoDue() {
  if (!S.photoDate) return false;
  return (Date.now() - new Date(S.photoDate).getTime()) / 864e5 >= 28;
}

function chart(field, color) {
  const pts = S.logs.filter(l => l[field]).map(l => ({ x: new Date(l.date).getTime(), y: +l[field] }));
  if (pts.length < 2) return `<p class="muted">Log at least two entries to see a trend.</p>`;
  const W = 600, H = 170, P = 26;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys) - 1, y1 = Math.max(...ys) + 1;
  const X = x => P + (x - x0) / (x1 - x0 || 1) * (W - 2 * P);
  const Y = y => H - P - (y - y0) / (y1 - y0 || 1) * (H - 2 * P);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    ${pts.map(p => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4" fill="${color}"/>`).join("")}
    <text x="4" y="16" fill="#9AA8A0" font-size="14">${y1.toFixed(0)}</text>
    <text x="4" y="${H - 6}" fill="#9AA8A0" font-size="14">${y0.toFixed(0)}</text>
  </svg>`;
}

function viewProgress() {
  const logs = [...S.logs].sort((a, b) => a.date < b.date ? 1 : -1);
  const first = S.logs.length ? [...S.logs].sort((a, b) => a.date < b.date ? -1 : 1)[0] : null;
  const last = logs[0];
  const diff = (f) => first && last && first[f] && last[f] ? (last[f] - first[f]).toFixed(1) : "–";
  $("#view").innerHTML = `
  <section class="card"><h2>Log this week</h2>
    <p class="muted">Weigh in once a week, same day, first thing in the morning. Measure your waist at the belly button.</p>
    <div class="grid2">
      <div><label>Weight (kg)</label><input id="lgW" type="number" step="0.1" inputmode="decimal"></div>
      <div><label>Waist (cm)</label><input id="lgWa" type="number" step="0.5" inputmode="decimal"></div>
    </div>
    <label>Date</label><input id="lgD" type="date" value="${dkey(new Date())}">
    <div style="height:12px"></div><button class="btn" id="lgSave">Save entry</button>
  </section>
  <section class="card"><div class="stats">
    <div class="stat"><small class="muted">Weight change</small><b>${diff("weight")} kg</b></div>
    <div class="stat"><small class="muted">Waist change</small><b>${diff("waist")} cm</b></div>
  </div></section>
  <section class="card"><h3>Weight</h3>${chart("weight", "#17A865")}</section>
  <section class="card"><h3>Waist</h3>${chart("waist", "#E8B53A")}</section>
  <section class="card"><h2>Progress photos</h2>
    <p class="muted" style="margin-bottom:10px">${S.photoDate ? `Last photos: ${S.photoDate}. Next due ${dkey(new Date(new Date(S.photoDate).getTime() + 28 * 864e5))}.` : "Take front, side and back photos every 4 weeks. Same spot, same lighting, same poses. Keep them in your phone gallery."}</p>
    <button class="btn ghost" id="phDone">I took my photos today</button>
  </section>
  ${logs.length ? `<section class="card"><h2>History</h2><table>${logs.map((l, i) => `<tr><td>${l.date}</td><td>${l.weight ? l.weight + " kg" : ""}</td><td>${l.waist ? l.waist + " cm" : ""}</td><td class="r"><a href="#" data-del="${l.date}" style="color:var(--red)">delete</a></td></tr>`).join("")}</table></section>` : ""}`;

  $("#lgSave").onclick = () => {
    const w = parseFloat($("#lgW").value), wa = parseFloat($("#lgWa").value), d = $("#lgD").value;
    if (!d || (!w && !wa)) return alert("Enter a weight or waist measurement.");
    S.logs = S.logs.filter(l => l.date !== d);
    S.logs.push({ date: d, weight: w || null, waist: wa || null });
    if (w && S.profile) S.profile.weight = w;   // keeps targets up to date
    save(); render();
  };
  $("#phDone").onclick = () => { S.photoDate = dkey(new Date()); save(); render(); };
  document.querySelectorAll("[data-del]").forEach(a => a.onclick = e => {
    e.preventDefault(); if (confirm("Delete this entry?")) { S.logs = S.logs.filter(l => l.date !== a.dataset.del); save(); render(); }
  });
}

// ---------- ME ----------
function viewMe() {
  const p = S.profile || {};
  const t = targets();
  $("#view").innerHTML = `
  <section class="card"><h2>Your details</h2>
    <div class="grid2">
      <div><label>Height (cm)</label><input id="pH" type="number" inputmode="decimal" value="${p.height || ""}"></div>
      <div><label>Weight (kg)</label><input id="pW" type="number" step="0.1" inputmode="decimal" value="${p.weight || ""}"></div>
      <div><label>Age</label><input id="pA" type="number" inputmode="numeric" value="${p.age || ""}"></div>
      <div><label>Training at</label><select id="pE"><option value="gym" ${equip()==="gym"?"selected":""}>Gym</option><option value="home" ${equip()==="home"?"selected":""}>Home (no gym)</option></select></div>
    </div>
    <div style="height:12px"></div><button class="btn" id="pSave">Save</button>
  </section>
  ${t ? `<section class="card"><h2>Your daily targets</h2><div class="stats">
      <div class="stat"><small class="muted">Calories</small><b>${t.kcal}</b><small class="muted">maintenance ≈ ${t.tdee}</small></div>
      <div class="stat"><small class="muted">Protein</small><b>${t.protein}g</b><small class="muted">spread across meals</small></div>
    </div>
    <p class="muted" style="margin-top:10px">Aim to lose about 0.5–1% of your body weight per week. Losing faster? Add a snack. No change in 3 weeks? Cut lunch rice by ½ cup.</p></section>` : ""}
  <section class="card"><h2>Back up your data</h2>
    <p class="muted" style="margin-bottom:10px">Your data stays on this phone. Copy a backup now and then, especially before changing phones.</p>
    <div class="grid2"><button class="btn ghost" id="bkOut">Copy backup</button><button class="btn ghost" id="bkIn">Restore</button></div>
  </section>
  <section class="card"><h3>Disclaimer</h3><p class="muted">Calorie and price figures are estimates. If you have a medical condition, check the plan with your GP.</p></section>`;

  $("#pSave").onclick = () => {
    S.profile = { height: +$("#pH").value || null, weight: +$("#pW").value || null, age: +$("#pA").value || null, equip: $("#pE").value };
    save(); render();
  };
  $("#bkOut").onclick = async () => {
    const txt = JSON.stringify(S);
    try { await navigator.clipboard.writeText(txt); alert("Backup copied. Paste it into Notes or WhatsApp to yourself."); }
    catch (e) { prompt("Copy this backup:", txt); }
  };
  $("#bkIn").onclick = () => {
    const txt = prompt("Paste your backup here:");
    if (!txt) return;
    try { S = Object.assign(load(), JSON.parse(txt)); save(); render(); alert("Restored."); }
    catch (e) { alert("That backup didn't look right."); }
  };
}

// ---------- shell ----------
function render() {
  $("#appName").textContent = APP_NAME;
  document.title = APP_NAME;
  const now = new Date();
  $("#dateLine").textContent = `${DAYS[now.getDay()]} ${now.getDate()} ${now.toLocaleString("en-GB", { month: "long" })}`;
  ({ today: viewToday, train: viewTrain, eat: viewEat, progress: viewProgress, me: viewMe })[tab]();
}

document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
  tab = b.dataset.tab;
  document.querySelectorAll(".tabs button").forEach(x => x.classList.toggle("active", x === b));
  window.scrollTo(0, 0);
  render();
}));

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
