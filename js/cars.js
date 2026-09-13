/* Cars: parking match (drag/tap) + swipe-to-wash */

const PARK_LEVELS = [
  {
    spots: [
      { id: "red", label: "אדום", color: "#ef4444", vehicle: "car-red" },
      { id: "blue", label: "כחול", color: "#3b82f6", vehicle: "car-blue" },
      { id: "yellow", label: "צהוב", color: "#eab308", vehicle: "bus" },
      { id: "green", label: "ירוק", color: "#22c55e", vehicle: "truck" },
    ],
    vehicles: [
      { id: "car-red", emoji: "🚗", name: "מכונית אדומה" },
      { id: "car-blue", emoji: "🚙", name: "מכונית כחולה" },
      { id: "bus", emoji: "🚌", name: "אוטובוס" },
      { id: "truck", emoji: "🚛", name: "משאית" },
    ],
  },
  {
    spots: [
      { id: "fire", label: "כיבוי", color: "#dc2626", vehicle: "fire" },
      { id: "police", label: "משטרה", color: "#1e3a8a", vehicle: "police" },
      { id: "ambulance", label: "הצלה", color: "#ffffff", vehicle: "ambulance" },
      { id: "taxi", label: "מונית", color: "#facc15", vehicle: "taxi" },
    ],
    vehicles: [
      { id: "fire", emoji: "🚒", name: "כבאית" },
      { id: "police", emoji: "🚓", name: "ניידת" },
      { id: "ambulance", emoji: "🚑", name: "אמבולנס" },
      { id: "taxi", emoji: "🚕", name: "מונית" },
    ],
  },
];

let parkLevel = 0;
let parked = 0;
let washDirt = 100;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setMode(mode) {
  document.querySelectorAll(".mode-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.mode === mode);
  });
  document.getElementById("park-area").classList.toggle("hidden", mode !== "park");
  document.getElementById("wash-area").classList.toggle("active", mode === "wash");
  if (mode === "wash") resetWash();
}

function tryPark(el, target) {
  if (!target || target.classList.contains("filled")) return false;
  if (target.dataset.accepts === el.dataset.id) {
    target.classList.add("filled", "pop");
    target.querySelector(".spot-vehicle").textContent = el.textContent;
    el.classList.add("placed");
    Common.clearSelection();
    Common.playSuccess();
    parked++;
    const level = PARK_LEVELS[parkLevel % PARK_LEVELS.length];
    if (parked >= level.vehicles.length) {
      setTimeout(() => {
        Common.showCelebrate({
          title: "חנייה מושלמת!",
          message: "כל הרכבים במקום!",
          onAgain: () => { parkLevel++; renderPark(); },
        });
      }, 400);
    }
    return true;
  }
  Common.playWrong();
  return false;
}

function renderPark() {
  parked = 0;
  Common.clearSelection();
  const level = PARK_LEVELS[parkLevel % PARK_LEVELS.length];
  const lot = document.getElementById("parking-lot");
  const tray = document.getElementById("vehicles-tray");
  lot.innerHTML = "";
  tray.innerHTML = "";

  level.spots.forEach((s) => {
    const spot = document.createElement("div");
    spot.className = "parking-spot";
    spot.dataset.accepts = s.vehicle;
    const textColor = (s.color === "#ffffff" || s.color === "#facc15") ? "#333" : "#fff";
    spot.innerHTML = `
      <span class="spot-label" style="background:${s.color};color:${textColor};padding:0.35rem 0.5rem;border-radius:10px;">${s.label}</span>
      <div class="spot-vehicle"></div>`;
    lot.appendChild(spot);
  });

  Common.enableTapTargets(".parking-spot", tryPark);

  shuffle(level.vehicles).forEach((v) => {
    const item = document.createElement("div");
    item.className = "draggable-item";
    item.dataset.id = v.id;
    item.setAttribute("aria-label", v.name);
    item.textContent = v.emoji;
    tray.appendChild(item);
    Common.makeDraggable(item, {
      onMove(el, x, y) {
        document.querySelectorAll(".parking-spot").forEach((h) => h.classList.remove("highlight"));
        const t = Common.findDropTarget(x, y, ".parking-spot:not(.filled)");
        if (t) t.classList.add("highlight");
      },
      onEnd(el, x, y) {
        document.querySelectorAll(".parking-spot").forEach((h) => h.classList.remove("highlight"));
        const target = Common.findDropTarget(x, y, ".parking-spot:not(.filled)");
        if (target) tryPark(el, target);
      },
    });
  });
}

function resetWash() {
  washDirt = 100;
  const truck = document.getElementById("dirty-truck");
  const dirt = document.getElementById("dirt-layer");
  const bar = document.getElementById("wash-bar");
  truck.classList.remove("clean");
  dirt.style.opacity = "1";
  bar.style.width = "0%";
}

function setupWash() {
  const area = document.getElementById("truck-wash");
  const dirt = document.getElementById("dirt-layer");
  const truck = document.getElementById("dirty-truck");
  const bar = document.getElementById("wash-bar");
  let washing = false;
  let lastX = 0, lastY = 0;
  let celebrated = false;

  function scrub(x, y) {
    const rect = area.getBoundingClientRect();
    const lx = x - rect.left;
    const ly = y - rect.top;
    const dist = Math.hypot(lx - lastX, ly - lastY);
    if (dist < 8) return;
    lastX = lx;
    lastY = ly;
    washDirt = Math.max(0, washDirt - dist * 0.15);
    const clean = 100 - washDirt;
    dirt.style.opacity = String(washDirt / 100);
    bar.style.width = clean + "%";

    const b = document.createElement("div");
    b.className = "bubble";
    const size = 10 + Math.random() * 16;
    b.style.width = size + "px";
    b.style.height = size + "px";
    b.style.left = lx + "px";
    b.style.top = ly + "px";
    area.appendChild(b);
    setTimeout(() => b.remove(), 800);

    if (washDirt < 30) truck.classList.add("clean");
    if (washDirt <= 0 && !celebrated) {
      celebrated = true;
      Common.playSuccess();
      setTimeout(() => {
        Common.showCelebrate({
          title: "נקי ומבריק!",
          message: "שטפת את המשאית!",
          onAgain: () => { celebrated = false; resetWash(); },
        });
      }, 300);
    }
  }

  function xy(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  area.addEventListener("pointerdown", (e) => {
    washing = true;
    celebrated = washDirt <= 0;
    const p = xy(e);
    lastX = p.x - area.getBoundingClientRect().left;
    lastY = p.y - area.getBoundingClientRect().top;
    if (area.setPointerCapture) area.setPointerCapture(e.pointerId);
    Common.playPop();
  });
  area.addEventListener("pointermove", (e) => {
    if (!washing) return;
    const p = xy(e);
    scrub(p.x, p.y);
  });
  area.addEventListener("pointerup", () => { washing = false; });
  area.addEventListener("pointercancel", () => { washing = false; });
  area.addEventListener("touchstart", (e) => { e.preventDefault(); }, { passive: false });
  area.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches[0]) scrub(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  area.addEventListener("touchend", () => { washing = false; });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });
  const parkInst = document.querySelector("#park-area .instructions");
  if (parkInst) parkInst.textContent = "גררו או לחצו על רכב, ואז על החניה";
  renderPark();
  setupWash();
});
